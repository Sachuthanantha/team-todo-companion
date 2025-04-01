
import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

type MessageStatusType = 'sending' | 'sent' | 'delivered' | 'read';

interface MessageStatusProps {
  status: MessageStatusType;
}

export const MessageStatus = ({ status }: MessageStatusProps) => {
  return (
    <span className="ml-1 inline-flex">
      {status === 'sending' && <Clock className="h-3 w-3 text-muted-foreground" />}
      {status === 'sent' && <Check className="h-3 w-3 text-muted-foreground" />}
      {status === 'delivered' && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
      {status === 'read' && <CheckCheck className="h-3 w-3 text-primary" />}
    </span>
  );
};
