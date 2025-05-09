
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { VoteFormData } from '@/types';

interface VoteFormProps {
  groupId: string;
  onSubmit: (voteData: VoteFormData) => void;
  onCancel: () => void;
  initialData?: Partial<VoteFormData> | null;
}

const VoteForm: React.FC<VoteFormProps> = ({ 
  groupId, 
  onSubmit, 
  onCancel,
  initialData = null
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState<Date | undefined>(
    initialData?.proposed_start ? 
      new Date(initialData.proposed_start) : 
      new Date()
  );
  const [startTime, setStartTime] = useState(
    initialData?.proposed_start ? 
      format(new Date(initialData.proposed_start), 'HH:mm') : 
      '12:00'
  );
  const [endTime, setEndTime] = useState(
    initialData?.proposed_end ? 
      format(new Date(initialData.proposed_end), 'HH:mm') : 
      '13:00'
  );
  
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      
      if (initialData.proposed_start) {
        const proposedStart = new Date(initialData.proposed_start);
        setDate(proposedStart);
        setStartTime(format(proposedStart, 'HH:mm'));
      }
      
      if (initialData.proposed_end) {
        const proposedEnd = new Date(initialData.proposed_end);
        setEndTime(format(proposedEnd, 'HH:mm'));
      }
    }
  }, [initialData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !title) {
      return;
    }
    
    // Create date objects from the form data
    const startDateTime = new Date(date);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);
    
    const endDateTime = new Date(date);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);
    
    const voteData: VoteFormData = {
      title,
      description,
      proposed_start: startDateTime,
      proposed_end: endDateTime,
      group_id: groupId
    };
    
    onSubmit(voteData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Vote title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about this vote"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="startTime"
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Vote</Button>
      </div>
    </form>
  );
};

export default VoteForm;
