
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { GroupFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, X, Check, UserPlus, Users } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { useAppContext } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface GroupFormProps {
  onSubmit: (data: GroupFormData) => void;
  onCancel: () => void;
  initialData?: GroupFormData;
  existingMembers?: string[];
  isEdit?: boolean;
}

interface FriendProfile {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
}

const GroupForm: React.FC<GroupFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  existingMembers = [],
  isEdit = false 
}) => {
  const { user } = useAuth();
  const { users } = useAppContext();
  const [selectedMembers, setSelectedMembers] = useState<string[]>(existingMembers);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFriends, setShowFriends] = useState(false);
  const [friends, setFriends] = useState<FriendProfile[]>([]);

  const form = useForm<GroupFormData>({
    defaultValues: initialData || {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    // Load user's friends list
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    try {
      // Get all accepted friendships where the current user is either the requester or the recipient
      const { data: sentFriends, error: sentError } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user?.id)
        .eq('status', 'accepted');
      
      const { data: receivedFriends, error: receivedError } = await supabase
        .from('friends')
        .select('user_id')
        .eq('friend_id', user?.id)
        .eq('status', 'accepted');
      
      if (sentError) throw sentError;
      if (receivedError) throw receivedError;
      
      const allFriends: FriendProfile[] = [];

      // Process sent friends - fetch their profiles separately
      if (sentFriends && sentFriends.length > 0) {
        const friendIds = sentFriends.map(f => f.friend_id);
        const { data: friendProfiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', friendIds);
          
        if (friendProfiles) {
          allFriends.push(...friendProfiles.map(profile => ({
            id: profile.id,
            name: profile.name,
            username: profile.username,
            avatar_url: profile.avatar_url
          })));
        }
      }

      // Process received friends - fetch their profiles separately
      if (receivedFriends && receivedFriends.length > 0) {
        const friendIds = receivedFriends.map(f => f.user_id);
        const { data: friendProfiles } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .in('id', friendIds);
          
        if (friendProfiles) {
          allFriends.push(...friendProfiles.map(profile => ({
            id: profile.id,
            name: profile.name,
            username: profile.username,
            avatar_url: profile.avatar_url
          })));
        }
      }
      
      setFriends(allFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleSearchUser = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .or(`name.ilike.%${term}%,username.ilike.%${term}%`)
        .limit(5);
      
      if (error) throw error;
      
      // Filter out already selected users and the current user
      const filteredResults = (data || []).filter(user => 
        user.id !== user?.id && !selectedMembers.includes(user.id)
      );
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = (member: any) => {
    if (!selectedMembers.includes(member.id)) {
      setSelectedMembers([...selectedMembers, member.id]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(id => id !== memberId));
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId) || 
           friends.find(friend => friend.id === userId) ||
           searchResults.find(result => result.id === userId);
  };

  const handleSubmit = (data: GroupFormData) => {
    // Add the selected members to the form data
    const formData = {
      ...data,
      members: selectedMembers
    };
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter group description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel htmlFor="members">{isEdit ? "Add New Members" : "Add Members"}</FormLabel>
          <div className="flex space-x-2">
            <Popover open={isSearching || searchResults.length > 0} onOpenChange={setIsSearching}>
              <PopoverTrigger asChild>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search-members"
                      placeholder="Search users..."
                      className="pl-9 pr-4 w-full"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearchUser(e.target.value);
                      }}
                      onFocus={() => setIsSearching(true)}
                    />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]" align="start">
                <Command>
                  <CommandList>
                    <CommandEmpty>No users found</CommandEmpty>
                    <CommandGroup heading="Users">
                      {searchResults.map(user => (
                        <CommandItem 
                          key={user.id} 
                          onSelect={() => handleAddMember(user)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Avatar>
                              <div className="bg-muted flex h-full w-full items-center justify-center">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              {user.username && (
                                <p className="text-xs text-muted-foreground">@{user.username}</p>
                              )}
                            </div>
                          </div>
                          <Plus className="h-4 w-4" />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={() => setShowFriends(!showFriends)}
              title="Show your friends"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          
          {showFriends && (
            <div className="border rounded-md p-4 mt-2 bg-background">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Your Friends
                </h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFriends(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-1">
                {friends.length === 0 && (
                  <p className="text-sm text-muted-foreground py-2">No friends yet</p>
                )}
                
                {friends.filter(friend => !selectedMembers.includes(friend.id)).map(friend => (
                  <div 
                    key={friend.id} 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <div className="bg-muted flex h-full w-full items-center justify-center">
                          {friend.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{friend.name}</p>
                        {friend.username && (
                          <p className="text-xs text-muted-foreground">@{friend.username}</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => handleAddMember(friend)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedMembers.map(memberId => {
                const member = getUserById(memberId);
                return (
                  <Badge key={memberId} variant="secondary" className="flex items-center gap-1 pr-1">
                    {member?.name || 'Unknown'}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 rounded-full ml-1"
                      onClick={() => handleRemoveMember(memberId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? "Update Group" : "Create Group"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GroupForm;
