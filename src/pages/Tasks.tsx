
import { useState } from 'react';
import { Task, useApp } from '@/context/AppContext';
import { TaskColumn } from '@/components/tasks/TaskColumn';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { ListTodo, CheckCircle2, Clock, Plus, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Tasks = () => {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<'todo' | 'inProcess' | 'completed'>('todo');
  const { tasks } = useApp();

  const handleAddTask = (status: 'todo' | 'inProcess' | 'completed' = 'todo') => {
    setSelectedTask(null);
    setInitialStatus(status);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  // Count tasks in each status
  const todoCount = tasks.filter(task => task.status === 'todo').length;
  const inProgressCount = tasks.filter(task => task.status === 'inProcess').length;
  const completedCount = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;

  return (
    <div className="animate-fade-in space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Task Overview</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your project tasks
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="w-full pl-9"
            />
          </div>
          <Button onClick={() => handleAddTask()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </header>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{totalTasks}</div>
              <div className="bg-primary/10 p-2 rounded-full">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{todoCount}</div>
              <div className="bg-primary/10 p-2 rounded-full">
                <ListTodo className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{inProgressCount}</div>
              <div className="bg-amber-500/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="bg-green-500/10 p-2 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Columns */}
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
