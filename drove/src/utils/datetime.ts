// Utilities for safe local parsing/formatting of date-only strings (YYYY-MM-DD)
// and date+time pairs, avoiding unintended UTC shifts.

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateOnlyToLocal(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const m = DATE_ONLY_REGEX.exec(String(dateStr));
  if (!m) return null;
  const year = Number(m[1]);
  const monthIndex = Number(m[2]) - 1;
  const day = Number(m[3]);
  return new Date(year, monthIndex, day, 12, 0, 0, 0); // noon to avoid DST edge cases
}

export function buildLocalDateTime(dateStr?: string | null, timeStr?: string | null): Date | null {
  if (!dateStr) return null;
  const m = DATE_ONLY_REGEX.exec(String(dateStr));
  const time = String(timeStr || '00:00');
  const [hh = '00', mm = '00'] = time.split(':');
  const hour = Number(hh);
  const minute = Number(mm);
  if (m) {
    const year = Number(m[1]);
    const monthIndex = Number(m[2]) - 1;
    const day = Number(m[3]);
    return new Date(year, monthIndex, day, hour, minute, 0, 0);
  }
  const d = new Date(String(dateStr));
  if (!isNaN(d.getTime())) {
    d.setHours(hour, minute, 0, 0);
    return d;
  }
  return null;
}

export function formatDateOnlyEs(dateStr?: string | null): string {
  if (!dateStr) return '';
  const m = DATE_ONLY_REGEX.exec(String(dateStr));
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  const d = new Date(String(dateStr));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateTimeEs(dateStr?: string | null, timeStr?: string | null): string {
  const dt = buildLocalDateTime(dateStr || undefined, timeStr || undefined);
  if (!dt) return '';
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short' }).format(dt);
}


