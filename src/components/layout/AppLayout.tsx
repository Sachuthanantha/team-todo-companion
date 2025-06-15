
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AppProvider } from '@/context/AppContext';
import { Header } from './Header';

export const AppLayout = () => {
  return (
    <AppProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-background dark:bg-background">
            <div className="container mx-auto p-3 sm:p-4 md:p-6 animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  );
};
