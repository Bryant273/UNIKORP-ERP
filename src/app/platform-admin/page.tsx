
'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';

import { cn } from '@/lib/utils';
import { userRoleAtom } from '@/lib/store';
import ActionsPage from '../actions/page';
import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, LineChart, Line, Funnel, FunnelChart, Tooltip } from 'recharts';
import type { ChartConfig } from "@/components/ui/chart";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Image from 'next/image';
import { PlusCircle, ShieldCheck, Download, Users, Briefcase, Settings, PlayCircle, StopCircle, UserPlus, Link2, Copy, Eye, Pencil, Trash2, Info, BarChart2, FileText, TrendingUp, LayoutDashboard, Bot, Loader2, DollarSign, Target, UserCheck, UserRound, Ship, TrendingDown, ImageIcon, FileUp, Check, Building, FolderKanban, FileSignature, GanttChartSquare, Handshake, Clock, Ticket, Database, GitMerge, Palette, Receipt, BookOpen, LifeBuoy, BarChart3, Mail, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import RequestsPage from './requests/page';


// --- DATA ---
const companies = [
  { id: 'comp-1', name: 'Société Alpha', plan: 'Premium', status: 'Actif', userCount: 25, nextBilling: '2024-08-15' },
  { id: 'comp-2', name: 'Tech Innovate SARL', plan: 'Standard', status: 'Actif', userCount: 10, nextBilling: '2024-08-22' },
  { id: 'comp-3', name: 'Global Corp', plan: 'Premium', status: 'Suspendu', userCount: 50, nextBilling: '2024-07-30' },
  { id: 'comp-4', name: 'Startup Boost', plan: 'Demo', status: 'En attente', userCount: 5, nextBilling: 'N/A' },
];

const subscriptions = [
    { id: 'sub-1', company: 'Société Alpha', status: 'Actif', amount: '150,000 FCFA/mois', nextBilling: '2024-08-15' },
    { id: 'sub-2', company: 'Tech Innovate SARL', status: 'Actif', amount: '75,000 FCFA/mois', nextBilling: '2024-08-22' },
    { id: 'sub-3', company: 'Global Corp', status: 'Réabonnement en attente', amount: '150,000 FCFA/mois', nextBilling: '2024-07-30' },
];

const demos = [
    { id: 'demo-1', company: 'Startup Boost', requestDate: '2024-07-28', status: 'En attente' },
    { id: 'demo-2', company: 'Future Solutions', requestDate: '2024-07-25', status: 'Activé' },
];

const promotions = [
    { id: 'promo-1', code: 'SUMMER2024', description: '-20% sur les 3 premiers mois du plan Premium', status: 'Actif' },
    { id: 'promo-2', code: 'LAUNCH10', description: '-10% à vie pour les 50 premiers clients', status: 'Expiré' },
];

const adminNav = [
    { title: "Gestion Clients", icon: Building, subItems: [
        { href: '?tab=companies', label: "Liste des entreprises" },
        { href: '?tab=subscriptions', label: "Abonnements" },
    ]},
    { title: "Prospects & Ventes", icon: Handshake, subItems: [
        { href: '?tab=requests', label: "Requêtes" },
        { href: '?tab=demos', label: "Démos" },
    ]},
    { title: "Déploiements & Instances", icon: GanttChartSquare, subItems: [
        { href: '#', label: "Environnements" },
        { href: '#', label: "Mises à jour" },
    ]},
    { title: "Templates & Modèles", icon: Palette, subItems: [
        { href: '#', label: "Templates Factures" },
        { href: '#', label: "Modèles Contrats" },
    ]},
    { title: "Support & Formation", icon: LifeBuoy, subItems: [
        { href: '#', label: "Tickets Support" },
        { href: '#', label: "Base de Connaissances" },
    ]},
    { title: "Analytics Business", icon: BarChart3, subItems: [
        { href: '#', label: "Métriques SaaS" },
    ]},
    { title: "Administration", icon: Settings, subItems: [
        { href: '#', label: "Gestion Équipe" },
        { href: '#', label: "Paramètres Plateforme" },
    ]},
    { title: "Marketing & Communication", icon: Megaphone, subItems: [
        { href: '#', label: "Campagnes Email" },
    ]},
];

// --- COMPONENTS ---
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Actif': case 'Activé': return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        case 'Suspendu': return <Badge variant="destructive">{status}</Badge>;
        case 'En attente': return <Badge variant="outline">{status}</Badge>;
        case 'Expiré': return <Badge variant="secondary">{status}</Badge>;
        case 'Réabonnement en attente': return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        default: return <Badge variant="secondary">{status}</Badge>;
    }
};

const DashboardView = () => (
    <Card>
        <CardHeader>
            <CardTitle>Vue d'ensemble de la Plateforme</CardTitle>
            <CardDescription>Indicateurs clés sur les entreprises et les revenus.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card><CardHeader className="pb-2"><CardDescription>Entreprises Actives</CardDescription><CardTitle className="text-3xl">2</CardTitle></CardHeader></Card>
             <Card><CardHeader className="pb-2"><CardDescription>Abonnements en attente</CardDescription><CardTitle className="text-3xl">1</CardTitle></CardHeader></Card>
             <Card><CardHeader className="pb-2"><CardDescription>Démos à activer</CardDescription><CardTitle className="text-3xl">1</CardTitle></CardHeader></Card>
             <Card><CardHeader className="pb-2"><CardDescription>Revenu Mensuel Récurrent (MRR)</CardDescription><CardTitle className="text-3xl">225,000 FCFA</CardTitle></CardHeader></Card>
        </CardContent>
    </Card>
);

const CompaniesView = () => (
    <Card><CardHeader><CardTitle>Gestion des Entreprises</CardTitle><CardDescription>Consultez la liste des entreprises clientes et leurs informations.</CardDescription></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Entreprise</TableHead><TableHead>Plan</TableHead><TableHead className="text-center">Utilisateurs</TableHead><TableHead className="text-center">Statut</TableHead></TableRow></TableHeader><TableBody>
            {companies.map(c => <TableRow key={c.id}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.plan}</TableCell><TableCell className="text-center">{c.userCount}</TableCell><TableCell className="text-center">{getStatusBadge(c.status)}</TableCell></TableRow>)}
        </TableBody></Table>
    </CardContent></Card>
);

const SubscriptionsView = () => (
    <Card><CardHeader><CardTitle>Gestion des Abonnements</CardTitle><CardDescription>Suivez les abonnements, les renouvellements et les suspensions.</CardDescription></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Entreprise</TableHead><TableHead>Montant</TableHead><TableHead>Prochaine Facturation</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {subscriptions.map(s => <TableRow key={s.id}><TableCell className="font-medium">{s.company}</TableCell><TableCell>{s.amount}</TableCell><TableCell>{format(new Date(s.nextBilling), 'dd/MM/yyyy')}</TableCell><TableCell>{getStatusBadge(s.status)}</TableCell><TableCell className="text-right">{s.status.includes('attente') && <Button size="sm">Valider</Button>}</TableCell></TableRow>)}
        </TableBody></Table>
    </CardContent></Card>
);

const DemosView = () => (
    <Card><CardHeader><CardTitle>Gestion des Comptes Démos</CardTitle><CardDescription>Activez les comptes de démonstration pour les nouveaux prospects.</CardDescription></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Entreprise</TableHead><TableHead>Date de Demande</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {demos.map(d => <TableRow key={d.id}><TableCell className="font-medium">{d.company}</TableCell><TableCell>{format(new Date(d.requestDate), 'dd/MM/yyyy')}</TableCell><TableCell>{getStatusBadge(d.status)}</TableCell><TableCell className="text-right">{d.status === 'En attente' && <Button size="sm">Activer</Button>}</TableCell></TableRow>)}
        </TableBody></Table>
    </CardContent></Card>
);

const AdminSidebar = ({ activeView, setActiveView }: { activeView: string, setActiveView: (view: string) => void }) => {
    return (
        <Card className="h-full">
            <CardHeader className="p-4 border-b">
                 <CardTitle className="text-lg">Admin Fournisseur</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <Accordion type="multiple" defaultValue={[adminNav[0].title, adminNav[1].title]} className="w-full">
                    {adminNav.map((section) => (
                        <AccordionItem value={section.title} key={section.title}>
                            <AccordionTrigger className="text-sm font-semibold text-muted-foreground hover:no-underline py-2">
                                <div className="flex items-center gap-2">
                                    <section.icon className="h-4 w-4" />
                                    {section.title}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pl-4">
                                <ul className="space-y-1">
                                {section.subItems.map((item) => {
                                    const value = item.href.split('=')[1] || 'dashboard';
                                    const isActive = activeView === value;
                                    return (
                                        <li key={item.href}>
                                            <Button
                                                variant={isActive ? 'secondary' : 'ghost'}
                                                className="w-full justify-start h-8"
                                                onClick={() => setActiveView(value)}
                                            >
                                                {item.label}
                                            </Button>
                                        </li>
                                    );
                                })}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    )
}

function PlatformAdminPageContent() {
    const searchParams = useSearchParams();
    const [activeView, setActiveView] = useState(searchParams.get('tab') || 'dashboard');
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'companies': return <CompaniesView />;
            case 'subscriptions': return <SubscriptionsView />;
            case 'demos': return <DemosView />;
            case 'requests': return <RequestsPage />;
            // Add other cases here as they are built
            default: return <DashboardView />;
        }
    };
    
    return (
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
            <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
            <main>
                {renderContent()}
            </main>
        </div>
    );
}

// --- MAIN PAGE ---

export default function PlatformAdminPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <PlatformAdminPageContent />
        </Suspense>
    );
}

    