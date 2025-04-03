
import { useState, useEffect } from 'react';
import { Project, useApp } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProject: Project | null;
}

export const ProjectDialog = ({ open, onOpenChange, initialProject }: ProjectDialogProps) => {
  const { addProject, updateProject, teamMembers, clients } = useApp();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberOptions, setSelectedMemberOptions] = useState<Option[]>([]);
  const [selectedClientOptions, setSelectedClientOptions] = useState<Option[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  
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
    if (open) {
      if (initialProject) {
        setName(initialProject.name || '');
        setDescription(initialProject.description || '');
        
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
        
        setStartDate(initialProject.startDate ? new Date(initialProject.startDate) : undefined);
        setDeadline(initialProject.deadline ? new Date(initialProject.deadline) : undefined);
      } else {
        resetForm();
      }
    }
  }, [initialProject, open, teamMembers, clients]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {initialProject 
                ? 'Update project details, team members, and clients.' 
                : 'Create a new project and assign team members and clients to it.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="deadline"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
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
      </DialogContent>
    </Dialog>
  );
};
