
'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAtom } from 'jotai';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import { Bot, GitCompareArrows, Handshake, LifeBuoy, Megaphone, Palette, Settings, Building, GanttChartSquare, BarChart3, LayoutDashboard, TrendingUp, Eye, Pencil, Trash2, MoreHorizontal, User, History, Wallet } from 'lucide-react';


// --- DATA ---
type Company = {
    id: string;
    name: string;
    plan: 'Premium' | 'Standard' | 'Demo';
    status: 'Actif' | 'Suspendu' | 'En attente';
    userCount: number;
    nextBilling: string;
    users: { id: string; name: string; role: string; avatarUrl: string }[];
};

const companiesData: Company[] = [
  { id: 'comp-1', name: 'Société Alpha', plan: 'Premium', status: 'Actif', userCount: 25, nextBilling: '2024-08-15', users: [{id: 'u1', name: 'Jean Dupont', role: 'Admin', avatarUrl: 'https://placehold.co/100x100.png'}] },
  { id: 'comp-2', name: 'Tech Innovate SARL', plan: 'Standard', status: 'Actif', userCount: 10, nextBilling: '2024-08-22', users: [{id: 'u2', name: 'Sophie Martin', role: 'Gestionnaire', avatarUrl: 'https://placehold.co/100x100.png'}] },
  { id: 'comp-3', name: 'Global Corp', plan: 'Premium', status: 'Suspendu', userCount: 50, nextBilling: '2024-07-30', users: [] },
  { id: 'comp-4', name: 'Startup Boost', plan: 'Demo', status: 'En attente', userCount: 5, nextBilling: 'N/A', users: [] },
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

const ITEMS_PER_PAGE = 10;

// --- UTILITY COMPONENTS ---
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Actif': case 'Activé': case 'Payé': return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
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
                <Link href="/super-admin-innovkorp">
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

function CompaniesView() {
    const { toast } = useToast();
    const [companies, setCompanies] = useState(companiesData);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

    const totalPages = Math.ceil(companies.length / ITEMS_PER_PAGE);
    const paginatedCompanies = companies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleDelete = () => {
        if (!companyToDelete) return;
        setCompanies(prev => prev.filter(c => c.id !== companyToDelete.id));
        setCompanyToDelete(null);
        toast({ title: 'Entreprise supprimée.' });
    };

    const handleSave = (formData: Company) => {
        setCompanies(prev => prev.map(c => c.id === formData.id ? formData : c));
        setEditingCompany(null);
        toast({ title: 'Modifications enregistrées.' });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Gestion des Entreprises</CardTitle>
                    <CardDescription>Consultez la liste des entreprises clientes et leurs informations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Entreprise</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead className="text-center">Utilisateurs</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCompanies.map((c, index) => (
                                <TableRow key={c.id} className="odd:bg-muted/50">
                                    <TableCell className="font-medium text-muted-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell><Badge variant="outline">{c.plan}</Badge></TableCell>
                                    <TableCell className="text-center">{c.userCount}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(c.status)}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setViewingCompany(c)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => setEditingCompany(c)}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => setCompanyToDelete(c)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <CardFooter className="flex items-center justify-between pt-6">
                        <div className="text-sm text-muted-foreground">
                            Total de {companies.length} entreprises. Page {currentPage} sur {totalPages}.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                Précédent
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                Suivant
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            <CompanyDetailsModal company={viewingCompany} isOpen={!!viewingCompany} onClose={() => setViewingCompany(null)} />
            <EditCompanyModal company={editingCompany} isOpen={!!editingCompany} onClose={() => setEditingCompany(null)} onSave={handleSave} />

            <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Êtes-vous certain ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera le compte de l'entreprise.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

const ContractsView = () => (
    <Card><CardHeader><CardTitle>Gestion des Abonnements</CardTitle><CardDescription>Suivez les abonnements, les renouvellements et les suspensions.</CardDescription></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Entreprise</TableHead><TableHead>Montant</TableHead><TableHead>Prochaine Facturation</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {subscriptions.map(s => <TableRow key={s.id}><TableCell className="font-medium">{s.company}</TableCell><TableCell>{s.amount}</TableCell><TableCell>{format(new Date(s.nextBilling), 'dd/MM/yyyy', { locale: fr })}</TableCell><TableCell>{getStatusBadge(s.status)}</TableCell><TableCell className="text-right">{s.status.includes('attente') && <Button size="sm">Valider</Button>}</TableCell></TableRow>)}
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

function CompanyDetailsModal({ company, isOpen, onClose }: { company: Company | null; isOpen: boolean; onClose: () => void }) {
    if (!company) return null;
    const mockActivity = [
        { date: '2024-07-28', action: 'Jean Dupont s\'est connecté.' },
        { date: '2024-07-27', action: 'Facture INV-0123 marquée comme payée.' },
        { date: '2024-07-26', action: 'Nouvel utilisateur ajouté: Alice.' },
    ];
    const mockBilling = [
        { id: 'fact-01', date: '2024-07-15', amount: '150,000 FCFA', status: 'Payé' },
        { id: 'fact-02', date: '2024-06-15', amount: '150,000 FCFA', status: 'Payé' },
        { id: 'fact-03', date: '2024-05-15', amount: '150,000 FCFA', status: 'Payé' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{company.name}</DialogTitle>
                    <DialogDescription>Détails complets de l'entreprise cliente.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-4">
                    <Tabs defaultValue="synthesis" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="synthesis">Synthèse</TabsTrigger>
                            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                            <TabsTrigger value="activity">Activité</TabsTrigger>
                            <TabsTrigger value="billing">Facturation</TabsTrigger>
                        </TabsList>
                        <TabsContent value="synthesis" className="mt-4">
                            <Card><CardHeader><CardTitle>Informations Clés</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Plan</p><p className="text-xl font-bold">{company.plan}</p></div>
                                <div className="p-4 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Statut</p><div className="text-xl font-bold">{getStatusBadge(company.status)}</div></div>
                                <div className="p-4 rounded-lg bg-muted"><p className="text-sm text-muted-foreground">Prochaine Facture</p><p className="text-xl font-bold">{company.nextBilling}</p></div>
                            </CardContent></Card>
                        </TabsContent>
                        <TabsContent value="users" className="mt-4">
                            <Card><CardHeader><CardTitle>Utilisateurs</CardTitle><CardDescription>Total: {company.userCount} utilisateurs</CardDescription></CardHeader><CardContent>
                                {company.users.length > 0 ? (
                                    <Table><TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Rôle</TableHead></TableRow></TableHeader><TableBody>
                                        {company.users.map(user => (
                                            <TableRow key={user.id}><TableCell>
                                                <div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={user.avatarUrl} alt={user.name}/><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>{user.name}</div>
                                            </TableCell><TableCell>{user.role}</TableCell></TableRow>
                                        ))}
                                    </TableBody></Table>
                                ) : <p className="p-4 text-center text-sm text-muted-foreground">Aucun utilisateur pour cette entreprise.</p>}
                            </CardContent></Card>
                        </TabsContent>
                        <TabsContent value="activity" className="mt-4">
                             <Card><CardHeader><CardTitle>Activité Récente</CardTitle></CardHeader><CardContent>
                                <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>
                                    {mockActivity.map(act => <TableRow key={act.action} className="odd:bg-muted/50"><TableCell className="font-mono text-xs">{act.date}</TableCell><TableCell>{act.action}</TableCell></TableRow>)}
                                </TableBody></Table>
                            </CardContent></Card>
                        </TabsContent>
                        <TabsContent value="billing" className="mt-4">
                            <Card><CardHeader><CardTitle>Historique de Facturation</CardTitle></CardHeader><CardContent>
                               <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead className="text-right">Montant</TableHead><TableHead className="text-center">Statut</TableHead></TableRow></TableHeader><TableBody>
                                   {mockBilling.map(b => <TableRow key={b.id} className="odd:bg-muted/50"><TableCell>{b.date}</TableCell><TableCell className="text-right">{b.amount}</TableCell><TableCell className="text-center">{getStatusBadge(b.status)}</TableCell></TableRow>)}
                                </TableBody></Table>
                            </CardContent></Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <DialogFooter><Button variant="outline" onClick={onClose}>Fermer</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditCompanyModal({ company, isOpen, onClose, onSave }: { company: Company | null; isOpen: boolean; onClose: () => void; onSave: (data: Company) => void; }) {
    const [formData, setFormData] = useState<Partial<Company>>({});

    useEffect(() => {
        setFormData(company || {});
    }, [company]);
    
    if (!company) return null;

    const handleSave = () => {
        onSave({ ...company, ...formData });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader><DialogTitle>Modifier l'entreprise: {company.name}</DialogTitle><DialogDescription>Modifiez les paramètres du compte de l'entreprise.</DialogDescription></DialogHeader>
                <Tabs defaultValue="subscription" className="w-full pt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">Général</TabsTrigger>
                        <TabsTrigger value="subscription">Abonnement</TabsTrigger>
                        <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="mt-4">
                        <Card><CardContent className="p-6 space-y-4">
                           <div className="space-y-2"><Label>Nom de l'entreprise</Label><Input value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))}/></div>
                        </CardContent></Card>
                    </TabsContent>
                    <TabsContent value="subscription" className="mt-4">
                        <Card><CardContent className="p-6 space-y-4">
                            <div className="space-y-2"><Label>Plan d'Abonnement</Label>
                                <Select value={formData.plan} onValueChange={(v: Company['plan']) => setFormData(p => ({...p, plan: v}))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent><SelectItem value="Demo">Demo</SelectItem><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Premium">Premium</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Statut du compte</Label>
                                <Select value={formData.status} onValueChange={(v: Company['status']) => setFormData(p => ({...p, status: v}))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent><SelectItem value="Actif">Actif</SelectItem><SelectItem value="En attente">En attente</SelectItem><SelectItem value="Suspendu">Suspendu</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </CardContent></Card>
                    </TabsContent>
                    <TabsContent value="users" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestion des utilisateurs</CardTitle>
                                <CardDescription>Ajoutez, modifiez ou supprimez les utilisateurs pour {company.name}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Utilisateur</TableHead><TableHead>Rôle</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {company.users.map(user => (
                                            <TableRow key={user.id} className="odd:bg-muted/50">
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.role}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4"/></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {company.users.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">Aucun utilisateur.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="ml-auto">Ajouter un utilisateur</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
                <DialogFooter><Button variant="outline" onClick={onClose}>Annuler</Button><Button onClick={handleSave}>Enregistrer</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PlatformAdminPageContent() {
    const searchParams = useSearchParams();
    const [activeView, setActiveView] = useState(searchParams.get('tab') || 'dashboard');
    
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'companies': return <CompaniesView />;
            case 'contracts': return <ContractsView />;
            case 'demos': return <DemosView />;
            case 'requests': return <PlaceholderPage title="Requêtes" description="Consultation des demandes de contact et démo." />;
            default: return <PlaceholderPage title={activeView} description={`Contenu pour "${activeView}" à venir.`} />;
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
