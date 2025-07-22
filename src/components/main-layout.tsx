
'use client';
import { usePathname } from 'next/navigation';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { ModuleNav } from './module-nav';
import { ChatWidget } from './chat-widget';

const noLayoutPaths = ['/login', '/super-admin', '/employee-dashboard'];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showLayout = !noLayoutPaths.includes(pathname);

  if (!showLayout) {
    return (
        <>
            {children}
            <ChatWidget />
        </>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <ModuleNav />
          <main className="flex-1 overflow-y-auto bg-background/80 p-6">
            {children}
          </main>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
