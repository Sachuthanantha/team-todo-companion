
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

// Type Definitions
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'inProcess' | 'completed';

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
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: string[];
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
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 'tm2',
    name: 'Sam Rodriguez',
    role: 'UX Designer',
    email: 'sam@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 'tm3',
    name: 'Taylor Kim',
    role: 'Developer',
    email: 'taylor@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3'
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
  
  const { toast } = useToast();
  
  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [tasks, teamMembers, projects]);
  
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
      deleteProject
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
