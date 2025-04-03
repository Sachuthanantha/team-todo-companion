
import { useState } from 'react';
import { Note, useApp } from '@/context/AppContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Edit, 
  Trash2, 
  Share2, 
  Clock, 
  MoreHorizontal 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export const NoteCard = ({ note, onEdit }: NoteCardProps) => {
  const { teamMembers, deleteNote } = useApp();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const creator = teamMembers.find(member => member.id === note.editedBy);
  const sharedWith = note.sharedWith && note.sharedWith.length > 0
    ? teamMembers.filter(member => note.sharedWith?.includes(member.id))
    : [];
  
  const handleDelete = () => {
    deleteNote(note.id);
    setDeleteDialogOpen(false);
  };
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{note.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Clock className="h-4 w-4 mr-2" />
                  View history
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="whitespace-pre-wrap text-sm">
            {note.content.length > 250 
              ? `${note.content.substring(0, 250)}...` 
              : note.content}
          </div>
        </CardContent>
        <CardFooter className="pt-4 flex-col items-start gap-2 border-t">
          <div className="flex justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{formatDistanceToNow(new Date(note.editedAt), { addSuffix: true })}</span>
            </div>
            <div>
              {format(new Date(note.createdAt), 'MMM d, yyyy')}
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full">
            {creator && (
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-1">
                  <AvatarImage src={creator.avatar} alt={creator.name} />
                  <AvatarFallback>
                    {creator.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{creator.name}</span>
              </div>
            )}
            
            {sharedWith.length > 0 && (
              <div className="flex items-center">
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                <div className="flex -space-x-2">
                  {sharedWith.slice(0, 3).map(member => (
                    <Avatar key={member.id} className="h-5 w-5 border border-background">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-[10px]">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {sharedWith.length > 3 && (
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px]">
                      +{sharedWith.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the note and all its version history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
