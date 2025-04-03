
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageStatus } from './MessageStatus';
import { Message, TeamMember } from '@/context/AppContext';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  sender?: TeamMember;
}

export const MessageItem = ({ message, isCurrentUser, sender }: MessageItemProps) => {
  // Safely check for attachments and ensure it's iterable
  const hasAttachments = message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0;
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[75%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
        {!isCurrentUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={sender?.avatar} />
            <AvatarFallback>
              {sender?.name ? sender.name.substring(0, 2).toUpperCase() : "UN"}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div>
          <div 
            className={`px-3 py-2 rounded-lg ${
              isCurrentUser 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-accent'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            
            {hasAttachments && (
              <div className="mt-2 space-y-1">
                {message.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center p-2 bg-background/60 rounded-md text-xs">
                    <span className="truncate flex-1">{attachment.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {Math.round(attachment.size / 1024)}KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span>{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
            {isCurrentUser && message.status && (
              <MessageStatus status={message.status} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
