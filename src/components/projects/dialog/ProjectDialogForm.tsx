
import { useState, useEffect } from 'react';
import { Project, useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { ProjectBasicInfoFields } from './ProjectBasicInfoFields';
import { ProjectDateFields } from './ProjectDateFields';
import { ProjectTeamFields } from './ProjectTeamFields';

interface ProjectDialogFormProps {
  initialProject: Project | null;
  onOpenChange: (open: boolean) => void;
}

export const ProjectDialogForm = ({ initialProject, onOpenChange }: ProjectDialogFormProps) => {
  const { addProject, updateProject, clients } = useApp();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberOptions, setSelectedMemberOptions] = useState<{value: string; label: string}[]>([]);
  const [selectedClientOptions, setSelectedClientOptions] = useState<{value: string; label: string}[]>([]);
  const [manualClientInput, setManualClientInput] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name || '');
      setDescription(initialProject.description || '');
      
      // Set the client options
      if (initialProject.clients && initialProject.clients.length > 0) {
        const clientOptions = initialProject.clients.map(clientId => {
          const foundClient = clients.find(c => c.id === clientId);
          return {
            value: clientId,
            label: foundClient ? foundClient.name : clientId
          };
        });
        setSelectedClientOptions(clientOptions);
      } else {
        setSelectedClientOptions([]);
      }
      
      // Set date values
      if (initialProject.startDate) {
        setStartDate(new Date(initialProject.startDate));
      }
      if (initialProject.deadline) {
        setDeadline(new Date(initialProject.deadline));
      }
    } else {
      resetForm();
    }
  }, [initialProject, clients]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedMemberOptions([]);
    setSelectedClientOptions([]);
    setManualClientInput('');
    setStartDate(undefined);
    setDeadline(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    // Process manual client input if any
    let finalClientOptions = [...selectedClientOptions];
    
    if (manualClientInput.trim()) {
      // Generate a temporary ID for the manual client input
      const manualClientId = `manual-client-${Date.now()}`;
      finalClientOptions.push({
        value: manualClientId,
        label: manualClientInput
      });
    }
    
    const projectData = {
      name,
      description,
      members: selectedMemberOptions.map(option => option.value),
      clients: finalClientOptions.map(option => option.value),
      startDate: startDate?.toISOString(),
      deadline: deadline?.toISOString(),
      tasks: initialProject?.tasks || []
    };
    
    if (initialProject) {
      updateProject({
        ...projectData,
        id: initialProject.id
      });
    } else {
      addProject(projectData);
    }
    
    onOpenChange(false);
    resetForm();
  };

  const handleManualClientAdd = () => {
    if (manualClientInput.trim()) {
      // Generate a temporary ID for the manual client
      const manualClientId = `manual-client-${Date.now()}`;
      setSelectedClientOptions([
        ...selectedClientOptions, 
        {
          value: manualClientId,
          label: manualClientInput
        }
      ]);
      setManualClientInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <ProjectBasicInfoFields 
          name={name} 
          setName={setName} 
          description={description} 
          setDescription={setDescription} 
        />
        
        <ProjectDateFields 
          startDate={startDate} 
          setStartDate={setStartDate} 
          deadline={deadline} 
          setDeadline={setDeadline} 
        />
        
        <ProjectTeamFields 
          selectedMemberOptions={selectedMemberOptions}
          setSelectedMemberOptions={setSelectedMemberOptions}
          selectedClientOptions={selectedClientOptions}
          setSelectedClientOptions={setSelectedClientOptions}
          manualClientInput={manualClientInput}
          setManualClientInput={setManualClientInput}
          onAddManualClient={handleManualClientAdd}
          initialProject={initialProject}
        />
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit">
          {initialProject ? 'Update Project' : 'Create Project'}
        </Button>
      </DialogFooter>
    </form>
  );
};
