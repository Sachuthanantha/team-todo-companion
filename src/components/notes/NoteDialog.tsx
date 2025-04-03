
import { useState, useEffect } from 'react';
import { Note, useApp } from '@/context/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { format } from 'date-fns';

interface NoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialNote: Note | null;
}

export const NoteDialog = ({ open, onOpenChange, initialNote }: NoteDialogProps) => {
  const { addNote, updateNote, teamMembers } = useApp();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  
  // Create options array for team member selection
  const memberOptions = teamMembers.map(member => ({
    value: member.id,
    label: `${member.name} (${member.role})`
  }));

  // Convert selected member IDs to option objects for MultiSelect
  const selectedMemberOptions: Option[] = selectedMemberIds.map(id => {
    const member = teamMembers.find(m => m.id === id);
    return {
      value: id,
      label: member ? `${member.name} (${member.role})` : id
    };
  });

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setSelectedMemberIds(initialNote.sharedWith || []);
    } else {
      resetForm();
    }
  }, [initialNote, open]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedMemberIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    const noteData = {
      title,
      content,
      sharedWith: selectedMemberIds,
      versions: initialNote?.versions || []
    };
    
    if (initialNote) {
      // Add current state as a new version
      const newVersion = {
        content: initialNote.content,
        timestamp: new Date().toISOString(),
        editedBy: initialNote.editedBy
      };
      
      updateNote({
        ...noteData,
        id: initialNote.id,
        createdAt: initialNote.createdAt,
        editedAt: new Date().toISOString(),
        editedBy: initialNote.editedBy,
        versions: [newVersion, ...initialNote.versions]
      });
    } else {
      addNote({
        ...noteData,
        createdAt: new Date().toISOString(),
        editedAt: new Date().toISOString(),
        editedBy: 'tm1' // Default to first team member (could be replaced with current user id)
      });
    }
    
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
            <DialogDescription>
              {initialNote 
                ? 'Update your note and share with team members if needed.' 
                : 'Create a new note and optionally share it with team members.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Note Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                rows={8}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sharedWith">Share with</Label>
              <MultiSelect
                value={selectedMemberOptions}
                onChange={(newValue) => {
                  setSelectedMemberIds(newValue.map(v => v.value));
                }}
                options={memberOptions}
                placeholder="Select team members to share with (optional)"
              />
            </div>
            
            {initialNote && initialNote.versions.length > 0 && (
              <div className="space-y-2">
                <Label>Version History</Label>
                <div className="max-h-40 overflow-auto border rounded-md p-2">
                  <ul className="space-y-1 text-sm">
                    {initialNote.versions.map((version, index) => (
                      <li key={index} className="flex justify-between py-1 px-2 hover:bg-muted/50 rounded">
                        <span>Version {initialNote.versions.length - index}</span>
                        <span className="text-muted-foreground">
                          {format(new Date(version.timestamp), 'MMM d, yyyy h:mm a')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialNote ? 'Update Note' : 'Create Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
