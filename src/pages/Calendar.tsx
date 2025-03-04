
import { useState } from 'react';
import { useApp, Task } from '@/context/AppContext';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { format } from 'date-fns';
import { CalendarClock, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Calendar = () => {
  const { tasks } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.dueDate) return acc;
    
    const dateKey = task.dueDate.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Get tasks for selected date
  const getTasksForDate = (date?: Date): Task[] => {
    if (!date) return [];
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

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
  const renderDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasksByDate[dateStr] || [];
    
    if (dayTasks.length === 0) return null;
    
    // Find highest priority
    const hasCritical = dayTasks.some(t => t.priority === 'high');
    const hasMedium = dayTasks.some(t => t.priority === 'medium');
    
    let dotColor = 'bg-green-500';
    if (hasCritical) dotColor = 'bg-red-500';
    else if (hasMedium) dotColor = 'bg-amber-500';
    
    return (
      <div className="flex justify-center">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor} mt-1`}></div>
      </div>
    );
  };

  // Handle task selection
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

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
          View and manage your tasks by due date.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Task Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                components={{
                  DayContent: (props) => (
                    <>
                      {props.day.getDate()}
                      {renderDay(props.day)}
                    </>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                {selectedDate ? (
                  <span>Tasks for {format(selectedDate, 'MMMM d, yyyy')}</span>
                ) : (
                  <span>Select a date</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {selectedDateTasks.map(task => (
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
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">
                    {selectedDate
                      ? 'No tasks scheduled for this date'
                      : 'Select a date to view tasks'}
                  </p>
                </div>
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
    </div>
  );
};

export default Calendar;
