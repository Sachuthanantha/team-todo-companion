import { useState, useRef, useEffect } from 'react';
import { useApp, Conversation, Message, TeamMember } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PlusCircle, 
  UserCircle, 
  Users, 
  Search, 
  Send,
  MessageSquare, 
  CircleUser,
  ChevronRight,
  Paperclip,
  Image,
  File,
  Video
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { MessageIndicator } from '@/components/messages/MessageIndicator';
import { MessageItem } from '@/components/messages/MessageItem';
import { MessageButtons } from '@/components/messages/MessageButtons';
import { MeetingDialog } from '@/components/meetings/MeetingDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Messages = () => {
  const { 
    teamMembers, 
    getCurrentUserId, 
    getConversationsForUser, 
    getConversationById,
    addMessage,
    getTeamMembersByIds,
    markMessagesAsRead,
    setUserTyping
  } = useApp();
  
  const currentUserId = getCurrentUserId();
  const conversations = getConversationsForUser(currentUserId);
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  );
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'direct' | 'groups'>('all');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const selectedConversation = selectedConversationId 
    ? getConversationById(selectedConversationId) 
    : null;
  
  useEffect(() => {
    if (selectedConversationId) {
      markMessagesAsRead(selectedConversationId);
    }
  }, [selectedConversationId, markMessagesAsRead]);
  
  const handleTyping = () => {
    if (!isTyping && selectedConversationId) {
      setIsTyping(true);
      setUserTyping(selectedConversationId, currentUserId, true);
    }
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
      if (selectedConversationId) {
        setUserTyping(selectedConversationId, currentUserId, false);
      }
    }, 2000);
    
    setTypingTimeout(timeout);
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);
  
  const filteredConversations = conversations.filter(conversation => {
    if (searchTerm) {
      if (!conversation.isGroup) {
        const otherParticipantId = conversation.participantIds.find(id => id !== currentUserId);
        const otherParticipant = otherParticipantId 
          ? teamMembers.find(member => member.id === otherParticipantId) 
          : null;
        
        if (otherParticipant && !otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
      } else if (conversation.name && !conversation.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    
    if (viewMode === 'direct' && conversation.isGroup) {
      return false;
    }
    if (viewMode === 'groups' && !conversation.isGroup) {
      return false;
    }
    
    return true;
  });
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);
  
  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversationId) {
      addMessage(selectedConversationId, {
        senderId: currentUserId,
        content: messageInput.trim(),
        read: false
      });
      setMessageInput('');
      setIsTyping(false);
      toast.success("Message sent");
    }
  };
  
  const getConversationDisplayName = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.name || 'Group Conversation';
    } else {
      const otherParticipantId = conversation.participantIds.find(id => id !== currentUserId);
      const otherParticipant = otherParticipantId 
        ? teamMembers.find(member => member.id === otherParticipantId) 
        : null;
      
      return otherParticipant ? otherParticipant.name : 'Unknown User';
    }
  };
  
  const getParticipantAvatars = (conversation: Conversation) => {
    return getTeamMembersByIds(conversation.participantIds.filter(id => id !== currentUserId));
  };
  
  const getUnreadMessageCount = (conversation: Conversation) => {
    return conversation.messages.filter(
      msg => msg.senderId !== currentUserId && !msg.read
    ).length;
  };
  
  const getMessageSender = (message: Message) => {
    return teamMembers.find(member => member.id === message.senderId);
  };
  
  const handleAttachmentClick = (type: string) => {
    toast.info(`${type} attachment feature coming soon!`);
  };
  
  const handleScheduleMeeting = () => {
    if (selectedConversationId) {
      setMeetingDialogOpen(true);
    } else {
      toast.error("Please select a conversation first");
    }
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-5rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Communicate with your team members in real-time
        </p>
      </header>
      
      <div className="flex flex-1 gap-4 h-full overflow-hidden">
        <Card className="w-full max-w-xs flex flex-col overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <Tabs 
                value={viewMode} 
                onValueChange={(value) => setViewMode(value as 'all' | 'direct' | 'groups')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="direct">Direct</TabsTrigger>
                  <TabsTrigger value="groups">Groups</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="w-full pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={() => setIsNewConversationOpen(true)}
              variant="outline" 
              className="w-full justify-start"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </div>
          
          <Separator />
          
          <ScrollArea className="flex-1">
            <div className="px-1 py-2">
              {conversations.length > 0 && filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => {
                  const displayName = getConversationDisplayName(conversation);
                  const lastMessage = conversation.messages[conversation.messages.length - 1];
                  const unreadCount = getUnreadMessageCount(conversation);
                  const isSelected = selectedConversationId === conversation.id;
                  const participants = getParticipantAvatars(conversation);
                  const isTypingInConversation = conversation.typingUsers?.length > 0;
                  
                  const typingUserName = isTypingInConversation && conversation.typingUsers 
                    ? teamMembers.find(m => conversation.typingUsers?.includes(m.id))?.name
                    : null;
                  
                  return (
                    <div 
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {conversation.isGroup ? (
                          <div className="relative h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="relative">
                            <Avatar>
                              <AvatarImage 
                                src={participants[0]?.avatar} 
                                alt={participants[0]?.name} 
                              />
                              <AvatarFallback>
                                {participants[0]?.name.substring(0, 2).toUpperCase() || "UN"}
                              </AvatarFallback>
                            </Avatar>
                            {participants[0]?.isOnline && (
                              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                            )}
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">{displayName}</h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {lastMessage ? formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true }) : ''}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center mt-1">
                            {isTypingInConversation && typingUserName ? (
                              <p className="text-sm text-primary animate-pulse truncate">
                                {typingUserName} is typing...
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground truncate">
                                {lastMessage ? (
                                  lastMessage.senderId === currentUserId ? 
                                  `You: ${lastMessage.content}` : 
                                  lastMessage.content
                                ) : 'No messages yet'}
                              </p>
                            )}
                            
                            {unreadCount > 0 && (
                              <Badge variant="default" className="ml-2">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No conversations found</p>
                  <Button 
                    onClick={() => setIsNewConversationOpen(true)} 
                    variant="outline"
                    className="mt-4"
                  >
                    Start a conversation
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
        
        {selectedConversation ? (
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                {selectedConversation.isGroup ? (
                  <div className="relative h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="relative">
                    <Avatar>
                      <AvatarImage 
                        src={getParticipantAvatars(selectedConversation)[0]?.avatar} 
                        alt={getConversationDisplayName(selectedConversation)} 
                      />
                      <AvatarFallback>
                        {getConversationDisplayName(selectedConversation).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {getParticipantAvatars(selectedConversation)[0]?.isOnline && (
                      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                  </div>
                )}
                
                <div>
                  <h2 className="font-medium">
                    {getConversationDisplayName(selectedConversation)}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.isGroup 
                      ? `${selectedConversation.participantIds.length} members` 
                      : getParticipantAvatars(selectedConversation)[0]?.isOnline 
                        ? 'Online'
                        : getParticipantAvatars(selectedConversation)[0]?.lastActive
                          ? `Last active ${formatDistanceToNow(new Date(getParticipantAvatars(selectedConversation)[0]?.lastActive || ''), { addSuffix: true })}`
                          : 'Offline'}
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleScheduleMeeting}
              >
                <Video className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedConversation.messages.length > 0 ? (
                  <>
                    {selectedConversation.messages.map((message) => {
                      const isCurrentUser = message.senderId === currentUserId;
                      const sender = getMessageSender(message);
                      
                      return (
                        <MessageItem 
                          key={message.id}
                          message={message}
                          isCurrentUser={isCurrentUser}
                          sender={sender}
                        />
                      );
                    })}
                    
                    {selectedConversation.messages.length >= 3 && (
                      <MessageButtons 
                        onScheduleMeeting={handleScheduleMeeting}
                        conversationId={selectedConversation.id}
                      />
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first to send a message!
                    </p>
                  </div>
                )}
                
                {selectedConversation.typingUsers?.length > 0 && 
                 !selectedConversation.typingUsers.includes(currentUserId) && (
                  selectedConversation.typingUsers.map(userId => {
                    const typingUser = teamMembers.find(member => member.id === userId);
                    if (typingUser) {
                      return (
                        <MessageIndicator 
                          key={userId} 
                          senderId={userId} 
                          senderName={typingUser.name} 
                        />
                      );
                    }
                    return null;
                  })
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      size="icon"
                      className="ml-1"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAttachmentClick('Image')}>
                      <Image className="h-4 w-4 mr-2" />
                      <span>Image</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAttachmentClick('Document')}>
                      <File className="h-4 w-4 mr-2" />
                      <span>Document</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col items-center justify-center p-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
            <p className="text-muted-foreground text-center mb-6">
              Select a conversation from the list or start a new one
            </p>
            <Button onClick={() => setIsNewConversationOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </Card>
        )}
      </div>
      
      <NewConversationDialog
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        onConversationCreated={(conversationId) => {
          setSelectedConversationId(conversationId);
        }}
      />
      
      <MeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        conversationId={selectedConversationId || undefined}
      />
    </div>
  );
};

export default Messages;
