

'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from "react";
import { useAtom } from 'jotai';

import { userRoleAtom, type UserRole, companyLogoAtom } from '@/lib/store';
import { cn } from '@/lib/utils';
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, ShieldCheck, Download, Users, Briefcase, Settings, PlayCircle, StopCircle, UserPlus, Link2, Copy, Eye, Pencil, Trash2, Info, BarChart2, FileText, TrendingUp, LayoutDashboard, Bot, Loader2, DollarSign, Target, UserCheck, UserRound, Ship, TrendingDown, Image as ImageIcon, FileUp, LineChart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Legend, PieChart as RechartsPieChart, Pie, ResponsiveContainer, BarChart } from 'recharts';
import { type ChartConfig } from "@/components/ui/chart";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Image from 'next/image';

// --- DATA ---
type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
    status: 'Actif' | 'Inactif';
    lastLogin: string;
}

const initialUsers: User[] = [
    { id: '1', name: 'Jean Dupont', email: 'jean.dupont@unikorp.com', role: 'Gestionnaire SKOMPTAB', avatarUrl: 'https://placehold.co/100x100.png', status: 'Actif', lastLogin: '2024-07-26T14:30:00Z' },
    { id: '2', name: 'Sophie Martin', email: 'sophie.martin@unikorp.com', role: 'Gestionnaire MARKOS', avatarUrl: 'https://placehold.co/100x100.png', status: 'Actif', lastLogin: '2024-07-26T11:15:00Z' },
    { id: '3', name: 'Admin', email: 'admin@unikorp.com', role: 'Admin-Gestionnaire', avatarUrl: 'https://placehold.co/100x100.png', status: 'Actif', lastLogin: '2024-07-26T14:00:00Z' },
    { id: '4', name: 'David Garcia', email: 'david.garcia@unikorp.com', role: 'Stagiaire SKOMPTAB', avatarUrl: 'https://placehold.co/100x100.png', status: 'Actif', lastLogin: '2024-07-25T09:02:00Z' },
    { id: '5', name: 'Léa Moreau', email: 'lea.moreau@unikorp.com', role: 'Employé', avatarUrl: 'https://placehold.co/100x100.png', status: 'Inactif', lastLogin: '2024-07-24T18:30:00Z' },
];

const navItems = [
    { href: '/super-admin?tab=dashboard', label: 'Tableau de bord', value: 'dashboard' },
    { href: '/super-admin?tab=users', label: 'Utilisateurs', value: 'users' },
    { href: '/super-admin?tab=actions', label: 'Actions', value: 'actions' },
    { href: '/super-admin?tab=settings', label: 'Configuration', value: 'settings' },
    { href: '/super-admin?tab=reports', label: 'États & Rapports', value: 'reports' },
    { href: '/dashboard', label: 'Accès ERP', value: 'erp' },
];

// --- COMPONENTS ---

// --- Dashboard Data & Configs ---
// SKOMPTAB
const skomptabKpis = [
  { title: "Chiffre d'Affaires", value: "128,5M FCFA", change: "+12.8% vs Q3" },
  { title: "Résultat Net", value: "43,2M FCFA", change: "+8.5% vs Q3" },
  { title: "Marge Brute", value: "45.2%", change: "+1.2% vs Q3" },
  { title: "Trésorerie Nette", value: "76,8M FCFA", change: "+3.2% vs Q3" },
  { title: "Factures en retard", value: "8,5M FCFA", change: "+5% vs M-1" },
];
const skomptabChart1Data = [ { month: "Jan", revenus: 40, depenses: 24 }, { month: "Fev", revenus: 30, depenses: 14 }, { month: "Mar", revenus: 50, depenses: 32 }, { month: "Avr", revenus: 28, depenses: 39 }, { month: "Mai", revenus: 69, depenses: 48 }, { month: "Juin", revenus: 74, depenses: 38 }, ];
const skomptabChart2Data = [ { name: 'Achats', value: 400 }, { name: 'Salaires', value: 300 }, { name: 'Services Ext.', value: 200 }, { name: 'Impôts', value: 278 }, { name: 'Autres', value: 189 }, ];
const skomptabChart3Data = [ { month: 'Jan', net: 16 }, { month: 'Fev', net: 16 }, { month: 'Mar', net: 18 }, { month: 'Avr', net: -11 }, { month: 'Mai', net: 21 }, { month: 'Juin', net: 36 }, ];
const skomptabChart4Data = [ { month: 'Jan', bfr: 12 }, { month: 'Fev', bfr: 15 }, { month: 'Mar', bfr: 14 }, { month: 'Avr', bfr: 18 }, { month: 'Mai', bfr: 16 }, { month: 'Juin', bfr: 20 }, ];
const skomptabChartConfig = {
  revenus: { label: "Revenus", color: "hsl(var(--chart-2))" },
  depenses: { label: "Dépenses", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

// SOCIX
const socixKpis = [
  { title: "Effectif Total", value: "112", change: "+2 vs M-1" },
  { title: "Masse Salariale", value: "89M FCFA", change: "+1.5% vs M-1" },
  { title: "Turnover (Annuel)", value: "5.8%", change: "+1.2% vs N-1" },
  { title: "Taux d'Absentéisme", value: "3.1%", change: "-0.5% vs M-1" },
  { title: "Recrutements (Mois)", value: "4", change: "+1 vs M-1" },
];
const socixChart1Data = [ { age: '20-30', count: 45 }, { age: '31-40', count: 38 }, { age: '41-50', count: 22 }, { age: '51+', count: 7 }, ];
const socixChart2Data = [ { name: 'Hommes', value: 58 }, { name: 'Femmes', value: 54 } ];
const socixChart3Data = [ { month: 'Jan', recrutements: 5, departs: 2 }, { month: 'Fev', recrutements: 3, departs: 3 }, { month: 'Mar', recrutements: 6, departs: 1 }, { month: 'Avr', recrutements: 4, departs: 2 }, { month: 'Mai', recrutements: 2, departs: 2 }, { month: 'Juin', recrutements: 4, departs: 2 }, ];
const socixChart4Data = [ { departement: 'IT', count: 35 }, { departement: 'MARKOS', count: 25 }, { departement: 'SKOMPTAB', count: 20 }, { departement: 'SOCIX', count: 15 }, { departement: 'LOGSON', count: 17 } ];

// MARKOS
const markosKpis = [
  { title: "Nouveaux Leads", value: "316", change: "+20.1% vs M-1" },
  { title: "Coût par Lead", value: "1 850 FCFA", change: "-5% vs M-1" },
  { title: "Taux de Conversion Global", value: "4.2%", change: "+0.8% vs M-1" },
  { title: "ROI Marketing", value: "450%", change: "+15% vs Q2" },
  { title: "Clients Acquis", value: "52", change: "+12 vs M-1" },
];
const markosChart1Data = [ { name: 'Organique', value: 400 }, { name: 'Payant', value: 300 }, { name: 'Réseaux Sociaux', value: 200 }, { name: 'Emailing', value: 278 }, ];
const markosChart2Data = [ { name: 'Leads', value: 316 }, { name: 'MQLs', value: 120 }, { name: 'SQLs', value: 89 }, { name: 'Clients', value: 52 }, ];
const markosChart3Data = [ { mois: 'Jan', produitA: 25.5, produitB: 35.2 }, { mois: 'Fév', produitA: 26.1, produitB: 34.8 }, { mois: 'Mar', produitA: 27.3, produitB: 36.1 }, { mois: 'Avr', produitA: 26.8, produitB: 37.5 }, { mois: 'Mai', produitA: 28.2, produitB: 38.0 }, { mois: 'Juin', produitA: 29.0, produitB: 37.2 }, ];
const markosChart4Data = [ { channel: "Organique", leads: 450, conversionRate: 26.7 }, { channel: "Payant", leads: 380, conversionRate: 25.0 }, { channel: "Sociaux", leads: 250, conversionRate: 24.0 }, { channel: "Emailing", leads: 174, conversionRate: 23.6 }, ];

// LOGSON
const logsonKpis = [
    { title: "Commandes Expédiées", value: "1,480", change: "-3.5% vs M-1" },
    { title: "Livraisons à Temps (OTD)", value: "97.8%", change: "+1.2% vs M-1" },
    { title: "Taux de Rotation des Stocks", value: "6.2", change: "+0.5 vs M-1" },
    { title: "Coût par Commande", value: "9 940 FCFA", change: "-2% vs M-1" },
    { title: "Précision de l'Inventaire", value: "99.5%", change: "+0.1% vs M-1" },
];
const logsonChart1Data = [ { month: "Jan", valeur: 1250 }, { month: "Fev", valeur: 1380 }, { month: "Mar", valeur: 1320 }, { month: "Avr", valeur: 1450 }, { month: "Mai", valeur: 1400 }, { month: "Juin", valeur: 1510 }, ];
const logsonChart2Data = [ { name: "Chronopost", deliv_rate: 98.5 }, { name: "Colissimo", deliv_rate: 97.2 }, { name: "DHL", deliv_rate: 99.1 }, { name: "FedEx", deliv_rate: 98.8 }, ];
const logsonChart3Data = [ { month: "Jan", entrees: 500, sorties: 450 }, { month: "Fev", entrees: 620, sorties: 580 }, { month: "Mar", entrees: 480, sorties: 510 }, { month: "Avr", entrees: 700, sorties: 650 }, { month: "Mai", entrees: 550, sorties: 600 }, { month: "Juin", entrees: 680, sorties: 640 }, ];
const logsonChart4Data = [ { depot: 'Abidjan', valeur: 75000000 }, { depot: 'Bouaké', valeur: 42000000 }, { depot: 'San Pédro', valeur: 18000000 } ];

const MiniChart = ({ data, dataKey, color }: { data: any[], dataKey: string, color: string }) => (
    <div className="h-10 w-24">
        <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

function AdminDashboard() {
    const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportContent, setReportContent] = useState("");

    const handleGenerateReport = () => {
        setIsGeneratingReport(true);
        setReportContent("");
        setTimeout(() => {
            const content = `
                Analyse Globale - ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric'})}

                Synthèse:
                L'entreprise affiche une performance solide ce mois-ci, portée par une forte croissance du chiffre d'affaires (+12.8% vs Q3) et un résultat net positif de 43.2M FCFA.
                
                Finance (SKOMPTAB):
                - Le CA est en hausse, mais les dépenses ont également augmenté, ce qui nécessite une surveillance.
                - La trésorerie reste stable mais en dessous de l'objectif.
                
                Marketing (MARKOS):
                - L'entonnoir de conversion montre une bonne qualification des leads (MQLs) mais une chute lors du passage en SQLs.
                - Recommandation: Revoir les critères de qualification des SQLs ou renforcer le suivi commercial.

                Logistique (LOGSON):
                - Le nombre d'expéditions est stable. Le taux de retours est faible, ce qui est un excellent indicateur de qualité.

                Ressources Humaines (SOCIX):
                - Le solde des recrutements est positif (+2), indiquant une croissance maîtrisée de l'effectif.
            `;
            setReportContent(content.replace(/^\s+/gm, ''));
            setIsGeneratingReport(false);
        }, 2000);
    };

    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Tableau de Bord de Supervision</h2>
                    <p className="text-muted-foreground">Vue globale de l'activité de l'entreprise pour le mois en cours.</p>
                </div>
                <div className="flex gap-2">
                     <Button onClick={() => {setIsReportModalOpen(true); handleGenerateReport();}}><Bot className="mr-2 h-4 w-4"/>Générer une analyse IA</Button>
                    <Button variant="outline" onClick={() => setIsOpeningModalOpen(true)}><PlayCircle className="mr-2 h-4 w-4"/>Ouverture d'exercice</Button>
                    <Button variant="destructive" onClick={() => setIsClosingModalOpen(true)}><StopCircle className="mr-2 h-4 w-4"/>Clôture d'exercice</Button>
                </div>
            </div>
            
            {/* SKOMPTAB Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">SKOMPTAB - Finance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {skomptabKpis.map(kpi => <Card key={kpi.title}><CardHeader className="pb-2"><CardDescription>{kpi.title}</CardDescription><CardTitle className="text-2xl">{kpi.value}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{kpi.change}</p></CardContent></Card>)}
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <Card><CardHeader><CardTitle className="text-base">Revenus vs Dépenses</CardTitle></CardHeader><CardContent><ChartContainer config={skomptabChartConfig} className="h-48 w-full"><BarChart data={skomptabChart1Data}><XAxis dataKey="month" fontSize={10} /><YAxis tickFormatter={(val) => `${val}M`} fontSize={10}/><Bar dataKey="revenus" fill="var(--color-revenus)" radius={2} /><Bar dataKey="depenses" fill="var(--color-depenses)" radius={2} /></BarChart></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Répartition des charges</CardTitle></CardHeader><CardContent className="flex justify-center"><ChartContainer config={{}} className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><RechartsPieChart><Pie data={skomptabChart2Data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} /></RechartsPieChart></ResponsiveContainer></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Évolution du Résultat Net</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><LineChart data={skomptabChart3Data}><XAxis dataKey="month" fontSize={10} /><YAxis fontSize={10} tickFormatter={(val) => `${val}M`} /><Line type="monotone" dataKey="net" stroke="#8884d8" /></LineChart></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Évolution du BFR</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><BarChart data={skomptabChart4Data}><XAxis dataKey="month" fontSize={10} /><YAxis fontSize={10} /><Bar dataKey="bfr" fill="#82ca9d" radius={2} /></BarChart></ChartContainer></CardContent></Card>
                    </div>
                </CardContent>
            </Card>

            {/* SOCIX Section */}
            <Card>
                 <CardHeader><CardTitle className="text-xl">SOCIX - Ressources Humaines</CardTitle></CardHeader>
                 <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {socixKpis.map(kpi => <Card key={kpi.title}><CardHeader className="pb-2"><CardDescription>{kpi.title}</CardDescription><CardTitle className="text-2xl">{kpi.value}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{kpi.change}</p></CardContent></Card>)}
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <Card><CardHeader><CardTitle className="text-base">Pyramide des âges</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><BarChart data={socixChart1Data} layout="vertical"><YAxis type="category" dataKey="age" fontSize={10} width={60} /><XAxis type="number" hide /><Bar dataKey="count" fill="var(--color-primary)" radius={2}/></BarChart></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Répartition Hommes/Femmes</CardTitle></CardHeader><CardContent className="flex justify-center"><ChartContainer config={{}} className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><RechartsPieChart><Pie data={socixChart2Data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} /></RechartsPieChart></ResponsiveContainer></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Recrutements vs Départs</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><BarChart data={socixChart3Data}><XAxis dataKey="month" fontSize={10}/><YAxis fontSize={10}/><Bar dataKey="recrutements" fill="#82ca9d" stackId="a" radius={2}/><Bar dataKey="departs" fill="#ff7300" stackId="a" radius={2}/></BarChart></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Effectif par département</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><BarChart data={socixChart4Data}><XAxis dataKey="departement" fontSize={10} /><YAxis fontSize={10} /><Bar dataKey="count" fill="#8884d8" radius={2}/></BarChart></ChartContainer></CardContent></Card>
                    </div>
                </CardContent>
            </Card>

             {/* MARKOS Section */}
            <Card>
                <CardHeader><CardTitle className="text-xl">MARKOS - Marketing & Ventes</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {markosKpis.map(kpi => <Card key={kpi.title}><CardHeader className="pb-2"><CardDescription>{kpi.title}</CardDescription><CardTitle className="text-2xl">{kpi.value}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{kpi.change}</p></CardContent></Card>)}
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <Card><CardHeader><CardTitle className="text-base">Source des Leads</CardTitle></CardHeader><CardContent className="flex justify-center"><ChartContainer config={{}} className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><RechartsPieChart><Pie data={markosChart1Data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} /></RechartsPieChart></ResponsiveContainer></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Entonnoir de Vente</CardTitle></CardHeader><CardContent className="flex justify-center"><ChartContainer config={{}} className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><RechartsPieChart><Pie data={markosChart2Data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} /></RechartsPieChart></ResponsiveContainer></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Marge par Produit</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><LineChart data={markosChart3Data}><XAxis dataKey="mois" fontSize={10} /><YAxis fontSize={10} unit="%"/>
<Line type="monotone" dataKey="produitA" stroke="#8884d8" /><Line type="monotone" dataKey="produitB" stroke="#82ca9d" /></LineChart></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Conv. par Canal</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><BarChart data={markosChart4Data} layout="vertical"><YAxis type="category" dataKey="channel" fontSize={10} width={60} /><XAxis type="number" hide /><Bar dataKey="conversionRate" fill="#ffc658" radius={2}/></BarChart></ChartContainer></CardContent></Card>
                    </div>
                </CardContent>
            </Card>

            {/* LOGSON Section */}
            <Card>
                <CardHeader><CardTitle className="text-xl">LOGSON - Logistique & Stocks</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {logsonKpis.map(kpi => <Card key={kpi.title}><CardHeader className="pb-2"><CardDescription>{kpi.title}</CardDescription><CardTitle className="text-2xl">{kpi.value}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{kpi.change}</p></CardContent></Card>)}
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <Card><CardHeader><CardTitle className="text-base">Niveau des stocks (Unités)</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><LineChart data={logsonChart1Data}><XAxis dataKey="month" fontSize={10} /><YAxis fontSize={10}/><Line type="monotone" dataKey="valeur" stroke="#8884d8" /></LineChart></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Performance Transporteurs</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><BarChart data={logsonChart2Data}><XAxis dataKey="name" fontSize={10} /><YAxis domain={[95, 100]} fontSize={10} unit="%"/><Bar dataKey="deliv_rate" fill="#82ca9d" radius={2} /></BarChart></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Flux de Stock (Entrée/Sortie)</CardTitle></CardHeader><CardContent><ChartContainer config={{}} className="h-48 w-full"><BarChart data={logsonChart3Data}><XAxis dataKey="month" fontSize={10} /><YAxis fontSize={10} /><Bar dataKey="entrees" fill="#8884d8" radius={2}/><Bar dataKey="sorties" fill="#ff7300" radius={2}/></BarChart></ChartContainer></CardContent></Card>
                        <Card><CardHeader><CardTitle className="text-base">Valeur stock par dépôt</CardTitle></CardHeader><CardContent className="flex justify-center"><ChartContainer config={{}} className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><RechartsPieChart><Pie data={logsonChart4Data} dataKey="valeur" nameKey="depot" cx="50%" cy="50%" outerRadius={60}/></RechartsPieChart></ResponsiveContainer></ChartContainer></CardContent></Card>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isOpeningModalOpen} onOpenChange={setIsOpeningModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ouverture d'un Nouvel Exercice Comptable</DialogTitle>
                        <DialogDescription>Configurez les dates pour le nouvel exercice. Cette action générera les écritures de report à nouveau.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label htmlFor="startDate">Date de début</Label><Input id="startDate" type="date" /></div>
                        <div className="space-y-2"><Label htmlFor="endDate">Date de fin</Label><Input id="endDate" type="date" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpeningModalOpen(false)}>Annuler</Button>
                        <Button>Confirmer et ouvrir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isClosingModalOpen} onOpenChange={setIsClosingModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clôturer l'exercice en cours ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. Une fois clôturé, aucune modification ne sera possible sur l'exercice 2024. Les résultats seront reportés.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Confirmer la clôture</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Bot /> Analyse du Tableau de Bord</DialogTitle>
                        <DialogDescription>
                            Voici une synthèse générée par l'IA basée sur les données actuelles du tableau de bord.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                        {isGeneratingReport ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">L'IA analyse les données...</p>
                            </div>
                        ) : (
                             <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/50 p-4 rounded-md">
                                {reportContent}
                             </pre>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Fermer</Button>
                        <Button disabled={isGeneratingReport || !reportContent}><Download className="mr-2 h-4 w-4"/> Télécharger en PDF</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function UserManagement() {
    const { toast } = useToast();
    const [users, setUsers] = useState(initialUsers);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    
    const inviteLink = "https://unikorp.com/invite/a1b2c3d4e5f6";
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        toast({ title: "Lien copié !", description: "Le lien d'invitation a été copié dans le presse-papiers." });
    };

    const handleSaveUser = (user: User) => {
        if (editingUser) {
            setUsers(users.map(u => u.id === user.id ? user : u));
            toast({ title: 'Utilisateur modifié', description: `Les informations de ${user.name} ont été mises à jour.` });
        } else {
            setUsers(prev => [user, ...prev]);
            toast({ title: 'Utilisateur ajouté', description: `${user.name} a été ajouté.` });
        }
        setEditingUser(null);
        setIsAddUserModalOpen(false);
    };

    const handleDeleteUser = () => {
        if (!userToDelete) return;
        setUsers(users.filter(u => u.id !== userToDelete.id));
        toast({ title: 'Utilisateur supprimé' });
        setUserToDelete(null);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Gestion des Utilisateurs</CardTitle>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setIsInviteUserModalOpen(true)}>
                                <Link2 className="mr-2 h-4 w-4"/>
                                Inviter un utilisateur
                            </Button>
                            <Button onClick={() => { setEditingUser(null); setIsAddUserModalOpen(true); }}>
                                <UserPlus className="mr-2 h-4 w-4"/>
                                Ajouter un utilisateur
                            </Button>
                        </div>
                    </div>
                    <CardDescription>Ajoutez, modifiez ou suspendez les accès des utilisateurs à l'ERP.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">#</TableHead>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead>Dernière connexion</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user, index) => (
                                <TableRow key={user.id} className="odd:bg-muted/50">
                                    <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9"><AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person face" /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                                            <div><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge variant={user.status === 'Actif' ? 'default' : 'destructive'} className={cn(user.status === 'Actif' && 'bg-green-100 text-green-800')}>{user.status}</Badge></TableCell>
                                    <TableCell>{format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm', {locale: fr})}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Aperçu non disponible' })}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setIsAddUserModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setUserToDelete(user)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} onSave={handleSaveUser} userToEdit={editingUser} />

            <Dialog open={isInviteUserModalOpen} onOpenChange={setIsInviteUserModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Inviter un utilisateur</DialogTitle>
                        <DialogDescription>Générez un lien d'invitation sécurisé à envoyer à un nouvel utilisateur. Il pourra compléter ses informations lui-même.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Label htmlFor="invite-link">Lien d'invitation unique</Label>
                        <div className="flex items-center gap-2">
                            <Input id="invite-link" value={inviteLink} readOnly />
                            <Button onClick={handleCopyLink} size="icon" variant="outline"><Copy className="h-4 w-4" /></Button>
                        </div>
                         <p className="text-xs text-muted-foreground">Ce lien est valide pour 7 jours.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteUserModalOpen(false)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Pour désactiver temporairement un compte, modifiez son statut.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function AddUserModal({ isOpen, onClose, onSave, userToEdit }: { isOpen: boolean, onClose: () => void, onSave: (data: User) => void, userToEdit: User | null }) {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [generatedPassword, setGeneratedPassword] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setFormData(userToEdit || { status: 'Actif' });
            setGeneratedPassword('');
        }
    }, [userToEdit, isOpen]);

    const generatePassword = () => {
        const pass = `pass${Math.random().toString(36).slice(-8)}`;
        setGeneratedPassword(pass);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copié !' });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            id: userToEdit?.id || `user-${Date.now()}`,
            name: formData.name || '',
            email: formData.email || '',
            role: formData.role || 'Employé',
            status: formData.status || 'Actif',
            lastLogin: userToEdit?.lastLogin || new Date().toISOString(),
            avatarUrl: userToEdit?.avatarUrl || 'https://placehold.co/100x100.png'
        };
        onSave(finalData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{userToEdit ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
                        <DialogDescription>Remplissez les informations pour {userToEdit ? 'modifier le' : 'créer un nouveau'} compte.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label htmlFor="name">Nom complet</Label><Input id="name" value={formData.name || ''} onChange={e => setFormData(f => ({...f, name: e.target.value}))} placeholder="Jean Dupont"/></div>
                        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={e => setFormData(f => ({...f, email: e.target.value}))} placeholder="jean.dupont@example.com"/></div>
                         <div className="space-y-2">
                            <Label htmlFor="role">Rôle</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData(f => ({...f, role: value}))}>
                                <SelectTrigger><SelectValue placeholder="Attribuer un rôle..."/></SelectTrigger><SelectContent>
                                    <SelectItem value="Admin-Gestionnaire">Admin-Gestionnaire</SelectItem>
                                    <SelectItem value="Gestionnaire SKOMPTAB">Gestionnaire SKOMPTAB</SelectItem>
                                    <SelectItem value="Stagiaire SKOMPTAB">Stagiaire SKOMPTAB</SelectItem>
                                    <SelectItem value="Employé">Employé</SelectItem>
                                </SelectContent></Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Statut</Label>
                            <Select value={formData.status} onValueChange={(value: 'Actif' | 'Inactif') => setFormData(f => ({...f, status: value}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                                    <SelectItem value="Actif">Actif</SelectItem>
                                    <SelectItem value="Inactif">Inactif</SelectItem>
                                </SelectContent></Select>
                        </div>
                         {!userToEdit && (
                            <>
                                <Separator />
                                <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold">Identifiants générés</h4>
                                         <Button type="button" variant="secondary" size="sm" onClick={generatePassword}>Générer le mot de passe</Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email / Nom d'utilisateur</Label>
                                        <Input readOnly value={formData.email || ''} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mot de passe temporaire</Label>
                                        <div className="flex items-center gap-2">
                                            <Input readOnly value={generatedPassword} placeholder="Cliquez pour générer" />
                                            <Button type="button" onClick={() => copyToClipboard(generatedPassword)} size="icon" variant="outline" disabled={!generatedPassword}><Copy className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">L'utilisateur sera invité à changer ce mot de passe à sa première connexion.</p>
                                </div>
                            </>
                         )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function CompanySettings() {
    const [logoUrl, setLogoUrl] = useAtom(companyLogoAtom);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informations sur l'entreprise</CardTitle>
                    <CardDescription>Gérez les informations légales et de contact de votre entreprise.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label htmlFor="companyName">Raison sociale</Label><Input id="companyName" defaultValue="UNIKORP S.A."/></div>
                    <div className="space-y-2"><Label htmlFor="companyNif">N° Compte Contribuable (NIF)</Label><Input id="companyNif" defaultValue="1234567-A"/></div>
                    <div className="space-y-2 col-span-full"><Label htmlFor="companyAddress">Adresse</Label><Input id="companyAddress" defaultValue="Cocody Angré, Abidjan, Côte d'Ivoire"/></div>
                    <div className="space-y-2"><Label htmlFor="companyPhone">Téléphone</Label><Input id="companyPhone" defaultValue="+225 01 02 03 04 05"/></div>
                    <div className="space-y-2"><Label htmlFor="companyEmail">Email</Label><Input id="companyEmail" defaultValue="contact@unikorp.com"/></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Image de marque et Logo</CardTitle>
                    <CardDescription>Personnalisez l'apparence de vos documents et de l'interface.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                     <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="logoUpload">Changer le logo</Label>
                        <Input id="logoUpload" type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                    <div className="flex justify-center items-center h-24 w-24 rounded-md border bg-muted">
                        {logoUrl ? (
                            <Image src={logoUrl} alt="Aperçu du logo" width={80} height={80} className="object-contain" data-ai-hint="company logo"/>
                        ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Paramètres Comptables et Fiscaux</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="accountingZone">Zone Comptable</Label>
                        <Select defaultValue="syscohada"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="syscohada">SYSCOHADA</SelectItem><SelectItem value="pcg-france">PCG (France)</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taxRegime">Régime d'imposition</Label>
                        <Select defaultValue="reel-normal"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="reel-normal">Réel Normal</SelectItem><SelectItem value="reel-simplifie">Réel Simplifié</SelectItem><SelectItem value="synthetique">Synthétique</SelectItem></SelectContent></Select>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Formats de Numérotation</CardTitle>
                    <CardDescription>Personnalisez les préfixes et formats pour vos documents.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="invoiceFormat">Format Factures de Vente</Label>
                        <Input id="invoiceFormat" defaultValue="FACT-{AAAA}-{MM}-{NNNN}"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="accountingFormat">Format Pièces Comptables</Label>
                        <Input id="accountingFormat" defaultValue="{JOURNAL}-{AAAA}{MM}-{NNNN}"/>
                    </div>
                     <div className="col-span-full text-xs text-muted-foreground flex items-center gap-2">
                        <Info className="h-4 w-4"/>
                        <span>Variables disponibles : &#123;AAAA&#125; (année), &#123;MM&#125; (mois), &#123;JOURNAL&#125; (code journal), &#123;NNNN&#125; (séquence).</span>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Exercices Comptables</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Année</TableHead><TableHead>Date Début</TableHead><TableHead>Date Fin</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell>2024</TableCell><TableCell>01/01/2024</TableCell><TableCell>31/12/2024</TableCell><TableCell><Badge>Ouvert</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm">Clôturer</Button></TableCell></TableRow>
                            <TableRow><TableCell>2023</TableCell><TableCell>01/01/2023</TableCell><TableCell>31/12/2023</TableCell><TableCell><Badge variant="secondary">Clôturé</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" disabled>Rouvrir</Button></TableCell></TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <Button className="ml-auto">Enregistrer les modifications</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

function Reports() {
     const [year, setYear] = useState('2024');
     const { toast } = useToast();

     const handleDownload = (reportName: string) => {
        toast({
            title: "Génération du rapport...",
            description: `Le rapport "${reportName}" pour ${year} est en cours de préparation.`
        })
     }
    
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>États & Rapports Financiers</CardTitle>
                    <div className="w-40">
                         <Select value={year} onValueChange={setYear}>
                            <SelectTrigger><SelectValue/></SelectTrigger><SelectContent>
                                <SelectItem value="2024">Exercice 2024</SelectItem>
                                <SelectItem value="2023">Exercice 2023</SelectItem>
                            </SelectContent></Select>
                    </div>
                </div>
                <CardDescription>Téléchargez les états comptables et financiers pour l'exercice sélectionné.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2" onClick={() => handleDownload('Bilan')}>
                        <FileText className="h-6 w-6"/>
                        <span className="font-semibold">Bilan</span>
                        <span className="text-xs text-muted-foreground text-left">Photographie du patrimoine de l'entreprise à la fin de l'exercice.</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2" onClick={() => handleDownload('Compte de Résultat')}>
                        <FileText className="h-6 w-6"/>
                        <span className="font-semibold">Compte de Résultat</span>
                        <span className="text-xs text-muted-foreground text-left">Synthèse des charges et des produits de l'exercice.</span>
                    </Button>
                     <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2" onClick={() => handleDownload('Tableau des SIG')}>
                        <FileText className="h-6 w-6"/>
                        <span className="font-semibold">Tableau des SIG</span>
                        <span className="text-xs text-muted-foreground text-left">Analyse de la formation du résultat de l'entreprise.</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2" onClick={() => handleDownload('Flux de Trésorerie')}>
                        <FileText className="h-6 w-6"/>
                        <span className="font-semibold">Flux de Trésorerie</span>
                        <span className="text-xs text-muted-foreground text-left">Tableau des encaissements et décaissements de l'exercice.</span>
                    </Button>
                     <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2" onClick={() => handleDownload('Balance Générale')}>
                        <FileText className="h-6 w-6"/>
                        <span className="font-semibold">Balance Générale</span>
                        <span className="text-xs text-muted-foreground text-left">Liste de tous les comptes avec leurs soldes débiteurs et créditeurs.</span>
                    </Button>
                     <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2" onClick={() => handleDownload('Grand Livre')}>
                        <FileText className="h-6 w-6"/>
                        <span className="font-semibold">Grand Livre</span>
                        <span className="text-xs text-muted-foreground text-left">Détail de toutes les écritures passées sur chaque compte.</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function SuperAdminPageNav() {
    const [role] = useAtom(userRoleAtom);
    const hasActionLogAccess = role === 'Compte Entreprise';
    const searchParams = useSearchParams();
    const activeTab = searchParams ? searchParams.get('tab') || 'dashboard' : 'dashboard';

    const isActive = (tabValue: string) => activeTab === tabValue;

    return (
        <nav className="bg-[#8A2BE2]">
            <div className="flex items-center gap-x-1 max-w-[1600px] mx-auto px-4 sm:px-6">
                {navItems.map((link) => {
                    if (link.value === 'actions' && !hasActionLogAccess) return null;
                    return (
                        <Link href={link.href} key={link.href} className={cn(
                            'flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:text-white relative',
                             isActive(link.value) ? 'text-white' : ''
                        )}>
                            {link.value === 'dashboard' ? <LayoutDashboard className="h-4 w-4" /> :
                             link.value === 'users' ? <Users className="h-4 w-4" /> :
                             link.value === 'actions' ? <BarChart2 className="h-4 w-4" /> :
                             link.value === 'settings' ? <Settings className="h-4 w-4" /> :
                             link.value === 'reports' ? <FileText className="h-4 w-4" /> :
                             link.value === 'erp' ? <TrendingUp className="h-4 w-4" /> : null
                            }
                            {link.label}
                            {isActive(link.value) && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-t-full" />}
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}

function SuperAdminPageContent() {
    const searchParams = useSearchParams();
    const [role] = useAtom(userRoleAtom);
    const hasActionLogAccess = role === 'Compte Entreprise';

    const activeTab = searchParams ? searchParams.get('tab') || 'dashboard' : 'dashboard';

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <AdminDashboard />;
            case 'users': return <UserManagement />;
            case 'actions': return hasActionLogAccess ? <ActionsPage /> : null;
            case 'settings': return <CompanySettings />;
            case 'reports': return <Reports />;
            default: return <AdminDashboard />;
        }
    };
    return <div className="pt-2">{renderContent()}</div>
}


export default function SuperAdminPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <div className="space-y-6">
                <SuperAdminPageNav />
                <SuperAdminPageContent />
            </div>
        </Suspense>
    );
}
