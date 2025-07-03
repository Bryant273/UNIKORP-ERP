'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calculator,
  Megaphone,
  Truck,
  UsersRound,
  MessageSquare,
} from 'lucide-react';

const navLinks = [
  {
    href: '/',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
  },
  {
    href: '/skomptab',
    label: 'SKOMPTAB',
    icon: Calculator,
  },
  {
    href: '/markos',
    label: 'MARKOS',
    icon: Megaphone,
  },
  {
    href: '/logson',
    label: 'LOGSON',
    icon: Truck,
  },
  {
    href: '/socix',
    label: 'SOCIX',
    icon: UsersRound,
  },
  {
    href: '/chat',
    label: 'CHAT',
    icon: MessageSquare,
  },
];

export function ModuleNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-primary px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {navLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground',
                isActive(link.href) &&
                  'rounded-t-md bg-background text-primary shadow-sm'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
