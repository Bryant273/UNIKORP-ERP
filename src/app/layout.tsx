import type { Metadata } from 'next';
import { Inter, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { ModuleNav } from '@/components/module-nav';
import { ThemeProvider } from '@/components/theme-provider';
import { ChatWidget } from '@/components/chat-widget';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '600'],
});
const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['400', '600'],
});

export const metadata: Metadata = {
  title: 'Unikorp',
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
      <body
        className={`${inter.variable} ${roboto.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
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
                <main className="flex-1 overflow-y-auto bg-background/80 p-6">
                  {children}
                </main>
              </div>
            </div>
          </div>
          <ChatWidget />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
