
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Search, Tag } from "lucide-react";
import { NoteCard } from "@/components/notes/NoteCard";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  attachments?: number;
}

const defaultNotes: Note[] = [
  {
    id: "1",
    title: "Meeting Notes",
    content: "<h2>Project Kickoff</h2><p>Discussed timeline and initial requirements.</p><ul><li>Set up weekly check-ins</li><li>Define MVP by next week</li></ul>",
    date: "2023-03-15",
    tags: ["meeting", "project"],
    attachments: 2,
  },
  {
    id: "2",
    title: "Ideas for New Features",
    content: "<p>Brainstorming session results:</p><ol><li>User dashboard improvements</li><li>Integration with calendar</li><li>Mobile app features</li></ol>",
    date: "2023-03-20",
    tags: ["ideas", "features"],
    attachments: 0,
  },
  {
    id: "3",
    title: "Research Notes",
    content: "<h2>Competitor Analysis</h2><p>Looking at similar products in the market:</p><ul><li>Product A - Good UI but limited features</li><li>Product B - Comprehensive but complex</li></ul>",
    date: "2023-04-05",
    tags: ["research"],
    attachments: 1,
  },
];

// Get all unique tags from notes
const getAllTags = (notes: Note[]) => {
  const tagsSet = new Set<string>();
  notes.forEach(note => {
    note.tags?.forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet);
};

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const navigate = useNavigate();
  const allTags = getAllTags(notes);

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

  // Filter and sort notes based on search term, tag, and sort option
  useEffect(() => {
    let result = [...notes];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tag
    if (selectedTag) {
      result = result.filter(note => note.tags?.includes(selectedTag));
    }
    
    // Sort notes
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    setFilteredNotes(result);
  }, [notes, searchTerm, selectedTag, sortBy]);

  const handleNewNote = () => {
    navigate('/notes/new');
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTag(null);
    setSortBy("newest");
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

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <Tag className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium mr-2">Tags:</span>
            {allTags.map(tag => (
              <Badge 
                key={tag} 
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
            {(searchTerm || selectedTag) && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            {notes.length === 0 
              ? "No notes yet. Create your first note!" 
              : "No notes match your search criteria."}
          </p>
          {notes.length === 0 ? (
            <Button onClick={handleNewNote}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              date={note.date}
              tags={note.tags}
              attachments={note.attachments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
