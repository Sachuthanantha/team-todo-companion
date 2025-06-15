
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, FolderOpen, Search, FilePlus2, FolderPlus, Folder, ChevronRight } from 'lucide-react';
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

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  data: string;
  parentId?: string | null;
}

interface ProjectFilesListProps {
  projectId: string;
}

export const ProjectFilesList = ({ projectId }: ProjectFilesListProps) => {
  const { projects, removeProjectFile, addProjectFile } = useApp();
  const project = projects.find(p => p.id === projectId);
  const files: ProjectFile[] = project?.files || [];

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [path, setPath] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'Project Files' }]);
  
  const currentFolderId = path[path.length - 1].id;

  const filteredFiles = useMemo(() => {
    const filesInCurrentFolder = files.filter(file => {
      if (currentFolderId === null) {
        return !file.parentId;
      }
      return file.parentId === currentFolderId;
    });

    if (!searchTerm) return filesInCurrentFolder;
    return filesInCurrentFolder.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [files, searchTerm, currentFolderId]);

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData: ProjectFile = {
          id: `file-${Date.now()}`,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          uploadDate: new Date().toISOString(),
          data: e.target?.result as string,
          parentId: currentFolderId,
        };
        addProjectFile(projectId, fileData);
        toast({
          title: "File uploaded",
          description: `${selectedFile.name} has been added to the folder.`,
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
    // Note: This will not delete files inside a folder.
    removeProjectFile(projectId, fileId);
    toast({
      title: "Item deleted",
      description: `${fileName} has been removed.`,
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
        toast({ title: "Folder name cannot be empty", variant: "destructive" });
        return;
    }

    const folderData: ProjectFile = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        type: 'folder',
        size: 0,
        uploadDate: new Date().toISOString(),
        data: '',
        parentId: currentFolderId,
    };

    addProjectFile(projectId, folderData);
    toast({
        title: "Folder created",
        description: `Folder "${newFolderName.trim()}" has been created.`,
    });
    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  const handleFolderClick = (folder: ProjectFile) => {
    setPath(prevPath => [...prevPath, { id: folder.id, name: folder.name }]);
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index: number) => {
    setPath(path.slice(0, index + 1));
    setSearchTerm('');
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center text-lg font-semibold flex-wrap">
              {path.map((p, index) => (
                  <div key={p.id || 'root'} className="flex items-center">
                      <Button 
                          variant="link" 
                          className="p-0 h-auto text-lg font-semibold text-foreground hover:text-primary disabled:text-foreground disabled:no-underline disabled:opacity-100" 
                          onClick={() => handleBreadcrumbClick(index)}
                          disabled={index === path.length -1}
                      >
                          {index === 0 && <FolderOpen className="h-5 w-5 mr-2" />}
                          {p.name}
                      </Button>
                      {index < path.length - 1 && <ChevronRight className="h-5 w-5 mx-1 text-muted-foreground" />}
                  </div>
              ))}
            </div>

            <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-grow">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                   placeholder="Search..."
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
          {path.length === 1 && files.filter(f => !f.parentId).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files uploaded yet</p>
              <p className="text-sm">Click "Add File" to get started</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files or folders found</p>
              <p className="text-sm">{searchTerm ? "Try a different search term." : "This folder is empty."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file: ProjectFile) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary/80 transition-colors group">
                  <div 
                    className="flex items-center space-x-4 overflow-hidden flex-1"
                    onClick={() => file.type === 'folder' && handleFolderClick(file)}
                    onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && file.type === 'folder') handleFolderClick(file) }}
                    role={file.type === 'folder' ? "button" : "presentation"}
                    tabIndex={file.type === 'folder' ? 0 : -1}
                    style={{ cursor: file.type === 'folder' ? 'pointer' : 'default' }}
                  >
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
                  
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.type !== 'folder' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file)}
                        aria-label={`Download ${file.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.id, file.name)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Delete ${file.name}`}
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
                    Enter a name for your new folder in{' '}
                    <span className="font-medium text-foreground">{path[path.length - 1].name}</span>.
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
