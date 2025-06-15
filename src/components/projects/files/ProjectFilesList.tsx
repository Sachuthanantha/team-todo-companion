
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface ProjectFilesListProps {
  projectId: string;
}

export const ProjectFilesList = ({ projectId }: ProjectFilesListProps) => {
  const { projects, removeProjectFile } = useApp();
  const project = projects.find(p => p.id === projectId);
  const files = project?.files || [];

  const handleDownload = (file: any) => {
    try {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: `Downloading ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the file.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (fileId: string, fileName: string) => {
    removeProjectFile(projectId, fileId);
    toast({
      title: "File deleted",
      description: `${fileName} has been removed from the project.`,
    });
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return 'destructive';
    if (fileType.includes('image')) return 'secondary';
    if (fileType.includes('document') || fileType.includes('word')) return 'default';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'outline';
    return 'outline';
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2" />
            Project Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Upload files to share documentation with your team</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FolderOpen className="h-5 w-5 mr-2" />
          Project Files ({files.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file: any) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.type)}
                <div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB • {format(new Date(file.uploadDate), 'MMM d, yyyy')}
                  </div>
                </div>
                <Badge variant={getFileTypeColor(file.type)}>
                  {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(file.id, file.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
