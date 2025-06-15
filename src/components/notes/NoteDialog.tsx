
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteEditor } from "./NoteEditor";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface NoteDialogProps {
  note?: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: Omit<Note, "id" | "date">) => void;
  onDelete?: (noteId: string) => void;
}

export const NoteDialog = ({ note, open, onOpenChange, onSave, onDelete }: NoteDialogProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(note?.title || "");
      setContent(note?.content || "");
    }
  }, [note, open]);

  const handleSave = () => {
    onSave({ title, content });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (note && onDelete) {
      onDelete(note.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "New Note"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex-grow overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <NoteEditor content={content} onChange={setContent} />
          </div>
        </div>
        <DialogFooter className="mt-4 pt-4 border-t flex justify-between items-center">
          <div>
            {note && onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
