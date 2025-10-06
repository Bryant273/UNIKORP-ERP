
'use client';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { Bar, BarChart, LineChart, Line, PieChart as RechartsPieChart, Pie, ResponsiveContainer, FunnelChart, Funnel, XAxis, YAxis } from "recharts";
import { LayoutDashboard, TrendingUp, DollarSign, Target, UserCheck, Ship, TrendingDown } from "lucide-react";
import Link from "next/link";
import type { ChartConfig } from "@/components/ui/chart";

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

export default function SuperAdminInnovkorpPage() {
    return (
        <div className="space-y-8">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Tableau de Bord de Supervision INNOV'KORP</h2>
                    <p className="text-muted-foreground">Vue globale de l'activité de l'entreprise INNOV'KORP sur sa propre instance ERP.</p>
                </div>
                <Button size="lg" asChild>
                    <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-5 w-5"/>
                        Accéder à l'ERP de Gestion
                    </Link>
                </Button>
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
                        <Card><CardHeader><CardTitle className="text-base">Entonnoir de Vente</CardTitle></CardHeader><CardContent className="flex justify-center"><ChartContainer config={{}} className="h-48 w-full"><ResponsiveContainer><FunnelChart><Funnel dataKey="value" data={markosChart2Data} /></FunnelChart></ResponsiveContainer></ChartContainer></CardContent></Card>
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
        </div>
    )
}
