
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NoteContentRenderer } from "./NoteContentRenderer";

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  date: string;
  onClick: () => void;
}

export const NoteCard = ({ title, content, date, onClick }: NoteCardProps) => {
  return (
    <Card 
      className="cursor-pointer h-full flex flex-col hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium line-clamp-1">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <div className="line-clamp-3">
          <NoteContentRenderer content={content} />
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-2 border-t">
        {new Date(date).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
};
