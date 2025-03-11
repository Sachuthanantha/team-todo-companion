
import { Project, useApp } from '@/context/AppContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { 
  MoreHorizontal, 
  CheckSquare, 
  Users, 
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export const ProjectCard = ({ project, onEdit }: ProjectCardProps) => {
  const { deleteProject, getTeamMembersByIds, tasks } = useApp();
  
  // Get tasks associated with this project
  const projectTasks = tasks.filter(task => project.tasks.includes(task.id));
  
  // Get unique team members assigned to this project's tasks
  const uniqueTeamMemberIds = Array.from(
    new Set(projectTasks.flatMap(task => task.assignedTo))
  );
  const teamMembers = getTeamMembersByIds(uniqueTeamMemberIds);
  
  // Calculate task statistics
  const todoTasks = projectTasks.filter(task => task.status === 'todo');
  const inProgressTasks = projectTasks.filter(task => task.status === 'inProcess');
  const completedTasks = projectTasks.filter(task => task.status === 'completed');
  
  // Calculate completion percentage
  const completionPercentage = projectTasks.length > 0 
    ? Math.round((completedTasks.length / projectTasks.length) * 100) 
    : 0;

  // Get tasks with high priority
  const highPriorityTasks = projectTasks.filter(task => task.priority === 'high');

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-medium">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">{project.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteProject(project.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {project.description}
        </p>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckSquare size={12} />
            <span>{projectTasks.length} tasks</span>
          </Badge>
          
          {highPriorityTasks.length > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <span>{highPriorityTasks.length} high priority</span>
            </Badge>
          )}
          
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-green-500" />
            <span>{completedTasks.length} completed</span>
          </Badge>
          
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock size={12} className="text-amber-500" />
            <span>{inProgressTasks.length} in progress</span>
          </Badge>
        </div>
        
        {teamMembers.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <Users size={14} className="mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team Members</span>
            </div>
            <AvatarGroup className="mt-1">
              {teamMembers.map(member => (
                <Avatar key={member.id} className="border-2 border-background">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          </div>
        )}
        
        {projectTasks.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button asChild variant="ghost" className="w-full justify-between">
            <Link to={`/project/${project.id}`}>
              <span>View Details</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
