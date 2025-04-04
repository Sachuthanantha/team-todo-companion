
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

  // Remove any script tags for security
  const sanitizedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  return (
    <div 
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
