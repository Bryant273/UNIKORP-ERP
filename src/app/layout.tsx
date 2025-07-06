import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { ModuleNav } from '@/components/module-nav';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Unikorp Central',
  description: 'The unified ERP solution for modern business.',
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex h-screen w-full flex-col">
            <AppHeader />
            <div className="flex flex-1 overflow-hidden">
              <AppSidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <ModuleNav />
                <main className="flex-1 overflow-y-auto bg-background/80 p-4 sm:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
