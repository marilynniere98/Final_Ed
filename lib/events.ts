import { supabase } from './supabase';

export type EventStatus = 'open' | 'closed';

export type Event = {
  eventId: string; // public event code from the UI (e.g. EVT-2026-0002)
  title: string;
  start: string;
  end: string;
  venue?: string | null;
  description?: string | null;
};

export type CloudEvent = {
  id: string;
  event_code: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  description: string | null;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
};

export type EventUpdates = {
  event_code?: string;
  title?: string;
  start_time?: string | null;
  end_time?: string | null;
  venue?: string | null;
  description?: string | null;
  status?: EventStatus;
};

function getMissingColumn(
  error: { code?: string; message?: string } | null
): string | null {
  if (!error || error.code !== 'PGRST204' || !error.message) {
    return null;
  }

  const match = error.message.match(/Could not find the '([^']+)' column/);
  return match ? match[1] : null;
}

export async function createEvent(
  event: Event
): Promise<{ error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload: Record<string, unknown> = {
    event_code: event.eventId,
    title: event.title,
    start_time: event.start || null,
    end_time: event.end || null,
    venue: event.venue || null,
    description: event.description || null,
    created_by: user?.id ?? null,
  };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { error } = await supabase.from('events').insert(payload);

    if (!error) {
      return { error: null };
    }

    const missing = getMissingColumn(error);
    if (missing && missing in payload) {
      delete payload[missing];
      continue;
    }

    if (error.code === '23505') {
      return { error: 'An event with this code already exists.' };
    }

    return { error: error.message };
  }

  return { error: 'Could not create the event.' };
}

export async function updateEvent(
  eventId: string,
  updates: EventUpdates
): Promise<{ error: string | null }> {
  const payload: Record<string, unknown> = { ...updates };

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', eventId);

    if (!error) {
      return { error: null };
    }

    const missing = getMissingColumn(error);
    if (missing && missing in payload) {
      delete payload[missing];
      continue;
    }

    return { error: error.message };
  }

  return { error: 'Could not update the event.' };
}

export async function getEventsByTeacher(
  teacherId: string
): Promise<CloudEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', teacherId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as CloudEvent[];
}

export async function getEventByCode(
  code: string
): Promise<CloudEvent | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_code', code)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CloudEvent;
}

export async function getAvailableEvents(): Promise<CloudEvent[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'open')
    .or(`end_time.is.null,end_time.gte.${now}`)
    .order('start_time', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as CloudEvent[];
}