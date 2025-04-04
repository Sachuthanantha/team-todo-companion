
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { NoteCard } from "@/components/notes/NoteCard";
import { NoteDialog } from "@/components/notes/NoteDialog";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

const defaultNotes: Note[] = [
  {
    id: "1",
    title: "Meeting Notes",
    content: "<h2>Project Kickoff</h2><p>Discussed timeline and initial requirements.</p><ul><li>Set up weekly check-ins</li><li>Define MVP by next week</li></ul>",
    date: "2023-03-15",
  },
  {
    id: "2",
    title: "Ideas for New Features",
    content: "<p>Brainstorming session results:</p><ol><li>User dashboard improvements</li><li>Integration with calendar</li><li>Mobile app features</li></ol>",
    date: "2023-03-20",
  },
  {
    id: "3",
    title: "Research Notes",
    content: "<h2>Competitor Analysis</h2><p>Looking at similar products in the market:</p><ul><li>Product A - Good UI but limited features</li><li>Product B - Comprehensive but complex</li></ul>",
    date: "2023-04-05",
  },
];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | undefined>(undefined);

  const handleOpenNote = (note: Note) => {
    setCurrentNote(note);
    setIsDialogOpen(true);
  };

  const handleNewNote = () => {
    setCurrentNote(undefined);
    setIsDialogOpen(true);
  };

  const handleSaveNote = (noteData: Omit<Note, "id" | "date">) => {
    if (currentNote) {
      // Edit existing note
      setNotes(
        notes.map((note) =>
          note.id === currentNote.id
            ? { ...note, ...noteData, date: new Date().toISOString() }
            : note
        )
      );
    } else {
      // Add new note
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteData,
        date: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Button onClick={handleNewNote}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            id={note.id}
            title={note.title}
            content={note.content}
            date={note.date}
            onClick={() => handleOpenNote(note)}
          />
        ))}
      </div>

      <NoteDialog
        note={currentNote}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveNote}
      />
    </div>
  );
}
