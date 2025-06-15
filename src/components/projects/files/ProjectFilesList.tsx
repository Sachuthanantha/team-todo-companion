
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, FolderOpen, Search, FilePlus2, FolderPlus, Folder } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useState, useRef, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectFilesListProps {
  projectId: string;
}

export const ProjectFilesList = ({ projectId }: ProjectFilesListProps) => {
  const { projects, removeProjectFile, addProjectFile } = useApp();
  const project = projects.find(p => p.id === projectId);
  const files = project?.files || [];

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return files;
    return files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [files, searchTerm]);

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          id: `file-${Date.now()}`,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          uploadDate: new Date().toISOString(),
          data: e.target?.result as string,
        };
        addProjectFile(projectId, fileData);
        toast({
          title: "File uploaded",
          description: `${selectedFile.name} has been added to the project.`,
        });
      };
      reader.readAsDataURL(selectedFile);
      if (event.target) event.target.value = '';
    }
  };

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

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
        toast({ title: "Folder name cannot be empty", variant: "destructive" });
        return;
    }

    const folderData = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        type: 'folder',
        size: 0,
        uploadDate: new Date().toISOString(),
        data: '',
    };

    addProjectFile(projectId, folderData);
    toast({
        title: "Folder created",
        description: `Folder "${newFolderName.trim()}" has been created.`,
    });
    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  const getFileIcon = (file: { type: string; data: string; name: string }) => {
    if (file.type === 'folder') {
      return <Folder className="h-8 w-8 text-muted-foreground flex-shrink-0" />;
    }
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={file.data}
          alt={file.name}
          className="h-10 w-10 rounded-md object-cover flex-shrink-0"
        />
      );
    }
    return <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />;
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return 'destructive';
    if (fileType.includes('image')) return 'secondary';
    if (fileType.includes('document') || fileType.includes('word')) return 'default';
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'outline';
    return 'outline';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <CardTitle className="flex items-center self-start">
                <FolderOpen className="h-5 w-5 mr-2" />
                Project Files
              </CardTitle>
            <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-grow">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search files..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 w-full"
                 />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <div className="flex items-center gap-2">
                <Button variant="outline" className="w-full sm:w-auto" onClick={handleAddFileClick}><FilePlus2 className="mr-2 h-4 w-4" /> Add File</Button>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsCreateFolderOpen(true)}><FolderPlus className="mr-2 h-4 w-4" /> Create Folder</Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files uploaded yet</p>
              <p className="text-sm">Click "Add File" to upload documentation</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files found</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file: any) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    {getFileIcon(file)}
                    <div className="overflow-hidden">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {file.type !== 'folder' && `${(file.size / 1024).toFixed(1)} KB • `}
                        {format(new Date(file.uploadDate), 'MMM d, yyyy')}
                      </div>
                    </div>
                    {file.type !== 'folder' && (
                      <Badge variant={getFileTypeColor(file.type)} className="flex-shrink-0">
                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.type !== 'folder' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.id, file.name)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Create New Folder</AlertDialogTitle>
                <AlertDialogDescription>
                    Enter a name for your new folder.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
                <Input 
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateFolder();
                      }
                    }}
                    autoFocus
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCreateFolder}>Create</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
