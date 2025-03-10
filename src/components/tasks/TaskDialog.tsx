
import { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, useApp } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['todo', 'inProcess', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  assignedTo: z.array(z.string()),
  projectId: z.string().optional(),
  dueDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTask?: Task | null;
}

export const TaskDialog = ({ open, onOpenChange, initialTask }: TaskDialogProps) => {
  const { addTask, updateTask, teamMembers, projects, updateProject } = useApp();
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo' as TaskStatus,
      priority: 'medium' as TaskPriority,
      assignedTo: [],
      projectId: undefined,
      dueDate: undefined,
    },
  });

  // Reset form when dialog opens/closes or initialTask changes
  useEffect(() => {
    if (open) {
      if (initialTask) {
        // Find which project this task belongs to
        const projectWithTask = projects.find(p => p.tasks.includes(initialTask.id));
        
        form.reset({
          title: initialTask.title,
          description: initialTask.description,
          status: initialTask.status,
          priority: initialTask.priority,
          assignedTo: initialTask.assignedTo,
          projectId: projectWithTask?.id,
          dueDate: initialTask.dueDate ? new Date(initialTask.dueDate) : undefined,
        });
        setSelectedTeamMembers(initialTask.assignedTo);
        setSelectedProjectId(projectWithTask?.id);
      } else {
        form.reset({
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          assignedTo: [],
          projectId: undefined,
          dueDate: undefined,
        });
        setSelectedTeamMembers([]);
        setSelectedProjectId(undefined);
      }
    }
  }, [open, initialTask, form, projects]);

  const onSubmit = (values: FormValues) => {
    // Handle task creation or update
    if (initialTask) {
      // Before updating the task, remove it from any project it was in
      const oldProjectWithTask = projects.find(p => p.tasks.includes(initialTask.id));
      if (oldProjectWithTask && oldProjectWithTask.id !== values.projectId) {
        const updatedTasks = oldProjectWithTask.tasks.filter(id => id !== initialTask.id);
        updateProject({
          ...oldProjectWithTask,
          tasks: updatedTasks
        });
      }
      
      // Update task
      updateTask({
        ...initialTask,
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        assignedTo: selectedTeamMembers,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      });
      
      // Add task to new project if selected
      if (values.projectId && (!oldProjectWithTask || oldProjectWithTask.id !== values.projectId)) {
        const projectToUpdate = projects.find(p => p.id === values.projectId);
        if (projectToUpdate && !projectToUpdate.tasks.includes(initialTask.id)) {
          updateProject({
            ...projectToUpdate,
            tasks: [...projectToUpdate.tasks, initialTask.id]
          });
        }
      }
    } else {
      // Create new task
      const newTask = addTask({
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        assignedTo: selectedTeamMembers,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      });
      
      // Add task to project if selected
      if (values.projectId && newTask) {
        const projectToUpdate = projects.find(p => p.id === values.projectId);
        if (projectToUpdate) {
          updateProject({
            ...projectToUpdate,
            tasks: [...projectToUpdate.tasks, newTask.id]
          });
        }
      }
    }
    onOpenChange(false);
  };

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {initialTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Task description" 
                      className="resize-none h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="inProcess">In Process</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Project selection field */}
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedProjectId(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Assigned To</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {teamMembers.map((member) => (
                  <Button
                    key={member.id}
                    type="button"
                    variant={selectedTeamMembers.includes(member.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTeamMember(member.id)}
                    className="transition-all duration-200"
                  >
                    {member.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                {initialTask ? 'Update Task' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
