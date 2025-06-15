
import { Project, TeamMember } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectInfoCardsProps {
  project: Project;
  teamMembersOnProject: TeamMember[];
  projectClients: any[];
}

export const ProjectInfoCards = ({ project, teamMembersOnProject, projectClients }: ProjectInfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Start Date</div>
            <div className="font-medium">
              {project.startDate 
                ? format(new Date(project.startDate), 'MMMM d, yyyy') 
                : 'Not set'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">End Date</div>
            <div className="font-medium">
              {project.deadline 
                ? format(new Date(project.deadline), 'MMMM d, yyyy')
                : 'Not set'}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Team Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembersOnProject.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {teamMembersOnProject.map(member => (
                <div key={member.id} className="flex items-center p-2 bg-card rounded-lg border">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No team members assigned</div>
          )}
        </CardContent>
      </Card>
      
      {/* Clients Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectClients.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {projectClients.map(client => (
                <div key={client.id} className="flex items-center p-2 bg-card rounded-lg border">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={client.avatar} alt={client.name} />
                    <AvatarFallback>
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs text-muted-foreground">{client.company}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No clients assigned</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
