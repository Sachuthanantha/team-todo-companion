
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useApp, Meeting, TeamMember } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, Users, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Meeting title is required' }),
  description: z.string().optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' }),
  meetingPlatform: z.enum(['in-app', 'zoom', 'google-meet', 'teams']),
  visibility: z.enum(['public', 'private']),
  participantIds: z.array(z.string()).min(1, { message: 'At least one participant is required' }),
  recurringType: z.enum(['none', 'daily', 'weekly', 'monthly']),
  isAllDay: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface MeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMeeting?: Meeting | null;
  conversationId?: string;
}

export const MeetingDialog = ({ open, onOpenChange, initialMeeting, conversationId }: MeetingDialogProps) => {
  const { 
    teamMembers, 
    addMeeting, 
    updateMeeting, 
    getCurrentUserId,
    createMeetingFromConversation
  } = useApp();
  
  const currentUserId = getCurrentUserId();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      startTime: format(new Date(), 'HH:mm'),
      endTime: format(new Date(Date.now() + 3600000), 'HH:mm'), // 1 hour from now
      meetingPlatform: 'in-app',
      visibility: 'public',
      participantIds: [currentUserId],
      recurringType: 'none',
      isAllDay: false,
    }
  });
  
  useEffect(() => {
    if (initialMeeting) {
      const startDate = new Date(initialMeeting.startTime);
      const endDate = new Date(initialMeeting.endTime);
      
      form.reset({
        title: initialMeeting.title,
        description: initialMeeting.description || '',
        startDate,
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm'),
        meetingPlatform: initialMeeting.meetingPlatform || 'in-app',
        visibility: initialMeeting.visibility,
        participantIds: initialMeeting.participantIds,
        recurringType: initialMeeting.recurringType || 'none',
        isAllDay: initialMeeting.isAllDay || false,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        startDate: new Date(),
        startTime: format(new Date(), 'HH:mm'),
        endTime: format(new Date(Date.now() + 3600000), 'HH:mm'),
        meetingPlatform: 'in-app',
        visibility: 'public',
        participantIds: conversationId ? [] : [currentUserId],
        recurringType: 'none',
        isAllDay: false,
      });
    }
  }, [initialMeeting, form, currentUserId, conversationId]);
  
  const onSubmit = (values: FormValues) => {
    // Combine date and time
    const [startHour, startMinute] = values.startTime.split(':').map(Number);
    const [endHour, endMinute] = values.endTime.split(':').map(Number);
    
    const startDateTime = new Date(values.startDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(values.startDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // If end time is earlier than start time, assume it's the next day
    if (endDateTime < startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
    
    const meetingData = {
      title: values.title,
      description: values.description,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      organizerId: currentUserId,
      participantIds: values.participantIds,
      visibility: values.visibility,
      meetingPlatform: values.meetingPlatform,
      recurringType: values.recurringType,
      isAllDay: values.isAllDay
    };
    
    if (initialMeeting) {
      updateMeeting({
        ...initialMeeting,
        ...meetingData
      });
    } else if (conversationId) {
      createMeetingFromConversation(conversationId, meetingData);
    } else {
      addMeeting(meetingData);
    }
    
    onOpenChange(false);
  };
  
  const toggleParticipant = (memberId: string) => {
    const currentParticipants = form.getValues().participantIds;
    const participantExists = currentParticipants.includes(memberId);
    
    const updatedParticipants = participantExists
      ? currentParticipants.filter(id => id !== memberId)
      : [...currentParticipants, memberId];
    
    form.setValue('participantIds', updatedParticipants);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}</DialogTitle>
          <DialogDescription>
            {initialMeeting 
              ? 'Update the details of your meeting.' 
              : 'Fill in the details to schedule a new meeting.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Weekly Team Sync" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Discuss project updates and next steps..." 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isAllDay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>All-day event</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {!form.watch('isAllDay') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input type="time" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input type="time" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meetingPlatform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in-app">In-App Meeting</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="google-meet">Google Meet</SelectItem>
                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recurringType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurring</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">One-time meeting</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public (Visible to all team members)</SelectItem>
                      <SelectItem value="private">Private (Visible to invited participants only)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="participantIds"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Participants
                  </FormLabel>
                  <ScrollArea className="h-[200px] border rounded-md p-2">
                    <div className="space-y-2">
                      {teamMembers.map(member => {
                        const isSelected = form.watch('participantIds').includes(member.id);
                        const isCurrentUser = member.id === currentUserId;
                        
                        return (
                          <div 
                            key={member.id}
                            className={cn(
                              "flex items-center p-2 rounded-md",
                              isSelected ? "bg-primary/10" : "hover:bg-secondary",
                              isCurrentUser && "opacity-70"
                            )}
                            onClick={() => {
                              if (!isCurrentUser) {
                                toggleParticipant(member.id);
                              }
                            }}
                          >
                            <Checkbox 
                              checked={isSelected}
                              disabled={isCurrentUser}
                              className="mr-2"
                              onCheckedChange={() => {
                                if (!isCurrentUser) {
                                  toggleParticipant(member.id);
                                }
                              }}
                            />
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-2">
                              <p className="text-sm font-medium">
                                {member.name} {isCurrentUser && "(You)"}
                              </p>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {initialMeeting ? 'Update Meeting' : 'Schedule Meeting'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
