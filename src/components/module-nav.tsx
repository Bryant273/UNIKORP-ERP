
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
    <nav className="bg-[#5D5CDE] border-b px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {visibleNavLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:text-white rounded-t-md',
                isActive(link.href) &&
                  'bg-white text-primary'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </div>
          </Link>
        ))}
        <div className="flex-1" />
        {isAdminRole && (
            <Link href="/super-admin">
                <div
                className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:text-white rounded-t-md',
                    isActive('/super-admin') && 'bg-white text-primary'
                )}
                >
                <ShieldCheck className="h-4 w-4" />
                Super Admin
                </div>
            </Link>
        )}
      </div>
    </nav>
  );
}
