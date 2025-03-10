
import { Task, TeamMember, useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Clock, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { getTeamMembersByIds, deleteTask, updateTask } = useApp();
  const assignedMembers = getTeamMembersByIds(task.assignedTo);
  
  // Format the date for display
  const formattedDate = task.dueDate 
    ? formatDistanceToNow(new Date(task.dueDate), { addSuffix: true }) 
    : null;

  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  
  // Get priority badge style
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Move task to next status
  const moveToNextStatus = () => {
    let newStatus = task.status;
    
    if (task.status === 'todo') {
      newStatus = 'inProcess';
    } else if (task.status === 'inProcess') {
      newStatus = 'completed';
    }
    
    if (newStatus !== task.status) {
      updateTask({
        ...task,
        status: newStatus as 'todo' | 'inProcess' | 'completed'
      });
    }
  };
  
  // Move task to previous status
  const moveToPrevStatus = () => {
    let newStatus = task.status;
    
    if (task.status === 'completed') {
      newStatus = 'inProcess';
    } else if (task.status === 'inProcess') {
      newStatus = 'todo';
    }
    
    if (newStatus !== task.status) {
      updateTask({
        ...task,
        status: newStatus as 'todo' | 'inProcess' | 'completed'
      });
    }
  };

  return (
    <Card className={cn(
      "task-card border rounded-lg shadow-sm hover:shadow-md transition-all",
      isPastDue && "border-red-300 dark:border-red-800"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-card-foreground line-clamp-1">{task.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                <MoreHorizontal size={16} />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
              {task.status !== 'todo' && (
                <DropdownMenuItem onClick={moveToPrevStatus}>
                  Move to {task.status === 'inProcess' ? 'Todo' : 'In Process'}
                </DropdownMenuItem>
              )}
              {task.status !== 'completed' && (
                <DropdownMenuItem onClick={moveToNextStatus}>
                  Move to {task.status === 'todo' ? 'In Process' : 'Completed'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => deleteTask(task.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{task.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <Badge variant="outline" className={cn("text-xs font-normal", getPriorityBadge())}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          
          {formattedDate && (
            <div className={cn(
              "flex items-center text-xs",
              isPastDue ? "text-destructive" : "text-muted-foreground"
            )}>
              <Clock size={12} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {assignedMembers.length > 0 ? (
              <div className="flex -space-x-2">
                {assignedMembers.slice(0, 3).map((member: TeamMember) => (
                  <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage 
                      src={member.avatar} 
                      alt={member.name} 
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {assignedMembers.length > 3 && (
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted">
                      +{assignedMembers.length - 3}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center">
                <User size={12} className="mr-1" />
                Unassigned
              </span>
            )}
          </div>
          
          {task.status !== 'completed' ? (
            <Button 
              size="sm"
              variant="ghost" 
              className="h-6 w-6 p-0 rounded-full"
              onClick={moveToNextStatus}
              title={`Move to ${task.status === 'todo' ? 'In Process' : 'Completed'}`}
            >
              <ArrowRight size={14} />
              <span className="sr-only">Move forward</span>
            </Button>
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
