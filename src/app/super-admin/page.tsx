
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Building, Users, Briefcase, CalendarCheck, CalendarX, LogIn, BarChart, Pencil, Trash2, DollarSign, ShoppingCart, TrendingUp, TrendingDown, Target, UserCheck, Ship, BarChart2, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, Line, ComposedChart, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

// Mock Data
const users = [
    { id: 1, name: 'Admin Gestionnaire', email: 'admin@unikorp.com', role: 'Admin-Gestionnaire', avatar: 'https://placehold.co/100x100.png' },
    { id: 2, name: 'Jean Dupont', email: 'jean.dupont@unikorp.com', role: 'Employé', avatar: 'https://placehold.co/100x100.png' },
    { id: 3, name: 'Marie Comptable', email: 'marie.compta@unikorp.com', role: 'Gestionnaire', avatar: 'https://placehold.co/100x100.png' },
];

// Data from main dashboard
const mainKpis = [
  { title: "Revenus (T3)", value: `${(1200000).toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA`, change: "+15.2%", icon: DollarSign, changeType: "up" },
  { title: "Nouveaux Clients", value: "89", change: "+20.1%", icon: Users, changeType: "up" },
  { title: "Commandes en cours", value: "245", change: "-3.5%", icon: ShoppingCart, changeType: "down" },
  { title: "Effectif Total", value: "112", breakdown: "60 H / 52 F", icon: UserCheck },
];
const skomptabKpis = [
    { title: "Marge Nette", value: "28.4%", icon: Target },
    { title: "Factures en attente", value: `${(12450).toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA`, icon: FileText }
];
const markosKpis = [
    { title: "Nouveaux Leads (Mois)", value: "316", icon: Users },
    { title: "Coût par Lead", value: `${(1850).toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA`, icon: DollarSign }
];
const logsonKpis = [
    { title: "Expéditions (Mois)", value: "1 480", icon: Ship },
    { title: "Taux de retours", value: "1.1%", icon: TrendingDown }
];
const socixKpis = [
    { title: "Masse Salariale", value: `${(89000).toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA`, icon: DollarSign },
    { title: "Turnover", value: "2.1%", icon: TrendingDown }
];
const skomptabChartData = [
  { month: "Jan", revenus: 4000, depenses: 2400, resultat: 1600 }, { month: "Fev", revenus: 3000, depenses: 1398, resultat: 1602 },
  { month: "Mar", revenus: 5000, depenses: 3200, resultat: 1800 }, { month: "Avr", revenus: 2780, depenses: 3908, resultat: -1128 },
  { month: "Mai", revenus: 6890, depenses: 4800, resultat: 2090 }, { month: "Juin", revenus: 7390, depenses: 3800, resultat: 3590 },
];
const skomptabChartConfig = {
  revenus: { label: "Revenus", color: "hsl(var(--chart-2))" },
  depenses: { label: "Dépenses", color: "hsl(var(--chart-1))" },
  resultat: { label: "Résultat Net", color: "hsl(var(--primary))" },
} satisfies ChartConfig;
const markosChartData = [
  { month: "Jan", leads: 22, conversion: 2.5 }, { month: "Fev", leads: 45, conversion: 3.1 },
  { month: "Mar", leads: 52, conversion: 3.5 }, { month: "Avr", leads: 78, conversion: 4.2 },
  { month: "Mai", leads: 92, conversion: 4.8 }, { month: "Juin", leads: 120, conversion: 5.1 },
];
const markosChartConfig = {
  leads: { label: "Leads", color: "hsl(var(--primary))" },
  conversion: { label: "Taux de Conv. (%)", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;
const logsonChartData = [
  { month: "Jan", expeditions: 1204, retours: 18 }, { month: "Fev", expeditions: 1350, retours: 22 },
  { month: "Mar", expeditions: 1100, retours: 15 }, { month: "Avr", expeditions: 1420, retours: 25 },
  { month: "Mai", expeditions: 1550, retours: 20 }, { month: "Juin", expeditions: 1480, retours: 16 },
];
const logsonChartConfig = {
  expeditions: { label: "Expéditions", color: "hsl(var(--chart-3))" },
  retours: { label: "Retours", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;
const socixChartData = [
  { month: "Jan", recrutements: 5, departs: 2, effectif: 103 }, { month: "Fev", recrutements: 3, departs: 3, effectif: 103 },
  { month: "Mar", recrutements: 6, departs: 1, effectif: 108 }, { month: "Avr", recrutements: 4, departs: 2, effectif: 110 },
  { month: "Mai", recrutements: 2, departs: 2, effectif: 110 }, { month: "Juin", recrutements: 4, departs: 2, effectif: 112 },
];
const socixChartConfig = {
  recrutements: { label: "Recrutements", color: "hsl(var(--chart-2))" },
  departs: { label: "Départs", color: "hsl(var(--chart-1))" },
  effectif: { label: "Effectif Total", color: "hsl(var(--primary))" },
} satisfies ChartConfig;
const fiscalDeadlines = [
    { date: "15/07/2024", label: "Déclaration de TVA (Juin)" },
    { date: "31/07/2024", label: "Paiement de l'acompte IS" },
    { date: "05/08/2024", label: "Déclaration Sociale Nominative (DSN)" },
];


function DashboardTab() {
    const [isExerciceModalOpen, setIsExerciceModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', description: '', action: '' });

    const openExerciceModal = (type: 'open' | 'close') => {
        if (type === 'open') {
            setModalContent({
                title: "Ouvrir un nouvel exercice",
                description: "Êtes-vous sûr de vouloir ouvrir un nouvel exercice comptable ? Cette action initialisera les soldes à nouveau.",
                action: "Ouvrir l'exercice"
            });
        } else {
            setModalContent({
                title: "Clôturer l'exercice en cours",
                description: "Cette action est irréversible. Elle figera les écritures de l'exercice actuel. Êtes-vous sûr de vouloir continuer ?",
                action: "Clôturer l'exercice"
            });
        }
        setIsExerciceModalOpen(true);
    };

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Gestion des Exercices Comptables</CardTitle>
                    <CardDescription>Actions critiques pour la gestion des périodes comptables de l'entreprise.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-semibold">Ouvrir un nouvel exercice</h4>
                            <p className="text-sm text-muted-foreground">Initialise une nouvelle année comptable et fiscale.</p>
                        </div>
                        <Button variant="outline" onClick={() => openExerciceModal('open')}>
                            <CalendarCheck className="mr-2 h-4 w-4" /> Ouvrir
                        </Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-destructive">Clôturer l'exercice en cours</h4>
                            <p className="text-sm text-destructive/80">Figera définitivement les écritures de l'exercice actuel.</p>
                        </div>
                        <Button variant="destructive" onClick={() => openExerciceModal('close')}>
                            <CalendarX className="mr-2 h-4 w-4" /> Clôturer
                        </Button>
                    </div>
                </CardContent>
             </Card>

             <Dialog open={isExerciceModalOpen} onOpenChange={setIsExerciceModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalContent.title}</DialogTitle>
                        <DialogDescription>{modalContent.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExerciceModalOpen(false)}>Annuler</Button>
                        <Button onClick={() => setIsExerciceModalOpen(false)}>{modalContent.action}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main Dashboard Content */}
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {mainKpis.map((kpi) => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="text-sm font-medium tracking-tight">{kpi.title}</div>
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    {kpi.breakdown ? (
                        <p className="text-xs text-muted-foreground">
                        {kpi.breakdown}
                        </p>
                    ) : (
                        <p className={`text-xs ${kpi.changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {kpi.change}
                        </p>
                    )}
                    </CardContent>
                </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SKOMPTAB Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-primary"/>SKOMPTAB - Finance</CardTitle>
                    <CardDescription>Analyse des revenus, dépenses et rentabilité.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            {skomptabKpis.map(kpi => (
                                <div key={kpi.title} className="p-2 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                                    <p className="text-lg font-bold">{kpi.value}</p>
                                </div>
                            ))}
                        </div>
                        <ChartContainer config={skomptabChartConfig} className="h-[200px] w-full flex-1">
                            <ComposedChart data={skomptabChartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => (value as number).toLocaleString('fr-FR')} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${(value as number).toLocaleString('fr-FR')} FCFA`} />} />
                                <Legend />
                                <Bar dataKey="revenus" fill="var(--color-revenus)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="depenses" fill="var(--color-depenses)" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="resultat" stroke="var(--color-resultat)" strokeWidth={2} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* MARKOS Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500"/>MARKOS - Marketing</CardTitle>
                    <CardDescription>Performance des leads et taux de conversion.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            {markosKpis.map(kpi => (
                                <div key={kpi.title} className="p-2 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                                    <p className="text-lg font-bold">{kpi.value}</p>
                                </div>
                            ))}
                        </div>
                        <ChartContainer config={markosChartConfig} className="h-[200px] w-full flex-1">
                            <ComposedChart data={markosChartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                                <YAxis yAxisId="left" orientation="left" stroke="var(--color-leads)" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => (value as number).toLocaleString('fr-FR')}/>
                                <YAxis yAxisId="right" orientation="right" stroke="var(--color-conversion)" tickLine={false} axisLine={false} fontSize={12} unit="%" />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => name === 'conversion' ? `${value}%` : `${(value as number).toLocaleString('fr-FR')} FCFA`} />} />
                                <Legend />
                                <Bar dataKey="leads" yAxisId="left" fill="var(--color-leads)" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="conversion" yAxisId="right" stroke="var(--color-conversion)" strokeWidth={2} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* LOGSON Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5 text-orange-500"/>LOGSON - Logistique</CardTitle>
                    <CardDescription>Expéditions et retours sur le dernier semestre.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            {logsonKpis.map(kpi => (
                                <div key={kpi.title} className="p-2 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                                    <p className="text-lg font-bold">{kpi.value}</p>
                                </div>
                            ))}
                        </div>
                        <ChartContainer config={logsonChartConfig} className="h-[200px] w-full flex-1">
                            <ComposedChart data={logsonChartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                                <YAxis yAxisId="left" orientation="left" stroke="var(--color-expeditions)" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => (value as number).toLocaleString('fr-FR')}/>
                                <YAxis yAxisId="right" orientation="right" stroke="var(--color-retours)" tickLine={false} axisLine={false} fontSize={12} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => (value as number).toLocaleString('fr-FR')} />} />
                                <Legend />
                                <Bar dataKey="expeditions" yAxisId="left" fill="var(--color-expeditions)" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="retours" yAxisId="right" stroke="var(--color-retours)" strokeWidth={2} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* SOCIX Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-purple-500"/>SOCIX - RH</CardTitle>
                    <CardDescription>Flux des employés et effectif total.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            {socixKpis.map(kpi => (
                                <div key={kpi.title} className="p-2 rounded-lg bg-muted/50">
                                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                                    <p className="text-lg font-bold">{kpi.value}</p>
                                </div>
                            ))}
                        </div>
                        <ChartContainer config={socixChartConfig} className="h-[200px] w-full flex-1">
                            <ComposedChart data={socixChartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                                <YAxis yAxisId="left" orientation="left" stroke="var(--color-recrutements)" tickLine={false} axisLine={false} fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--color-effectif)" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => (value as number).toLocaleString('fr-FR')} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => (value as number).toLocaleString('fr-FR')} />} />
                                <Legend />
                                <Bar dataKey="recrutements" stackId="a" yAxisId="left" fill="var(--color-recrutements)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="departs" stackId="a" yAxisId="left" fill="var(--color-departs)" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="effectif" yAxisId="right" stroke="var(--color-effectif)" strokeWidth={2} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                </div>

                {/* Colonne Latérale */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Échéances Fiscales</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <Calendar
                        mode="single"
                        selected={new Date()}
                        className="rounded-md border p-0"
                    />
                    <div className="mt-4 space-y-2">
                        {fiscalDeadlines.map(deadline => (
                            <div key={deadline.label} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                                <p>{deadline.label}</p>
                                <Badge variant="outline">{deadline.date}</Badge>
                            </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>
                </div>
            </div>
        </div>
    );
}

function UsersTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>Créez, modifiez et gérez les accès des utilisateurs de la plateforme.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Utilisateur</TableHead><TableHead>Rôle</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9"><AvatarImage src={user.avatar} data-ai-hint="person face" /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" disabled><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" disabled><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function CompanyInfoTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Informations de l'Entreprise</CardTitle>
                <CardDescription>Modifiez les informations légales et les paramètres de votre entreprise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="companyName">Raison Sociale</Label><Input id="companyName" defaultValue="UNIKORP S.A." /></div>
                    <div className="space-y-1"><Label htmlFor="companyNcc">N° Compte Contribuable</Label><Input id="companyNcc" defaultValue="1234567 A" /></div>
                </div>
                <div className="space-y-1"><Label htmlFor="companyAddress">Adresse</Label><Textarea id="companyAddress" defaultValue="Cocody Angré, 7ème Tranche, Abidjan, Côte d'Ivoire" /></div>
            </CardContent>
             <CardFooter>
                <Button>Enregistrer les modifications</Button>
            </CardFooter>
        </Card>
    );
}

function ErpAccessTab() {
    const router = useRouter();
    return (
         <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase /> Accès à l'ERP</CardTitle>
                <CardDescription>Accédez à l'interface de gestion principale avec tous les modules.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="lg" className="w-full" onClick={() => router.push('/dashboard')}>
                    <LogIn className="mr-2 h-5 w-5" /> Accéder à UNIKORP
                </Button>
            </CardContent>
        </Card>
    );
}


export default function SuperAdminPage() {
    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Portail Super Administrateur</h1>
                <p className="text-muted-foreground">Gérez les paramètres globaux de votre instance UNIKORP.</p>
            </header>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="inline-flex h-auto rounded-none border-b-0 bg-[#5D5CDE] p-0">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=inactive]:text-white/80 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/10 rounded-t-md rounded-b-none px-4 py-2">
                        <BarChart className="mr-2 h-4 w-4" />Tableau de bord
                    </TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=inactive]:text-white/80 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/10 rounded-t-md rounded-b-none px-4 py-2">
                        <Users className="mr-2 h-4 w-4" />Utilisateurs
                    </TabsTrigger>
                    <TabsTrigger value="company" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=inactive]:text-white/80 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/10 rounded-t-md rounded-b-none px-4 py-2">
                        <Building className="mr-2 h-4 w-4" />Infos Entreprise
                    </TabsTrigger>
                    <TabsTrigger value="access" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=inactive]:text-white/80 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-white/10 rounded-t-md rounded-b-none px-4 py-2">
                        <LogIn className="mr-2 h-4 w-4" />Accès ERP
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="mt-4">
                    <DashboardTab />
                </TabsContent>
                <TabsContent value="users" className="mt-4">
                    <UsersTab />
                </TabsContent>
                <TabsContent value="company" className="mt-4">
                    <CompanyInfoTab />
                </TabsContent>
                <TabsContent value="access" className="mt-4">
                    <ErpAccessTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
