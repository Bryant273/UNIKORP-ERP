'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  FilePlus, 
  Settings, 
  Users, 
  Briefcase, 
  Receipt, 
  Building,
  Landmark,
  FileBarChart,
  BookUser,
  Percent,
  Calculator,
  LayoutDashboard,
  Cog
} from 'lucide-react';


const skomptabNav = [
  { 
    title: 'CRÉATION', 
    icon: FilePlus,
    subItems: [
      { title: 'Journaux', href: '/skomptab/journaux', icon: BookUser },
      { title: 'Factures', href: '/skomptab/factures', icon: Receipt },
      { title: 'Immobilisations', href: '/skomptab/immobilisations', icon: Building }
    ]
  },
  { 
    title: 'GESTION', 
    icon: Settings,
    subItems: [
      { title: 'Clients', href: '/skomptab/clients', icon: Users },
      { title: 'Fournisseurs', href: '/skomptab/fournisseurs', icon: Briefcase },
    ]
  },
  { 
    title: 'FINANCE',
    icon: Landmark,
    subItems: [
      { title: 'Trésorerie', href: '/skomptab/tresorerie', icon: Calculator },
      { title: 'Rapprochement', href: '/skomptab/rapprochement', icon: FileBarChart },
    ]
  },
  { 
    title: 'ÉTATS COMPTABLES',
    icon: FileText,
    subItems: [
      { title: 'Bilan', href: '/skomptab/bilan', icon: FileBarChart },
      { title: 'Compte de résultat', href: '/skomptab/resultat', icon: FileBarChart },
    ]
  },
  { 
    title: 'FISCALITÉ',
    icon: Percent,
    subItems: [
      { title: 'TVA', href: '/skomptab/tva', icon: FileText },
    ]
  }
];

const getNavForPath = (pathname: string) => {
  if (pathname.startsWith('/skomptab')) {
    return {
      dashboardLink: '/skomptab',
      items: skomptabNav,
    };
  }
  if (pathname.startsWith('/logson') || pathname.startsWith('/markos') || pathname.startsWith('/socix')) {
     return {
      dashboardLink: pathname,
      items: [],
      placeholder: `Sections pour ${pathname.split('/')[1].toUpperCase()}`
    };
  }
  // Default for main dashboard
  return {
    dashboardLink: '/',
    items: [],
  };
};

export function AppSidebar() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  const { dashboardLink, items, placeholder } = getNavForPath(pathname);

  return (
    <aside className="hidden w-72 flex-col border-r bg-card sm:flex">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Link href={dashboardLink}>
            <Button
              variant={pathname === dashboardLink ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Tableau de bord
            </Button>
          </Link>
        </div>
        {items.length > 0 && (
          <Accordion type="multiple" className="w-full px-4" defaultValue={items.map(item => item.title)}>
            {items.map((item) => (
              <AccordionItem value={item.title} key={item.title} className="border-b-0">
                <AccordionTrigger className="py-2 text-sm font-semibold text-muted-foreground hover:no-underline">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="pl-4">
                  <ul className="space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            pathname === subItem.href && 'bg-accent text-accent-foreground'
                          )}
                        >
                         <subItem.icon className="h-4 w-4" />
                          {subItem.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {placeholder && (
          <div className="p-4 text-sm text-muted-foreground">{placeholder}</div>
        )}
      </div>
       <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Cog className="h-4 w-4" />
            <span>Paramètres du module</span>
          </Button>
       </div>
    </aside>
  );
}
