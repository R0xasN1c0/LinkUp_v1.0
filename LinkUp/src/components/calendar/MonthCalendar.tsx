import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { CalendarEvent } from '@/types';
import CalendarHeader from './CalendarHeader';

interface MonthCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  availableSlots?: {
    date: Date;
    isVoted?: boolean;
  }[];
  onAvailableSlotClick?: (date: Date) => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  events,
  onEventClick,
  onDateClick,
  availableSlots = [],
  onAvailableSlotClick,
}) => {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });
  
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach(event => {
    const eventDate = event.start_time instanceof Date ? event.start_time : new Date(event.start_time);
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push(event);
  });
  
  // Group available slots by date (day level)
  const availableDateMap: Record<string, boolean> = {};
  const votedDateMap: Record<string, boolean> = {};
  
  availableSlots.forEach(slot => {
    const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
    const dateKey = format(slotDate, 'yyyy-MM-dd');
    
    // Mark this date as having availability
    availableDateMap[dateKey] = true;
    
    // If any slot on this date is voted, mark the date as voted
    if (slot.isVoted) {
      votedDateMap[dateKey] = true;
    }
  });
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
      </div>
      
      <div className="calendar-grid-header bg-gray-50 border-b border-t">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-grid">
        {calendarDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateKey] || [];
          const hasAvailability = availableDateMap[dateKey];
          const hasVoted = votedDateMap[dateKey];
          
          let cellClassName = "calendar-cell";
          if (!isSameMonth(day, monthStart)) {
            cellClassName += " text-gray-400";
          }
          if (isToday(day)) {
            cellClassName += " bg-blue-50";
          }
          
          return (
            <div 
              key={dateKey} 
              className={cellClassName}
              onClick={() => onDateClick && onDateClick(day)}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${isToday(day) ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                {hasAvailability && (
                  <span 
                    className={`text-xs px-1 py-0.5 rounded-full cursor-pointer hover:opacity-80 ${
                      hasVoted ? 'bg-amber-200' : 'bg-green-200'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAvailableSlotClick) {
                        onAvailableSlotClick(day);
                      }
                    }}
                  >
                    {hasVoted ? 'Voted' : 'Available'}
                  </span>
                )}
              </div>
              
              <div className="mt-1 max-h-20 overflow-y-auto">
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id} 
                    className="text-xs mb-1 p-1 rounded truncate cursor-pointer"
                    style={{ backgroundColor: event.color || '#9b87f5' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick && onEventClick(event);
                    }}
                  >
                    <div className="text-white truncate">
                      {format(event.start_time instanceof Date ? event.start_time : new Date(event.start_time), 'HH:mm')} {event.title}
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">
                    + {dayEvents.length - 3} more
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

export default MonthCalendar;
