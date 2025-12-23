import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface LayoutProps {
  children: ReactNode;
  maxHeightScreen?: boolean;
}

export function Layout({ children, maxHeightScreen = false }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className={`${maxHeightScreen ? 'h-screen' : 'min-h-screen'} flex w-full bg-background`}>
        <AppSidebar />
        <main className={`flex-1 flex flex-col ${maxHeightScreen ? 'h-screen' : 'min-h-screen'} overflow-hidden`}>
          <header className="h-14 border-b border-border flex items-center px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          </header>
          <div className={`flex-1 ${maxHeightScreen ? 'overflow-hidden' : 'overflow-auto'}`}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
