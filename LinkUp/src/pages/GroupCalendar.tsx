import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import DayCalendar from '@/components/calendar/DayCalendar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Plus, ChevronLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarEvent, Group, VoteFormData } from '@/types';
import EventDetails from '@/components/events/EventDetails';
import VoteForm from '@/components/votes/VoteForm';
import VoteCard from '@/components/votes/VoteCard';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { startOfHour, addHours, isSameDay, startOfDay, endOfDay, format, isSameMonth, getDate } from 'date-fns';
import { Users, Vote } from 'lucide-react';

const GroupCalendar = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { 
    groups, 
    users, 
    currentUser, 
    getGroupEvents,
    getUserById,
    votes,
    createVoteProposal
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'calendar' | 'votes' | 'day-view'>('calendar');
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [isAddVoteDialogOpen, setIsAddVoteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  if (!groupId) return <div>Group ID is required</div>;
  
  const group = groups.find(g => g.id === groupId);
  if (!group) return <div>Group not found</div>;
  
  const isMember = currentUser ? group.members?.includes(currentUser.id) : false;
  const groupEvents = getGroupEvents(groupId);
  const groupVotes = votes.filter(vote => vote.group_id === groupId);
  const activeVotes = groupVotes.filter(vote => vote.status === 'active');
  const groupMembers = users.filter(user => group.members?.includes(user.id));
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };
  
  const handleAddVote = (voteData: VoteFormData) => {
    createVoteProposal(voteData);
    setIsAddVoteDialogOpen(false);
    toast.success('Vote created successfully');
    setSelectedSlot(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setActiveTab('day-view');
  };

  const handleBackToMonth = () => {
    setActiveTab('calendar');
    setSelectedDate(null);
  };

  const [preFilledVoteData, setPreFilledVoteData] = useState<Partial<VoteFormData> | null>(null);

  const handleTimeSlotClick = (date: Date) => {
    const newSlot = startOfHour(date);
    if (isMember) {
      setSelectedSlot(newSlot);
      const voteData: Partial<VoteFormData> = {
        proposed_start: newSlot,
        proposed_end: addHours(newSlot, 1),
        group_id: groupId,
        title: `Availability vote for ${format(newSlot, 'MMMM d, h:mm a')}`
      };
      setPreFilledVoteData(voteData);
      setIsAddVoteDialogOpen(true);
    }
  };

  // Process availability data for calendar display
  const processAvailabilityData = () => {
    // Get dates of all active votes
    const availableSlots: { date: Date, isVoted?: boolean }[] = [];
    
    activeVotes.forEach(vote => {
      const voteDate = vote.proposed_start instanceof Date ? 
        vote.proposed_start : new Date(vote.proposed_start);
        
      // Fix the property access - check if vote_responses exists on the vote object
      const hasUserVoted = vote.vote_responses?.some(
        response => response.user_id === currentUser?.id
      );
      
      availableSlots.push({
        date: voteDate,
        isVoted: hasUserVoted
      });
    });
    
    return availableSlots;
  };

  const availableSlots = processAvailabilityData();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button variant="link" className="p-0" asChild>
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Groups
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
            <p className="text-muted-foreground">
              {group.description || `Group with ${group.members?.length} members`}
            </p>
          </div>
          
          {isMember && activeTab === 'votes' && (
            <Button onClick={() => {
              setPreFilledVoteData(null);
              setIsAddVoteDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Propose Time
            </Button>
          )}

          {activeTab === 'day-view' && (
            <Button variant="outline" onClick={handleBackToMonth}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Month View
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {groupMembers.map(member => (
            <div key={member.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
              <Avatar className="h-6 w-6">
                <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground text-xs">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>
              </Avatar>
              <span className="text-sm">{member.name}</span>
            </div>
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calendar' | 'votes' | 'day-view')}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {activeTab === 'day-view' ? 'Month View' : 'Calendar'}
            </TabsTrigger>
            <TabsTrigger value="votes" className="flex items-center gap-2">
              <Vote className="h-4 w-4" />
              Availability Votes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-4">
            <MonthCalendar 
              events={groupEvents}
              onEventClick={handleEventClick}
              onDateClick={handleDateClick}
              availableSlots={availableSlots}
              onAvailableSlotClick={isMember ? handleTimeSlotClick : undefined}
            />
            {!isMember && (
              <p className="mt-3 text-sm text-muted-foreground">
                Join this group to propose and vote on available time slots.
              </p>
            )}
          </TabsContent>

          <TabsContent value="day-view" className="mt-4">
            {selectedDate && (
              <DayCalendar 
                date={selectedDate}
                events={groupEvents}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
                availableSlots={availableSlots.filter(slot => {
                  const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
                  return isSameDay(slotDate, selectedDate);
                })}
                onAvailableSlotClick={isMember ? handleTimeSlotClick : undefined}
              />
            )}
          </TabsContent>
          
          <TabsContent value="votes" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeVotes.length > 0 ? (
                activeVotes.map(vote => {
                  const creator = getUserById(vote.created_by);
                  return (
                    <VoteCard 
                      key={vote.id} 
                      vote={vote} 
                      creator={creator} 
                    />
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center bg-white rounded-lg shadow">
                  <Vote className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-xl font-semibold mb-2">No Active Votes</p>
                  <p className="text-muted-foreground mb-4">
                    Create a vote to find the best time for your group to meet
                  </p>
                  {isMember && (
                    <Button onClick={() => {
                      setPreFilledVoteData(null);
                      setIsAddVoteDialogOpen(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Propose Time
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* View Event Dialog */}
      <Dialog open={isViewEventDialogOpen} onOpenChange={setIsViewEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventDetails 
              event={selectedEvent}
              creator={getUserById(selectedEvent.user_id)}
              isOwner={currentUser?.id === selectedEvent.user_id}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Vote Dialog */}
      <Dialog open={isAddVoteDialogOpen} onOpenChange={setIsAddVoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose Time for Vote</DialogTitle>
          </DialogHeader>
          <VoteForm 
            groupId={groupId}
            onSubmit={handleAddVote}
            onCancel={() => {
              setIsAddVoteDialogOpen(false);
              setSelectedSlot(null);
            }}
            initialData={preFilledVoteData}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default GroupCalendar;
