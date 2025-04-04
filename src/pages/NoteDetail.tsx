
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  FileText, 
  Image, 
  Tag as TagIcon, 
  Share2, 
  Printer, 
  Plus 
} from "lucide-react";
import { toast } from "sonner";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
}

export default function NoteDetail() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save timer
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            setTags(foundNote.tags || []);
            setAttachments(foundNote.attachments || []);
          } else if (noteId === "new") {
            // Creating a new note
            setTitle("");
            setContent("");
            setTags([]);
            setAttachments([]);
          } else {
            toast.error("Note not found");
            navigate("/notes");
          }
        } else if (noteId === "new") {
          // Creating a new note
          setTitle("");
          setContent("");
          setTags([]);
          setAttachments([]);
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

    // Setup auto-save
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [noteId, navigate]);

  // Setup auto-save whenever content or title changes
  useEffect(() => {
    // Only start auto-save if note is loaded and has changes
    if (!isLoading && (title || content)) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        handleSave();
        setLastSaved(new Date());
      }, 5000); // Auto-save after 5 seconds of inactivity
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content]);

  const handleSave = () => {
    try {
      const storedNotes = localStorage.getItem("notes");
      let notes: Note[] = storedNotes ? JSON.parse(storedNotes) : [];
      
      if (noteId === "new") {
        // Create new note
        const newNote: Note = {
          id: Date.now().toString(),
          title: title || "Untitled Note",
          content,
          date: new Date().toISOString(),
          tags,
          attachments,
        };
        notes = [newNote, ...notes];
        toast.success("Note created");
        navigate(`/notes/${newNote.id}`); // Navigate to the new note
      } else {
        // Update existing note
        notes = notes.map((n) =>
          n.id === noteId
            ? { 
                ...n, 
                title: title || "Untitled Note", 
                content, 
                date: new Date().toISOString(),
                tags,
                attachments,
              }
            : n
        );
        toast.success("Note updated");
      }
      
      localStorage.setItem("notes", JSON.stringify(notes));
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newAttachments = Array.from(files).map(file => {
      // In a real app, we would upload this to a server and get a URL
      // For demo purposes, we'll create object URLs
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size,
      };
    });

    setAttachments([...attachments, ...newAttachments]);
    toast.success(`${newAttachments.length} file(s) attached`);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-[80vh]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-16">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/notes">Notes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{noteId === "new" ? "New Note" : title || "Untitled Note"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center mb-6 gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/notes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{noteId === "new" ? "New Note" : "Edit Note"}</h1>
        <div className="ml-auto flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
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
          <div className="flex justify-between items-center">
            <Label>Tags</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <TagIcon className="h-4 w-4 mr-2" />
                  Manage Tags
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Tags</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a tag" 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} className="flex items-center gap-1">
                        {tag}
                        <button 
                          className="ml-1 hover:bg-primary-foreground rounded-full"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {tags.length === 0 && (
                      <p className="text-sm text-muted-foreground">No tags added yet</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground">No tags added yet</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="content">Content</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              multiple
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Files
            </Button>
          </div>
          
          {attachments.length > 0 && (
            <div className="border rounded-md p-4 mb-4 space-y-2">
              <h3 className="text-sm font-medium">Attachments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between border rounded p-2">
                    <div className="flex items-center">
                      {getFileIcon(attachment.type)}
                      <span className="ml-2 text-sm truncate">{attachment.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleRemoveAttachment(attachment.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border rounded-md min-h-[500px]">
            <NoteEditor content={content} onChange={setContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
