
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
  const { addProject, updateProject } = useApp();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberOptions, setSelectedMemberOptions] = useState<{value: string; label: string}[]>([]);
  const [selectedClientOptions, setSelectedClientOptions] = useState<{value: string; label: string}[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name || '');
      setDescription(initialProject.description || '');
      // Team member and client options will be handled in their respective components
    } else {
      resetForm();
    }
  }, [initialProject]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedMemberOptions([]);
    setSelectedClientOptions([]);
    setStartDate(undefined);
    setDeadline(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    const projectData = {
      name,
      description,
      members: selectedMemberOptions.map(option => option.value),
      clients: selectedClientOptions.map(option => option.value),
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
