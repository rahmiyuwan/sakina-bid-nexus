import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { NavigationHeader } from './NavigationHeader';
import { useApp } from '@/contexts/AppContext';
import { PageLoadingSpinner } from '@/components/Common/LoadingStates';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { loading, currentUser } = useApp();

  if (loading) {
    return <PageLoadingSpinner message="Initializing application..." />;
  }

  if (!currentUser) {
    return null; // This should be handled by routing
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <NavigationHeader />
          <main className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};