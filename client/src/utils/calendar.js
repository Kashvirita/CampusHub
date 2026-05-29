// Build a Date from an event's `date` (yyyy-mm-dd or ISO) and an "HH:MM" time string.
const buildDate = (eventDate, hhmm) => {
  const base = new Date(eventDate);
  const [h = 0, m = 0] = (hhmm || '00:00').split(':').map(Number);
  base.setHours(h, m, 0, 0);
  return base;
};

const toIcsDate = (d) =>
  d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

const toGCalDate = (d) =>
  d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// Escape characters per RFC 5545.
const escapeIcs = (s = '') =>
  String(s)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');

export const buildIcs = (event) => {
  const start = buildDate(event.date, event.startTime);
  const end = buildDate(event.date, event.endTime);
  const stamp = toIcsDate(new Date());
  const description = event.eventDescription || event.shortDescription || '';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusHub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event._id}@campushub`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(event.location || '')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

export const downloadIcs = (event) => {
  const ics = buildIcs(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(event.title || 'event').replace(/[^\w\-]+/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const buildGoogleCalendarUrl = (event) => {
  const start = buildDate(event.date, event.startTime);
  const end = buildDate(event.date, event.endTime);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || '',
    dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
    details: event.eventDescription || event.shortDescription || '',
    location: event.location || '',
  });
  return `https://www.google.com/calendar/render?${params.toString()}`;
};
