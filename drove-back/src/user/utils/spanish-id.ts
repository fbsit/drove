const DNI_REGEX = /^[0-9]{8}[A-Z]$/;
const NIE_REGEX = /^[XYZ][0-9]{7}[A-Z]$/;
const CIF_REGEX = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]$/;
const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

export type DocKind = 'DNI' | 'NIE' | 'CIF' | 'UNKNOWN';

export function normalizeId(raw: string): string {
  return (raw || '').toUpperCase().replace(/\s|-/g, '');
}

export function classifyId(raw: string): DocKind {
  const v = normalizeId(raw);
  if (CIF_REGEX.test(v)) return 'CIF';
  if (NIE_REGEX.test(v)) return 'NIE';
  if (DNI_REGEX.test(v)) return 'DNI';
  return 'UNKNOWN';
}

export function validateDni(dni: string): boolean {
  const v = normalizeId(dni);
  if (!DNI_REGEX.test(v)) return false;
  const num = parseInt(v.slice(0, 8), 10);
  return DNI_LETTERS[num % 23] === v[8];
}

export function validateNie(nie: string): boolean {
  const v = normalizeId(nie);
  if (!NIE_REGEX.test(v)) return false;
  const map: Record<string, string> = { X: '0', Y: '1', Z: '2' };
  const num = parseInt((map[v[0]] || '') + v.slice(1, 8), 10);
  return DNI_LETTERS[num % 23] === v[8];
}

export function isLikelyCompanyName(name: string): boolean {
  return /\b(SL|S\.L\.|SA|S\.A\.|SRL|SAS|LLC|LTD)\b/i.test(name || '');
}


