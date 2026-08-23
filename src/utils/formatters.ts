/**
 * Formats a number into Australian Dollars ($XX.XX)
 */
export function formatAud(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Formats an 11-digit Australian Business Number (ABN) with standard spacing: XX XXX XXX XXX
 */
export function formatAbn(abn: string): string {
  const clean = abn.replace(/\D/g, '');
  if (clean.length !== 11) return abn;
  return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 11)}`;
}

/**
 * Formats date and time according to Australian standards (DD/MM/YYYY hh:mm:ss A)
 */
export function formatAusDateTime(dateStringOrObj: string | Date): string {
  const d = typeof dateStringOrObj === 'string' ? new Date(dateStringOrObj) : dateStringOrObj;
  return new Intl.DateTimeFormat('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Formats short time for kitchen orders (e.g. 10:24 AM)
 */
export function formatAusTime(dateStringOrObj: string | Date): string {
  const d = typeof dateStringOrObj === 'string' ? new Date(dateStringOrObj) : dateStringOrObj;
  return new Intl.DateTimeFormat('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Calculates minutes elapsed since an ISO timestamp
 */
export function getElapsedMinutes(isoString: string): number {
  const then = new Date(isoString).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / 60000));
}

/**
 * Generates unique sequence IDs
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}
