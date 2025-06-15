
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
import { cn } from '@/lib/utils';

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
}

export const TeamMemberCard = ({ member, onEdit }: TeamMemberCardProps) => {
  const { deleteTeamMember, getTasksByTeamMember } = useApp();
  const tasks = getTasksByTeamMember(member.id);
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100) 
    : 0;

  const placeholders = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1527982965255-d36416f43def?q=80&w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?q=80&w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=200&h=200&fit=crop',
  ];

  // A simple hashing function to get a deterministic index from the member id
  const getIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  const placeholderIndex = getIndex(member.id) % placeholders.length;
  const avatarSrc = member.avatar || placeholders[placeholderIndex];

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-medium animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
          <div className="flex items-center space-x-4 overflow-hidden">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={avatarSrc} alt={member.name} />
                <AvatarFallback>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-base truncate" title={member.name}>{member.name}</h3>
                <p className="text-sm text-muted-foreground truncate" title={member.role}>{member.role}</p>
              </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
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
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-between">
        <div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
              <Mail size={14} />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckSquare size={14} />
              <span>{tasks.length} tasks assigned</span>
            </div>
        </div>
        
        {tasks.length > 0 && (
          <div className="mt-4">
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
