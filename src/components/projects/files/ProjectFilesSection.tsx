
import { ProjectFileUpload } from './ProjectFileUpload';
import { ProjectFilesList } from './ProjectFilesList';

interface ProjectFilesSectionProps {
  projectId: string;
}

export const ProjectFilesSection = ({ projectId }: ProjectFilesSectionProps) => {
  return (
    <div className="space-y-6">
      <ProjectFileUpload projectId={projectId} />
      <ProjectFilesList projectId={projectId} />
    </div>
  );
};
