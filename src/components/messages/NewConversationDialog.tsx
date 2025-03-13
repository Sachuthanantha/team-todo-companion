
import { useState } from 'react';
import { useApp, TeamMember } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users } from 'lucide-react';
import { toast } from "sonner";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
}

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onConversationCreated
}: NewConversationDialogProps) => {
  const { teamMembers, getCurrentUserId, addConversation, getConversationsForUser } = useApp();
  const currentUserId = getCurrentUserId();
  
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  
  // Filter out current user and filter by search term
  const availableMembers = teamMembers.filter(member => 
    member.id !== currentUserId && 
    (searchTerm === '' || 
     member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };
  
  const handleCreateConversation = () => {
    if (selectedMemberIds.length === 0) {
      toast.error("Please select at least one team member");
      return;
    }
    
    // For one-on-one conversations, check if it already exists
    if (!isGroup && selectedMemberIds.length === 1) {
      const existingConversations = getConversationsForUser(currentUserId);
      const existingDirectConversation = existingConversations.find(conv => 
        !conv.isGroup && 
        conv.participantIds.length === 2 &&
        conv.participantIds.includes(currentUserId) &&
        conv.participantIds.includes(selectedMemberIds[0])
      );
      
      if (existingDirectConversation) {
        onConversationCreated(existingDirectConversation.id);
        onOpenChange(false);
        toast.info("Opened existing conversation");
        return;
      }
    }
    
    // Create a new conversation
    const newConversation = addConversation({
      name: isGroup ? groupName : undefined,
      participantIds: [currentUserId, ...selectedMemberIds],
      isGroup,
      messages: []
    });
    
    onConversationCreated(newConversation.id);
    onOpenChange(false);
    
    // Reset the form
    setIsGroup(false);
    setGroupName('');
    setSearchTerm('');
    setSelectedMemberIds([]);
    
    toast.success(isGroup ? "Group conversation created" : "Conversation started");
  };
  
  const isValid = selectedMemberIds.length > 0 && (!isGroup || (isGroup && groupName.trim() !== ''));
  
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Reset form when closing
      if (!newOpen) {
        setIsGroup(false);
        setGroupName('');
        setSearchTerm('');
        setSelectedMemberIds([]);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a new conversation with team members
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Group Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isGroup" 
              checked={isGroup}
              onCheckedChange={(checked) => setIsGroup(checked === true)}
            />
            <Label htmlFor="isGroup" className="cursor-pointer">
              Create a group conversation
            </Label>
          </div>
          
          {/* Group Name */}
          {isGroup && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}
          
          {/* Search */}
          <div className="space-y-2">
            <Label>Select Members</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Team Members List */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Team Members</Label>
              <span className="text-xs text-muted-foreground">
                {selectedMemberIds.length} selected
              </span>
            </div>
            
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {availableMembers.length > 0 ? (
                <div className="space-y-2">
                  {availableMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center p-2 rounded cursor-pointer hover:bg-accent ${
                        selectedMemberIds.includes(member.id) ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleToggleMember(member.id)}
                    >
                      <Checkbox
                        checked={selectedMemberIds.includes(member.id)}
                        onCheckedChange={() => handleToggleMember(member.id)}
                        className="mr-3"
                      />
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Users className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No team members found
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mt-2 sm:mt-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={!isValid}
            className="ml-2"
          >
            Create Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
