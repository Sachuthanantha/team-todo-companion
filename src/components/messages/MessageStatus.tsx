
import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type MessageStatusType = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

interface MessageStatusProps {
  status: MessageStatusType;
  showLabel?: boolean;
}

export const MessageStatus = ({ status, showLabel = false }: MessageStatusProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-1 inline-flex items-center">
            {status === 'sending' && (
              <>
                <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />
                {showLabel && <span className="ml-1 text-xs text-muted-foreground">Sending</span>}
              </>
            )}
            {status === 'sent' && (
              <>
                <Check className="h-3 w-3 text-muted-foreground" />
                {showLabel && <span className="ml-1 text-xs text-muted-foreground">Sent</span>}
              </>
            )}
            {status === 'delivered' && (
              <>
                <CheckCheck className="h-3 w-3 text-muted-foreground" />
                {showLabel && <span className="ml-1 text-xs text-muted-foreground">Delivered</span>}
              </>
            )}
            {status === 'read' && (
              <>
                <CheckCheck className="h-3 w-3 text-primary" />
                {showLabel && <span className="ml-1 text-xs text-primary">Read</span>}
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="h-3 w-3 text-destructive" />
                {showLabel && <span className="ml-1 text-xs text-destructive">Failed</span>}
              </>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {status === 'sending' && 'Sending message...'}
          {status === 'sent' && 'Message sent'}
          {status === 'delivered' && 'Message delivered'}
          {status === 'read' && 'Message read'}
          {status === 'error' && 'Failed to send message'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
