import { Project, TeamMember, useApp } from '@/context/AppContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export const ProjectCard = ({ project, onEdit }: ProjectCardProps) => {
  const { teamMembers } = useApp();
  const projectMembers = teamMembers.filter(member => 
    project.members && project.members.includes(member.id)
  );

  // Format dates when they exist
  const formattedStartDate = project.startDate 
    ? format(new Date(project.startDate), 'MMM d, yyyy')
    : 'Not set';
  
  const formattedDeadline = project.deadline 
    ? format(new Date(project.deadline), 'MMM d, yyyy')
    : 'Not set';
  
  // Calculate progress status based on dates
  const getStatusBadge = () => {
    if (!project.startDate || !project.deadline) return null;
    
    const today = new Date();
    const start = new Date(project.startDate);
    const end = new Date(project.deadline);
    
    if (today < start) {
      return <Badge variant="outline">Not Started</Badge>;
    } else if (today > end) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else {
      return <Badge variant="default">In Progress</Badge>;
    }
  };

  const handleOpenInNewWindow = () => {
    const url = `/project/${project.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">
            <Link to={`/project/${project.id}`} className="hover:text-primary hover:underline transition-colors">
              {project.name}
            </Link>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onEdit(project)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">
          {project.description || 'No description provided.'}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium">Dates: </span>
              <span>{formattedStartDate} - {formattedDeadline}</span>
            </div>
          </div>
          
          {getStatusBadge() && (
            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
          )}
          
          {projectMembers.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Team:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {projectMembers.slice(0, 5).map(member => (
                  <div key={member.id} className="flex items-center gap-2 text-sm bg-secondary/50 rounded-full px-3 py-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                ))}
                {projectMembers.length > 5 && (
                  <Badge variant="outline">+{projectMembers.length - 5} more</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Link to={`/project/${project.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
