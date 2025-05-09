import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import DayCalendar from '@/components/calendar/DayCalendar';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarEvent, EventFormData } from '@/types';
import EventForm from '@/components/events/EventForm';
import EventDetails from '@/components/events/EventDetails';
import { toast } from 'sonner';
import CalendarConnections from '@/components/calendar/CalendarConnections';

const PersonalCalendar = () => {
  const { events, currentUser, addEvent, updateEvent, deleteEvent, getUserById } = useAppContext();
  const [activeTab, setActiveTab] = useState<'month' | 'day'>('month');
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setActiveTab('day');
  };

  const handleHourClick = (date: Date) => {
    setSelectedDate(date);
    setIsAddEventDialogOpen(true);
  };
  
  const handleAddEvent = (eventData: EventFormData) => {
    addEvent(eventData);
    setIsAddEventDialogOpen(false);
    toast.success('Event created successfully');
  };
  
  const handleUpdateEvent = (eventData: EventFormData) => {
    if (selectedEvent) {
      updateEvent({
        ...eventData,
        id: selectedEvent.id,
        user_id: selectedEvent.user_id,
      });
      setIsEditEventDialogOpen(false);
      toast.success('Event updated successfully');
    }
  };
  
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      setIsViewEventDialogOpen(false);
      toast.success('Event deleted successfully');
    }
  };
  
  const handleEditEvent = () => {
    setIsViewEventDialogOpen(false);
    setIsEditEventDialogOpen(true);
  };
  
  const userEvents = events.filter(
    event => currentUser && event.user_id === currentUser.id
  );
  
  console.log("Personal Calendar - Total Events:", events.length);
  console.log("Personal Calendar - Current User:", currentUser?.id);
  console.log("Personal Calendar - User Events:", userEvents.length);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Calendar</h1>
            <p className="text-muted-foreground">
              Manage your personal events
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab(activeTab === 'month' ? 'day' : 'month')}>
              <Calendar className="h-4 w-4 mr-2" />
              {activeTab === 'month' ? 'Day View' : 'Month View'}
            </Button>
            <Button onClick={() => {
              setSelectedDate(new Date());
              setIsAddEventDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>
        
        <CalendarConnections />
        
        {activeTab === 'month' ? (
          <MonthCalendar 
            events={userEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        ) : (
          <DayCalendar 
            date={selectedDate}
            events={userEvents}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleHourClick}
          />
        )}
      </div>
      
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <EventForm 
            initialData={selectedDate ? { start_time: selectedDate, end_time: new Date(selectedDate.getTime() + 60 * 60 * 1000) } : undefined}
            onSubmit={handleAddEvent}
            onCancel={() => setIsAddEventDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventDetails 
              event={selectedEvent}
              creator={getUserById(selectedEvent.user_id)}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              isOwner={currentUser?.id === selectedEvent.user_id}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm 
              initialData={{
                title: selectedEvent.title,
                description: selectedEvent.description,
                location: selectedEvent.location,
                start_time: selectedEvent.start_time instanceof Date 
                  ? selectedEvent.start_time 
                  : new Date(selectedEvent.start_time),
                end_time: selectedEvent.end_time instanceof Date 
                  ? selectedEvent.end_time 
                  : new Date(selectedEvent.end_time),
                color: selectedEvent.color,
                is_private: selectedEvent.is_private
              }}
              onSubmit={handleUpdateEvent}
              onCancel={() => setIsEditEventDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PersonalCalendar;
