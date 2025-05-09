
import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash, Edit } from 'lucide-react';

interface EventDetailsProps {
  event: CalendarEvent;
  creator?: User;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner: boolean;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  creator,
  onEdit,
  onDelete,
  isOwner,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        
        {isOwner && (
          <div className="flex space-x-2">
            <Button size="icon" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="destructive" onClick={onDelete}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div>
        <div className="text-sm text-gray-500 mb-1">Created by</div>
        <div className="flex items-center">
          {creator?.avatar_url ? (
            <img src={creator.avatar_url} alt={creator.name} className="w-6 h-6 rounded-full mr-2" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
              {creator?.name.charAt(0) || '?'}
            </div>
          )}
          <span>{creator?.name || 'Unknown'}</span>
        </div>
      </div>
      
      {event.description && (
        <div>
          <div className="text-sm text-gray-500 mb-1">Description</div>
          <p>{event.description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Start</div>
          <p>{format(new Date(event.start_time), 'PPP')}</p>
          <p>{format(new Date(event.start_time), 'HH:mm')}</p>
        </div>
        
        <div>
          <div className="text-sm text-gray-500 mb-1">End</div>
          <p>{format(new Date(event.end_time), 'PPP')}</p>
          <p>{format(new Date(event.end_time), 'HH:mm')}</p>
        </div>
      </div>
      
      {event.location && (
        <div>
          <div className="text-sm text-gray-500 mb-1">Location</div>
          <p>{event.location}</p>
        </div>
      )}
      
      <div
        className="w-full h-2 rounded-full mt-2"
        style={{ backgroundColor: event.color || '#9b87f5' }}
      />
    </div>
  );
};

export default EventDetails;
