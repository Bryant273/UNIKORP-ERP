
'use client';
import { usePathname } from 'next/navigation';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { ChatWidget } from './chat-widget';
import { cn } from '@/lib/utils';

const noHeaderPaths = ['/login'];
const noSidebarPaths = ['/login', '/super-admin', '/employee-dashboard'];


export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showHeader = !noHeaderPaths.includes(pathname);
  const showSidebar = !noSidebarPaths.includes(pathname);

  return (
    <div className="flex h-screen w-full flex-col">
      {showHeader && <AppHeader />}
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <AppSidebar />}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            // Default padding for pages with a sidebar
            showSidebar && 'p-6',
            // Specific padding for pages without a sidebar but with a header
            !showSidebar && showHeader && 'p-4 sm:p-6 lg:p-8',
            // Centering for the login page (no header, no sidebar)
            !showHeader && !showSidebar && 'flex items-center justify-center bg-gray-100 dark:bg-gray-900', 
            // Background for all other pages
            (showHeader || showSidebar) && 'bg-background/80'
          )}
        >
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
