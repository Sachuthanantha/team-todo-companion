
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ProjectFileUploadProps {
  projectId: string;
}

export const ProjectFileUpload = ({ projectId }: ProjectFileUploadProps) => {
  const { addProjectFile } = useApp();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

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
      for (const file of selectedFiles) {
        // Create a mock file object with base64 data
        const reader = new FileReader();
        reader.onload = () => {
          const fileData = {
            id: `file-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString(),
            data: reader.result as string
          };
          
          addProjectFile(projectId, fileData);
        };
        reader.readAsDataURL(file);
      }
      
      toast({
        title: "Files uploaded successfully",
        description: `${selectedFiles.length} file(s) uploaded to project.`,
      });
      
      setSelectedFiles([]);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="file-upload">Select Files</Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileSelect}
            className="mt-1"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files:</Label>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={selectedFiles.length === 0 || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
        </Button>
      </CardContent>
    </Card>
  );
};
