
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteDialog } from "@/components/notes/NoteDialog";
import { useToast } from "@/components/ui/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  attachments?: number;
}

interface ProjectNotesSectionProps {
  projectId: string;
}

export const ProjectNotesSection = ({ projectId }: ProjectNotesSectionProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const storageKey = `project_notes_${projectId}`;

  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem(storageKey);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
      setNotes([]);
    }
  }, [storageKey]);

  const saveNotes = (updatedNotes: Note[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
      toast({
        title: "Error",
        description: "Could not save notes.",
        variant: "destructive",
      });
    }
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setNoteDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setNoteDialogOpen(true);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'date'>) => {
    let updatedNotes;
    if (selectedNote) {
      updatedNotes = notes.map(n => n.id === selectedNote.id ? { ...selectedNote, ...noteData, date: new Date().toISOString() } : n);
      toast({ title: "Note updated" });
    } else {
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}`,
        date: new Date().toISOString(),
      };
      updatedNotes = [...notes, newNote];
      toast({ title: "Note created" });
    }
    saveNotes(updatedNotes);
    setNoteDialogOpen(false);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    saveNotes(updatedNotes);
    toast({ title: "Note deleted" });
    setNoteDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <Button onClick={handleNewNote}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-10 rounded-lg border-2 border-dashed border-muted-foreground/20">
          <p className="text-muted-foreground">No notes for this project yet.</p>
          <p className="text-sm text-muted-foreground">Click "New Note" to add one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              {...note}
              onClick={() => handleEditNote(note)}
            />
          ))}
        </div>
      )}

      <NoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        note={selectedNote || undefined}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
};
