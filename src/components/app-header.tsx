'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { Bell } from 'lucide-react';
import { UserNav } from './user-nav';
import { SmartSearch } from './smart-search';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Placeholder for page title, can be dynamic */}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <SmartSearch />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
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
                  <div
                    className="mb-2 flex items-start rounded-md p-2 text-sm transition-colors hover:bg-accent"
                  >
                    <div className="grid gap-1">
                      <p className="font-semibold">New Lead</p>
                      <p className="text-xs text-muted-foreground">
                        A new lead was assigned to you in MARKOS.
                      </p>
                    </div>
                  </div>
                   <div
                    className="mb-2 flex items-start rounded-md p-2 text-sm transition-colors hover:bg-accent"
                  >
                    <div className="grid gap-1">
                      <p className="font-semibold">Invoice Paid</p>
                      <p className="text-xs text-muted-foreground">
                        Invoice #INV-2024-07 was paid.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        <UserNav />
      </div>
    </header>
  );
}
