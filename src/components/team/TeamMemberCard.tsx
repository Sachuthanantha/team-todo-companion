
import { TeamMember, useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Mail, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
}

export const TeamMemberCard = ({ member, onEdit }: TeamMemberCardProps) => {
  const { deleteTeamMember, getTasksByTeamMember } = useApp();
  const tasks = getTasksByTeamMember(member.id);
  
  // Calculate completion percentage
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100) 
    : 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-medium">
      <CardHeader className="p-0">
        <div className="relative flex justify-end p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-2 right-2">
                <MoreHorizontal size={16} />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(member)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteTeamMember(member.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col items-center pt-6 pb-4 bg-accent/40">
          <Avatar className="h-20 w-20 mb-3 border-4 border-background">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="text-xl">
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-medium text-lg">{member.name}</h3>
          <Badge variant="outline" className="mt-1 text-xs font-normal">
            {member.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
          <Mail size={14} />
          <span>{member.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CheckSquare size={14} />
          <span>{tasks.length} tasks assigned</span>
        </div>
        
        {tasks.length > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Task Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  completionPercentage >= 80 
                    ? "bg-green-500" 
                    : completionPercentage >= 40 
                      ? "bg-amber-500" 
                      : "bg-primary"
                )}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
