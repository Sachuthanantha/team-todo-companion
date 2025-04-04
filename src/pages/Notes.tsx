
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { NoteCard } from "@/components/notes/NoteCard";
import { useNavigate } from "react-router-dom";

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
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  // Load notes from localStorage or use default
  useEffect(() => {
    const storedNotes = localStorage.getItem("notes");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    } else {
      setNotes(defaultNotes);
      localStorage.setItem("notes", JSON.stringify(defaultNotes));
    }
  }, []);

  const handleNewNote = () => {
    navigate('/notes/new');
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

      {notes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No notes yet. Create your first note!</p>
          <Button onClick={handleNewNote}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              date={note.date}
            />
          ))}
        </div>
      )}
    </div>
  );
}
