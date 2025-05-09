import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, Users, Vote } from 'lucide-react';
import { format, isSameDay, startOfDay } from 'date-fns';
import Layout from '@/components/layout/Layout';
import GroupCard from '@/components/groups/GroupCard';
import VoteCard from '@/components/votes/VoteCard';

const Dashboard = () => {
  const { currentUser, events, groups, votes, getUserById } = useAppContext();
  
  const today = startOfDay(new Date());
  
  const upcomingEvents = events
    .filter(event => {
      const eventDate = event.start_time instanceof Date ? event.start_time : new Date(event.start_time);
      return eventDate >= today;
    })
    .sort((a, b) => {
      const aDate = a.start_time instanceof Date ? a.start_time : new Date(a.start_time);
      const bDate = b.start_time instanceof Date ? b.start_time : new Date(b.start_time);
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 3);
    
  const todayEvents = events.filter(event => {
    const eventDate = event.start_time instanceof Date ? event.start_time : new Date(event.start_time);
    return isSameDay(eventDate, today);
  });
  
  const userGroups = groups.filter(group => 
    currentUser && group.members.includes(currentUser.id)
  ).slice(0, 3);
  
  const activeVotes = votes.filter(vote => vote.status === 'active').slice(0, 3);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/bdc5c01d-17e7-4823-8603-082672d9edb8.png" 
              alt="Link-Up Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {currentUser?.name || 'User'}!
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild>
              <Link to="/calendar" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link to="/groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manage Groups
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Events
              </CardTitle>
              <CardDescription>
                {format(today, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {todayEvents.length > 0 ? (
                <div className="space-y-3">
                  {todayEvents.map(event => {
                    const startTime = event.start_time instanceof Date ? event.start_time : new Date(event.start_time);
                    const endTime = event.end_time instanceof Date ? event.end_time : new Date(event.end_time);
                    return (
                      <div 
                        key={event.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
                      >
                        <div 
                          className="w-2 h-10 rounded-full" 
                          style={{ backgroundColor: event.color || '#9b87f5' }} 
                        />
                        
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No events scheduled for today</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
                
                <Button variant="link" size="sm" asChild>
                  <Link to="/calendar">View Calendar</Link>
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    const startTime = event.start_time instanceof Date ? event.start_time : new Date(event.start_time);
                    const endTime = event.end_time instanceof Date ? event.end_time : new Date(event.end_time);
                    return (
                      <div 
                        key={event.id}
                        className="flex items-start gap-4 p-2 rounded-md hover:bg-gray-50"
                      >
                        <div className="min-w-[60px] text-center">
                          <div className="bg-gray-100 rounded-md p-1">
                            <p className="text-xs text-gray-500">{format(startTime, 'MMM')}</p>
                            <p className="text-lg font-bold">{format(startTime, 'd')}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-500">{event.location}</p>
                          )}
                        </div>
                        
                        <div 
                          className="ml-auto w-2 h-10 rounded-full" 
                          style={{ backgroundColor: event.color || '#9b87f5' }} 
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No upcoming events</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5 text-primary" />
                  Active Votes
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent>
              {activeVotes.length > 0 ? (
                <div className="space-y-3">
                  {activeVotes.map(vote => {
                    const creator = getUserById(vote.created_by);
                    const proposedStart = vote.proposed_start instanceof Date ? vote.proposed_start : new Date(vote.proposed_start);
                    return (
                      <div 
                        key={vote.id}
                        className="p-2 rounded-md hover:bg-gray-50"
                      >
                        <p className="font-medium">{vote.title}</p>
                        <p className="text-xs text-gray-500">
                          {format(proposedStart, 'MMM d, HH:mm')}
                        </p>
                        <div className="mt-1 flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {(vote.vote_responses || []).filter(v => v.response === 'yes').length} votes
                          </span>
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/group/${vote.group_id}`}>
                              Vote
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No active votes</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Groups</h2>
            <Button variant="link" asChild>
              <Link to="/groups">View All Groups</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
            
            {userGroups.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">You're not a member of any groups yet</p>
                  <Button asChild>
                    <Link to="/groups">
                      <Users className="h-4 w-4 mr-2" />
                      Find Groups
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
