
'use client';
import { usePathname } from 'next/navigation';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { ModuleNav } from './module-nav';
import { ChatWidget } from './chat-widget';
import { cn } from '@/lib/utils';

const noLayoutPaths = ['/login', '/super-admin', '/employee-dashboard'];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showFullLayout = !noLayoutPaths.includes(pathname);

  return (
     <div className="flex h-screen w-full flex-col">
      <AppHeader />
      {showFullLayout ? (
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <ModuleNav />
            <main className="flex-1 overflow-y-auto bg-background/80 p-6">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <main className={cn(
          "flex-1 overflow-y-auto bg-background/80",
          (pathname === '/login' || pathname === '/') && "flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900"
          )}>
          {children}
        </main>
      )}
      <ChatWidget />
    </div>
  );
}
