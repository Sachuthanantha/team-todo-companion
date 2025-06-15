
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HardDrive, Folder, File, Plus } from 'lucide-react';
import { StorageFileUpload, StorageFile } from '@/components/storage/StorageFileUpload';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface StorageFolder {
    id: string;
    name: string;
    parentId: string | null;
}

const Storage = () => {
    const [folders, setFolders] = useState<StorageFolder[]>([]);
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    const handleCreateFolder = () => {
        if (newFolderName.trim() !== '') {
            setFolders(prev => [...prev, { id: Date.now().toString(), name: newFolderName.trim(), parentId: currentFolderId }]);
            setNewFolderName('');
            setCreateFolderOpen(false);
        }
    };

    const handleFilesUpload = (uploadedFiles: StorageFile[]) => {
        setFiles(prev => [...prev, ...uploadedFiles]);
    };

    const getFolderPath = (folderId: string | null): StorageFolder[] => {
        if (!folderId) return [];
        const path: StorageFolder[] = [];
        let currentId: string | null = folderId;
        while (currentId) {
            const folder = folders.find(f => f.id === currentId);
            if (folder) {
                path.unshift(folder);
                currentId = folder.parentId;
            } else {
                currentId = null;
            }
        }
        return path;
    };

    const folderPath = getFolderPath(currentFolderId);
    const foldersInView = folders.filter(f => f.parentId === currentFolderId);
    const filesInView = files.filter(f => f.parentId === currentFolderId);

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <HardDrive className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">Storage</h1>
                </div>
                <div className="flex gap-2">
                    <StorageFileUpload onUpload={handleFilesUpload} currentFolderId={currentFolderId} />
                    <Dialog open={isCreateFolderOpen} onOpenChange={setCreateFolderOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Create Folder</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Folder</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Label htmlFor="name" className="sr-only">Name</Label>
                                <Input 
                                  id="name" 
                                  placeholder="Folder name" 
                                  value={newFolderName} 
                                  onChange={(e) => setNewFolderName(e.target.value)} 
                                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Files & Folders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); setCurrentFolderId(null); }}>Storage</BreadcrumbLink>
                            </BreadcrumbItem>
                            {folderPath.map((folder, index) => (
                                <React.Fragment key={folder.id}>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {index === folderPath.length - 1 ? (
                                            <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); setCurrentFolderId(folder.id); }}>{folder.name}</BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                    {(filesInView.length === 0 && foldersInView.length === 0) ? (
                        <div className="text-center text-muted-foreground py-12">
                            <p>{currentFolderId ? 'This folder is empty.' : 'Your storage is empty.'}</p>
                            <p className="text-sm">Create a folder or upload a file to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {foldersInView.map(folder => (
                                <div key={folder.id} onClick={() => setCurrentFolderId(folder.id)} className="rounded-lg border overflow-hidden flex flex-col hover:bg-accent hover:border-primary cursor-pointer transition-colors">
                                    <div className="aspect-square w-full flex items-center justify-center">
                                        <Folder className="h-16 w-16 text-primary" />
                                    </div>
                                    <div className="p-2 border-t text-center">
                                        <p className="font-medium text-sm truncate" title={folder.name}>{folder.name}</p>
                                    </div>
                                </div>
                            ))}
                            {filesInView.map(file => (
                                <div key={file.id} className="rounded-lg border overflow-hidden flex flex-col hover:bg-accent transition-colors">
                                    <div className="aspect-square w-full bg-secondary flex items-center justify-center">
                                        {file.type.startsWith('image/') ? (
                                            <img src={file.data} alt={file.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <File className="h-16 w-16 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="p-2 border-t">
                                        <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{ (file.size / 1024).toFixed(1) } KB</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Storage;
