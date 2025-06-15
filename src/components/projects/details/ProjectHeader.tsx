
import { Project } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase, 
  Pencil,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface ProjectHeaderProps {
  project: Project;
  onEditProject: () => void;
  onDeleteProject: () => void;
}

export const ProjectHeader = ({ project, onEditProject, onDeleteProject }: ProjectHeaderProps) => {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="h-9 w-9">
              <Link to="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="bg-primary/10 p-2 rounded-md">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold">{project.name}</h1>
          </div>
          <p className="text-muted-foreground mt-2 ml-14">
            {project.description}
          </p>
        </div>
        
        <div className="flex items-center gap-3 ml-14 md:ml-0">
          <Button 
            variant="outline" 
            onClick={onEditProject}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={onDeleteProject}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
