
import { cn } from '@/lib/utils';

interface NoteContentRendererProps {
  content: string;
  className?: string;
}

export const NoteContentRenderer = ({ content, className }: NoteContentRendererProps) => {
  // If there's no content, display a placeholder
  if (!content) {
    return <p className="text-muted-foreground italic">No content</p>;
  }

  return (
    <div 
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
