
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function NoteDetail() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, we would fetch the note from an API
  // For now, we'll use localStorage to persist notes
  useEffect(() => {
    const fetchNote = () => {
      setIsLoading(true);
      try {
        const storedNotes = localStorage.getItem("notes");
        if (storedNotes) {
          const parsedNotes: Note[] = JSON.parse(storedNotes);
          const foundNote = parsedNotes.find((n) => n.id === noteId);
          if (foundNote) {
            setNote(foundNote);
            setTitle(foundNote.title);
            setContent(foundNote.content);
          } else {
            toast.error("Note not found");
            navigate("/notes");
          }
        } else if (noteId === "new") {
          // Creating a new note
          setTitle("");
          setContent("");
        } else {
          toast.error("Note not found");
          navigate("/notes");
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        toast.error("Failed to load note");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [noteId, navigate]);

  const handleSave = () => {
    try {
      const storedNotes = localStorage.getItem("notes");
      let notes: Note[] = storedNotes ? JSON.parse(storedNotes) : [];
      
      if (noteId === "new") {
        // Create new note
        const newNote: Note = {
          id: Date.now().toString(),
          title,
          content,
          date: new Date().toISOString(),
        };
        notes = [newNote, ...notes];
        toast.success("Note created");
        navigate(`/notes/${newNote.id}`); // Navigate to the new note
      } else {
        // Update existing note
        notes = notes.map((n) =>
          n.id === noteId
            ? { ...n, title, content, date: new Date().toISOString() }
            : n
        );
        toast.success("Note updated");
      }
      
      localStorage.setItem("notes", JSON.stringify(notes));
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[80vh]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6 gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/notes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{noteId === "new" ? "New Note" : "Edit Note"}</h1>
        <div className="ml-auto">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            className="text-lg"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <div className="border rounded-md min-h-[500px]">
            <NoteEditor content={content} onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
