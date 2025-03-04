
import { Task, useApp } from '@/context/AppContext';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col bg-secondary/40 rounded-lg p-4 min-h-[24rem] border border-border/40">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 flex items-center justify-center">
            {icon}
          </div>
          <h2 className="font-semibold">{title}</h2>
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs">
            {tasks.length}
          </div>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-7 w-7 p-0"
          onClick={onAddTask}
        >
          <Plus size={16} />
          <span className="sr-only">Add task</span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <div className="mb-2">{icon}</div>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
