
import { useState } from 'react';
import { TeamMember, useApp } from '@/context/AppContext';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { TeamMemberDialog } from '@/components/team/TeamMemberDialog';
import { Users, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Team = () => {
  const { teamMembers } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddMember = () => {
    setSelectedMember(null);
    setDialogOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  // Filter team members based on search query
  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-md mr-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold">Team</h1>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAddMember}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Manage your team members and their assigned tasks.
        </p>
      </header>

      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map(member => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-secondary/50 rounded-lg">
          <Users className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          {searchQuery ? (
            <>
              <p className="text-muted-foreground mb-4 text-center">No team members match your search</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4 text-center">No team members yet</p>
              <Button onClick={handleAddMember}>
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </>
          )}
        </div>
      )}

      {/* Team Member Dialog */}
      <TeamMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialMember={selectedMember}
      />
    </div>
  );
};

export default Team;
