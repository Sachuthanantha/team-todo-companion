
import { useState } from 'react';
import { Task, useApp } from '@/context/AppContext';
import { TaskColumn } from '@/components/tasks/TaskColumn';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { ListTodo, CheckCircle2, Clock, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const Tasks = () => {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<'todo' | 'inProcess' | 'completed'>('todo');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'byProject'>('all');
  const { tasks, projects } = useApp();

  // Filter tasks based on search term and project filter
  const filteredTasks = tasks.filter(task => {
    // Filter by search term
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If no project filter is selected, show all tasks
    if (projectFilter.length === 0) {
      return matchesSearch;
    }
    
    // Check if task belongs to any of the selected projects
    const taskProjects = projects.filter(p => p.tasks.includes(task.id));
    const belongsToSelectedProject = taskProjects.some(p => projectFilter.includes(p.id));
    
    // Include tasks with no project if "No Project" is selected
    const isUnassigned = projectFilter.includes('unassigned') && 
                        !projects.some(p => p.tasks.includes(task.id));
                        
    return matchesSearch && (belongsToSelectedProject || isUnassigned);
  });

  const handleAddTask = (status: 'todo' | 'inProcess' | 'completed' = 'todo') => {
    setSelectedTask(null);
    setInitialStatus(status);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  // Get filtered tasks by status
  const getFilteredTasksByStatus = (status: 'todo' | 'inProcess' | 'completed') => {
    return filteredTasks.filter(task => task.status === status);
  };

  // Get tasks that don't belong to any project
  const getUnassignedTasks = () => {
    return filteredTasks.filter(task => 
      !projects.some(project => project.tasks.includes(task.id))
    );
  };

  // Get tasks for a specific project
  const getTasksByProject = (projectId: string) => {
    return filteredTasks.filter(task => {
      const project = projects.find(p => p.id === projectId);
      return project && project.tasks.includes(task.id);
    });
  };

  // Count tasks in each status
  const todoCount = getFilteredTasksByStatus('todo').length;
  const inProgressCount = getFilteredTasksByStatus('inProcess').length;
  const completedCount = getFilteredTasksByStatus('completed').length;
  const totalFilteredTasks = filteredTasks.length;

  // Toggle project filter
  const toggleProjectFilter = (projectId: string) => {
    setProjectFilter(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8">
      <header className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">Task Overview</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your project tasks
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="w-full pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {projectFilter.length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
                    {projectFilter.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by Project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={projectFilter.includes('unassigned')}
                onCheckedChange={() => toggleProjectFilter('unassigned')}
              >
                No Project
              </DropdownMenuCheckboxItem>
              {projects.map(project => (
                <DropdownMenuCheckboxItem
                  key={project.id}
                  checked={projectFilter.includes(project.id)}
                  onCheckedChange={() => toggleProjectFilter(project.id)}
                >
                  {project.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => handleAddTask()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </header>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="dark:border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold">{totalFilteredTasks}</div>
              <div className="bg-primary/10 p-2 rounded-full">
                <ListTodo className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold">{todoCount}</div>
              <div className="bg-primary/10 p-2 rounded-full">
                <ListTodo className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold">{inProgressCount}</div>
              <div className="bg-amber-500/10 p-2 rounded-full">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dark:border-border/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xl sm:text-2xl font-bold">{completedCount}</div>
              <div className="bg-green-500/10 p-2 rounded-full">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <Tabs defaultValue="all" onValueChange={(value) => setViewMode(value as 'all' | 'byProject')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="byProject">By Project</TabsTrigger>
        </TabsList>
        
        {/* All Tasks View */}
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <TaskColumn
              title="To Do"
              status="todo"
              emptyMessage="No tasks to do yet"
              icon={<ListTodo className="h-4 w-4 text-primary" />}
              onAddTask={() => handleAddTask('todo')}
              onEditTask={handleEditTask}
              filteredTasks={filteredTasks}
            />
            
            <TaskColumn
              title="In Process"
              status="inProcess"
              emptyMessage="No tasks in progress"
              icon={<Clock className="h-4 w-4 text-amber-500" />}
              onAddTask={() => handleAddTask('inProcess')}
              onEditTask={handleEditTask}
              filteredTasks={filteredTasks}
            />
            
            <TaskColumn
              title="Completed"
              status="completed"
              emptyMessage="No completed tasks yet"
              icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
              onAddTask={() => handleAddTask('completed')}
              onEditTask={handleEditTask}
              filteredTasks={filteredTasks}
            />
          </div>
        </TabsContent>
        
        {/* By Project View */}
        <TabsContent value="byProject" className="mt-6 space-y-8">
          {/* Unassigned Tasks */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">Unassigned Tasks</span>
              <span className="bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getUnassignedTasks().length}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <TaskColumn
                title="To Do"
                status="todo"
                emptyMessage="No unassigned tasks to do"
                icon={<ListTodo className="h-4 w-4 text-primary" />}
                onAddTask={() => handleAddTask('todo')}
                onEditTask={handleEditTask}
                filteredTasks={getUnassignedTasks()}
              />
              
              <TaskColumn
                title="In Process"
                status="inProcess"
                emptyMessage="No unassigned tasks in progress"
                icon={<Clock className="h-4 w-4 text-amber-500" />}
                onAddTask={() => handleAddTask('inProcess')}
                onEditTask={handleEditTask}
                filteredTasks={getUnassignedTasks()}
              />
              
              <TaskColumn
                title="Completed"
                status="completed"
                emptyMessage="No unassigned completed tasks"
                icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                onAddTask={() => handleAddTask('completed')}
                onEditTask={handleEditTask}
                filteredTasks={getUnassignedTasks()}
              />
            </div>
          </div>
          
          {/* Project Tasks */}
          {projects.map(project => {
            const projectTasks = getTasksByProject(project.id);
            if (projectTasks.length === 0) return null;
            
            return (
              <div key={project.id} className="space-y-4 pt-4 border-t">
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="mr-2">{project.name}</span>
                  <span className="bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {projectTasks.length}
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <TaskColumn
                    title="To Do"
                    status="todo"
                    emptyMessage={`No ${project.name} tasks to do`}
                    icon={<ListTodo className="h-4 w-4 text-primary" />}
                    onAddTask={() => {
                      setSelectedTask(null);
                      setInitialStatus('todo');
                      setTaskDialogOpen(true);
                    }}
                    onEditTask={handleEditTask}
                    filteredTasks={projectTasks}
                  />
                  
                  <TaskColumn
                    title="In Process"
                    status="inProcess"
                    emptyMessage={`No ${project.name} tasks in progress`}
                    icon={<Clock className="h-4 w-4 text-amber-500" />}
                    onAddTask={() => {
                      setSelectedTask(null);
                      setInitialStatus('inProcess');
                      setTaskDialogOpen(true);
                    }}
                    onEditTask={handleEditTask}
                    filteredTasks={projectTasks}
                  />
                  
                  <TaskColumn
                    title="Completed"
                    status="completed"
                    emptyMessage={`No ${project.name} completed tasks`}
                    icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                    onAddTask={() => {
                      setSelectedTask(null);
                      setInitialStatus('completed');
                      setTaskDialogOpen(true);
                    }}
                    onEditTask={handleEditTask}
                    filteredTasks={projectTasks}
                  />
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Task Dialog */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        initialTask={selectedTask}
        defaultProjectId=""
      />
    </div>
  );
};

export default Tasks;
