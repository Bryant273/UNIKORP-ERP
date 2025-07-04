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
  Receipt,
  Landmark,
  FileBarChart,
  BookUser,
  Percent,
  Calculator,
  LayoutDashboard,
  Cog,
  FileScan,
  FileSearch,
  BookCopy,
  Scale,
  BarChartHorizontal,
  Table,
  ArrowLeftRight,
  ClipboardList,
  Columns,
  Spline,
  FilePieChart,
  Target,
  Calendar,
  GitCompareArrows,
  Pencil,
} from 'lucide-react';
import { useState, useEffect } from 'react';


const skomptabNav = [
  {
    title: 'CRÉATION',
    icon: FilePlus,
    subItems: [
      { title: 'Journaux', href: '/skomptab/creation-journaux', icon: BookUser },
      { title: 'Comptes généraux', href: '/skomptab/comptes-generaux', icon: FileBarChart },
      { title: 'Comptes tiers', href: '/skomptab/comptes-tiers', icon: Users },
      { title: 'Modèle de saisie', href: '/skomptab/modele-saisie', icon: FileText },
      { title: 'Modèle de déclaration', href: '/skomptab/modele-declaration', icon: FileText },
      { title: 'Modèle de facture', href: '/skomptab/modele-facture', icon: Receipt },
    ]
  },
  {
    title: 'GESTION',
    icon: Settings,
    subItems: [
      { title: 'Brouillards', href: '/skomptab/brouillards', icon: Pencil },
      { title: 'Saisie comptable', href: '/skomptab/saisie-comptable', icon: Calculator },
      { title: 'Digitalisation des factures', href: '/skomptab/digitalisation-factures', icon: FileScan },
      { title: 'Contrôle de trésorerie', href: '/skomptab/controle-tresorerie', icon: Landmark },
      { title: 'Elaboration des factures', href: '/skomptab/elaboration-factures', icon: FilePlus },
      { title: 'Rapprochement bancaire', href: '/skomptab/rapprochement-bancaire', icon: GitCompareArrows },
    ]
  },
  {
    title: 'ÉTATS COMPTABLES',
    icon: FileText,
    subItems: [
      { title: 'Journaux', href: '/skomptab/etats-comptables-journaux', icon: BookUser },
      { title: 'Brouillards', href: '/skomptab/etats-comptables-brouillards', icon: FileSearch },
      { title: 'Grand livre général', href: '/skomptab/grand-livre-general', icon: BookCopy },
      { title: 'Grand livre tiers', href: '/skomptab/grand-livre-tiers', icon: BookCopy },
      { title: 'Balance générale', href: '/skomptab/balance-generale', icon: Scale },
      { title: 'Bilan', href: '/skomptab/bilan', icon: BarChartHorizontal },
      { title: 'Compte de résultat', href: '/skomptab/compte-de-resultat', icon: BarChartHorizontal },
      { title: 'Tableau des SIG', href: '/skomptab/tableau-sig', icon: Table },
      { title: 'Tableau des flux de trésorerie', href: '/skomptab/tableau-flux-tresorerie', icon: ArrowLeftRight },
    ]
  },
  {
    title: 'ANALYTIQUE',
    icon: ClipboardList,
    subItems: [
      { title: 'Plan analytiques', href: '/skomptab/plan-analytiques', icon: ClipboardList },
      { title: 'Sections analytiques', href: '/skomptab/sections-analytiques', icon: Columns },
      { title: 'Ventilations', href: '/skomptab/ventilations', icon: Spline },
      { title: 'Reporting analytique', href: '/skomptab/reporting-analytique', icon: FilePieChart },
      { title: 'Budgétisation', href: '/skomptab/budgetisation', icon: Target },
    ]
  },
  {
    title: 'FISCALITÉ',
    icon: Percent,
    subItems: [
      { title: 'TVA', href: '/skomptab/tva', icon: Percent },
      { title: 'Déclarations fiscales', href: '/skomptab/declarations-fiscales', icon: FileText },
      { title: 'Déclarations sociales', href: '/skomptab/declarations-sociales', icon: FileText },
      { title: 'Autres impôts', href: '/skomptab/autres-impots', icon: FileText },
      { title: 'Calendrier fiscal', href: '/skomptab/calendrier-fiscal', icon: Calendar },
      { title: 'Simulations fiscales', href: '/skomptab/simulations-fiscales', icon: Calculator },
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
  // Default for main dashboard and special pages
  return {
    dashboardLink: '/',
    items: [],
  };
};

export function AppSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    // This prevents a hydration mismatch.
    const savedState = localStorage.getItem('sidebarOpenSections');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (Array.isArray(parsedState)) {
          setOpenSections(parsedState);
        }
      } catch (e) {
        // Fallback to default if data is malformed
        setOpenSections(['GESTION', 'ÉTATS COMPTABLES']);
      }
    } else {
      // Default for first-time visit
      setOpenSections(['GESTION', 'ÉTATS COMPTABLES']);
    }
    setIsClient(true);
  }, []); // Empty dependency array ensures this runs once on mount.

  const handleValueChange = (value: string[]) => {
    setOpenSections(value);
    localStorage.setItem('sidebarOpenSections', JSON.stringify(value));
  };

  const specialPages = ['/chat', '/notifications', '/settings', '/help'];
  if (pathname === '/' || specialPages.some(p => pathname.startsWith(p))) {
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
          <Accordion
            type="multiple"
            className="w-full px-4"
            value={isClient ? openSections : []} // Use safe default on server/initial render
            onValueChange={handleValueChange}
          >
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
