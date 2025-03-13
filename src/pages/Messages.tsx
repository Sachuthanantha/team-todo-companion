
import { useState, useRef, useEffect } from 'react';
import { useApp, Conversation, Message } from '@/context/AppContext';
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
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";

const Messages = () => {
  const { 
    teamMembers, 
    getCurrentUserId, 
    getConversationsForUser, 
    getConversationById,
    addMessage,
    getTeamMembersByIds
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const selectedConversation = selectedConversationId 
    ? getConversationById(selectedConversationId) 
    : null;
  
  const filteredConversations = conversations.filter(conversation => {
    // Filter by search term
    if (searchTerm) {
      // For direct messages, search in the other participant's name
      if (!conversation.isGroup) {
        const otherParticipantId = conversation.participantIds.find(id => id !== currentUserId);
        const otherParticipant = otherParticipantId 
          ? teamMembers.find(member => member.id === otherParticipantId) 
          : null;
        
        if (otherParticipant && !otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
      } else if (conversation.name && !conversation.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        // For group conversations, search in the group name
        return false;
      }
    }
    
    // Filter by view mode
    if (viewMode === 'direct' && conversation.isGroup) {
      return false;
    }
    if (viewMode === 'groups' && !conversation.isGroup) {
      return false;
    }
    
    return true;
  });
  
  // Scroll to bottom of messages when conversation changes or new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation]);
  
  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversationId) {
      addMessage(selectedConversationId, {
        senderId: currentUserId,
        content: messageInput.trim(),
        read: false
      });
      setMessageInput('');
      toast.success("Message sent");
    }
  };
  
  const getConversationDisplayName = (conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.name || 'Group Conversation';
    } else {
      // For direct messages, show the other person's name
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
  
  return (
    <div className="animate-fade-in h-[calc(100vh-5rem)] flex flex-col">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Communicate with your team members
        </p>
      </header>
      
      <div className="flex flex-1 gap-4 h-full overflow-hidden">
        {/* Conversations List */}
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
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => {
                  const displayName = getConversationDisplayName(conversation);
                  const lastMessage = conversation.messages[conversation.messages.length - 1];
                  const unreadCount = getUnreadMessageCount(conversation);
                  const isSelected = selectedConversationId === conversation.id;
                  const participants = getParticipantAvatars(conversation);
                  
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
                          <Avatar>
                            <AvatarImage 
                              src={participants[0]?.avatar} 
                              alt={participants[0]?.name} 
                            />
                            <AvatarFallback>
                              {participants[0]?.name.substring(0, 2).toUpperCase() || "UN"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">{displayName}</h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {lastMessage ? formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true }) : ''}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage ? (
                                lastMessage.senderId === currentUserId ? 
                                `You: ${lastMessage.content}` : 
                                lastMessage.content
                              ) : 'No messages yet'}
                            </p>
                            
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
        
        {/* Conversation/Messages */}
        {selectedConversation ? (
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Conversation Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                {selectedConversation.isGroup ? (
                  <div className="relative h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                ) : (
                  <Avatar>
                    <AvatarImage 
                      src={getParticipantAvatars(selectedConversation)[0]?.avatar} 
                      alt={getConversationDisplayName(selectedConversation)} 
                    />
                    <AvatarFallback>
                      {getConversationDisplayName(selectedConversation).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div>
                  <h2 className="font-medium">
                    {getConversationDisplayName(selectedConversation)}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.isGroup 
                      ? `${selectedConversation.participantIds.length} members` 
                      : 'Direct message'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((message) => {
                    const isCurrentUser = message.senderId === currentUserId;
                    const sender = getMessageSender(message);
                    
                    return (
                      <div 
                        key={message.id} 
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[75%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          {!isCurrentUser && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={sender?.avatar} />
                              <AvatarFallback>
                                {sender?.name.substring(0, 2).toUpperCase() || "UN"}
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
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first to send a message!
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
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
    </div>
  );
};

export default Messages;
