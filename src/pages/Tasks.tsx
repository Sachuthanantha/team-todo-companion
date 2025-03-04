
import { useState } from 'react';
import { Task, useApp } from '@/context/AppContext';
import { TaskColumn } from '@/components/tasks/TaskColumn';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { ListTodo, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Tasks = () => {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<'todo' | 'inProcess' | 'completed'>('todo');

  const handleAddTask = (status: 'todo' | 'inProcess' | 'completed' = 'todo') => {
    setSelectedTask(null);
    setInitialStatus(status);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center mb-2">
            <div className="bg-primary/10 p-2 rounded-md mr-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold">Tasks</h1>
          </div>
          <Button onClick={() => handleAddTask()}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </div>
        <p className="text-muted-foreground">
          Manage your tasks and track their progress.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn
          title="To Do"
          status="todo"
          emptyMessage="No tasks to do yet"
          icon={<ListTodo className="h-4 w-4 text-primary" />}
          onAddTask={() => handleAddTask('todo')}
          onEditTask={handleEditTask}
        />
        
        <TaskColumn
          title="In Process"
          status="inProcess"
          emptyMessage="No tasks in progress"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          onAddTask={() => handleAddTask('inProcess')}
          onEditTask={handleEditTask}
        />
        
        <TaskColumn
          title="Completed"
          status="completed"
          emptyMessage="No completed tasks yet"
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
          onAddTask={() => handleAddTask('completed')}
          onEditTask={handleEditTask}
        />
      </div>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        initialTask={selectedTask ? selectedTask : { 
          id: '',
          title: '',
          description: '',
          status: initialStatus,
          priority: 'medium',
          assignedTo: [],
          createdAt: new Date().toISOString()
        } as Task}
      />
    </div>
  );
};

export default Tasks;
