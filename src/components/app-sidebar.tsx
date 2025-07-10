
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
  Users,
  Receipt,
  Landmark,
  FileBarChart,
  BookUser,
  Percent,
  Calculator,
  LayoutDashboard,
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
  BookDown,
  Wallet,
  GraduationCap,
  BarChart3,
  Contact,
  FileSignature,
  FolderKanban,
  Network,
  Plane,
  UserX,
  CalendarDays,
  CheckSquare,
  HandCoins,
  Mail,
  BookOpenCheck,
  Star,
  UserPlus,
  MessageSquare,
  TrendingUp,
  Repeat,
  AreaChart,
  BookHeart,
  Fingerprint,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';


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
    icon: Pencil,
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
      { title: 'Amortissements', href: '/skomptab/amortissements', icon: BookDown },
    ]
  },
  {
    title: 'ÉTATS FINANCIERS',
    icon: BarChartHorizontal,
    subItems: [
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
      { title: 'Ventilations', href: '/skomptab/ventilations', icon: Spline },
      { title: 'Sections analytiques', href: '/skomptab/sections-analytiques', icon: Columns },
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

const socixNav = [
  {
    title: 'PERSONNEL',
    icon: Contact,
    subItems: [
      { title: 'Employés', href: '/socix/employes', icon: Users },
      { title: 'Contrats', href: '/socix/contrats', icon: FileSignature },
      { title: 'Dossiers administratifs', href: '/socix/dossiers-administratifs', icon: FolderKanban },
      { title: 'Organigramme', href: '/socix/organigramme', icon: Network },
    ]
  },
  {
    title: 'PRÉSENCES',
    icon: CalendarDays,
    subItems: [
      { title: 'Congés & Absences', href: '/socix/conges-payes', icon: Plane },
      { title: 'Pointage', href: '/socix/absences-arrets', icon: Fingerprint },
      { title: 'Planning d\'équipe', href: '/socix/planning-equipe', icon: CalendarDays },
      { title: 'Validation des demandes', href: '/socix/validation-demandes', icon: CheckSquare },
    ]
  },
  {
    title: 'PAIE',
    icon: Wallet,
    subItems: [
      { title: 'Paramétrage de la paie', href: '/socix/traitement-paie', icon: HandCoins },
      { title: 'Bulletins de paie', href: '/socix/bulletins-paie', icon: Mail },
      { title: 'Notes de frais', href: '/socix/notes-de-frais', icon: Receipt },
      { title: 'Déclarations sociales', href: '/skomptab/declarations-sociales', icon: FileText },
    ]
  },
  {
    title: 'TALENTS',
    icon: Star,
    subItems: [
      { title: 'Recrutement', href: '/socix/recrutement', icon: UserPlus },
      { title: 'Plans de formation', href: '/socix/plans-formation', icon: BookOpenCheck },
      { title: 'Compétences & Évaluations', href: '/socix/competences-evaluations', icon: Star },
      { title: 'Entretiens annuels', href: '/socix/entretiens-annuels', icon: MessageSquare },
    ]
  },
  {
    title: 'ANALYSE',
    icon: BarChart3,
    subItems: [
      { title: 'KPI sociaux', href: '/socix/kpi-sociaux', icon: TrendingUp },
      { title: 'Alternance des équipes', href: '/socix/alternance-equipes', icon: Repeat },
      { title: 'Rapports et analyses', href: '/socix/rapports-analyses', icon: AreaChart },
      { title: 'Bilan social', href: '/socix/bilan-social', icon: BookHeart },
    ]
  },
];


const getNavForPath = (pathname: string) => {
  if (pathname.startsWith('/skomptab')) {
    return {
      dashboardLink: '/skomptab',
      items: skomptabNav,
    };
  }
  if (pathname.startsWith('/socix')) {
    return {
      dashboardLink: '/socix',
      items: socixNav,
    };
  }
  if (pathname.startsWith('/logson') || pathname.startsWith('/markos')) {
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

function SidebarNavContent() {
  const pathname = usePathname();
  const { items } = getNavForPath(pathname);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const savedState = localStorage.getItem('sidebarOpenSections');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          if (Array.isArray(parsedState)) {
            setOpenSections(parsedState);
          }
        } catch (e) {
          // Silently fail is ok, default state will be used.
        }
      }
    }
  }, [isMounted]);

  const handleValueChange = (value: string[]) => {
    setOpenSections(value);
    localStorage.setItem('sidebarOpenSections', JSON.stringify(value));
  };

  // The skeleton is already handled in the parent AppSidebar component.
  // We can render directly here.
  return (
    <Accordion
      type="multiple"
      className="w-full px-4"
      value={openSections}
      onValueChange={handleValueChange}
    >
      {items.map((item) => (
        <AccordionItem value={item.title} key={item.title} className="border-b-0">
          <AccordionTrigger className="py-2 text-sm font-semibold text-muted-foreground hover:no-underline font-roboto">
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
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const specialPages = ['/chat', '/notifications', '/settings', '/help'];
  if (pathname === '/' || specialPages.some(p => pathname.startsWith(p))) {
    return null;
  }

  const { dashboardLink, placeholder } = getNavForPath(pathname);

  if (!isMounted) {
    return (
        <aside className="hidden w-72 flex-col border-r bg-card font-roboto sm:flex">
             <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-4 px-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </div>
        </aside>
    );
  }

  return (
    <aside className="hidden w-72 flex-col border-r bg-card font-roboto sm:flex">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Link href={dashboardLink}>
            <Button
              variant={pathname === dashboardLink ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2 font-semibold"
            >
              <LayoutDashboard className="h-4 w-4" />
              Tableau de bord
            </Button>
          </Link>
        </div>
        <SidebarNavContent />
        {placeholder && (
          <div className="p-4 text-sm text-muted-foreground">{placeholder}</div>
        )}
      </div>
    </aside>
  );
}
