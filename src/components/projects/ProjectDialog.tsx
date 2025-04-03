
import { Project } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProjectDialogForm } from './dialog/ProjectDialogForm';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProject: Project | null;
}

export const ProjectDialog = ({ open, onOpenChange, initialProject }: ProjectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {initialProject 
              ? 'Update project details, team members, and clients.' 
              : 'Create a new project and assign team members and clients to it.'}
          </DialogDescription>
        </DialogHeader>
        
        <ProjectDialogForm 
          initialProject={initialProject} 
          onOpenChange={onOpenChange} 
        />
      </DialogContent>
    </Dialog>
  );
};
