
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Friends = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFriendData();
    }
  }, [user]);

  const loadFriendData = async () => {
    try {
      setLoading(true);
      
      // Load received friend requests - query directly without using foreign key relationship
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('friends')
        .select('id, user_id, status')
        .eq('friend_id', user?.id)
        .eq('status', 'pending');

      if (receivedError) {
        console.error('Error loading received requests:', receivedError);
        throw receivedError;
      }

      // For each received request, get the sender's profile
      const receivedWithProfiles = await Promise.all(
        (receivedRequests || []).map(async (request) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, username')
            .eq('id', request.user_id)
            .single();
          
          return {
            ...request,
            profiles: profileData
          };
        })
      );

      // Load sent friend requests - query directly without using foreign key relationship
      const { data: outgoingRequests, error: sentError } = await supabase
        .from('friends')
        .select('id, friend_id, status')
        .eq('user_id', user?.id)
        .eq('status', 'pending');
        
      if (sentError) {
        console.error('Error loading sent requests:', sentError);
        throw sentError;
      }

      // For each sent request, get the recipient's profile
      const sentWithProfiles = await Promise.all(
        (outgoingRequests || []).map(async (request) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, username')
            .eq('id', request.friend_id)
            .single();
          
          return {
            ...request,
            profiles: profileData
          };
        })
      );

      // Load accepted friends
      const { data: acceptedFriends, error: friendsError } = await supabase
        .from('friends')
        .select('id, friend_id')
        .eq('user_id', user?.id)
        .eq('status', 'accepted');
        
      if (friendsError) {
        console.error('Error loading accepted friends:', friendsError);
        throw friendsError;
      }

      // For each friend, get their profile
      const friendsWithProfiles = await Promise.all(
        (acceptedFriends || []).map(async (friend) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, username')
            .eq('id', friend.friend_id)
            .single();
          
          return {
            ...friend,
            profiles: profileData
          };
        })
      );

      console.log('Received requests:', receivedWithProfiles);
      console.log('Sent requests:', sentWithProfiles);
      console.log('Accepted friends:', friendsWithProfiles);

      setPendingRequests(receivedWithProfiles || []);
      setSentRequests(sentWithProfiles || []);
      setFriends(friendsWithProfiles || []);
    } catch (error) {
      console.error('Error loading friend data:', error);
      toast.error('Failed to load friend data');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    
    try {
      // First, find the user by username
      const { data: userToAdd, error: userError } = await supabase
        .from('profiles')
        .select('id, name, username')
        .eq('username', username)
        .single();

      if (userError || !userToAdd) {
        console.error('User lookup error:', userError);
        toast.error('User not found');
        return;
      }

      if (userToAdd.id === user?.id) {
        toast.error('You cannot add yourself as a friend');
        return;
      }

      // Check if request already exists - using two separate queries for clarity
      const { data: existingRequestsByUser, error: requestErrorByUser } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user?.id)
        .eq('friend_id', userToAdd.id);

      const { data: existingRequestsToUser, error: requestErrorToUser } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', userToAdd.id)
        .eq('friend_id', user?.id);

      if (requestErrorByUser) {
        console.error('Error checking outgoing requests:', requestErrorByUser);
        throw requestErrorByUser;
      }
      
      if (requestErrorToUser) {
        console.error('Error checking incoming requests:', requestErrorToUser);
        throw requestErrorToUser;
      }

      if ((existingRequestsByUser && existingRequestsByUser.length > 0) || 
          (existingRequestsToUser && existingRequestsToUser.length > 0)) {
        toast.error('Friend request already exists');
        return;
      }

      // Send friend request
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user?.id,
          friend_id: userToAdd.id,
          status: 'pending'
        });

      if (error) {
        console.error('Error sending friend request:', error);
        throw error;
      }

      toast.success('Friend request sent');
      setUsername('');
      await loadFriendData();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  };

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      if (accept) {
        await supabase
          .from('friends')
          .update({ status: 'accepted' })
          .eq('id', requestId);
        toast.success('Friend request accepted');
      } else {
        await supabase
          .from('friends')
          .delete()
          .eq('id', requestId);
        toast.success('Friend request rejected');
      }
      await loadFriendData();
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast.error('Failed to process friend request');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
        </div>

        <div className="max-w-xl">
          <div className="flex gap-4 mb-8">
            <Input 
              type="text" 
              placeholder="Enter friend's username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1"
            />
            <Button onClick={sendFriendRequest}>
              <UserPlus className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p>Loading friend data...</p>
            </div>
          ) : (
            <>
              {pendingRequests.length > 0 && (
                <div className="space-y-4 mb-8">
                  <h2 className="text-xl font-semibold">Pending Friend Requests</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.profiles?.name}</TableCell>
                          <TableCell>{request.profiles?.username}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFriendRequest(request.id, true)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleFriendRequest(request.id, false)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {sentRequests.length > 0 && (
                <div className="space-y-4 mb-8">
                  <h2 className="text-xl font-semibold">Sent Requests</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sentRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.profiles?.name}</TableCell>
                          <TableCell>{request.profiles?.username}</TableCell>
                          <TableCell>Pending</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {friends.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Your Friends</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {friends.map((friend) => (
                        <TableRow key={friend.id}>
                          <TableCell>{friend.profiles?.name}</TableCell>
                          <TableCell>{friend.profiles?.username}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No friends added yet</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Friends;
