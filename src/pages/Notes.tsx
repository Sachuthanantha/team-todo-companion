
import { useState } from 'react';
import { Note, useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteDialog } from '@/components/notes/NoteDialog';
import { FileText, Plus, Search } from 'lucide-react';

const Notes = () => {
  const { notes } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const myNotes = filteredNotes.filter(note => note.editedBy === 'tm1'); // Assuming current user is the first team member
  const sharedNotes = filteredNotes.filter(note => 
    note.editedBy !== 'tm1' && (note.sharedWith?.includes('tm1') || false)
  );

  const handleAddNote = () => {
    setSelectedNote(null);
    setNoteDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setNoteDialogOpen(true);
  };

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Notes</h1>
        <p className="text-muted-foreground">Create and manage your notes, optionally share them with your team</p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddNote}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Notes ({filteredNotes.length})</TabsTrigger>
          <TabsTrigger value="my">My Notes ({myNotes.length})</TabsTrigger>
          <TabsTrigger value="shared">Shared with me ({sharedNotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map(note => (
                <NoteCard key={note.id} note={note} onEdit={handleEditNote} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-secondary/50 rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              {searchTerm ? (
                <p className="text-muted-foreground mb-4">No notes found matching "{searchTerm}"</p>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">No notes yet</p>
                  <Button onClick={handleAddNote}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first note
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          {myNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myNotes.map(note => (
                <NoteCard key={note.id} note={note} onEdit={handleEditNote} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-secondary/50 rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">You haven't created any notes yet</p>
              <Button onClick={handleAddNote}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first note
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="shared" className="mt-6">
          {sharedNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedNotes.map(note => (
                <NoteCard key={note.id} note={note} onEdit={handleEditNote} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-secondary/50 rounded-lg">
              <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No notes have been shared with you</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        initialNote={selectedNote}
      />
    </div>
  );
};

export default Notes;
