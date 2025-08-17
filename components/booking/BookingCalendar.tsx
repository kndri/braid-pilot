'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isAfter, isBefore, parseISO } from 'date-fns';

interface BookingCalendarProps {
  salonId: Id<"salons">;
  onSlotSelect: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

export function BookingCalendar({ salonId, onSlotSelect, selectedDate, selectedTime }: BookingCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  
  const availability = useQuery(api.booking.getCalendarAvailability, {
    salonId,
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
  });
  
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);
  
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);
  
  const isSlotAvailable = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!availability) return false;
    
    const slot = availability.find(
      (s: any) => s.date === dateStr && s.startTime === time
    );
    
    return slot?.isAvailable || false;
  };
  
  const handlePreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };
  
  const handleSlotClick = (date: Date, time: string) => {
    if (isSlotAvailable(date, time)) {
      onSlotSelect(format(date, 'yyyy-MM-dd'), time);
    }
  };
  
  const isToday = (date: Date) => isSameDay(date, new Date());
  const isPastDate = (date: Date) => isBefore(date, new Date()) && !isToday(date);
  
  if (!availability) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-8 gap-2">
            {[...Array(56)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous week"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-lg font-semibold">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h3>
          
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next week"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[640px] p-4">
          <div className="grid grid-cols-8 gap-2">
            <div></div>
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 uppercase">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-sm font-medium ${isToday(day) ? 'text-orange-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-8 gap-2 mt-4">
            {timeSlots.map((time) => (
              <>
                <div key={`time-${time}`} className="text-right pr-2 text-sm text-gray-500 py-3">
                  {time}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isAvailable = isSlotAvailable(day, time);
                  const isSelected = selectedDate === dateStr && selectedTime === time;
                  const isPast = isPastDate(day);
                  const isDisabled = isPast || !isAvailable;
                  
                  return (
                    <button
                      key={`${dayIndex}-${time}`}
                      onClick={() => handleSlotClick(day, time)}
                      disabled={isDisabled}
                      className={`
                        p-3 rounded-lg text-sm font-medium transition-all
                        ${isSelected 
                          ? 'bg-orange-500 text-white shadow-md' 
                          : isDisabled
                            ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                        }
                      `}
                    >
                      {isAvailable ? 'Available' : isPast ? '-' : 'Booked'}
                    </button>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
            <span className="text-gray-600">Unavailable</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
            <span className="text-gray-600">Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}