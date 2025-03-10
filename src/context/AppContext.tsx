
import React, { createContext, useContext, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
// Fix: Removing incorrect import of 'toast' from sonner
// and relying only on the useToast hook from shadcn/ui

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  
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

  return (
    <AppContext.Provider value={{ sidebarOpen, toggleSidebar, showSuccessToast, showErrorToast }}>
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
