'use client';
import { Button } from './ui/button';
import { Bell, ChevronDown, HelpCircle } from 'lucide-react';
import { UserNav } from './user-nav';
import { SmartSearch } from './smart-search';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Logo } from './logo';
import Link from 'next/link';
import { Switch } from './ui/switch';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-[#1C2039] px-4 text-primary-foreground sm:px-6">
      <div className="flex items-center gap-2">
        <Logo className="h-8 w-8 text-primary" />
        <Button variant="ghost" className="hover:bg-white/10 hover:text-primary-foreground">
          <span>AUTO - SociétéX</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="w-full max-w-sm">
          <SmartSearch />
        </div>
        
        <Switch id="dark-mode-toggle" className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/20"/>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-primary-foreground">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <Card className="border-0 shadow-none">
              <CardHeader className="p-2">
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>You have 3 unread messages.</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <div className="flex flex-col gap-2">
                  <div
                    className="mb-2 flex items-start rounded-md p-2 text-sm transition-colors hover:bg-accent"
                  >
                    <div className="grid gap-1">
                      <p className="font-semibold">System Update</p>
                      <p className="text-xs text-muted-foreground">
                        New version of LOGSON module is available.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
        
        <Link href="/help">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-primary-foreground">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
        </Link>

        <UserNav />
      </div>
    </header>
  );
}
