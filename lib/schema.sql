-- ============================================================
-- Phase 3 — Supabase PostgreSQL Schema for QR-ATT
--
-- This file replaces the local SQLite schema with a cloud schema.
-- It mirrors the original `events` and `attendance` tables but
-- integrates with Supabase Auth (auth.users) and adds Row Level
-- Security so each user can only see their own data.
--
-- HOW TO RUN:
--   1. Open Supabase Dashboard -> SQL Editor
--   2. Paste the ENTIRE file
--   3. Click "Run"
--   4. Verify the tables appear under Table Editor
--
-- This script is IDEMPOTENT: it can be run multiple times safely.
--
-- IMPORTANT: All tables are created BEFORE any policy. PostgreSQL
-- validates RLS policy expressions when the policy is created, so a
-- policy referencing a table that does not exist yet fails with
-- "ERROR: 42P01: relation ... does not exist".
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'teacher', 'admin'));

-- To create the first administrator:
--   1. Sign up normally in the app.
--   2. In Supabase SQL Editor, run:
--      update public.profiles set role = 'admin' where email = 'admin@school.edu';

-- EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_code text not null unique,
  title text not null,
  start_time timestamptz,
  end_time timestamptz,
  venue text,
  description text,
  status text not null default 'open',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.events add column if not exists status text not null default 'open';
alter table public.events add column if not exists venue text;
alter table public.events add column if not exists description text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'events_status_check'
      and conrelid = 'public.events'::regclass
  ) then
    alter table public.events
      add constraint events_status_check check (status in ('open', 'closed'));
  end if;
end
$$;

-- ATTENDANCE
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  scanned_at timestamptz not null default now(),
  status text not null default 'present',
  unique (student_id, event_id)
);

alter table public.attendance add column if not exists status text not null default 'present';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attendance_status_check'
      and conrelid = 'public.attendance'::regclass
  ) then
    alter table public.attendance
      add constraint attendance_status_check
      check (status in ('present', 'late', 'absent'));
  end if;
end
$$;

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.attendance enable row level security;

-- ------------------------------------------------------------
-- 2. AUTOMATIC PROFILE CREATION
-- ------------------------------------------------------------

-- Automatically create a profile after a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Returns true when the signed-in user's profile has the admin role.
-- Security definer avoids recursive RLS checks on public.profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_student()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'student'
  );
$$;

create or replace function public.is_teacher_or_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  );
$$;

-- Prevent a normal user from promoting themselves to admin.
-- SQL Editor / service-role operations have no auth.uid(), so the first
-- administrator can still be assigned from the Supabase dashboard.
create or replace function public.prevent_admin_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is not null
    and new.role = 'admin'
    and old.role is distinct from 'admin'
    and not public.is_admin()
  then
    raise exception 'Only administrators can assign the admin role.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_admin_escalation on public.profiles;
create trigger prevent_admin_escalation
  before update on public.profiles
  for each row execute procedure public.prevent_admin_escalation();

-- ------------------------------------------------------------
-- 3. POLICIES
-- ------------------------------------------------------------

-- Profiles policies
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Events policies
-- Any signed-in user can read event details (needed to validate QR codes)
drop policy if exists "Events are readable by any authenticated user" on public.events;
create policy "Events are readable by any authenticated user"
  on public.events for select
  using (auth.role() = 'authenticated');

-- Only teachers and administrators can create events.
drop policy if exists "Users can insert events" on public.events;
create policy "Users can insert events"
  on public.events for insert
  with check (public.is_teacher_or_admin());

-- Teachers can update only the events they created. Admins have a
-- separate policy that allows updating any event.
drop policy if exists "Users can update their own events" on public.events;
create policy "Users can update their own events"
  on public.events for update
  using (
    public.is_teacher_or_admin()
    and auth.uid() = created_by
  )
  with check (
    public.is_teacher_or_admin()
    and auth.uid() = created_by
  );

drop policy if exists "Admins can update any event" on public.events;
create policy "Admins can update any event"
  on public.events for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete any event" on public.events;
create policy "Admins can delete any event"
  on public.events for delete
  using (public.is_admin());

-- Attendance policies
-- Students can only view / insert their own attendance
drop policy if exists "Students can view their own attendance" on public.attendance;
create policy "Students can view their own attendance"
  on public.attendance for select
  using (auth.uid() = student_id);

drop policy if exists "Students can insert their own attendance" on public.attendance;
create policy "Students can insert their own attendance"
  on public.attendance for insert
  with check (
    auth.uid() = student_id
    and public.is_student()
    and exists (
      select 1 from public.events e
      where e.id = event_id
        and e.status = 'open'
        and (e.start_time is null or e.start_time <= now())
        and (e.end_time is null or e.end_time >= now())
    )
  );

-- Teachers can view attendance for events they created, plus any event
-- row that shares the same event_code (covers QRs whose events were
-- auto-created during a scan before the teacher saved the event).
drop policy if exists "Teachers can view attendance for their events" on public.attendance;
create policy "Teachers can view attendance for their events"
  on public.attendance for select
  using (
    exists (
      select 1 from public.events e
      where e.id = attendance.event_id
        and exists (
          select 1 from public.events own
          where own.event_code = e.event_code
            and own.created_by = auth.uid()
        )
    )
  );

-- Teachers can read the profiles of students who attended their events
-- (needed to show attendee names in the teacher's History view).
-- Mirrors the attendance policy: matches any event row sharing the teacher's
-- event_code, so students of auto-created (orphan) event rows also show.
drop policy if exists "Teachers can view profiles of their attendees" on public.profiles;
create policy "Teachers can view profiles of their attendees"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.attendance a
      join public.events e on e.id = a.event_id
      where a.student_id = profiles.id
        and exists (
          select 1 from public.events own
          where own.event_code = e.event_code
            and own.created_by = auth.uid()
        )
    )
  );

-- Admins can view, correct, and delete any attendance record.
drop policy if exists "Admins can view all attendance" on public.attendance;
create policy "Admins can view all attendance"
  on public.attendance for select
  using (public.is_admin());

drop policy if exists "Admins can update all attendance" on public.attendance;
create policy "Admins can update all attendance"
  on public.attendance for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete all attendance" on public.attendance;
create policy "Admins can delete all attendance"
  on public.attendance for delete
  using (public.is_admin());

------------------------------------------------------------
-- END OF SCHEMA
------------------------------------------------------------