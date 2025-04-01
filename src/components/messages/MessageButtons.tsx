
import React from 'react';
import { Button } from '@/components/ui/button';
import { Video, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MessageButtonsProps {
  onScheduleMeeting: () => void;
  onSendAttachment?: () => void;
  conversationId: string;
}

export const MessageButtons = ({ onScheduleMeeting, conversationId }: MessageButtonsProps) => {
  const navigate = useNavigate();
  
  const handleViewCalendar = () => {
    navigate('/calendar');
  };
  
  return (
    <div className="flex flex-wrap gap-2 my-3 p-3 bg-secondary/50 rounded-md">
      <Button variant="outline" size="sm" onClick={onScheduleMeeting} className="flex-1">
        <Video className="h-4 w-4 mr-2" />
        Schedule Meeting
      </Button>
      
      <Button variant="outline" size="sm" onClick={handleViewCalendar} className="flex-1">
        <Calendar className="h-4 w-4 mr-2" />
        View Calendar
      </Button>
    </div>
  );
};
