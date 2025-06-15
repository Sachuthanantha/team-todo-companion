
import { ProjectFilesList } from './ProjectFilesList';

interface ProjectFilesSectionProps {
  projectId: string;
}

export const ProjectFilesSection = ({ projectId }: ProjectFilesSectionProps) => {
  return (
    <div>
      <ProjectFilesList projectId={projectId} />
    </div>
  );
};
