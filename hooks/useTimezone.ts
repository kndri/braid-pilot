'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { 
  DEFAULT_TIMEZONE, 
  TimezoneKey,
  formatInTimezone,
  getDateStringInTimezone,
  getTimeStringInTimezone,
  isTodayInTimezone,
  isPastInTimezone,
  parseInTimezone,
  startOfDayInTimezone,
  endOfDayInTimezone
} from '@/lib/timezone';

/**
 * Hook to get the current salon's timezone and utility functions
 */
export function useTimezone() {
  // Get the current user's salon
  const viewer = useQuery(api.users.viewer);
  const salon = useQuery(
    api.salons.getSalonById, 
    viewer?.salonId ? { salonId: viewer.salonId } : 'skip'
  );

  // Get timezone from salon or use default
  const timezone = (salon?.timezone || DEFAULT_TIMEZONE) as TimezoneKey;

  return {
    timezone,
    
    // Format functions bound to salon timezone
    formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => 
      formatInTimezone(date, timezone, options),
    
    formatTime: (date: Date | string | number, use24Hour = false) => 
      getTimeStringInTimezone(date, timezone, use24Hour),
    
    formatDateTime: (date: Date | string | number) => 
      formatInTimezone(date, timezone, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
    
    // Date utilities bound to salon timezone
    getDateString: (date: Date | string | number) => 
      getDateStringInTimezone(date, timezone),
    
    parseDateTime: (dateString: string, timeString: string) => 
      parseInTimezone(dateString, timeString, timezone),
    
    startOfDay: (date: Date | string | number) => 
      startOfDayInTimezone(date, timezone),
    
    endOfDay: (date: Date | string | number) => 
      endOfDayInTimezone(date, timezone),
    
    // Check functions bound to salon timezone
    isToday: (date: Date | string | number) => 
      isTodayInTimezone(date, timezone),
    
    isPast: (date: Date | string | number) => 
      isPastInTimezone(date, timezone),
  };
}

/**
 * Hook to format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function useRelativeTime() {
  const { timezone } = useTimezone();
  
  return (date: Date | string | number): string => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (Math.abs(diffMin) < 1) {
      return 'just now';
    }
    
    if (Math.abs(diffMin) < 60) {
      return diffMin > 0 
        ? `in ${diffMin} minute${diffMin === 1 ? '' : 's'}`
        : `${Math.abs(diffMin)} minute${Math.abs(diffMin) === 1 ? '' : 's'} ago`;
    }
    
    if (Math.abs(diffHour) < 24) {
      return diffHour > 0
        ? `in ${diffHour} hour${diffHour === 1 ? '' : 's'}`
        : `${Math.abs(diffHour)} hour${Math.abs(diffHour) === 1 ? '' : 's'} ago`;
    }
    
    if (Math.abs(diffDay) < 7) {
      return diffDay > 0
        ? `in ${diffDay} day${diffDay === 1 ? '' : 's'}`
        : `${Math.abs(diffDay)} day${Math.abs(diffDay) === 1 ? '' : 's'} ago`;
    }
    
    // For older dates, just show the date
    return formatInTimezone(d, timezone, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };
}