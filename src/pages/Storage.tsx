
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HardDrive, Folder, File, Plus } from 'lucide-react';
import { StorageFileUpload, StorageFile } from '@/components/storage/StorageFileUpload';

interface StorageFolder {
    id: string;
    name: string;
}

const Storage = () => {
    const [folders, setFolders] = useState<StorageFolder[]>([]);
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    const handleCreateFolder = () => {
        if (newFolderName.trim() !== '') {
            setFolders(prev => [...prev, { id: Date.now().toString(), name: newFolderName.trim() }]);
            setNewFolderName('');
            setCreateFolderOpen(false);
        }
    };

    const handleFilesUpload = (uploadedFiles: StorageFile[]) => {
        setFiles(prev => [...prev, ...uploadedFiles]);
    };

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <HardDrive className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">Storage</h1>
                </div>
                <div className="flex gap-2">
                    <StorageFileUpload onUpload={handleFilesUpload} />
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
                    {(files.length === 0 && folders.length === 0) ? (
                        <div className="text-center text-muted-foreground py-12">
                            <p>Your storage is empty.</p>
                            <p className="text-sm">Create a folder or upload a file to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {folders.map(folder => (
                                <div key={folder.id} className="flex items-center p-3 rounded-lg border hover:bg-accent hover:border-primary cursor-pointer transition-colors">
                                    <Folder className="mr-3 h-6 w-6 text-primary" />
                                    <span className="font-medium truncate">{folder.name}</span>
                                </div>
                            ))}
                            {files.map(file => (
                                <div key={file.id} className="flex items-center p-3 rounded-lg border hover:bg-accent">
                                    <File className="mr-3 h-6 w-6 text-muted-foreground" />
                                    <div className="truncate flex-1">
                                        <p className="font-medium text-sm truncate">{file.name}</p>
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
