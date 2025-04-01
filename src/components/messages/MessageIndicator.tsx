
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface MessageIndicatorProps {
  senderId: string;
  senderName: string;
}

export const MessageIndicator = ({ senderId, senderName }: MessageIndicatorProps) => {
  const [dotCount, setDotCount] = useState(1);
  const [visible, setVisible] = useState(true);
  
  // Animate the typing dots
  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDotCount(prev => prev < 3 ? prev + 1 : 1);
    }, 500);
    
    // Simulate typing effect that eventually disappears
    const visibilityTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);
    
    return () => {
      clearInterval(dotTimer);
      clearTimeout(visibilityTimer);
    };
  }, []);
  
  if (!visible) return null;

  // Generate dots based on the current count
  const dots = '.'.repeat(dotCount);

  return (
    <div className="flex items-center text-xs text-muted-foreground animate-fade-in ml-2 mt-1">
      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      <span>{senderName} is typing{dots}</span>
    </div>
  );
};
