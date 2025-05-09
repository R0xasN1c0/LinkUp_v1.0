
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import GroupCard from '@/components/groups/GroupCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GroupForm from '@/components/groups/GroupForm';
import { Group, GroupFormData } from '@/types';
import { toast } from 'sonner';

const Groups = () => {
  const { groups, addGroup } = useAppContext();
  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleAddGroup = (groupData: GroupFormData) => {
    // addGroup now handles both the group data and the members
    addGroup(groupData);
    setIsAddGroupDialogOpen(false);
    toast.success('Group created successfully');
  };
  
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
            <p className="text-muted-foreground">
              Join existing groups or create your own
            </p>
          </div>
          
          <Button onClick={() => setIsAddGroupDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search groups..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
          
          {filteredGroups.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground mb-4">No groups found</p>
              <Button onClick={() => setIsAddGroupDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Group Dialog */}
      <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <GroupForm 
            onSubmit={handleAddGroup}
            onCancel={() => setIsAddGroupDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Groups;
