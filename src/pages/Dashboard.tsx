
import { useState } from 'react';
import { useApp, Task, TeamMember } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckSquare, 
  Clock, 
  ListTodo, 
  AlertCircle, 
  Users, 
  Briefcase,
  Plus,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { format } from 'date-fns';

const Dashboard = () => {
  const { tasks, teamMembers, projects } = useApp();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Get tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const tasksToday = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });
  
  // Calculate task completion percentages
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const inProcessTasks = tasks.filter(task => task.status === 'inProcess').length;
  const totalTasks = tasks.length;
  
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;
  
  // Get high priority tasks that are not completed
  const highPriorityTasks = tasks.filter(
    task => task.priority === 'high' && task.status !== 'completed'
  );
  
  // Get recent team members (limit to 5)
  const recentTeamMembers = [...teamMembers].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
  
  const handleAddTask = () => {
    setSelectedTask(null);
    setTaskDialogOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center mb-2">
          <div className="bg-primary/10 p-2 rounded-md mr-3">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Welcome to your workspace. Here's an overview of your tasks and team progress.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Total Tasks</CardTitle>
            <CardDescription>All tasks in workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-semibold">{totalTasks}</div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
                  <span>{todoTasks} to do</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
                  <span>{inProcessTasks} in progress</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span>{completedTasks} done</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Team</CardTitle>
            <CardDescription>Team members overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-semibold">{teamMembers.length}</div>
            </div>
            <div className="mt-4">
              <div className="flex -space-x-2 mb-3">
                {recentTeamMembers.map(member => (
                  <Avatar key={member.id} className="border-2 border-background h-9 w-9">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {teamMembers.length > 5 && (
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary border-2 border-background text-xs font-medium">
                    +{teamMembers.length - 5}
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => window.location.href = '/team'}
              >
                <Users className="h-4 w-4 mr-2" />
                View Team
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Projects</CardTitle>
            <CardDescription>Active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-semibold">{projects.length}</div>
            </div>
            <div className="mt-4 space-y-3">
              {projects.slice(0, 2).map(project => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                    <span className="text-sm truncate max-w-[150px]">{project.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {project.tasks.length} tasks
                  </span>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
              >
                <Briefcase className="h-4 w-4 mr-2" />
                View Projects
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Due Today</CardTitle>
            <CardDescription>Tasks due today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-semibold">{tasksToday.length}</div>
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{format(today, 'MMM d')}</span>
              </div>
            </div>
            <div className="mt-4">
              {tasksToday.length > 0 ? (
                <div className="space-y-2">
                  {tasksToday.slice(0, 2).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                      <span className="truncate max-w-[180px]">{task.title}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                      }`}></div>
                    </div>
                  ))}
                  {tasksToday.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center mt-1">
                      + {tasksToday.length - 2} more due today
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-md">
                  <Clock className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground text-center">No tasks due today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-soft h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-semibold">High Priority Tasks</CardTitle>
                  <CardDescription>Tasks that need immediate attention</CardDescription>
                </div>
                <Button size="sm" onClick={handleAddTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {highPriorityTasks.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {highPriorityTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={handleEditTask} 
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-secondary/50 rounded-lg h-[300px]">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4 text-center">No high priority tasks at the moment</p>
                  <Button onClick={handleAddTask}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-soft h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Task Overview</CardTitle>
              <CardDescription>Current task status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <ListTodo className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium">To Do</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{todoTasks} tasks</span>
                  </div>
                  <Progress 
                    value={totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="font-medium">In Progress</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{inProcessTasks} tasks</span>
                  </div>
                  <Progress 
                    value={totalTasks > 0 ? (inProcessTasks / totalTasks) * 100 : 0} 
                    className="h-2 bg-secondary"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <CheckSquare className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">Completed</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{completedTasks} tasks</span>
                  </div>
                  <Progress 
                    value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} 
                    className="h-2 bg-secondary"
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Overall Progress</span>
                    <span className="text-sm">{completionPercentage}%</span>
                  </div>
                  <Progress 
                    value={completionPercentage} 
                    className="h-3" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Task Dialog */}
      <TaskDialog 
        open={taskDialogOpen} 
        onOpenChange={setTaskDialogOpen} 
        initialTask={selectedTask} 
      />
    </div>
  );
};

export default Dashboard;
