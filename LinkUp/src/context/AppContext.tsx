import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, CalendarEvent, Group, VoteProposal, Friend, GroupMember, EventFormData, GroupFormData, VoteFormData, VoteResponse, CalendarConnection } from '../types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AppContextType {
  currentUser: User | null;
  events: CalendarEvent[];
  groups: Group[];
  votes: VoteProposal[];
  groupMembers: GroupMember[];
  users: User[];
  calendarConnections: CalendarConnection[];
  addEvent: (event: EventFormData) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  addGroup: (group: GroupFormData & { members?: string[] }) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  addMembersToGroup: (groupId: string, memberIds: string[]) => Promise<void>;
  createVoteProposal: (vote: VoteFormData) => Promise<void>;
  submitVote: (voteId: string, response: 'yes' | 'no' | 'maybe') => Promise<void>;
  getGroupEvents: (groupId: string) => CalendarEvent[];
  getUserById: (userId: string) => User | undefined;
  connectCalendar: () => Promise<void>;
  disconnectCalendar: (connectionId: string) => Promise<void>;
  syncCalendars: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [votes, setVotes] = useState<VoteProposal[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [calendarConnections, setCalendarConnections] = useState<CalendarConnection[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (profile) {
        const userProfile: User = {
          id: profile.id,
          name: profile.name,
          username: profile.username || undefined,
          avatar_url: profile.avatar_url || undefined,
          created_at: profile.created_at ? new Date(profile.created_at) : undefined
        };
        setCurrentUser(userProfile);
      } else {
        // Create a profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.email?.split('@')[0] || 'User',
          });
        
        if (insertError) throw insertError;
        
        // Load the newly created profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (newProfile) {
          const userProfile: User = {
            id: newProfile.id,
            name: newProfile.name,
            username: newProfile.username || undefined,
            avatar_url: newProfile.avatar_url || undefined,
            created_at: newProfile.created_at ? new Date(newProfile.created_at) : undefined
          };
          setCurrentUser(userProfile);
        }
      }

      // Load user's events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id);

      if (eventsError) throw eventsError;
      if (eventsData) {
        const formattedEvents: CalendarEvent[] = eventsData.map(event => ({
          id: event.id,
          user_id: event.user_id,
          title: event.title,
          description: event.description || undefined,
          start_time: new Date(event.start_time),
          end_time: new Date(event.end_time),
          location: event.location || undefined,
          color: event.color || undefined,
          is_private: event.is_private ?? false,
          created_at: event.created_at ? new Date(event.created_at) : undefined
        }));
        setEvents(formattedEvents);
      }

      // Load user's group memberships first
      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('user_id', user.id);

      if (membersError) throw membersError;
      
      // Then fetch the actual groups
      if (membersData && membersData.length > 0) {
        const groupIds = membersData.map(member => member.group_id);
        
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds);
          
        if (groupsError) throw groupsError;
        
        if (groupsData) {
          // For each group, fetch members
          const formattedGroups: Group[] = await Promise.all(
            groupsData.map(async group => {
              const { data: groupMembersData } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', group.id);
                
              const memberIds = groupMembersData?.map(member => member.user_id) || [];
              
              return {
                id: group.id,
                name: group.name,
                description: group.description || undefined,
                created_by: group.created_by,
                created_at: group.created_at ? new Date(group.created_at) : new Date(),
                members: memberIds
              };
            })
          );
          
          setGroups(formattedGroups);
        }
        
        // Save group members for reference
        setGroupMembers(membersData.map(member => ({
          id: member.id,
          group_id: member.group_id,
          user_id: member.user_id,
          is_admin: member.is_admin ?? false,
          created_at: member.created_at ? new Date(member.created_at) : new Date()
        })));
      }

      // Load active votes for user's groups
      if (groups.length > 0) {
        const groupIds = groups.map(g => g.id);
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('status', 'active')
          .in('group_id', groupIds);

        if (votesError) throw votesError;
        if (votesData) {
          // Fetch vote responses separately
          const voteIds = votesData.map(vote => vote.id);
          const { data: responsesData, error: responsesError } = await supabase
            .from('vote_responses')
            .select('*')
            .in('vote_id', voteIds);
            
          if (responsesError) throw responsesError;
          
          const responsesByVoteId: Record<string, VoteResponse[]> = {};
          
          // Group responses by vote_id
          if (responsesData) {
            responsesData.forEach(response => {
              if (!responsesByVoteId[response.vote_id]) {
                responsesByVoteId[response.vote_id] = [];
              }
              responsesByVoteId[response.vote_id].push({
                id: response.id,
                vote_id: response.vote_id,
                user_id: response.user_id,
                response: response.response as 'yes' | 'no' | 'maybe',
                created_at: response.created_at ? new Date(response.created_at) : new Date()
              });
            });
          }
          
          const formattedVotes: VoteProposal[] = votesData.map(vote => {
            return {
              id: vote.id,
              group_id: vote.group_id,
              title: vote.title,
              description: vote.description || undefined,
              proposed_start: new Date(vote.proposed_start),
              proposed_end: new Date(vote.proposed_end),
              created_by: vote.created_by,
              status: vote.status as 'active' | 'completed' | 'cancelled',
              created_at: vote.created_at ? new Date(vote.created_at) : new Date(),
              vote_responses: responsesByVoteId[vote.id] || []
            };
          });
          setVotes(formattedVotes);
        }
      }

      // Load users (for profile display)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;
      if (usersData) {
        const formattedUsers: User[] = usersData.map(user => ({
          id: user.id,
          name: user.name,
          username: user.username || undefined,
          avatar_url: user.avatar_url || undefined,
          created_at: user.created_at ? new Date(user.created_at) : undefined
        }));
        setUsers(formattedUsers);
      }

      // Load calendar connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('user_id', user.id);

      if (connectionsError) throw connectionsError;
      if (connectionsData) {
        const formattedConnections: CalendarConnection[] = connectionsData.map(conn => ({
          id: conn.id,
          user_id: conn.user_id,
          provider: conn.provider as 'google',
          external_calendar_id: conn.external_calendar_id,
          calendar_name: conn.calendar_name || undefined,
          sync_token: conn.sync_token || undefined,
          last_synced_at: conn.last_synced_at ? new Date(conn.last_synced_at) : undefined,
          created_at: conn.created_at ? new Date(conn.created_at) : undefined,
          access_token: conn.access_token,
          refresh_token: conn.refresh_token,
          token_expires_at: new Date(conn.token_expires_at)
        }));
        setCalendarConnections(formattedConnections);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    }
  };

  const addEvent = async (eventData: EventFormData) => {
    if (!user) return;
    
    try {
      // Convert Date objects to ISO strings for Supabase
      const dbEventData = {
        ...eventData,
        user_id: user.id,
        start_time: eventData.start_time.toISOString(),
        end_time: eventData.end_time.toISOString()
      };

      const { data, error } = await supabase
        .from('events')
        .insert(dbEventData)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newEvent: CalendarEvent = {
          id: data.id,
          user_id: data.user_id,
          title: data.title,
          description: data.description || undefined,
          start_time: new Date(data.start_time),
          end_time: new Date(data.end_time),
          location: data.location || undefined,
          color: data.color || undefined,
          is_private: data.is_private ?? false,
          created_at: data.created_at ? new Date(data.created_at) : undefined
        };
        setEvents(prev => [...prev, newEvent]);
        toast.success('Event created successfully');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to create event');
    }
  };

  const getGroupEvents = (groupId: string): CalendarEvent[] => {
    return events.filter(event => {
      const isGroupMember = groups.some(group => 
        group.id === groupId && 
        group.members?.includes(event.user_id)
      );
      return isGroupMember;
    });
  };

  const updateEvent = async (updatedEvent: CalendarEvent) => {
    try {
      // Convert Date objects to ISO strings for Supabase
      const dbEventData = {
        ...updatedEvent,
        start_time: updatedEvent.start_time instanceof Date ? 
          updatedEvent.start_time.toISOString() : updatedEvent.start_time,
        end_time: updatedEvent.end_time instanceof Date ? 
          updatedEvent.end_time.toISOString() : updatedEvent.end_time,
        created_at: updatedEvent.created_at instanceof Date ?
          updatedEvent.created_at.toISOString() : updatedEvent.created_at,
      };

      const { data, error } = await supabase
        .from('events')
        .update(dbEventData)
        .eq('id', updatedEvent.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setEvents(prev => prev.map(event =>
          event.id === updatedEvent.id ? {
            ...data,
            start_time: new Date(data.start_time),
            end_time: new Date(data.end_time),
            created_at: data.created_at ? new Date(data.created_at) : undefined
          } : event
        ));
        toast.success('Event updated successfully');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const addGroup = async (groupData: GroupFormData & { members?: string[] }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({ 
          name: groupData.name, 
          description: groupData.description, 
          created_by: user.id 
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        // Add the current user as an admin member of the group
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: data.id,
            user_id: user.id,
            is_admin: true
          });
          
        if (memberError) throw memberError;
        
        // Add additional members if provided
        if (groupData.members && groupData.members.length > 0) {
          const groupMembers = groupData.members.map(memberId => ({
            group_id: data.id,
            user_id: memberId,
            is_admin: false
          }));
          
          const { error: addMembersError } = await supabase
            .from('group_members')
            .insert(groupMembers);
            
          if (addMembersError) {
            console.error('Error adding group members:', addMembersError);
            // Continue anyway, just log the error
          }
        }
        
        // Create initial group with only confirmed members
        const memberIds = groupData.members || [];
        
        const newGroup: Group = {
          id: data.id,
          name: data.name,
          description: data.description || undefined,
          created_by: data.created_by,
          created_at: data.created_at ? new Date(data.created_at) : new Date(),
          members: [user.id, ...memberIds] // Add current user and additional members
        };
        
        setGroups(prev => [...prev, newGroup]);
        toast.success('Group created successfully');
      }
    } catch (error) {
      console.error('Error adding group:', error);
      toast.error('Failed to create group');
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert([{ group_id: groupId, user_id: user.id }]);

      if (error) throw error;
      // Optimistically update the state
      setGroups(prev => prev.map(group => {
        if (group.id === groupId && !group.members.includes(user.id)) {
          return { ...group, members: [...group.members, user.id] };
        }
        return group;
      }));
      toast.success('Successfully joined the group');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join the group');
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
      // Optimistically update the state
      setGroups(prev => prev.map(group => {
        if (group.id === groupId) {
          return { ...group, members: group.members.filter(id => id !== user.id) };
        }
        return group;
      }));
      toast.success('Successfully left the group');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave the group');
    }
  };

  const addMembersToGroup = async (groupId: string, memberIds: string[]) => {
    if (!user || memberIds.length === 0) return;

    try {
      // Filter out members that are already in the group
      const group = groups.find(g => g.id === groupId);
      if (!group) {
        toast.error('Group not found');
        return;
      }

      const newMemberIds = memberIds.filter(id => !group.members.includes(id));
      if (newMemberIds.length === 0) {
        toast.info('Selected users are already members of this group');
        return;
      }

      // Create group member entries for new members
      const groupMembers = newMemberIds.map(memberId => ({
        group_id: groupId,
        user_id: memberId,
        is_admin: false
      }));

      const { error: addMembersError } = await supabase
        .from('group_members')
        .insert(groupMembers);

      if (addMembersError) throw addMembersError;

      // Update the local state
      setGroups(prev => prev.map(g => {
        if (g.id === groupId) {
          return { 
            ...g, 
            members: [...g.members, ...newMemberIds]
          };
        }
        return g;
      }));

      toast.success(`${newMemberIds.length} member${newMemberIds.length > 1 ? 's' : ''} added to the group`);
    } catch (error) {
      console.error('Error adding members to group:', error);
      toast.error('Failed to add members to group');
    }
  };

  const createVoteProposal = async (voteData: VoteFormData) => {
    if (!user) return;

    try {
      // Convert Date objects to ISO strings for Supabase
      const dbVoteData = {
        title: voteData.title,
        description: voteData.description,
        group_id: voteData.group_id,
        created_by: user.id,
        status: 'active' as const,
        proposed_start: voteData.proposed_start.toISOString(),
        proposed_end: voteData.proposed_end.toISOString()
      };

      const { data, error } = await supabase
        .from('votes')
        .insert(dbVoteData)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newVote: VoteProposal = {
          id: data.id,
          group_id: data.group_id,
          title: data.title,
          description: data.description || undefined,
          proposed_start: new Date(data.proposed_start),
          proposed_end: new Date(data.proposed_end),
          created_by: data.created_by,
          status: data.status as 'active' | 'completed' | 'cancelled',
          created_at: data.created_at ? new Date(data.created_at) : new Date(),
          vote_responses: []
        };
        setVotes(prev => [...prev, newVote]);
        toast.success('Vote proposal created successfully');
      }
    } catch (error) {
      console.error('Error creating vote proposal:', error);
      toast.error('Failed to create vote proposal');
    }
  };

  const submitVote = async (voteId: string, response: 'yes' | 'no' | 'maybe') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vote_responses')
        .insert([{ vote_id: voteId, user_id: user.id, response }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Vote submitted successfully');

      if (data) {
        // Explicitly define the correct type for the response
        const responseType: 'yes' | 'no' | 'maybe' = data.response as 'yes' | 'no' | 'maybe';
        
        // Optimistically update the vote responses
        setVotes(prev => prev.map(vote => {
          if (vote.id === voteId) {
            const newResponse: VoteResponse = {
              id: data.id,
              vote_id: data.vote_id,
              user_id: data.user_id,
              response: responseType,
              created_at: data.created_at ? new Date(data.created_at) : new Date()
            };
            
            // Filter out any existing responses from this user
            const filteredResponses = vote.vote_responses ? 
              vote.vote_responses.filter(r => r.user_id !== user.id) : [];
              
            return { 
              ...vote, 
              vote_responses: [...filteredResponses, newResponse]
            };
          }
          return vote;
        }));
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote');
    }
  };

  const connectCalendar = async () => {
    if (!user) {
      toast.error('You need to be logged in to connect a calendar');
      return;
    }

    try {
      console.log('Starting Google Calendar OAuth flow');
      
      // Determine if we're running in a mobile context or web
      const isMobileApp = window.matchMedia('(max-width: 767px)').matches || 
                          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                         
      // Create the redirect URL based on the platform
      let redirectUrl;
      if (isMobileApp) {
        // For mobile, we use the app's URL scheme
        const baseUrl = window.location.origin;
        redirectUrl = `${baseUrl}/calendar`;
      } else {
        // For web, we use the standard web URL
        redirectUrl = `${window.location.origin}/calendar`;
      }
      
      console.log('Redirect URL:', redirectUrl);
      
      // Initiate OAuth flow for Google Calendar with explicit redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar.readonly',
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        toast.error('Failed to connect Google Calendar: ' + error.message);
        throw error;
      }

      console.log('OAuth flow initiated:', data);
      toast.info('Redirecting to Google for authorization...');
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      toast.error('Failed to connect Google Calendar');
      throw error;
    }
  };

  const disconnectCalendar = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_connections')
        .delete()
        .eq('id', connectionId)
        .eq('provider', 'google');

      if (error) throw error;

      // Refresh calendar connections
      await loadUserData();
      toast.success('Google Calendar disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      toast.error('Failed to disconnect calendar');
    }
  };

  const syncCalendars = async () => {
    try {
      console.log('Initiating calendar sync');
      const { error } = await supabase.functions.invoke('sync-calendars');
      
      if (error) throw error;
      
      toast.success('Calendar sync complete');
      // Refresh calendar connections and events to reflect the sync
      await loadUserData();
    } catch (error) {
      console.error('Error syncing calendars:', error);
      toast.error('Failed to sync calendars');
    }
  };

  const getUserById = (userId: string): User | undefined => {
    if (currentUser && userId === currentUser.id) {
      return currentUser;
    }
    return users.find(user => user.id === userId);
  };

  const value: AppContextType = {
    currentUser,
    events,
    groups,
    votes,
    groupMembers,
    users,
    calendarConnections,
    addEvent,
    updateEvent,
    deleteEvent,
    addGroup,
    joinGroup,
    leaveGroup,
    addMembersToGroup,
    createVoteProposal,
    submitVote,
    getGroupEvents,
    getUserById,
    connectCalendar,
    disconnectCalendar,
    syncCalendars,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
