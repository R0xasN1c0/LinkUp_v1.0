
import React from 'react';
import { format, addHours, startOfDay, isSameHour, isAfter, isBefore, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types';

interface DayCalendarProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date) => void;
  availableSlots?: {
    date: Date;
    isVoted?: boolean;
  }[];
  onAvailableSlotClick?: (date: Date) => void;
}

const DayCalendar: React.FC<DayCalendarProps> = ({
  date,
  events,
  onEventClick,
  onTimeSlotClick,
  availableSlots = [],
  onAvailableSlotClick,
}) => {
  // Generate time slots for the day (hourly from 7am to 10pm)
  const generateTimeSlots = () => {
    const slots = [];
    const day = startOfDay(date);
    
    for (let i = 7; i <= 22; i++) { // 7am to 10pm
      slots.push(addHours(day, i));
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // Filter events for the selected day
  const dayEvents = events.filter(event => {
    const eventStart = event.start_time instanceof Date ? event.start_time : new Date(event.start_time);
    return isSameDay(eventStart, date);
  });

  // Check if a time slot is available for voting
  const isSlotAvailable = (timeSlot: Date) => {
    return availableSlots.some(slot => {
      const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
      return isSameHour(slotDate, timeSlot);
    });
  };

  // Check if a time slot has been voted on
  const isSlotVoted = (timeSlot: Date) => {
    return availableSlots.some(slot => {
      const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
      return isSameHour(slotDate, timeSlot) && slot.isVoted;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{format(date, 'EEEE, MMMM d, yyyy')}</h2>
        
        {availableSlots.length > 0 && (
          <div className="mt-2 p-2 bg-green-50 rounded-md border border-green-200 flex items-center">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-800">
              This day has {availableSlots.length} available time slot{availableSlots.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      <div className="day-calendar-grid">
        {timeSlots.map(timeSlot => {
          const hourEvents = dayEvents.filter(event => {
            const eventStart = event.start_time instanceof Date ? 
              event.start_time : new Date(event.start_time);
            return isSameHour(eventStart, timeSlot);
          });
          
          const isAvailable = isSlotAvailable(timeSlot);
          const isVoted = isSlotVoted(timeSlot);
          
          return (
            <div 
              key={timeSlot.toISOString()} 
              className={`day-calendar-row border-b hover:bg-gray-50 cursor-pointer ${
                isAvailable 
                  ? isVoted 
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'bg-green-50 hover:bg-green-100' 
                  : ''
              }`}
              onClick={() => {
                if (isAvailable && onAvailableSlotClick) {
                  onAvailableSlotClick(timeSlot);
                } else if (onTimeSlotClick && !hourEvents.length) {
                  onTimeSlotClick(timeSlot);
                }
              }}
            >
              <div className="day-calendar-time-cell border-r p-2 text-sm text-gray-500">
                {format(timeSlot, 'h:mm a')}
              </div>
              <div className="day-calendar-events-cell p-2">
                {hourEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="text-sm mb-1 p-2 rounded"
                    style={{ backgroundColor: event.color || '#9b87f5' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick && onEventClick(event);
                    }}
                  >
                    <div className="text-white">
                      {event.title}
                    </div>
                  </div>
                ))}
                
                {isAvailable && !hourEvents.length && (
                  <div className={`text-xs inline-flex items-center px-2 py-1 rounded ${isVoted ? 'bg-amber-200' : 'bg-green-200'}`}>
                    <span className="mr-1">
                      {isVoted ? '✓ Voted' : '+ Available'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayCalendar;
