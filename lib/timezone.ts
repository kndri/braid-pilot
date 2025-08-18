/**
 * Timezone utilities for handling salon-specific timezones
 * All dates are stored in UTC in the database and converted for display
 */

// Common US timezones for salons
export const TIMEZONES = {
  'America/New_York': 'Eastern Time (ET)',
  'America/Chicago': 'Central Time (CT)',
  'America/Denver': 'Mountain Time (MT)',
  'America/Phoenix': 'Mountain Time - Arizona (MST)',
  'America/Los_Angeles': 'Pacific Time (PT)',
  'America/Anchorage': 'Alaska Time (AKT)',
  'Pacific/Honolulu': 'Hawaii Time (HST)',
} as const;

export type TimezoneKey = keyof typeof TIMEZONES;

// Default timezone if salon hasn't set one
export const DEFAULT_TIMEZONE: TimezoneKey = 'America/New_York';

/**
 * Get the current date/time in UTC
 */
export function nowUTC(): Date {
  return new Date();
}

/**
 * Get the current timestamp in UTC (milliseconds)
 */
export function nowUTCTimestamp(): number {
  return Date.now();
}

/**
 * Convert a UTC date to a specific timezone
 */
export function toTimezone(date: Date | string | number, timezone: TimezoneKey): Date {
  const d = new Date(date);
  return new Date(d.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Convert a local date in a specific timezone to UTC
 */
export function fromTimezone(date: Date | string, timezone: TimezoneKey): Date {
  const d = new Date(date);
  const localTime = d.getTime();
  const localOffset = d.getTimezoneOffset() * 60000;
  
  // Get target timezone offset
  const targetDate = new Date(d.toLocaleString('en-US', { timeZone: timezone }));
  const targetOffset = targetDate.getTimezoneOffset() * 60000;
  
  // Calculate UTC time
  return new Date(localTime - (targetOffset - localOffset));
}

/**
 * Format a date for display in a specific timezone
 */
export function formatInTimezone(
  date: Date | string | number,
  timezone: TimezoneKey,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    timeZone: timezone,
    ...options
  });
}

/**
 * Get a date string for a specific timezone (YYYY-MM-DD)
 */
export function getDateStringInTimezone(
  date: Date | string | number,
  timezone: TimezoneKey
): string {
  const d = new Date(date);
  const formatted = d.toLocaleDateString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const [month, day, year] = formatted.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Get a time string for a specific timezone (HH:MM)
 */
export function getTimeStringInTimezone(
  date: Date | string | number,
  timezone: TimezoneKey,
  use24Hour = false
): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour
  });
}

/**
 * Parse a date and time string in a specific timezone to UTC
 */
export function parseInTimezone(
  dateString: string,
  timeString: string,
  timezone: TimezoneKey
): Date {
  // Combine date and time
  const combined = `${dateString}T${timeString}`;
  
  // Create date in local time
  const localDate = new Date(combined);
  
  // Convert to target timezone then to UTC
  return fromTimezone(localDate, timezone);
}

/**
 * Get the start of day in a specific timezone (in UTC)
 */
export function startOfDayInTimezone(
  date: Date | string | number,
  timezone: TimezoneKey
): Date {
  const d = new Date(date);
  const dateStr = getDateStringInTimezone(d, timezone);
  return parseInTimezone(dateStr, '00:00', timezone);
}

/**
 * Get the end of day in a specific timezone (in UTC)
 */
export function endOfDayInTimezone(
  date: Date | string | number,
  timezone: TimezoneKey
): Date {
  const d = new Date(date);
  const dateStr = getDateStringInTimezone(d, timezone);
  return parseInTimezone(dateStr, '23:59', timezone);
}

/**
 * Check if a date is today in a specific timezone
 */
export function isTodayInTimezone(
  date: Date | string | number,
  timezone: TimezoneKey
): boolean {
  const d = new Date(date);
  const now = new Date();
  return getDateStringInTimezone(d, timezone) === getDateStringInTimezone(now, timezone);
}

/**
 * Check if a date is in the past in a specific timezone
 */
export function isPastInTimezone(
  date: Date | string | number,
  timezone: TimezoneKey
): boolean {
  const d = new Date(date);
  const now = new Date();
  return d < now;
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone: TimezoneKey): number {
  const now = new Date();
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  return (now.getTime() - tzDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Get a user-friendly timezone display name
 */
export function getTimezoneDisplayName(timezone: TimezoneKey): string {
  return TIMEZONES[timezone] || timezone;
}

/**
 * Get all available timezones for dropdown
 */
export function getAllTimezones(): Array<{ value: TimezoneKey; label: string }> {
  return Object.entries(TIMEZONES).map(([value, label]) => ({
    value: value as TimezoneKey,
    label
  }));
}