
import { useState, useEffect } from 'react';
import { Task, useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { taskSchema, TaskFormData } from './schemas/taskFormSchema';
import { TaskBasicFields } from './form-fields/TaskBasicFields';
import { TaskStatusFields } from './form-fields/TaskStatusFields';
import { TaskDateField } from './form-fields/TaskDateField';
import { TaskAssignmentFields } from './form-fields/TaskAssignmentFields';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTask?: Task | null;
  defaultProjectId?: string;
}

export const TaskDialog = ({
  open,
  onOpenChange,
  initialTask,
  defaultProjectId = '',
}: TaskDialogProps) => {
  const navigate = useNavigate();
  const { projects, teamMembers, addTask, updateTask } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('');

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      assignedTo: [],
      projectId: defaultProjectId,
    },
  });

  useEffect(() => {
    if (initialTask) {
      // Find which project this task belongs to
      const taskProject = projects.find(p => p.tasks.includes(initialTask.id));
      const taskProjectId = taskProject?.id || '';
      
      form.reset({
        title: initialTask.title,
        description: initialTask.description,
        priority: initialTask.priority,
        status: initialTask.status,
        dueDate: initialTask.dueDate || '',
        assignedTo: initialTask.assignedTo,
        projectId: taskProjectId,
      });
      setSelectedProject(taskProjectId);
    } else {
      form.reset({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        assignedTo: [],
        projectId: defaultProjectId,
      });
      setSelectedProject(defaultProjectId);
    }
  }, [initialTask, form, defaultProjectId, projects]);

  const onSubmit = (data: TaskFormData) => {
    if (initialTask) {
      updateTask({
        ...initialTask,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate || null,
        assignedTo: data.assignedTo,
      });
    } else {
      addTask({
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate || null,
        assignedTo: data.assignedTo,
      });
    }
    onOpenChange(false);
  };

  const handleProjectClick = (projectId: string) => {
    onOpenChange(false);
    navigate(`/project/${projectId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {initialTask 
              ? 'Update the task details below.' 
              : 'Fill in the details to create a new task.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TaskBasicFields control={form.control} />
            <TaskStatusFields control={form.control} />
            <TaskDateField control={form.control} />
            <TaskAssignmentFields
              control={form.control}
              projects={projects}
              teamMembers={teamMembers}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              onProjectClick={handleProjectClick}
            />

            <div className="flex justify-end">
              <Button type="submit">
                {initialTask ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
