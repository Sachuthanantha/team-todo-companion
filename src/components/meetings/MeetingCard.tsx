
import React from 'react';
import { Meeting, TeamMember, useApp } from '@/context/AppContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { format, isToday, isTomorrow, addMinutes } from 'date-fns';
import { CalendarClock, Clock, Users, Video, ExternalLink, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MeetingCardProps {
  meeting: Meeting;
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (meetingId: string) => void;
}

export const MeetingCard = ({ meeting, onEdit, onDelete }: MeetingCardProps) => {
  const { getTeamMembersByIds, getCurrentUserId, joinMeeting } = useApp();
  
  const currentUserId = getCurrentUserId();
  const isOrganizer = meeting.organizerId === currentUserId;
  const participants = getTeamMembersByIds(meeting.participantIds);
  const organizer = getTeamMembersByIds([meeting.organizerId])[0];
  
  const startDate = new Date(meeting.startTime);
  const endDate = new Date(meeting.endTime);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // Duration in minutes
  
  const getStatusColor = () => {
    switch (meeting.status) {
      case 'ongoing':
        return 'bg-emerald-500';
      case 'scheduled':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-slate-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };
  
  const getStatusText = () => {
    switch (meeting.status) {
      case 'ongoing':
        return 'In Progress';
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'canceled':
        return 'Canceled';
      default:
        return meeting.status;
    }
  };
  
  const getPlatformIcon = () => {
    switch (meeting.meetingPlatform) {
      case 'zoom':
        return <ExternalLink className="h-4 w-4" />;
      case 'google-meet':
        return <ExternalLink className="h-4 w-4" />;
      case 'teams':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };
  
  const getRecurringText = () => {
    if (!meeting.recurringType || meeting.recurringType === 'none') return null;
    
    switch (meeting.recurringType) {
      case 'daily':
        return 'Repeats daily';
      case 'weekly':
        return 'Repeats weekly';
      case 'monthly':
        return 'Repeats monthly';
      default:
        return null;
    }
  };
  
  const getDateDisplay = () => {
    if (isToday(startDate)) {
      return 'Today';
    } else if (isTomorrow(startDate)) {
      return 'Tomorrow';
    } else {
      return format(startDate, 'EEE, MMM d');
    }
  };
  
  const handleJoinMeeting = () => {
    joinMeeting(meeting.id);
  };
  
  return (
    <Card className={cn(
      "transition-colors",
      meeting.status === 'canceled' && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-base">{meeting.title}</h3>
            {meeting.description && (
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{meeting.description}</p>
            )}
          </div>
          
          {(isOrganizer || onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(meeting)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(meeting.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="flex flex-col space-y-2 mb-3">
          <div className="flex items-center text-sm">
            <CalendarClock className="h-4 w-4 text-muted-foreground mr-2" />
            <span>{getDateDisplay()}</span>
            {!meeting.isAllDay && (
              <>
                <span className="mx-1">•</span>
                <span>{format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}</span>
              </>
            )}
            {meeting.isAllDay && (
              <Badge variant="outline" className="ml-2">All day</Badge>
            )}
          </div>
          
          {!meeting.isAllDay && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <span>{duration} minutes</span>
              {getRecurringText() && (
                <>
                  <span className="mx-1">•</span>
                  <span>{getRecurringText()}</span>
                </>
              )}
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 text-muted-foreground mr-2" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center">
                    <span>
                      {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
                    </span>
                    <AvatarGroup className="ml-2">
                      {participants.slice(0, 3).map((participant) => (
                        <Avatar key={participant.id} className="h-6 w-6 border-background">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="text-xs">
                            {participant.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {participants.length > 3 && (
                        <Avatar className="h-6 w-6 border-background">
                          <AvatarFallback className="text-xs">
                            +{participants.length - 3}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </AvatarGroup>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold text-xs">Participants:</p>
                    {participants.map(participant => (
                      <div key={participant.id} className="flex items-center">
                        <span className="text-xs">
                          {participant.name} {participant.id === meeting.organizerId && '(Organizer)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn("flex items-center", getStatusColor())}>
            <span className="h-2 w-2 rounded-full mr-1 bg-current"></span>
            {getStatusText()}
          </Badge>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <span>Organized by {organizer?.name || 'Unknown'}</span>
          </div>
        </div>
      </CardContent>
      
      {(meeting.status === 'scheduled' || meeting.status === 'ongoing') && (
        <CardFooter className="p-4 pt-0">
          <Button 
            onClick={handleJoinMeeting}
            className="w-full"
            variant={meeting.status === 'ongoing' ? 'default' : 'outline'}
          >
            {getPlatformIcon()}
            <span className="ml-2">
              {meeting.status === 'ongoing' ? 'Join Now' : 'Join Meeting'}
            </span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
