
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { ArrowLeft } from 'lucide-react';
import { Control } from 'react-hook-form';
import { TaskFormData } from '../schemas/taskFormSchema';
import { Project, TeamMember } from '@/context/AppContext';

interface TaskAssignmentFieldsProps {
  control: Control<TaskFormData>;
  projects: Project[];
  teamMembers: TeamMember[];
  selectedProject: string;
  setSelectedProject: (projectId: string) => void;
  onProjectClick: (projectId: string) => void;
}

export const TaskAssignmentFields = ({
  control,
  projects,
  teamMembers,
  selectedProject,
  setSelectedProject,
  onProjectClick,
}: TaskAssignmentFieldsProps) => {
  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <>
      <FormField
        control={control}
        name="projectId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project</FormLabel>
            <div className="space-y-2">
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedProject(value);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-project">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedProjectData && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onProjectClick(selectedProject)}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to {selectedProjectData.name}
                </Button>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="assignedTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assign to</FormLabel>
            <MultiSelect
              options={teamMembers.map((member) => ({
                label: member.name,
                value: member.id,
              }))}
              value={field.value.map(id => ({ 
                label: teamMembers.find(m => m.id === id)?.name || id, 
                value: id 
              }))}
              onChange={(selectedOptions) => {
                field.onChange(selectedOptions.map(option => option.value));
              }}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
