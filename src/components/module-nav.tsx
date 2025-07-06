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
    href: '/socix',
    label: 'SOCIX',
    icon: UsersRound,
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
    <nav className="bg-card px-4 sm:px-6 border-b">
      <div className="flex items-center gap-4">
        {navLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary',
                isActive(link.href) &&
                  'rounded-t-md bg-primary text-primary-foreground hover:text-primary-foreground'
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
