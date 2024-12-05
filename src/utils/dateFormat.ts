import { parse, format as formatDate, isValid } from 'date-fns';

// Standard date formats used throughout the application
export const DATE_FORMATS = {
  display: 'd/MM/yyyy',
  api: 'yyyy-MM-dd',
  datetime: 'd/MM/yyyy H:mm', // Changed back to H:mm for 24-hour format for accuracy
} as const;

/**
 * Parse a date string in our standard format (d/MM/yyyy)
 */
export function parseDisplayDate(dateStr: string): Date {
  const parsed = parse(dateStr, DATE_FORMATS.display, new Date());
  if (!isValid(parsed)) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }
  return parsed;
}

/**
 * Format a date to our standard display format (d/MM/yyyy)
 */
export function formatDisplayDate(date: Date): string {
  return formatDate(date, DATE_FORMATS.display);
}

/**
 * Format a date to API format (yyyy-MM-dd)
 */
export function formatApiDate(date: Date): string {
  return formatDate(date, DATE_FORMATS.api);
}

/**
 * Parse a datetime string in our standard format (d/MM/yyyy H:mm)
 */
export function parseDatetime(datetimeStr: string): Date {
  const parsed = parse(datetimeStr, DATE_FORMATS.datetime, new Date());
  if (!isValid(parsed)) {
    throw new Error(`Invalid datetime string: ${datetimeStr}`);
  }
  return parsed;
}

/**
 * Format a date to our standard datetime format (d/MM/yyyy H:mm)
 */
export function formatDatetime(date: Date): string {
  return formatDate(date, DATE_FORMATS.datetime);
}