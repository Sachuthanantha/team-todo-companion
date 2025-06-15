
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, File, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface StorageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  data: string;
}

interface StorageFileUploadProps {
  onUpload: (files: StorageFile[]) => void;
}

export const StorageFileUpload = ({ onUpload }: StorageFileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!selectedFiles.length) {
      setPreviewUrls([]);
      return;
    }

    const newUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);

    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    try {
      const filePromises = selectedFiles.map(file => {
        return new Promise<StorageFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const fileData: StorageFile = {
              id: `file-${Date.now()}-${Math.random()}`,
              name: file.name,
              size: file.size,
              type: file.type,
              uploadDate: new Date().toISOString(),
              data: reader.result as string
            };
            resolve(fileData);
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedFiles = await Promise.all(filePromises);

      onUpload(uploadedFiles);
      
      toast({
        title: "Files uploaded successfully",
        description: `${selectedFiles.length} file(s) uploaded to storage.`,
      });
      
      setSelectedFiles([]);
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Upload File</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  Select files from your computer to upload. You can see a preview below.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="file-upload" className="sr-only">Select Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-2 rounded-md border">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={previewUrls[index]}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary flex flex-col items-center justify-center p-2 text-center">
                              <File className="h-8 w-8 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground mt-2 break-words">
                                {file.name}
                              </span>
                            </div>
                          )}
                           <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <DialogFooter>
                <Button 
                  onClick={handleUpload} 
                  disabled={selectedFiles.length === 0 || uploading}
                >
                  {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};
