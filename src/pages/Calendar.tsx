
import { useState } from 'react';
import { useApp, Task, Meeting } from '@/context/AppContext';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { MeetingDialog } from '@/components/meetings/MeetingDialog';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { format, isSameDay, startOfDay } from 'date-fns';
import { CalendarClock, Clock, AlertCircle, Plus, Video, ListTodo, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DayContentProps } from 'react-day-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const Calendar = () => {
  const { tasks, meetings, deleteMeeting } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Group tasks and meetings by date
  const itemsByDate = tasks.reduce((acc, task) => {
    if (!task.dueDate) return acc;
    
    const dateKey = task.dueDate.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = { tasks: [], meetings: [] };
    }
    acc[dateKey].tasks.push(task);
    return acc;
  }, {} as Record<string, { tasks: Task[], meetings: Meeting[] }>);
  
  // Add meetings to the grouped items
  meetings.forEach(meeting => {
    const dateKey = meeting.startTime.split('T')[0];
    if (!itemsByDate[dateKey]) {
      itemsByDate[dateKey] = { tasks: [], meetings: [] };
    }
    itemsByDate[dateKey].meetings.push(meeting);
  });

  // Get tasks and meetings for selected date
  const getItemsForDate = (date?: Date) => {
    if (!date) return { tasks: [], meetings: [] };
    const dateKey = format(date, 'yyyy-MM-dd');
    return itemsByDate[dateKey] || { tasks: [], meetings: [] };
  };

  const { tasks: selectedDateTasks, meetings: selectedDateMeetings } = getItemsForDate(selectedDate);
  
  // Filter items based on active tab
  const filteredTasks = activeTab === 'meetings' ? [] : selectedDateTasks;
  const filteredMeetings = activeTab === 'tasks' ? [] : selectedDateMeetings;

  // Priority order for coloring
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-primary';
    }
  };

  // Render custom day content for the calendar
  const renderDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayItems = itemsByDate[dateStr];
    
    if (!dayItems || (dayItems.tasks.length === 0 && dayItems.meetings.length === 0)) return null;
    
    // Find highest priority
    const hasCritical = dayItems.tasks.some(t => t.priority === 'high');
    const hasMedium = dayItems.tasks.some(t => t.priority === 'medium');
    const hasOngoingMeeting = dayItems.meetings.some(m => m.status === 'ongoing');
    
    let dotColor = 'bg-green-500';
    if (hasOngoingMeeting) dotColor = 'bg-emerald-500';
    else if (hasCritical) dotColor = 'bg-red-500';
    else if (hasMedium) dotColor = 'bg-amber-500';
    
    return (
      <div className="flex flex-col items-center">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-0.5`}></div>
        
        {/* Show the count of tasks + meetings if there's more than one */}
        {(dayItems.tasks.length + dayItems.meetings.length > 1) && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {dayItems.tasks.length + dayItems.meetings.length}
          </div>
        )}
      </div>
    );
  };

  // Handle item selection
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };
  
  const handleMeetingClick = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDialogOpen(true);
  };
  
  const handleAddTask = () => {
    setSelectedTask(null);
    setTaskDialogOpen(true);
  };
  
  const handleAddMeeting = () => {
    setSelectedMeeting(null);
    setMeetingDialogOpen(true);
  };
  
  const handleDeleteMeeting = (meetingId: string) => {
    deleteMeeting(meetingId);
  };
  
  // Calculate counts for the day
  const taskCount = selectedDateTasks.length;
  const meetingCount = selectedDateMeetings.length;
  const totalCount = taskCount + meetingCount;

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <div className="flex items-center mb-2">
          <div className="bg-primary/10 p-2 rounded-md mr-3">
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold">Calendar</h1>
        </div>
        <p className="text-muted-foreground">
          View and manage your tasks and meetings by date.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Schedule</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleAddTask}>
                    <ListTodo className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                  <Button size="sm" onClick={handleAddMeeting}>
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </div>
              <CardDescription>
                View your tasks and meetings in the calendar or list view.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }: DayContentProps) => (
                    <>
                      {date.getDate()}
                      {renderDay(date)}
                    </>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  {selectedDate ? (
                    <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
                  ) : (
                    <span>Select a date</span>
                  )}
                </CardTitle>
                
                <Badge variant="outline" className="ml-2">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks ({taskCount})</TabsTrigger>
                  <TabsTrigger value="meetings">Meetings ({meetingCount})</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="h-[calc(100%-160px)] overflow-hidden flex flex-col">
              {(filteredTasks.length > 0 || filteredMeetings.length > 0) ? (
                <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                  {activeTab !== 'meetings' && filteredTasks.length > 0 && (
                    <div>
                      {activeTab === 'all' && (
                        <>
                          <div className="flex items-center mb-2">
                            <ListTodo className="h-4 w-4 mr-2 text-muted-foreground" />
                            <h3 className="font-medium text-muted-foreground">Tasks</h3>
                          </div>
                          <Separator className="mb-3" />
                        </>
                      )}
                      
                      <div className="space-y-3">
                        {filteredTasks.map(task => (
                          <div 
                            key={task.id}
                            className={cn(
                              "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                              "hover:border-primary/50 hover:shadow-sm",
                              task.status === 'completed' && "bg-secondary/50"
                            )}
                            onClick={() => handleTaskClick(task)}
                          >
                            <div className="flex justify-between mb-2">
                              <h3 className={cn(
                                "font-medium",
                                task.status === 'completed' && "line-through opacity-70"
                              )}>
                                {task.title}
                              </h3>
                              <Badge variant="outline" className={cn(
                                task.priority === 'high' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                                  : task.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              )}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {task.dueDate ? format(new Date(task.dueDate), 'h:mm a') : 'No time set'}
                              </div>
                              <Badge variant={task.status === 'completed' ? 'secondary' : 'outline'}>
                                {task.status === 'todo' 
                                  ? 'To Do' 
                                  : task.status === 'inProcess' 
                                    ? 'In Process' 
                                    : 'Completed'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeTab !== 'tasks' && filteredMeetings.length > 0 && (
                    <div>
                      {activeTab === 'all' && (
                        <>
                          <div className="flex items-center mb-2 mt-4">
                            <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                            <h3 className="font-medium text-muted-foreground">Meetings</h3>
                          </div>
                          <Separator className="mb-3" />
                        </>
                      )}
                      
                      <div className="space-y-3">
                        {filteredMeetings.map(meeting => (
                          <MeetingCard 
                            key={meeting.id} 
                            meeting={meeting} 
                            onEdit={handleMeetingClick}
                            onDelete={handleDeleteMeeting}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">
                    {selectedDate
                      ? 'No items scheduled for this date'
                      : 'Select a date to view items'}
                  </p>
                  
                  {selectedDate && (
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={handleAddTask}>
                        <ListTodo className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                      <Button size="sm" onClick={handleAddMeeting}>
                        <Video className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            {(filteredTasks.length > 0 || filteredMeetings.length > 0) && (
              <CardFooter className="p-4 border-t flex justify-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleAddTask}>
                    <ListTodo className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                  <Button size="sm" onClick={handleAddMeeting}>
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              </CardFooter>
            )}
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

export default Calendar;
