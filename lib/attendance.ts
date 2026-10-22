import { supabase } from './supabase';
import { parseQRPayload } from './qr';
import { getEventByCode } from './events';

export type AttendanceStatus = 'present' | 'late' | 'absent';

export type AttendanceRecord = {
  id: string;
  eventId: string;
  eventTitle: string;
  scannedAt: string;
  status: AttendanceStatus;
};

export type RegisterResult = {
  success: boolean;
  message: string;
  eventTitle?: string;
};

export type TeacherEventAttendance = {
  eventId: string;
  eventCode: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  attendeeCount: number;
  attendees: {
    studentId: string;
    studentName: string | null;
    scannedAt: string;
  }[];
};

export type TeacherEventSummary = {
  eventId: string;
  eventCode: string;
  title: string;
  startTime: string | null;
  attendeeCount: number;
};

export async function registerAttendance(
  rawPayload: string,
  studentId: string
): Promise<RegisterResult> {
  const parsed = parseQRPayload(rawPayload);
  if (!parsed.ok) {
    return { success: false, message: parsed.message };
  }
  const payload = parsed.payload;

  const now = Date.now();
  const start = payload.start ? new Date(payload.start).getTime() : null;
  const end = payload.end ? new Date(payload.end).getTime() : null;

  if (start && now < start) {
    return { success: false, message: 'Event has not started yet.' };
  }
  if (end && now > end) {
    return { success: false, message: 'Event has already ended.' };
  }

  const event = await getEventByCode(payload.event);
  if (!event) {
    return { success: false, message: 'Event not found. Invalid QR code.' };
  }
  if (event.status === 'closed') {
    return { success: false, message: 'Event is already closed.' };
  }

  const { error: attError } = await supabase.from('attendance').insert([
    {
      student_id: studentId,
      event_id: event.id,
    },
  ]);

  if (attError) {
    if (attError.code === '23505') {
      return {
        success: false,
        message: 'Already registered for this event.',
        eventTitle: event.title,
      };
    }
    return { success: false, message: attError.message };
  }

  return {
    success: true,
    message: 'Attendance recorded!',
    eventTitle: event.title,
  };
}

export async function getAttendanceHistory(
  studentId: string
): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, scanned_at, status, events ( event_code, title )')
    .eq('student_id', studentId)
    .order('scanned_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    eventId: row.events?.event_code ?? '',
    eventTitle: row.events?.title ?? '',
    scannedAt: row.scanned_at,
    status: row.status ?? 'present',
  }));
}

export async function getTeacherEventAttendance(
  teacherId: string
): Promise<TeacherEventAttendance[]> {
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id, event_code, title, start_time, end_time')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (eventError || !events) return [];

  const codes = Array.from(
    new Set(events.map((e: any) => e.event_code))
  ).filter(Boolean) as string[];
  if (codes.length === 0) return [];

  const { data: codeEvents, error: codeError } = await supabase
    .from('events')
    .select('id, event_code')
    .in('event_code', codes);

  if (codeError || !codeEvents) return [];

  const allEventIds = Array.from(
    new Set(codeEvents.map((e: any) => e.id))
  ) as string[];
  const codeToEventIds = new Map<string, string[]>();
  for (const e of codeEvents as any[]) {
    const prev = codeToEventIds.get(e.event_code) ?? [];
    prev.push(e.id);
    codeToEventIds.set(e.event_code, prev);
  }

  const { data: attendance, error: attError } = await supabase
    .from('attendance')
    .select('student_id, scanned_at, event_id')
    .in('event_id', allEventIds)
    .order('scanned_at', { ascending: false });

  if (attError || !attendance) return [];

  const studentIds = Array.from(
    new Set(attendance.map((a: any) => a.student_id))
  ) as string[];
  const nameById = new Map<string, string | null>();
  if (studentIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', studentIds);
    if (!profilesError && profiles) {
      for (const p of profiles as any[]) {
        nameById.set(p.id, p.full_name ?? null);
      }
    }
  }

  return events.map((e: any) => {
    const matchIds = new Set(codeToEventIds.get(e.event_code) ?? [e.id]);
    const rows = attendance.filter((a: any) => matchIds.has(a.event_id));

    const seen = new Set<string>();
    const uniqueRows = rows.filter((a: any) => {
      if (seen.has(a.student_id)) return false;
      seen.add(a.student_id);
      return true;
    });

    return {
      eventId: e.id,
      eventCode: e.event_code,
      title: e.title,
      startTime: e.start_time,
      endTime: e.end_time,
      attendeeCount: seen.size,
      attendees: uniqueRows.map((a: any) => ({
        studentId: a.student_id,
        studentName: nameById.get(a.student_id) ?? null,
        scannedAt: a.scanned_at,
      })),
    };
  });
}

export async function getTeacherEventSummary(
  teacherId: string
): Promise<TeacherEventSummary[]> {
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id, event_code, title, start_time')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (eventError || !events) return [];

  const codes = Array.from(
    new Set(events.map((e: any) => e.event_code))
  ).filter(Boolean) as string[];
  if (codes.length === 0) return [];

  const { data: codeEvents, error: codeError } = await supabase
    .from('events')
    .select('id, event_code')
    .in('event_code', codes);

  if (codeError || !codeEvents) return [];

  const allEventIds = Array.from(
    new Set(codeEvents.map((e: any) => e.id))
  ) as string[];

  const { data: attRows, error: attError } = await supabase
    .from('attendance')
    .select('event_id')
    .in('event_id', allEventIds);

  if (attError || !attRows) return [];

  const counts: Record<string, number> = {};
  for (const row of attRows as any[]) {
    counts[row.event_id] = (counts[row.event_id] ?? 0) + 1;
  }

  const codeToEventIds = new Map<string, string[]>();
  for (const e of codeEvents as any[]) {
    const prev = codeToEventIds.get(e.event_code) ?? [];
    prev.push(e.id);
    codeToEventIds.set(e.event_code, prev);
  }

  return events.map((e: any) => {
    const ids = codeToEventIds.get(e.event_code) ?? [e.id];
    const attendeeCount = ids.reduce(
      (sum, id) => sum + (counts[id] ?? 0),
      0
    );
    return {
      eventId: e.id,
      eventCode: e.event_code,
      title: e.title,
      startTime: e.start_time,
      attendeeCount,
    };
  });
}