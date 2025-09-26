
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
  ShieldCheck,
} from 'lucide-react';
import { useAtom } from 'jotai';
import { userRoleAtom } from '@/lib/store';

const allNavLinks = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    allowedRoles: ['Admin-Gestionnaire', 'Compte Entreprise', 'Gestionnaire SKOMPTAB', 'Gestionnaire SOCIX', 'Gestionnaire MARKOS', 'Gestionnaire LOGSON', 'Stagiaire SKOMPTAB', 'Stagiaire SOCIX', 'Stagiaire MARKOS', 'Stagiaire LOGSON'],
  },
  {
    href: '/skomptab',
    label: 'SKOMPTAB',
    icon: Calculator,
    allowedRoles: ['Admin-Gestionnaire', 'Compte Entreprise', 'Gestionnaire SKOMPTAB', 'Stagiaire SKOMPTAB'],
  },
  {
    href: '/socix',
    label: 'SOCIX',
    icon: UsersRound,
    allowedRoles: ['Admin-Gestionnaire', 'Compte Entreprise', 'Gestionnaire SOCIX', 'Stagiaire SOCIX'],
  },
  {
    href: '/markos',
    label: 'MARKOS',
    icon: Megaphone,
    allowedRoles: ['Admin-Gestionnaire', 'Compte Entreprise', 'Gestionnaire MARKOS', 'Stagiaire MARKOS'],
  },
  {
    href: '/logson',
    label: 'LOGSON',
    icon: Truck,
    allowedRoles: ['Admin-Gestionnaire', 'Compte Entreprise', 'Gestionnaire LOGSON', 'Stagiaire LOGSON'],
  },
];

export function ModuleNav() {
  const pathname = usePathname();
  const [role] = useAtom(userRoleAtom);
  
  const isAdminRole = role === 'Admin-Gestionnaire' || role === 'Compte Entreprise';

  const visibleNavLinks = allNavLinks.filter(link => 
    role ? link.allowedRoles.includes(role) : false
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-[#1C2039] border-b border-white/20">
      <div className="flex items-center gap-x-1 max-w-[1600px] mx-auto px-4 sm:px-6">
        {visibleNavLinks.map((link) => (
          <Link href={link.href} key={link.href} className={cn(
            'flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:text-white relative',
            isActive(link.href) ? 'text-white' : ''
          )}>
            <link.icon className="h-4 w-4" />
            {link.label}
            {isActive(link.href) && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
            )}
          </Link>
        ))}
        <div className="flex-1" />
        {isAdminRole && (
            <Link href="/super-admin" className={cn(
              'flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:text-white relative',
              isActive('/super-admin') ? 'text-white' : ''
            )}>
              <ShieldCheck className="h-4 w-4" />
              Page Admin
              {isActive('/super-admin') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />
              )}
            </Link>
        )}
      </div>
    </nav>
  );
}
