
import { Task, TeamMember, useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Clock, User } from 'lucide-react';
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
    <div className={cn(
      "task-card bg-card border rounded-xl p-4 mb-3 shadow-soft",
      "transform transition-all duration-300",
      isPastDue && "border-red-300 dark:border-red-800"
    )}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-card-foreground">{task.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
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
      <p className="text-muted-foreground text-sm mb-3">{task.description}</p>
      <div className="flex justify-between items-center mb-3">
        <Badge variant="outline" className={cn("text-xs font-normal", getPriorityBadge())}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
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
      
      <div className="flex items-center">
        <div className="flex -space-x-2 mr-2">
          {assignedMembers.map((member: TeamMember) => (
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
        </div>
        {assignedMembers.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {assignedMembers.length === 1 
              ? assignedMembers[0].name 
              : `${assignedMembers.length} members`}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center">
            <User size={12} className="mr-1" />
            Unassigned
          </span>
        )}
      </div>
    </div>
  );
};
