
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Group, User } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Calendar, ChevronRight, UserPlus } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GroupForm from './GroupForm';

interface GroupCardProps {
  group: Group;
  showMembers?: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({ 
  group,
  showMembers = true
}) => {
  const navigate = useNavigate();
  const { currentUser, getUserById, addMembersToGroup } = useAppContext();
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  
  const members = group.members || [];
  const isCurrentUserMember = currentUser ? members.includes(currentUser.id) : false;
  const isCurrentUserAdmin = currentUser?.id === group.created_by;
  const creator = getUserById(group.created_by);
  
  const viewGroup = () => {
    navigate(`/group/${group.id}`);
  };

  const handleAddMembers = async (data: any) => {
    await addMembersToGroup(group.id, data.members || []);
    setIsAddMembersOpen(false);
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{group.name}</h3>
              {group.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{group.description}</p>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={viewGroup}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created by {creator?.name || 'Unknown'}</span>
          </div>
          
          {showMembers && members.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">Members</p>
                {(isCurrentUserMember || isCurrentUserAdmin) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsAddMembersOpen(true)}
                    className="flex items-center gap-1 h-7 px-2 text-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add Members
                  </Button>
                )}
              </div>
              <div className="flex -space-x-2">
                {members.slice(0, 5).map(memberId => {
                  const member = getUserById(memberId);
                  return (
                    <Avatar key={memberId} className="border-2 border-white">
                      <div className="bg-primary text-primary-foreground flex items-center justify-center h-full">
                        {member?.avatar_url ? (
                          <img src={member.avatar_url} alt={member.name} />
                        ) : (
                          member?.name?.charAt(0) || 'U'
                        )}
                      </div>
                    </Avatar>
                  );
                })}
                
                {members.length > 5 && (
                  <Avatar className="border-2 border-white">
                    <div className="bg-muted flex items-center justify-center h-full">
                      +{members.length - 5}
                    </div>
                  </Avatar>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-gray-50 pt-3 pb-3">
          <Button 
            variant="outline" 
            className="w-full text-primary"
            onClick={viewGroup}
          >
            View Group Calendar
          </Button>
        </CardFooter>
      </Card>
      
      {/* Add Members Dialog */}
      <Dialog open={isAddMembersOpen} onOpenChange={setIsAddMembersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Members to {group.name}</DialogTitle>
          </DialogHeader>
          <GroupForm 
            onSubmit={handleAddMembers}
            onCancel={() => setIsAddMembersOpen(false)}
            existingMembers={members}
            isEdit={true}
            initialData={{
              name: group.name,
              description: group.description
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GroupCard;
