import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Type Definitions
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'inProcess' | 'completed';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type MeetingStatus = 'scheduled' | 'ongoing' | 'completed' | 'canceled';
export type MeetingVisibility = 'public' | 'private';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string[];
  createdAt: string;
  dueDate?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastActive?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  members?: string[];
  startDate?: string;
  deadline?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  organizerId: string;
  participantIds: string[];
  status: MeetingStatus;
  visibility: MeetingVisibility;
  meetingLink?: string;
  meetingPlatform?: 'in-app' | 'zoom' | 'google-meet' | 'teams';
  recurringType?: 'none' | 'daily' | 'weekly' | 'monthly';
  conversationId?: string;
  isAllDay?: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  status?: MessageStatus;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  meetingId?: string;
}

export interface Conversation {
  id: string;
  name?: string;
  participantIds: string[];
  isGroup: boolean;
  messages: Message[];
  createdAt: string;
  lastMessageAt: string;
  typingUsers?: string[];
  meetings?: string[];
}

interface AppContextType {
  // Sidebar state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Toast methods
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
  
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByTeamMember: (memberId: string) => Task[];
  
  // Team Members
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (id: string) => void;
  getTeamMembersByIds: (ids: string[]) => TeamMember[];
  
  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  
  // Meetings
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'status'>) => Meeting;
  updateMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => void;
  getMeetingsByStatus: (status: MeetingStatus) => Meeting[];
  getMeetingsByParticipant: (participantId: string) => Meeting[];
  getUpcomingMeetings: (limit?: number) => Meeting[];
  getCurrentMeetings: () => Meeting[];
  joinMeeting: (meetingId: string) => void;
  
  // Messages
  conversations: Conversation[];
  addConversation: (conversation: Omit<Conversation, 'id' | 'createdAt' | 'lastMessageAt' | 'typingUsers'>) => Conversation;
  updateConversation: (conversation: Conversation) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  getConversationsForUser: (userId: string) => Conversation[];
  getConversationById: (id: string) => Conversation | undefined;
  getCurrentUserId: () => string;
  setUserTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  markMessagesAsRead: (conversationId: string) => void;
  simulateMessageDelivery: (messageId: string, conversationId: string) => void;
  toggleUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  createMeetingFromConversation: (conversationId: string, meetingDetails: Omit<Meeting, 'id' | 'createdAt' | 'participantIds' | 'status' | 'conversationId' | 'organizerId'>) => Meeting;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Sample data
const initialTeamMembers: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Alex Johnson',
    role: 'Product Manager',
    email: 'alex@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isOnline: true,
    lastActive: new Date().toISOString()
  },
  {
    id: 'tm2',
    name: 'Sam Rodriguez',
    role: 'UX Designer',
    email: 'sam@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isOnline: false,
    lastActive: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
  },
  {
    id: 'tm3',
    name: 'Taylor Kim',
    role: 'Developer',
    email: 'taylor@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isOnline: true,
    lastActive: new Date().toISOString()
  }
];

const initialTasks: Task[] = [
  {
    id: 'task1',
    title: 'Design new dashboard',
    description: 'Create wireframes for the new dashboard layout',
    status: 'inProcess',
    priority: 'high',
    assignedTo: ['tm2'],
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString() // 2 days from now
  },
  {
    id: 'task2',
    title: 'Fix navigation bug',
    description: 'Resolve the issue with the sidebar navigation',
    status: 'todo',
    priority: 'medium',
    assignedTo: ['tm3'],
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString() // 5 days from now
  },
  {
    id: 'task3',
    title: 'User research',
    description: 'Conduct user interviews for the new feature',
    status: 'completed',
    priority: 'low',
    assignedTo: ['tm1', 'tm2'],
    createdAt: new Date().toISOString(),
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString() // 1 day ago
  }
];

const initialProjects: Project[] = [
  {
    id: 'proj1',
    name: 'Website Redesign',
    description: 'Modernize the company website',
    tasks: ['task1', 'task3']
  },
  {
    id: 'proj2',
    name: 'Mobile App Development',
    description: 'Create a new mobile application',
    tasks: ['task2']
  }
];

// Sample meetings
const initialMeetings: Meeting[] = [
  {
    id: 'meet1',
    title: 'Weekly Team Sync',
    description: 'Regular team catch-up and progress updates',
    startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    endTime: new Date(Date.now() + 5400000).toISOString(), // 1.5 hours from now
    organizerId: 'tm1',
    participantIds: ['tm1', 'tm2', 'tm3'],
    status: 'scheduled',
    visibility: 'public',
    meetingPlatform: 'in-app',
    recurringType: 'weekly',
    createdAt: new Date().toISOString()
  },
  {
    id: 'meet2',
    title: 'Design Review',
    description: 'Review new homepage design concepts',
    startTime: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    endTime: new Date(Date.now() + 90000000).toISOString(), // 1 day + 1 hour from now
    organizerId: 'tm2',
    participantIds: ['tm1', 'tm2'],
    status: 'scheduled',
    visibility: 'private',
    meetingPlatform: 'zoom',
    recurringType: 'none',
    createdAt: new Date().toISOString()
  }
];

// Updated sample conversations with message status
const initialConversations: Conversation[] = [
  {
    id: 'conv1',
    name: 'Website Redesign Team',
    participantIds: ['tm1', 'tm2', 'tm3'],
    isGroup: true,
    messages: [
      {
        id: 'msg1',
        senderId: 'tm1',
        content: "Hi team, let's discuss the new website design.",
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        read: true,
        status: 'read'
      },
      {
        id: 'msg2',
        senderId: 'tm2',
        content: "I've prepared some mockups. Will share them shortly.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        status: 'read'
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    typingUsers: []
  },
  {
    id: 'conv2',
    participantIds: ['tm1', 'tm2'],
    isGroup: false,
    messages: [
      {
        id: 'msg3',
        senderId: 'tm1',
        content: "Hi Sam, how's the design coming along?",
        timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        read: true,
        status: 'read'
      },
      {
        id: 'msg4',
        senderId: 'tm2',
        content: "It's going well! I should have it ready by tomorrow.",
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        read: false,
        status: 'delivered'
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastMessageAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    typingUsers: []
  }
];

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const savedMembers = localStorage.getItem('teamMembers');
    return savedMembers ? JSON.parse(savedMembers) : initialTeamMembers;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('projects');
    return savedProjects ? JSON.parse(savedProjects) : initialProjects;
  });
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const savedConversations = localStorage.getItem('conversations');
    return savedConversations ? JSON.parse(savedConversations) : initialConversations;
  });
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const savedMeetings = localStorage.getItem('meetings');
    return savedMeetings ? JSON.parse(savedMeetings) : initialMeetings;
  });
  
  const { toast } = useToast();
  
  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('conversations', JSON.stringify(conversations));
    localStorage.setItem('meetings', JSON.stringify(meetings));
  }, [tasks, teamMembers, projects, conversations, meetings]);
  
  // Update meeting statuses based on current time
  useEffect(() => {
    const updateMeetingStatuses = () => {
      const now = new Date();
      
      setMeetings(prevMeetings => 
        prevMeetings.map(meeting => {
          const startTime = new Date(meeting.startTime);
          const endTime = new Date(meeting.endTime);
          
          if (meeting.status === 'canceled') {
            return meeting;
          }
          
          if (now >= startTime && now <= endTime) {
            return { ...meeting, status: 'ongoing' };
          } else if (now > endTime) {
            return { ...meeting, status: 'completed' };
          } else {
            return { ...meeting, status: 'scheduled' };
          }
        })
      );
    };
    
    // Update meeting statuses immediately
    updateMeetingStatuses();
    
    // Then update meeting statuses every minute
    const intervalId = setInterval(updateMeetingStatuses, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const showSuccessToast = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });
  };

  const showErrorToast = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };
  
  // Task methods
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    showSuccessToast('Task added successfully');
    return newTask;
  };
  
  const updateTask = (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    showSuccessToast('Task updated successfully');
  };
  
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    // Update projects that have this task
    setProjects(prev => 
      prev.map(p => ({
        ...p,
        tasks: p.tasks.filter(taskId => taskId !== id)
      }))
    );
    showSuccessToast('Task deleted successfully');
  };
  
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };
  
  const getTasksByTeamMember = (memberId: string) => {
    return tasks.filter(task => task.assignedTo.includes(memberId));
  };
  
  // Team Member methods
  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: generateId()
    };
    setTeamMembers(prev => [...prev, newMember]);
    showSuccessToast('Team member added successfully');
  };
  
  const updateTeamMember = (member: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === member.id ? member : m));
    showSuccessToast('Team member updated successfully');
  };
  
  const deleteTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    // Update tasks to remove this member
    setTasks(prev => 
      prev.map(task => ({
        ...task,
        assignedTo: task.assignedTo.filter(memberId => memberId !== id)
      }))
    );
    showSuccessToast('Team member deleted successfully');
  };
  
  const getTeamMembersByIds = (ids: string[]) => {
    return teamMembers.filter(member => ids.includes(member.id));
  };
  
  // Project methods
  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: generateId()
    };
    setProjects(prev => [...prev, newProject]);
    showSuccessToast('Project added successfully');
  };
  
  const updateProject = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    showSuccessToast('Project updated successfully');
  };
  
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    showSuccessToast('Project deleted successfully');
  };

  // Meeting methods
  const addMeeting = (meeting: Omit<Meeting, 'id' | 'createdAt' | 'status'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    };
    
    setMeetings(prev => [...prev, newMeeting]);
    showSuccessToast('Meeting scheduled successfully');
    return newMeeting;
  };
  
  const updateMeeting = (meeting: Meeting) => {
    setMeetings(prev => prev.map(m => m.id === meeting.id ? meeting : m));
    showSuccessToast('Meeting updated successfully');
  };
  
  const deleteMeeting = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    showSuccessToast('Meeting canceled successfully');
  };
  
  const getMeetingsByStatus = (status: MeetingStatus) => {
    return meetings.filter(meeting => meeting.status === status);
  };
  
  const getMeetingsByParticipant = (participantId: string) => {
    return meetings.filter(meeting => 
      meeting.participantIds.includes(participantId) || meeting.organizerId === participantId
    );
  };
  
  const getUpcomingMeetings = (limit?: number) => {
    const now = new Date();
    
    const upcomingMeetings = meetings
      .filter(meeting => 
        new Date(meeting.startTime) > now && 
        meeting.status !== 'canceled' && 
        meeting.status !== 'completed'
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return limit ? upcomingMeetings.slice(0, limit) : upcomingMeetings;
  };
  
  const getCurrentMeetings = () => {
    const now = new Date();
    
    return meetings.filter(meeting => 
      meeting.status === 'ongoing' || 
      (new Date(meeting.startTime) <= now && new Date(meeting.endTime) >= now)
    );
  };
  
  const joinMeeting = (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    
    if (!meeting) {
      showErrorToast('Meeting not found');
      return;
    }
    
    if (meeting.status === 'canceled') {
      showErrorToast('This meeting has been canceled');
      return;
    }
    
    if (meeting.status === 'completed') {
      showErrorToast('This meeting has already ended');
      return;
    }
    
    // In a real application, this would redirect to the meeting room or launch the meeting platform
    showSuccessToast(`Joining meeting: ${meeting.title}`);
    
    // For demonstration, we'll just simulate joining by updating the meeting status to ongoing if it's not already
    if (meeting.status === 'scheduled') {
      updateMeeting({ ...meeting, status: 'ongoing' });
    }
  };
  
  const createMeetingFromConversation = (
    conversationId: string, 
    meetingDetails: Omit<Meeting, 'id' | 'createdAt' | 'participantIds' | 'status' | 'conversationId' | 'organizerId'>
  ) => {
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
      showErrorToast('Conversation not found');
      throw new Error('Conversation not found');
    }
    
    const currentUserId = getCurrentUserId();
    
    const newMeeting = addMeeting({
      ...meetingDetails,
      organizerId: currentUserId,
      participantIds: conversation.participantIds,
      visibility: 'private',
      conversationId
    });
    
    // Update the conversation to reference this meeting
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            meetings: [...(conv.meetings || []), newMeeting.id]
          };
        }
        return conv;
      })
    );
    
    // Add a message to the conversation about the meeting
    addMessage(conversationId, {
      senderId: currentUserId,
      content: `I've scheduled a meeting: "${newMeeting.title}" for ${new Date(newMeeting.startTime).toLocaleString()}`,
      read: false,
      meetingId: newMeeting.id
    });
    
    return newMeeting;
  };

  // Messages methods
  const addConversation = (conversation: Omit<Conversation, 'id' | 'createdAt' | 'lastMessageAt' | 'typingUsers'>) => {
    const now = new Date().toISOString();
    const newConversation: Conversation = {
      ...conversation,
      id: generateId(),
      createdAt: now,
      lastMessageAt: now
    };
    setConversations(prev => [...prev, newConversation]);
    showSuccessToast('Conversation created successfully');
    return newConversation;
  };

  const updateConversation = (conversation: Conversation) => {
    setConversations(prev => prev.map(c => c.id === conversation.id ? conversation : c));
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    showSuccessToast('Conversation deleted successfully');
  };

  const addMessage = (conversationId: string, message: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
    const now = new Date().toISOString();
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: now,
      status: 'sending', // Initial status
    };
    
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessageAt: now,
            typingUsers: conv.typingUsers?.filter(id => id !== message.senderId) || []
          };
        }
        return conv;
      })
    );
    
    // Simulate message being sent after a delay
    setTimeout(() => {
      simulateMessageDelivery(newMessage.id, conversationId);
    }, 1000);
  };

  const simulateMessageDelivery = (messageId: string, conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  status: 'delivered' as MessageStatus
                };
              }
              return msg;
            })
          };
        }
        return conv;
      })
    );
  };

  const markMessagesAsRead = (conversationId: string) => {
    const currentUserId = getCurrentUserId();
    
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: conv.messages.map(msg => {
              if (msg.senderId !== currentUserId && !msg.read) {
                return {
                  ...msg,
                  read: true,
                  status: 'read' as MessageStatus
                };
              }
              return msg;
            })
          };
        }
        return conv;
      })
    );
  };

  const setUserTyping = (conversationId: string, userId: string, isTyping: boolean) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          const typingUsers = conv.typingUsers || [];
          const updatedTypingUsers = isTyping 
            ? [...new Set([...typingUsers, userId])]
            : typingUsers.filter(id => id !== userId);
          
          return {
            ...conv,
            typingUsers: updatedTypingUsers
          };
        }
        return conv;
      })
    );
  };

  const toggleUserOnlineStatus = (userId: string, isOnline: boolean) => {
    setTeamMembers(prev => 
      prev.map(member => {
        if (member.id === userId) {
          return {
            ...member,
            isOnline,
            lastActive: isOnline ? new Date().toISOString() : member.lastActive
          };
        }
        return member;
      })
    );
  };

  const getConversationsForUser = (userId: string) => {
    return conversations.filter(conv => 
      conv.participantIds.includes(userId)
    ).sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
  };

  const getConversationById = (id: string) => {
    return conversations.find(conv => conv.id === id);
  };
  
  // For demo purposes, we'll assume the first team member is the current user
  const getCurrentUserId = () => {
    return teamMembers[0]?.id || '';
  };

  return (
    <AppContext.Provider value={{ 
      sidebarOpen, 
      toggleSidebar, 
      showSuccessToast, 
      showErrorToast,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      getTasksByStatus,
      getTasksByTeamMember,
      teamMembers,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      getTeamMembersByIds,
      projects,
      addProject,
      updateProject,
      deleteProject,
      meetings,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      getMeetingsByStatus,
      getMeetingsByParticipant,
      getUpcomingMeetings,
      getCurrentMeetings,
      joinMeeting,
      conversations,
      addConversation,
      updateConversation,
      deleteConversation,
      addMessage,
      getConversationsForUser,
      getConversationById,
      getCurrentUserId,
      setUserTyping,
      markMessagesAsRead,
      simulateMessageDelivery,
      toggleUserOnlineStatus,
      createMeetingFromConversation
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
