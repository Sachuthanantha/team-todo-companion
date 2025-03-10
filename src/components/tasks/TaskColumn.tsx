
import { Task, useApp } from '@/context/AppContext';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskColumnProps {
  title: string;
  status: 'todo' | 'inProcess' | 'completed';
  emptyMessage: string;
  icon: React.ReactNode;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export const TaskColumn = ({
  title,
  status,
  emptyMessage,
  icon,
  onAddTask,
  onEditTask,
}: TaskColumnProps) => {
  const { getTasksByStatus } = useApp();
  const tasks = getTasksByStatus(status);

  return (
    <Card className="flex flex-col h-[calc(100vh-16rem)] md:h-[calc(100vh-18rem)] overflow-hidden border border-border dark:border-border/20">
      <CardHeader className="pb-2 pt-4 sm:pt-5">
        <CardTitle className="flex justify-between items-center text-sm sm:text-base">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
              {icon}
            </div>
            <span>{title}</span>
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs">
              {tasks.length}
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0 rounded-full"
            onClick={onAddTask}
          >
            <Plus size={16} />
            <span className="sr-only">Add task</span>
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto pb-6 pt-0 px-2 sm:px-3">
        {tasks.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <div className="mb-2">{icon}</div>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
