
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
import { MultiSelect } from '@/components/ui/multi-select';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProject: Project | null;
}

export const ProjectDialog = ({ open, onOpenChange, initialProject }: ProjectDialogProps) => {
  const { addProject, updateProject, tasks } = useApp();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  
  // Create options array for task selection
  const taskOptions = tasks.map(task => ({
    value: task.id,
    label: task.title
  }));

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description);
      setSelectedTaskIds(initialProject.tasks);
    } else {
      resetForm();
    }
  }, [initialProject, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedTaskIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    const projectData = {
      name,
      description,
      tasks: selectedTaskIds
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
                ? 'Update project details and task assignments.' 
                : 'Create a new project and assign tasks to it.'}
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
            
            <div className="space-y-2">
              <Label htmlFor="tasks">Tasks</Label>
              <MultiSelect
                value={selectedTaskIds.map(id => ({
                  value: id,
                  label: tasks.find(t => t.id === id)?.title || id
                }))}
                onChange={(newValue) => {
                  setSelectedTaskIds(newValue.map(v => v.value));
                }}
                options={taskOptions}
                placeholder="Select tasks for this project"
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
