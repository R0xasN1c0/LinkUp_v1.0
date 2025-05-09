
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold">
        {format(currentDate, 'MMMM yyyy')}
      </h2>
      
      <div className="flex items-center space-x-2">
        <Button onClick={onToday} variant="outline" size="sm">
          Today
        </Button>
        
        <div className="flex">
          <Button onClick={onPrevMonth} variant="outline" size="icon" className="rounded-r-none">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button onClick={onNextMonth} variant="outline" size="icon" className="rounded-l-none">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
