
import { Task, TeamMember } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectStatsProps {
  projectTasks: Task[];
  teamMembersOnProject: TeamMember[];
}

export const ProjectStats = ({ projectTasks, teamMembersOnProject }: ProjectStatsProps) => {
  const completedTasks = projectTasks.filter(task => task.status === 'completed');
  const completionPercentage = projectTasks.length > 0 
    ? Math.round((completedTasks.length / projectTasks.length) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <div className="text-2xl font-semibold">{projectTasks.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <div className="text-2xl font-semibold">{teamMembersOnProject.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
        </CardHeader>
        <CardContent className="py-0">
          <div className="text-2xl font-semibold">{completionPercentage}%</div>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
        </CardHeader>
        <CardContent className="py-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">To Do</span>
            <Badge variant="outline">{projectTasks.filter(task => task.status === 'todo').length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">In Progress</span>
            <Badge variant="outline">{projectTasks.filter(task => task.status === 'inProcess').length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Completed</span>
            <Badge variant="outline">{projectTasks.filter(task => task.status === 'completed').length}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
