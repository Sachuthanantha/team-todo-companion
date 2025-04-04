
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NoteContentRenderer } from "./NoteContentRenderer";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Tag } from "lucide-react";

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  date: string;
  tags?: string[];
  attachments?: number;
}

export const NoteCard = ({ 
  id, 
  title, 
  content, 
  date,
  tags = [],
  attachments = 0
}: NoteCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/notes/${id}`);
  };

  return (
    <Card 
      className="cursor-pointer h-full flex flex-col hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium line-clamp-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <div className="line-clamp-3">
          <NoteContentRenderer content={content} />
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-2 border-t flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          {attachments > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{attachments}</span>
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{tags.length}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
