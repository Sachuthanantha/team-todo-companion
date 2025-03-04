
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

// Define types
export type TaskStatus = 'todo' | 'inProcess' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

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
  createdAt: string;
  dueDate?: string;
  tasks: string[]; // Task IDs
  team: string[]; // Team member IDs
}

// Initial data for demo purposes
const initialTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Project Manager',
    email: 'alex@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Sam Wilson',
    role: 'Designer',
    email: 'sam@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Taylor Kim',
    role: 'Developer',
    email: 'taylor@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: 'Jordan Parker',
    role: 'Marketing',
    email: 'jordan@example.com',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design new homepage',
    description: 'Create wireframes and mockups for the new homepage design',
    status: 'todo',
    priority: 'high',
    assignedTo: ['2'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
  },
  {
    id: '2',
    title: 'Backend API integration',
    description: 'Integrate the new API endpoints with the frontend',
    status: 'inProcess',
    priority: 'medium',
    assignedTo: ['3'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
  },
  {
    id: '3',
    title: 'Create marketing campaign',
    description: 'Plan and execute marketing campaign for product launch',
    status: 'inProcess',
    priority: 'high',
    assignedTo: ['4', '1'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
  },
  {
    id: '4',
    title: 'User testing session',
    description: 'Conduct usability testing with focus group',
    status: 'completed',
    priority: 'medium',
    assignedTo: ['1', '2'],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
  },
  {
    id: '5',
    title: 'Documentation update',
    description: 'Update user and developer documentation',
    status: 'todo',
    priority: 'low',
    assignedTo: ['3'],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
  },
];

const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with new branding',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
    tasks: ['1', '2', '4'],
    team: ['1', '2', '3'],
  },
  {
    id: '2',
    name: 'Product Launch',
    description: 'Launch of new flagship product with marketing campaign',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    dueDate: new Date(Date.now() + 86400000 * 21).toISOString(), // 21 days from now
    tasks: ['3', '5'],
    team: ['1', '4'],
  },
];

// Create app context with default values
interface AppContextType {
  tasks: Task[];
  teamMembers: TeamMember[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (member: TeamMember) => void;
  deleteTeamMember: (memberId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTeamMembersByIds: (ids: string[]) => TeamMember[];
  getTasksByTeamMember: (memberId: string) => Task[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  // Task functions
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setTasks((prev) => [...prev, newTask]);
    toast.success('Task added successfully');
  };

  const updateTask = (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    toast.success('Task updated successfully');
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    // Also remove from any projects
    setProjects((prev) => 
      prev.map(p => ({
        ...p,
        tasks: p.tasks.filter(id => id !== taskId)
      }))
    );
    toast.success('Task deleted successfully');
  };

  // Team member functions
  const addTeamMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString(),
    };
    
    setTeamMembers((prev) => [...prev, newMember]);
    toast.success('Team member added successfully');
  };

  const updateTeamMember = (member: TeamMember) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
    toast.success('Team member updated successfully');
  };

  const deleteTeamMember = (memberId: string) => {
    // Check if member is assigned to any tasks first
    const assignedTasks = tasks.filter(t => t.assignedTo.includes(memberId));
    
    if (assignedTasks.length > 0) {
      toast.error('Cannot delete: Member is assigned to tasks');
      return;
    }
    
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
    // Also remove from any projects
    setProjects((prev) => 
      prev.map(p => ({
        ...p,
        team: p.team.filter(id => id !== memberId)
      }))
    );
    toast.success('Team member deleted successfully');
  };

  // Project functions
  const addProject = (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setProjects((prev) => [...prev, newProject]);
    toast.success('Project added successfully');
  };

  const updateProject = (project: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
    toast.success('Project updated successfully');
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    toast.success('Project deleted successfully');
  };

  // Helper functions
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const getTeamMembersByIds = (ids: string[]) => {
    return teamMembers.filter((member) => ids.includes(member.id));
  };

  const getTasksByTeamMember = (memberId: string) => {
    return tasks.filter((task) => task.assignedTo.includes(memberId));
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        teamMembers,
        projects,
        addTask,
        updateTask,
        deleteTask,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        addProject,
        updateProject,
        deleteProject,
        getTasksByStatus,
        getTeamMembersByIds,
        getTasksByTeamMember,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using app context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
