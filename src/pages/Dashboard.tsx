
import { useState } from 'react';
import { useApp, Task, TeamMember, Meeting } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { 
  CheckSquare, 
  Clock, 
  ListTodo, 
  AlertCircle, 
  Users, 
  Briefcase,
  Plus,
  LayoutDashboard,
  ArrowRight,
  Video,
  CalendarClock,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { MeetingDialog } from '@/components/meetings/MeetingDialog';
import { CheckInButton } from '@/components/dashboard/CheckInButton';
import { format, differenceInMinutes } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const Dashboard = () => {
  const { tasks, teamMembers, projects, meetings, getCurrentMeetings, getUpcomingMeetings } = useApp();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

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
  
  // Get current and upcoming meetings
  const currentMeetings = getCurrentMeetings();
  const upcomingMeetings = getUpcomingMeetings(3);
  
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
  
  const handleAddMeeting = () => {
    setSelectedMeeting(null);
    setMeetingDialogOpen(true);
  };
  
  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDialogOpen(true);
  };
  
  // Calculate time remaining until next meeting
  const getNextMeetingCountdown = () => {
    if (upcomingMeetings.length === 0) return null;
    
    const nextMeeting = upcomingMeetings[0];
    const startTime = new Date(nextMeeting.startTime);
    const minutesRemaining = differenceInMinutes(startTime, new Date());
    
    if (minutesRemaining <= 60) {
      return `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} from now`;
    } else {
      const hours = Math.floor(minutesRemaining / 60);
      const minutes = minutesRemaining % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min` : ''} from now`;
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-md mr-3">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
          </div>
          <CheckInButton />
        </div>
        <p className="text-muted-foreground">
          Welcome to your workspace. Here's an overview of your tasks and team progress.
        </p>
      </header>
      
      {/* Current Meetings Section */}
      {currentMeetings.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Video className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-xl font-semibold">Current Meetings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMeetings.map(meeting => (
              <MeetingCard 
                key={meeting.id} 
                meeting={meeting} 
                onEdit={handleEditMeeting}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Next Meeting Countdown */}
      {upcomingMeetings.length > 0 && !currentMeetings.length && (
        <Card className="mb-8 border-2 border-primary/10 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold mb-1 flex items-center">
                  <CalendarClock className="h-5 w-5 mr-2 text-primary" />
                  Next Meeting: {upcomingMeetings[0].title}
                </h2>
                <p className="text-muted-foreground">
                  {format(new Date(upcomingMeetings[0].startTime), 'EEEE, MMMM d • h:mm a')}
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  Starting {getNextMeetingCountdown()}
                </p>
              </div>
              
              <Button onClick={() => handleEditMeeting(upcomingMeetings[0])}>
                <Video className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
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
                asChild
              >
                <Link to="/team">
                  <Users className="h-4 w-4 mr-2" />
                  View Team
                </Link>
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
                <Link to={`/project/${project.id}`} key={project.id} className="flex items-center justify-between hover:bg-secondary/50 p-1 rounded transition-colors">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                    <span className="text-sm truncate max-w-[150px]">{project.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {project.tasks.length} tasks
                  </span>
                </Link>
              ))}
              {projects.length > 2 && (
                <div className="text-xs text-muted-foreground text-center">
                  + {projects.length - 2} more projects
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                asChild
              >
                <Link to="/projects">
                  <Briefcase className="h-4 w-4 mr-2" />
                  View Projects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Calendar</CardTitle>
            <CardDescription>Today's Schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-semibold">{tasksToday.length + currentMeetings.length + upcomingMeetings.filter(m => 
                new Date(m.startTime).toDateString() === today.toDateString()
              ).length}</div>
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(today, 'MMM d')}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-2">
                {/* Show current meetings first */}
                {currentMeetings.slice(0, 1).map(meeting => (
                  <div key={meeting.id} 
                    className="flex items-center justify-between p-2 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-md text-sm">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 bg-emerald-200 dark:bg-emerald-800/30 border-0">LIVE</Badge>
                      <span className="truncate max-w-[150px]">{meeting.title}</span>
                    </div>
                    <Video className="h-3.5 w-3.5 flex-shrink-0" />
                  </div>
                ))}
                
                {/* Then upcoming meetings for today */}
                {upcomingMeetings
                  .filter(m => new Date(m.startTime).toDateString() === today.toDateString())
                  .slice(0, currentMeetings.length ? 1 : 2)
                  .map(meeting => (
                    <div key={meeting.id} className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                      <span className="truncate max-w-[180px]">{meeting.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(meeting.startTime), 'h:mm a')}
                      </span>
                    </div>
                  ))}
                
                {/* Then tasks for today */}
                {tasksToday.slice(0, 3 - currentMeetings.length - Math.min(upcomingMeetings.filter(m => 
                  new Date(m.startTime).toDateString() === today.toDateString()
                ).length, currentMeetings.length ? 1 : 2)).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                    <span className="truncate max-w-[180px]">{task.title}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                ))}
                
                {tasksToday.length === 0 && currentMeetings.length === 0 && upcomingMeetings.filter(m => 
                  new Date(m.startTime).toDateString() === today.toDateString()
                ).length === 0 && (
                  <div className="flex flex-col items-center justify-center p-4 bg-secondary/50 rounded-md">
                    <Clock className="h-10 w-10 text-muted-foreground mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground text-center">No items scheduled for today</p>
                  </div>
                )}
                
                {(tasksToday.length + currentMeetings.length + upcomingMeetings.filter(m => 
                  new Date(m.startTime).toDateString() === today.toDateString()
                ).length) > 3 && (
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    + {tasksToday.length + currentMeetings.length + upcomingMeetings.filter(m => 
                      new Date(m.startTime).toDateString() === today.toDateString()
                    ).length - 3} more items today
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3" 
                asChild
              >
                <Link to="/calendar">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  View Calendar
                </Link>
              </Button>
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-semibold">Upcoming Meetings</CardTitle>
                  <CardDescription>Your scheduled meetings</CardDescription>
                </div>
                <Button size="sm" onClick={handleAddMeeting}>
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {upcomingMeetings.map(meeting => (
                    <div 
                      key={meeting.id}
                      className="p-3 border rounded-md cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleEditMeeting(meeting)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{meeting.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {meeting.meetingPlatform === 'in-app' ? 'In-App' : 
                           meeting.meetingPlatform === 'zoom' ? 'Zoom' :
                           meeting.meetingPlatform === 'google-meet' ? 'Meet' : 'Teams'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                        <span>{format(new Date(meeting.startTime), 'EEE, MMM d • h:mm a')}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AvatarGroup className="mr-1">
                            {meeting.participantIds.slice(0, 3).map(id => {
                              const member = teamMembers.find(m => m.id === id);
                              return (
                                <Avatar key={id} className="h-5 w-5 border-background">
                                  <AvatarImage src={member?.avatar} />
                                  <AvatarFallback className="text-[10px]">
                                    {member?.name.substring(0, 2).toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                              );
                            })}
                            {meeting.participantIds.length > 3 && (
                              <Avatar className="h-5 w-5 border-background">
                                <AvatarFallback className="text-[10px]">
                                  +{meeting.participantIds.length - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </AvatarGroup>
                          <span className="text-xs ml-1">{meeting.participantIds.length} participants</span>
                        </div>
                        
                        <div className="text-xs text-primary">
                          {differenceInMinutes(new Date(meeting.startTime), new Date()) <= 30 
                            ? 'Starting soon'
                            : format(new Date(meeting.startTime), 'h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-secondary/50 rounded-lg h-[200px]">
                  <Video className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4 text-center">No upcoming meetings</p>
                  <Button onClick={handleAddMeeting}>
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule Meeting
                  </Button>
                </div>
              )}
              
              {upcomingMeetings.length > 0 && (
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link to="/calendar">
                    <CalendarClock className="h-4 w-4 mr-2" />
                    View All Meetings
                  </Link>
                </Button>
              )}
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
      
      {/* Meeting Dialog */}
      <MeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        initialMeeting={selectedMeeting}
      />
    </div>
  );
};

export default Dashboard;
