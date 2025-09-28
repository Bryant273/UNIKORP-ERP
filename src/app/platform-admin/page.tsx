

'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Users, Clock, CheckCircle, FileText, Ticket, GanttChartSquare, LayoutDashboard, Handshake } from "lucide-react";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import Link from 'next/link';
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

// --- NAVIGATION ---
const navItems = [
    { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'requests', label: 'Requêtes', icon: Handshake },
    { id: 'companies', label: 'Entreprises', icon: Building },
    { id: 'subscriptions', label: 'Abonnements', icon: Clock },
    { id: 'demos', label: 'Démos', icon: GanttChartSquare },
    { id: 'promotions', label: 'Promotions', icon: Ticket },
];

// --- COMPONENTS ---
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Actif':
        case 'Activé':
             return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
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

const PromotionsView = () => (
     <Card><CardHeader><CardTitle>Gestion des Promotions</CardTitle><CardDescription>Créez et gérez les codes promotionnels pour vos campagnes.</CardDescription></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Code Promo</TableHead><TableHead>Description</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>
            {promotions.map(p => <TableRow key={p.id}><TableCell className="font-medium font-mono">{p.code}</TableCell><TableCell>{p.description}</TableCell><TableCell>{getStatusBadge(p.status)}</TableCell></TableRow>)}
        </TableBody></Table>
    </CardContent></Card>
);

// --- MAIN PAGE ---

export default function PlatformAdminPage() {
    const [activeView, setActiveView] = useState('dashboard');
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'requests': return <RequestsPage />;
            case 'companies': return <CompaniesView />;
            case 'subscriptions': return <SubscriptionsView />;
            case 'demos': return <DemosView />;
            case 'promotions': return <PromotionsView />;
            default: return <DashboardView />;
        }
    };
    
    return (
        <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] gap-6">
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                <h2 className="px-4 text-lg font-semibold tracking-tight">
                    Fournisseur ERP
                </h2>
                {navItems.map(item => (
                    <Button 
                        key={item.id}
                        variant={activeView === item.id ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveView(item.id)}
                    >
                         <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Button>
                ))}
            </nav>
            <main>
                {renderContent()}
            </main>
        </div>
    );
}
