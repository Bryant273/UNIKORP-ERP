
'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAtom } from 'jotai';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import RequestsPage from './requests/page';
import { Bot, GitCompareArrows, Handshake, LifeBuoy, Megaphone, Palette, Settings, Building, GanttChartSquare, BarChart3, LayoutDashboard, TrendingUp } from 'lucide-react';


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

const adminNav = [
    { title: "Gestion Clients", icon: Building, subItems: [
        { href: '?tab=companies', label: "Liste des entreprises" },
        { href: '?tab=company-profiles', label: "Profils détaillés" },
        { href: '?tab=contracts', label: "Contrats et abonnements" },
        { href: '?tab=payment-history', label: "Historique des paiements" },
        { href: '?tab=account-status', label: "Statuts des comptes" },
    ]},
    { title: "Prospects & Ventes", icon: Handshake, subItems: [
        { href: '?tab=requests', label: "Requêtes" },
        { href: '?tab=sales-pipeline', label: "Pipeline commercial" },
        { href: '?tab=leads', label: "Leads et opportunités" },
        { href: '?tab=demos', label: "Démos planifiées" },
        { href: '?tab=proposals', label: "Propositions commerciales" },
        { href: '?tab=conversion-tracking', label: "Conversion tracking" },
    ]},
    { title: "Déploiements & Instances", icon: GanttChartSquare, subItems: [
        { href: '?tab=environments', label: "Environnements clients" },
        { href: '?tab=custom-configs', label: "Configurations personnalisées" },
        { href: '?tab=updates', label: "Mises à jour et versions" },
        { href: '?tab=migrations', label: "Migrations de données" },
        { href: '?tab=monitoring', label: "Monitoring technique" },
    ]},
    { title: "Templates & Modèles", icon: Palette, subItems: [
        { href: '?tab=accounting-templates', label: "Plans comptables" },
        { href: '?tab=tax-templates', label: "Déclarations fiscales" },
        { href: '?tab=entry-templates', label: "Saisies comptables" },
        { href: '?tab=invoice-templates', label: "Factures et devis" },
        { href: '?tab=financial-statement-layouts', label: "Disposition états financiers" },
        { href: '?tab=accounting-statement-formats', label: "Formats états comptables" },
        { href: '?tab=logistics-templates', label: "Formes bons logistiques" },
        { href: '?tab=marketing-templates', label: "Templates marketing" },
        { href: '?tab=contract-templates', label: "Modèles contractuels" },
    ]},
    { title: "Support & Formation", icon: LifeBuoy, subItems: [
        { href: '?tab=support-tickets', label: "Tickets Support" },
        { href: '?tab=knowledge-base', label: "Base de Connaissances" },
        { href: '?tab=training-sessions', label: "Sessions de formation" },
        { href: '?tab=onboarding', label: "Onboarding clients" },
        { href: '?tab=customer-satisfaction', label: "Satisfaction client" },
    ]},
    { title: "Analytics Business", icon: BarChart3, subItems: [
        { href: '?tab=saas-metrics', label: "Métriques SaaS (MRR, ARR, LTV)" },
        { href: '?tab=usage-by-client', label: "Usage par client" },
        { href: '?tab=product-performance', label: "Performance produit" },
        { href: '?tab=churn-analysis', label: "Analyses de churn" },
        { href: '?tab=revenue-forecasts', label: "Prévisions revenus" },
    ]},
    { title: "Administration", icon: Settings, subItems: [
        { href: '?tab=team-management', label: "Gestion Équipe interne" },
        { href: '?tab=platform-settings', label: "Paramètres Plateforme" },
        { href: '?tab=billing-pricing', label: "Facturation et pricing" },
        { href: '?tab=partner-integrations', label: "Intégrations partenaires" },
        { href: '?tab=security-compliance', label: "Sécurité et conformité" },
    ]},
    { title: "Marketing & Communication", icon: Megaphone, subItems: [
        { href: '?tab=email-campaigns', label: "Campagnes email" },
        { href: '?tab=webinars', label: "Webinaires" },
        { href: '?tab=product-docs', label: "Documentation produit" },
        { href: '?tab=announcements-roadmap', label: "Annonces et roadmap" },
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

const PlaceholderPage = ({ title, description }: { title: string, description: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                Contenu à venir...
            </div>
        </CardContent>
    </Card>
);

const DashboardView = () => (
    <Card>
        <CardHeader className="flex flex-row items-start justify-between">
            <div>
                <CardTitle>Vue d'ensemble de la Plateforme</CardTitle>
                <CardDescription>Indicateurs clés sur les entreprises et les revenus.</CardDescription>
            </div>
             <Button asChild>
                <Link href="/dashboard">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Accès ERP
                </Link>
            </Button>
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
        <Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Entreprise</TableHead><TableHead>Plan</TableHead><TableHead className="text-center">Utilisateurs</TableHead><TableHead className="text-center">Statut</TableHead></TableRow></TableHeader><TableBody>
            {companies.map((c, index) => <TableRow key={c.id}><TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.plan}</TableCell><TableCell className="text-center">{c.userCount}</TableCell><TableCell className="text-center">{getStatusBadge(c.status)}</TableCell></TableRow>)}
        </TableBody></Table>
    </CardContent></Card>
);

const ContractsView = () => (
    <Card><CardHeader><CardTitle>Gestion des Abonnements</CardTitle><CardDescription>Suivez les abonnements, les renouvellements et les suspensions.</CardDescription></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Entreprise</TableHead><TableHead>Montant</TableHead><TableHead>Prochaine Facturation</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {subscriptions.map((s, index) => <TableRow key={s.id}><TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell><TableCell className="font-medium">{s.company}</TableCell><TableCell>{s.amount}</TableCell><TableCell>{format(new Date(s.nextBilling), 'dd/MM/yyyy', { locale: fr })}</TableCell><TableCell>{getStatusBadge(s.status)}</TableCell><TableCell className="text-right">{s.status.includes('attente') && <Button size="sm">Valider</Button>}</TableCell></TableRow>)}
        </TableBody></Table>
    </CardContent></Card>
);

const DemosView = () => (
    <Card><CardHeader><CardTitle>Gestion des Comptes Démos</CardTitle><CardDescription>Activez les comptes de démonstration pour les nouveaux prospects.</CardDescription></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>#</TableHead><TableHead>Entreprise</TableHead><TableHead>Date de Demande</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {demos.map((d, index) => <TableRow key={d.id}><TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell><TableCell className="font-medium">{d.company}</TableCell><TableCell>{format(new Date(d.requestDate), 'dd/MM/yyyy')}</TableCell><TableCell>{getStatusBadge(d.status)}</TableCell><TableCell className="text-right">{d.status === 'En attente' && <Button size="sm">Activer</Button>}</TableCell></TableRow>)}
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
                 <Button
                    variant={activeView === 'dashboard' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2 font-semibold mb-2"
                    onClick={() => setActiveView('dashboard')}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Tableau de bord
                </Button>
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
            // Gestion Clients
            case 'companies': return <CompaniesView />;
            case 'company-profiles': return <PlaceholderPage title="Profils Détaillés des Entreprises" description="Visualisez les informations complètes, les contacts et l'historique pour chaque client."/>;
            case 'contracts': return <ContractsView />;
            case 'payment-history': return <PlaceholderPage title="Historique des Paiements" description="Suivez tous les paiements, factures et abonnements pour chaque client."/>;
            case 'account-status': return <PlaceholderPage title="Statuts des Comptes" description="Gérez l'activation, la suspension ou la suppression des comptes clients."/>;

            // Prospects & Ventes
            case 'requests': return <RequestsPage />;
            case 'sales-pipeline': return <PlaceholderPage title="Pipeline Commercial" description="Suivez les opportunités de vente de la prospection à la signature."/>;
            case 'leads': return <PlaceholderPage title="Leads et Opportunités" description="Gérez la base de données de tous les leads entrants et qualifiez-les."/>;
            case 'demos': return <DemosView />;
            case 'proposals': return <PlaceholderPage title="Propositions Commerciales" description="Créez et suivez les propositions envoyées aux prospects."/>;
            case 'conversion-tracking': return <PlaceholderPage title="Conversion Tracking" description="Analysez les taux de conversion à chaque étape du pipeline de vente."/>;

            // Déploiements & Instances
            case 'environments': return <PlaceholderPage title="Environnements Clients" description="Gérez et monitorez les instances déployées pour chaque client."/>;
            case 'custom-configs': return <PlaceholderPage title="Configurations Personnalisées" description="Gérez les configurations spécifiques et les développements sur-mesure pour chaque client."/>;
            case 'updates': return <PlaceholderPage title="Mises à jour et Versions" description="Planifiez et déployez les mises à jour sur les environnements clients."/>;
            case 'migrations': return <PlaceholderPage title="Migrations de Données" description="Outils et suivi pour les migrations de données des nouveaux clients."/>;
            case 'monitoring': return <PlaceholderPage title="Monitoring Technique" description="Supervisez la performance, la disponibilité et les erreurs des instances clientes."/>;

            // Templates & Modèles
            case 'accounting-templates': return <PlaceholderPage title="Templates de Plans Comptables" description="Gérez les modèles de plans comptables par pays et normes."/>;
            case 'tax-templates': return <PlaceholderPage title="Templates de Déclarations Fiscales" description="Créez et maintenez les modèles pour les déclarations fiscales."/>;
            case 'entry-templates': return <PlaceholderPage title="Modèles de Saisies Comptables" description="Gérez les modèles récurrents pour accélérer la saisie."/>;
            case 'invoice-templates': return <PlaceholderPage title="Templates Factures et Devis" description="Personnalisez les modèles de documents de vente."/>;
            case 'financial-statement-layouts': return <PlaceholderPage title="Disposition États Financiers" description="Configurez l'affichage du Bilan, Compte de Résultat, etc."/>;
            case 'accounting-statement-formats': return <PlaceholderPage title="Formats États Comptables" description="Gérez les formats d'export pour les états comptables (PDF, Excel)."/>;
            case 'logistics-templates': return <PlaceholderPage title="Formes Bons Logistiques" description="Personnalisez les bons de commande, de livraison et de réception."/>;
            case 'marketing-templates': return <PlaceholderPage title="Templates Marketing" description="Gérez les modèles d'emails et de landing pages pour le module MARKOS."/>;
            case 'contract-templates': return <PlaceholderPage title="Modèles Contractuels" description="Gérez les modèles de contrats de travail pour le module SOCIX."/>;

            // Support & Formation
            case 'support-tickets': return <PlaceholderPage title="Tickets Support" description="Suivez et répondez aux demandes de support des clients."/>;
            case 'knowledge-base': return <PlaceholderPage title="Base de Connaissances" description="Rédigez et organisez les articles d'aide pour les utilisateurs."/>;
            case 'training-sessions': return <PlaceholderPage title="Sessions de Formation" description="Planifiez et gérez les sessions de formation pour les clients."/>;
            case 'onboarding': return <PlaceholderPage title="Onboarding Clients" description="Suivez le processus d'intégration des nouveaux clients."/>;
            case 'customer-satisfaction': return <PlaceholderPage title="Satisfaction Client" description="Analysez les retours et la satisfaction des utilisateurs."/>;

            // Analytics Business
            case 'saas-metrics': return <PlaceholderPage title="Métriques SaaS" description="Analysez les indicateurs clés de performance de la plateforme (MRR, Churn, LTV)."/>;
            case 'usage-by-client': return <PlaceholderPage title="Usage par Client" description="Suivez l'utilisation des modules et fonctionnalités par chaque client."/>;
            case 'product-performance': return <PlaceholderPage title="Performance Produit" description="Analysez la performance et l'adoption des différentes fonctionnalités de l'ERP."/>;
            case 'churn-analysis': return <PlaceholderPage title="Analyses de Churn" description="Analysez les raisons des résiliations et identifiez les clients à risque."/>;
            case 'revenue-forecasts': return <PlaceholderPage title="Prévisions Revenus" description="Modélisez et prévoyez les revenus futurs basés sur les abonnements et opportunités."/>;

            // Administration
            case 'team-management': return <PlaceholderPage title="Gestion Équipe Interne" description="Gérez les accès et les rôles de votre équipe de support et de développement."/>;
            case 'platform-settings': return <PlaceholderPage title="Paramètres Plateforme" description="Configurez les paramètres globaux de l'application UNIKORP."/>;
            case 'billing-pricing': return <PlaceholderPage title="Facturation et Pricing" description="Gérez les plans tarifaires, les options et la facturation des clients."/>;
            case 'partner-integrations': return <PlaceholderPage title="Intégrations Partenaires" description="Gérez les clés API et les connexions avec les services tiers."/>;
            case 'security-compliance': return <PlaceholderPage title="Sécurité et Conformité" description="Audits de sécurité, gestion des logs et conformité RGPD."/>;

            // Marketing & Communication
            case 'email-campaigns': return <PlaceholderPage title="Campagnes Email" description="Gérez la communication avec les clients et prospects de la plateforme."/>;
            case 'webinars': return <PlaceholderPage title="Webinaires" description="Organisez et promouvez des webinaires pour les clients et prospects."/>;
            case 'product-docs': return <PlaceholderPage title="Documentation Produit" description="Gérez la documentation publique et technique de l'application."/>;
            case 'announcements-roadmap': return <PlaceholderPage title="Annonces et Roadmap" description="Communiquez les nouveautés et la roadmap produit aux utilisateurs."/>;
            
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
