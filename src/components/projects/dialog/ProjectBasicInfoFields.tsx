
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProjectBasicInfoFieldsProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

export const ProjectBasicInfoFields = ({ 
  name, 
  setName, 
  description, 
  setDescription 
}: ProjectBasicInfoFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description"
          rows={3}
        />
      </div>
    </>
  );
};
