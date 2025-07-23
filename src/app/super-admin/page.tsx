
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Legend } from "recharts";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Building, KeyRound, Pencil, DollarSign, TrendingUp, Ship, UserCheck, BarChart2, TrendingDown, Package, PlusCircle, Trash2, Eye, Ban, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const skomptabKpis = [
    { title: "Marge Nette Globale", value: "28.4%", Icon: TrendingUp },
    { title: "Factures en attente", value: "12,45M FCFA", Icon: DollarSign },
    { title: "Délai Paiement Moyen", value: "42 jours", Icon: TrendingDown }
];
const skomptabChartData = [ { month: "Jan", revenus: 4000, depenses: 2400 }, { month: "Fev", revenus: 3000, depenses: 1398 }, { month: "Mar", revenus: 5000, depenses: 3200 }, { month: "Avr", revenus: 2780, depenses: 3908 }, { month: "Mai", revenus: 6890, depenses: 4800 }, { month: "Juin", revenus: 7390, depenses: 3800 }];
const skomptabChartConfig = { revenus: { label: "Revenus", color: "hsl(var(--chart-2))" }, depenses: { label: "Dépenses", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;

const socixKpis = [
    { title: "Effectif Total", value: "112", Icon: Users },
    { title: "Taux de Turnover", value: "5.8%", Icon: TrendingDown },
    { title: "Satisfaction Employés", value: "88%", Icon: UserCheck }
];
const socixChartData = [ { month: "Jan", recrutements: 5, departs: 2}, { month: "Fev", recrutements: 3, departs: 3}, { month: "Mar", recrutements: 6, departs: 1}, { month: "Avr", recrutements: 4, departs: 2}, { month: "Mai", recrutements: 2, departs: 2}, { month: "Juin", recrutements: 4, departs: 2}];
const socixChartConfig = { recrutements: { label: "Recrutements", color: "hsl(var(--chart-2))" }, departs: { label: "Départs", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;

const markosKpis = [
    { title: "Nouveaux Leads (Mois)", value: "316", Icon: UserCheck },
    { title: "Coût par Lead", value: "1 850 FCFA", Icon: DollarSign },
    { title: "ROI Marketing", value: "450%", Icon: TrendingUp }
];
const markosChartData = [ { month: "Jan", leads: 22 }, { month: "Fev", leads: 45 }, { month: "Mar", leads: 52 }, { month: "Avr", leads: 78 }, { month: "Mai", leads: 92 }, { month: "Juin", leads: 120 }];
const markosChartConfig = { leads: { label: "Leads", color: "hsl(var(--chart-3))" } } satisfies ChartConfig;

const logsonKpis = [
    { title: "Commandes Expédiées", value: "1,480", Icon: Ship },
    { title: "Taux de Retours", value: "1.1%", Icon: TrendingDown },
    { title: "Rotation des Stocks", value: "6.2", Icon: Package }
];
const logsonChartData = [ { month: "Jan", expeditions: 1204, retours: 18 }, { month: "Fev", expeditions: 1350, retours: 22 }, { month: "Mar", expeditions: 1100, retours: 15 }, { month: "Avr", expeditions: 1420, retours: 25 }, { month: "Mai", expeditions: 1550, retours: 20 }, { month: "Juin", expeditions: 1480, retours: 16 } ];
const logsonChartConfig = { expeditions: { label: "Expéditions", color: "hsl(var(--chart-4))" }, retours: { label: "Retours", color: "hsl(var(--chart-1))" } } satisfies ChartConfig;

// --- USER MANAGEMENT DATA ---
type UserRole = 'Admin-Gestionnaire' | 'Gestionnaire (SKOMPTAB)' | 'Stagiaire (SKOMPTAB)' | 'Employé';
type UserStatus = 'Actif' | 'Suspendu';
type User = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    modules: string[];
};

const initialUsers: User[] = [
    { id: 'usr-1', name: 'Jean Dupont', email: 'jean.dupont@unikorp.com', role: 'Admin-Gestionnaire', status: 'Actif', modules: ['SKOMPTAB', 'SOCIX', 'MARKOS', 'LOGSON'] },
    { id: 'usr-2', name: 'Sophie Martin', email: 'sophie.martin@unikorp.com', role: 'Gestionnaire (SKOMPTAB)', status: 'Actif', modules: ['SKOMPTAB'] },
    { id: 'usr-3', name: 'David Garcia', email: 'david.garcia@unikorp.com', role: 'Stagiaire (SKOMPTAB)', status: 'Suspendu', modules: ['SKOMPTAB'] },
];

const MODULES = ['SKOMPTAB', 'SOCIX', 'MARKOS', 'LOGSON'];


// --- TAB COMPONENTS ---

function DashboardTab() {
  return (
    <div className="mt-6 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Exercices Comptables</CardTitle>
                <CardDescription>Ouvrez un nouvel exercice ou clôturez l'exercice en cours pour archiver les données.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4">
                <Button variant="outline" size="lg">Ouvrir un nouvel exercice</Button>
                <Button variant="destructive" size="lg">Clôturer l'exercice en cours</Button>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-blue-500"/>SKOMPTAB - Finance</CardTitle>
                    <CardDescription>Indicateurs et aperçu de la performance financière.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {skomptabKpis.map(kpi => (
                            <div key={kpi.title} className="p-2 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">{kpi.title}</p><p className="text-lg font-bold">{kpi.value}</p></div>
                        ))}
                    </div>
                     <ChartContainer config={skomptabChartConfig} className="h-[200px] w-full"><BarChart data={skomptabChartData}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/><YAxis tickFormatter={(v) => `${(v as number)/1000}k`} /><ChartTooltip content={<ChartTooltipContent formatter={(value) => `${(value as number).toLocaleString()} FCFA`} />} /><Legend /><Bar dataKey="revenus" fill="var(--color-revenus)" radius={[4, 4, 0, 0]} /><Bar dataKey="depenses" fill="var(--color-depenses)" radius={[4, 4, 0, 0]} /></BarChart></ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-purple-500"/>SOCIX - RH</CardTitle>
                    <CardDescription>Indicateurs et aperçu des ressources humaines.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {socixKpis.map(kpi => (
                            <div key={kpi.title} className="p-2 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">{kpi.title}</p><p className="text-lg font-bold">{kpi.value}</p></div>
                        ))}
                    </div>
                     <ChartContainer config={socixChartConfig} className="h-[200px] w-full"><BarChart data={socixChartData}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Legend /><Bar dataKey="recrutements" fill="var(--color-recrutements)" radius={[4, 4, 0, 0]} stackId="a" /><Bar dataKey="departs" fill="var(--color-departs)" radius={[4, 4, 0, 0]} stackId="a" /></BarChart></ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500"/>MARKOS - Marketing</CardTitle>
                    <CardDescription>Indicateurs et aperçu des activités marketing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {markosKpis.map(kpi => (
                            <div key={kpi.title} className="p-2 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">{kpi.title}</p><p className="text-lg font-bold">{kpi.value}</p></div>
                        ))}
                    </div>
                     <ChartContainer config={markosChartConfig} className="h-[200px] w-full"><LineChart data={markosChartData}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={3} dot={{r:4}} /></LineChart></ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5 text-orange-500"/>LOGSON - Logistique</CardTitle>
                    <CardDescription>Indicateurs et aperçu de la chaîne logistique.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        {logsonKpis.map(kpi => (
                            <div key={kpi.title} className="p-2 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">{kpi.title}</p><p className="text-lg font-bold">{kpi.value}</p></div>
                        ))}
                    </div>
                    <ChartContainer config={logsonChartConfig} className="h-[200px] w-full"><BarChart data={logsonChartData}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Legend /><Bar dataKey="expeditions" fill="var(--color-expeditions)" radius={[4, 4, 0, 0]} /><Bar dataKey="retours" fill="var(--color-retours)" radius={[4, 4, 0, 0]} /></BarChart></ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

function UsersTab() {
    const [users, setUsers] = useState(initialUsers);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const handleOpenModal = (user: User | null) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = (formData: Omit<User, 'id' | 'status'>) => {
        if (editingUser) {
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...editingUser, ...formData } : u));
        } else {
            const newUser: User = { id: `usr-${Date.now()}`, status: 'Actif', ...formData };
            setUsers(prev => [...prev, newUser]);
        }
        setIsUserModalOpen(false);
    };

    const toggleSuspendUser = () => {
        if (userToSuspend) {
            setUsers(prev => prev.map(u => u.id === userToSuspend.id ? {...u, status: u.status === 'Actif' ? 'Suspendu' : 'Actif'} : u));
            setUserToSuspend(null);
        }
    };

  return (
    <div className="mt-6">
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Utilisateurs</CardTitle>
                        <CardDescription>Gérez les utilisateurs et leurs permissions.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenModal(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un utilisateur
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Accès Modules</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="odd:bg-muted/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                                        <div><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                                    </div>
                                </TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell><div className="flex flex-wrap gap-1">{user.modules.map(m => <Badge key={m} variant="secondary">{m}</Badge>)}</div></TableCell>
                                <TableCell className="text-center"><Badge variant={user.status === 'Actif' ? 'default' : 'destructive'} className={user.status === 'Actif' ? 'bg-green-100 text-green-800' : ''}>{user.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-1">
                                        <Button variant="ghost" size="icon" title="Voir" onClick={() => setViewingUser(user)}><Eye className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" title="Modifier" onClick={() => handleOpenModal(user)}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className={user.status === 'Actif' ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'} title={user.status === 'Actif' ? 'Suspendre' : 'Réactiver'} onClick={() => setUserToSuspend(user)}>
                                            {user.status === 'Actif' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4"/>}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleSaveUser} userToEdit={editingUser} />
        <UserDetailModal isOpen={!!viewingUser} onClose={() => setViewingUser(null)} user={viewingUser} />
        <AlertDialog open={!!userToSuspend} onOpenChange={() => setUserToSuspend(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la {userToSuspend?.status === 'Actif' ? 'suspension' : 'réactivation'} ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Voulez-vous vraiment {userToSuspend?.status === 'Actif' ? 'suspendre' : 'réactiver'} le compte de {userToSuspend?.name} ?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={toggleSuspendUser} className={userToSuspend?.status === 'Actif' ? 'bg-destructive hover:bg-destructive/90' : 'bg-green-600 hover:bg-green-700'}>
                        {userToSuspend?.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

function UserModal({ isOpen, onClose, onSave, userToEdit }: { isOpen: boolean; onClose: () => void; onSave: (data: any) => void; userToEdit: User | null }) {
    const [formData, setFormData] = useState<Partial<User>>({});

    React.useEffect(() => {
        setFormData(userToEdit || { modules: [] });
    }, [userToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };
    
    const handleModuleChange = (module: string, checked: boolean) => {
        setFormData(prev => {
            const currentModules = prev.modules || [];
            if (checked) {
                return { ...prev, modules: [...currentModules, module] };
            } else {
                return { ...prev, modules: currentModules.filter(m => m !== module) };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Omit<User, 'id' | 'status'>);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{userToEdit ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 md:grid-cols-2">
                        <div className="space-y-2"><Label htmlFor="name">Nom complet</Label><Input id="name" value={formData.name || ''} onChange={handleChange} required /></div>
                        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={handleChange} required /></div>
                        <div className="space-y-2"><Label htmlFor="role">Rôle</Label><Select name="role" value={formData.role} onValueChange={v => setFormData(f => ({...f, role: v as UserRole}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Admin-Gestionnaire">Admin-Gestionnaire</SelectItem><SelectItem value="Gestionnaire (SKOMPTAB)">Gestionnaire (SKOMPTAB)</SelectItem><SelectItem value="Stagiaire (SKOMPTAB)">Stagiaire (SKOMPTAB)</SelectItem><SelectItem value="Employé">Employé</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2">
                            <Label>Accès aux modules</Label>
                            <div className="flex flex-wrap gap-4 p-2 border rounded-md">
                                {MODULES.map(module => (
                                    <div key={module} className="flex items-center space-x-2">
                                        <Checkbox id={module} checked={formData.modules?.includes(module)} onCheckedChange={checked => handleModuleChange(module, !!checked)} />
                                        <Label htmlFor={module} className="font-normal">{module}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Identifiants de connexion</Label>
                            <div className="flex gap-2 items-center">
                                <Input value="****************" disabled /><Button variant="secondary" type="button">Générer un mot de passe</Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function UserDetailModal({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: User | null }) {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Feuille de Compte Utilisateur</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16"><AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                            <h3 className="text-xl font-bold">{user.name}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    <Card>
                        <CardContent className="pt-6 space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Rôle:</span><span className="font-semibold">{user.role}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Statut:</span><Badge variant={user.status === 'Actif' ? 'default' : 'destructive'} className={user.status === 'Actif' ? 'bg-green-100 text-green-800' : ''}>{user.status}</Badge></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Accès aux Modules</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {user.modules.map(m => <Badge key={m} variant="secondary" className="text-base py-1 px-3">{m}</Badge>)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CompanyInfoTab() {
  return (
    <div className="mt-6">
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Informations sur l'entreprise</CardTitle>
                <CardDescription>Mettez à jour les informations légales et de contact de votre entreprise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1"><Label htmlFor="companyName">Raison sociale</Label><Input id="companyName" defaultValue="AUTO - SociétéX" /></div>
                    <div className="space-y-1"><Label htmlFor="companyNcc">N° Compte Contribuable</Label><Input id="companyNcc" defaultValue="P0012345678X" /></div>
                </div>
                <div className="space-y-1"><Label htmlFor="companyAddress">Adresse</Label><Textarea id="companyAddress" defaultValue="Cocody Angré, 7ème Tranche, Abidjan, Côte d'Ivoire" /></div>
            </CardContent>
            <CardFooter>
                <Button>Enregistrer les modifications</Button>
            </CardFooter>
        </Card>
    </div>
  );
}

function ErpAccessTab() {
  const router = useRouter();
  return (
    <div className="mt-6">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Accès à l'ERP</CardTitle>
                <CardDescription>Basculez vers l'interface principale de gestion de l'ERP.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Button size="lg" onClick={() => router.push('/dashboard')}>Accéder à l'ERP</Button>
            </CardContent>
        </Card>
    </div>
  );
}

export default function SuperAdminPage() {
    return (
        <div className="w-full">
            <Tabs defaultValue="dashboard">
                <TabsList className={cn(
                    "grid w-full grid-cols-4 h-auto p-0 rounded-none bg-primary",
                    "border-b border-primary/50"
                  )}>
                    <TabsTrigger value="dashboard" className="text-white/80 hover:text-white data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-t-md rounded-b-none py-3">
                        <LayoutDashboard className="mr-2 h-4 w-4" />Tableau de bord
                    </TabsTrigger>
                    <TabsTrigger value="users" className="text-white/80 hover:text-white data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-t-md rounded-b-none py-3">
                        <Users className="mr-2 h-4 w-4" />Utilisateurs
                    </TabsTrigger>
                    <TabsTrigger value="company" className="text-white/80 hover:text-white data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-t-md rounded-b-none py-3">
                        <Building className="mr-2 h-4 w-4" />Infos Entreprise
                    </TabsTrigger>
                    <TabsTrigger value="access" className="text-white/80 hover:text-white data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md rounded-t-md rounded-b-none py-3">
                        <KeyRound className="mr-2 h-4 w-4" />Accès ERP
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard"><DashboardTab /></TabsContent>
                <TabsContent value="users"><UsersTab /></TabsContent>
                <TabsContent value="company"><CompanyInfoTab /></TabsContent>
                <TabsContent value="access"><ErpAccessTab /></TabsContent>
            </Tabs>
        </div>
    );
}
