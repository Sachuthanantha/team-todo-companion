
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface MessageIndicatorProps {
  senderId: string;
  senderName: string;
}

export const MessageIndicator = ({ senderId, senderName }: MessageIndicatorProps) => {
  const [visible, setVisible] = useState(true);
  
  // Simulate typing effect that eventually disappears
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;

  return (
    <div className="flex items-center text-xs text-muted-foreground animate-fade-in ml-2 mt-1">
      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      <span>{senderName} is typing...</span>
    </div>
  );
};
