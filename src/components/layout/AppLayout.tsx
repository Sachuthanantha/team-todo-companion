
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AppProvider } from '@/context/AppContext';

export const AppLayout = () => {
  return (
    <AppProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background">
          <div className="container mx-auto p-4 md:p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </AppProvider>
  );
};
