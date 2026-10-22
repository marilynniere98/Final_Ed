import { supabase } from './supabase';
import type { AttendanceStatus } from './attendance';
import type { CloudEvent } from './events';
import type { Role } from './profiles';

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
};

export type AdminAttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string | null;
  studentEmail: string | null;
  eventId: string;
  eventTitle: string;
  eventCode: string;
  scannedAt: string;
  status: AttendanceStatus;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .order('role', { ascending: true })
    .order('full_name', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as AdminUser[];
}

export async function updateUserRole(
  userId: string,
  role: Role
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  return { error: error?.message ?? null };
}

export async function getAllEvents(): Promise<CloudEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as CloudEvent[];
}

export async function deleteEvent(
  eventId: string
): Promise<{ error: string | null }> {
  const { data: target, error: findError } = await supabase
    .from('events')
    .select('id, event_code')
    .eq('id', eventId)
    .maybeSingle();

  if (findError) {
    return { error: findError.message };
  }

  const code = target?.event_code ?? null;
  let eventIds = [eventId];

  if (code) {
    const { data: siblings, error: siblingError } = await supabase
      .from('events')
      .select('id')
      .eq('event_code', code);

    if (siblingError) {
      return { error: siblingError.message };
    }

    const matchingIds = (siblings ?? []).map((row: any) => row.id as string);
    if (matchingIds.length > 0) {
      eventIds = matchingIds;
    }
  }

  const { error: attendanceError } = await supabase
    .from('attendance')
    .delete()
    .in('event_id', eventIds);

  if (attendanceError) {
    return { error: attendanceError.message };
  }

  const { error } = code
    ? await supabase.from('events').delete().eq('event_code', code)
    : await supabase.from('events').delete().eq('id', eventId);

  return { error: error?.message ?? null };
}

export async function getOverallAttendance(): Promise<
  AdminAttendanceRecord[]
> {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, student_id, event_id, scanned_at, status')
    .order('scanned_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  const eventIds = Array.from(
    new Set(data.map((row: any) => row.event_id))
  ).filter(Boolean) as string[];
  const studentIds = Array.from(
    new Set(data.map((row: any) => row.student_id))
  ).filter(Boolean) as string[];

  const eventById = new Map<string, CloudEvent>();
  if (eventIds.length > 0) {
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    for (const event of (events ?? []) as CloudEvent[]) {
      eventById.set(event.id, event);
    }
  }

  const profileById = new Map<
    string,
    { full_name: string | null; email: string }
  >();
  if (studentIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', studentIds);
    for (const profile of profiles ?? []) {
      profileById.set(profile.id, {
        full_name: profile.full_name ?? null,
        email: profile.email,
      });
    }
  }

  return data.map((row: any) => {
    const event = eventById.get(row.event_id);
    const profile = profileById.get(row.student_id);

    return {
      id: row.id,
      studentId: row.student_id,
      studentName: profile?.full_name ?? null,
      studentEmail: profile?.email ?? null,
      eventId: row.event_id,
      eventTitle: event?.title ?? '',
      eventCode: event?.event_code ?? '',
      scannedAt: row.scanned_at,
      status: row.status ?? 'present',
    };
  });
}

export async function updateAttendanceStatus(
  attendanceId: string,
  status: AttendanceStatus
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('attendance')
    .update({ status })
    .eq('id', attendanceId);

  return { error: error?.message ?? null };
}

export async function deleteAttendance(
  attendanceId: string
): Promise<{ error: string | null }> {
  const { data: target, error: findError } = await supabase
    .from('attendance')
    .select('id, student_id, event_id')
    .eq('id', attendanceId)
    .maybeSingle();

  if (findError) {
    return { error: findError.message };
  }

  let attendanceIds = [attendanceId];

  if (target) {
    const { data: event } = await supabase
      .from('events')
      .select('event_code')
      .eq('id', target.event_id)
      .maybeSingle();

    if (event?.event_code) {
      const { data: siblings } = await supabase
        .from('events')
        .select('id')
        .eq('event_code', event.event_code);

      const eventIds = (siblings ?? []).map(
        (row: any) => row.id as string
      );

      if (eventIds.length > 0) {
        const { data: matches } = await supabase
          .from('attendance')
          .select('id')
          .eq('student_id', target.student_id)
          .in('event_id', eventIds);

        if (matches && matches.length > 0) {
          attendanceIds = matches.map((row: any) => row.id as string);
        }
      }
    }
  }

  const { error } = await supabase
    .from('attendance')
    .delete()
    .in('id', attendanceIds);

  return { error: error?.message ?? null };
}
