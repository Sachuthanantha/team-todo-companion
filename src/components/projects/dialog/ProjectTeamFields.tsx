
import { useState, useEffect } from 'react';
import { Project, useApp } from '@/context/AppContext';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProjectTeamFieldsProps {
  selectedMemberOptions: { value: string; label: string }[];
  setSelectedMemberOptions: (options: { value: string; label: string }[]) => void;
  selectedClientOptions: { value: string; label: string }[];
  setSelectedClientOptions: (options: { value: string; label: string }[]) => void;
  manualClientInput?: string;
  setManualClientInput?: (value: string) => void;
  onAddManualClient?: () => void;
  initialProject: Project | null;
}

export const ProjectTeamFields = ({
  selectedMemberOptions,
  setSelectedMemberOptions,
  selectedClientOptions,
  setSelectedClientOptions,
  manualClientInput = '',
  setManualClientInput = () => {},
  onAddManualClient = () => {},
  initialProject
}: ProjectTeamFieldsProps) => {
  const { teamMembers, clients } = useApp();
  const [teamMemberOptions, setTeamMemberOptions] = useState<{ value: string; label: string }[]>([]);
  const [clientOptions, setClientOptions] = useState<{ value: string; label: string }[]>([]);
  
  // Prepare team member options
  useEffect(() => {
    const memberOptions = teamMembers.map(member => ({
      value: member.id,
      label: member.name
    }));
    setTeamMemberOptions(memberOptions);
    
    // Set initial selected members if editing a project
    if (initialProject?.members?.length) {
      const initialSelectedMembers = teamMembers
        .filter(member => initialProject.members?.includes(member.id))
        .map(member => ({
          value: member.id,
          label: member.name
        }));
      
      setSelectedMemberOptions(initialSelectedMembers);
    }
  }, [initialProject, teamMembers]);
  
  // Prepare client options
  useEffect(() => {
    const clientOpts = clients.map(client => ({
      value: client.id,
      label: client.name
    }));
    setClientOptions(clientOpts);
  }, [clients]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && manualClientInput.trim()) {
      e.preventDefault();
      onAddManualClient();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="project-members">Team Members</Label>
        <MultiSelect
          placeholder="Select team members"
          selected={selectedMemberOptions}
          setSelected={setSelectedMemberOptions}
          options={teamMemberOptions}
          className="w-full"
        />
      </div>
      
      <div>
        <Label htmlFor="project-clients">Clients</Label>
        <MultiSelect
          placeholder="Select clients"
          selected={selectedClientOptions}
          setSelected={setSelectedClientOptions}
          options={clientOptions}
          className="w-full mb-2"
        />
        
        <div className="flex gap-2 mt-2">
          <Input
            id="manual-client-input"
            placeholder="Or type client name manually"
            value={manualClientInput}
            onChange={(e) => setManualClientInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button 
            type="button" 
            variant="outline"
            onClick={onAddManualClient}
            disabled={!manualClientInput.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Press Enter or click Add to add a manual client
        </div>
      </div>
    </div>
  );
};
