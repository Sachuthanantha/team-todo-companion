
import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { useApp } from '@/context/AppContext';
import type { Project } from '@/context/AppContext';

interface ProjectTeamFieldsProps {
  selectedMemberOptions: Option[];
  setSelectedMemberOptions: (options: Option[]) => void;
  selectedClientOptions: Option[];
  setSelectedClientOptions: (options: Option[]) => void;
  initialProject: Project | null;
}

export const ProjectTeamFields = ({ 
  selectedMemberOptions, 
  setSelectedMemberOptions,
  selectedClientOptions,
  setSelectedClientOptions,
  initialProject
}: ProjectTeamFieldsProps) => {
  const { teamMembers, clients } = useApp();
  
  // Create options array for team member selection
  const memberOptions: Option[] = teamMembers.map(member => ({
    value: member.id,
    label: `${member.name} (${member.role})`
  }));

  // Create options array for client selection
  const clientOptions: Option[] = clients.map(client => ({
    value: client.id,
    label: `${client.name} (${client.company})`
  }));
  
  useEffect(() => {
    if (initialProject) {
      // Convert member IDs to option objects
      const memberOpts = (initialProject.members || [])
        .map(id => {
          const member = teamMembers.find(m => m.id === id);
          return member ? {
            value: id,
            label: `${member.name} (${member.role})`
          } : null;
        })
        .filter((option): option is Option => option !== null);
      
      setSelectedMemberOptions(memberOpts);
      
      // Convert client IDs to option objects
      const clientOpts = (initialProject.clients || [])
        .map(id => {
          const client = clients.find(c => c.id === id);
          return client ? {
            value: id,
            label: `${client.name} (${client.company})`
          } : null;
        })
        .filter((option): option is Option => option !== null);
      
      setSelectedClientOptions(clientOpts);
    } else {
      setSelectedMemberOptions([]);
      setSelectedClientOptions([]);
    }
  }, [initialProject, teamMembers, clients, setSelectedMemberOptions, setSelectedClientOptions]);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="members">Team Members</Label>
        <MultiSelect
          value={selectedMemberOptions}
          onChange={setSelectedMemberOptions}
          options={memberOptions}
          placeholder="Select team members for this project"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clients">Clients</Label>
        <MultiSelect
          value={selectedClientOptions}
          onChange={setSelectedClientOptions}
          options={clientOptions}
          placeholder="Select clients for this project"
        />
      </div>
    </>
  );
};
