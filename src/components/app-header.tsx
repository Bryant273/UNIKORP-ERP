
'use client';
import { Button } from './ui/button';
import { Bell, ChevronDown, HelpCircle, FileText, UserPlus, Megaphone, LifeBuoy } from 'lucide-react';
import { UserNav } from './user-nav';
import { SmartSearch } from './smart-search';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Logo } from './logo';
import Link from 'next/link';
import { Switch } from './ui/switch';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { usePathname } from 'next/navigation';
import { useAtom } from 'jotai';
import { companyFileAtom } from '@/lib/store';
import Image from 'next/image';

type Notification = {
  id: string;
  type: 'invoice' | 'user' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

const initialNotifications: Notification[] = [
    { id: '1', type: 'invoice', title: 'Nouvelle facture reçue', description: 'Facture #F2024-155 de Fournisseur Gamma.', timestamp: 'Il y a 5 min', read: false },
    { id: '2', type: 'user', title: 'Nouveau membre dans SOCIX', description: 'Sophie Martin a rejoint le module RH.', timestamp: 'Il y a 2 heures', read: false },
    { id: '3', type: 'system', title: 'Mise à jour système', description: 'Le module LOGSON a été mis à jour en v2.1.', timestamp: 'Il y a 1 jour', read: true },
    { id: '4', type: 'invoice', title: 'Paiement en retard', description: 'La facture #FACT-088 est en retard de 3 jours.', timestamp: 'Il y a 3 jours', read: true },
];

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    switch (type) {
        case 'invoice': return <FileText className="h-5 w-5 text-blue-500" />;
        case 'user': return <UserPlus className="h-5 w-5 text-green-500" />;
        case 'system': return <Megaphone className="h-5 w-5 text-purple-500" />;
        default: return <Bell className="h-5 w-5" />;
    }
}


export function AppHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [companyFile] = useAtom(companyFileAtom);

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  const showCompanyName = !['/super-admin', '/dashboard'].includes(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Logo className="h-8 w-8 text-primary" />
        {showCompanyName && companyFile && (
            <div className="flex items-center gap-3">
                <Image src="https://placehold.co/100x100.png" width={28} height={28} alt="Company Logo" className="h-7 w-7 rounded-full border-2 border-primary/20" data-ai-hint="company logo"/>
                <span className="font-semibold text-foreground">{companyFile}</span>
            </div>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="w-full max-w-sm">
          <SmartSearch />
        </div>
        
        {mounted ? (
          <Switch
            id="dark-mode-toggle"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => {
              setTheme(checked ? 'dark' : 'light');
            }}
          />
        ) : (
          <div className="h-6 w-11" />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-primary-foreground">
                    {unreadCount}
                </span>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <Card className="border-0 shadow-none">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Notifications</CardTitle>
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                        Tout marquer comme lu
                    </Button>
                </div>
              </CardHeader>
              <ScrollArea className="h-auto max-h-[400px]">
                <div className="px-4 pb-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                             <div key={notif.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted">
                                <NotificationIcon type={notif.type} />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm">{notif.title}</p>
                                    <p className="text-xs text-muted-foreground">{notif.description}</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">{notif.timestamp}</p>
                                </div>
                                {!notif.read && (
                                    <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                                )}
                            </div>
                        ))
                    ) : (
                         <div className="text-center text-sm text-muted-foreground py-8">
                            Vous n'avez aucune notification.
                        </div>
                    )}
                </div>
              </ScrollArea>
              <Separator />
              <CardFooter className="p-2">
                 <Button variant="ghost" className="w-full as-child">
                    <Link href="/notifications">Voir toutes les notifications</Link>
                 </Button>
              </CardFooter>
            </Card>
          </PopoverContent>
        </Popover>
        
        <Link href="/help">
          <Button variant="ghost" size="icon" className="rounded-full">
            <LifeBuoy className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
        </Link>

        <UserNav />
      </div>
    </header>
  );
}
