
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ComposedChart, Line } from "recharts";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Building, KeyRound, Pencil, DollarSign, TrendingUp, Ship, UserCheck, BarChart2, TrendingDown, Package, PlusCircle, Trash2, Eye, Ban, CheckCircle, Copy, BookLock, BookUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

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
                 <Dialog><DialogTrigger asChild><Button variant="outline" size="lg"><BookUp className="mr-2 h-4 w-4"/>Ouvrir un nouvel exercice</Button></DialogTrigger><OpeningModal /></Dialog>
                 <Dialog><DialogTrigger asChild><Button variant="destructive" size="lg"><BookLock className="mr-2 h-4 w-4"/>Clôturer l'exercice en cours</Button></DialogTrigger><ClosingModal /></Dialog>
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
                     <ChartContainer config={markosChartConfig} className="h-[200px] w-full"><ComposedChart data={markosChartData}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} /></ComposedChart></ChartContainer>
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
                    <ChartContainer config={logsonChartConfig} className="h-[200px] w-full">
                        <ComposedChart data={logsonChartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                            <YAxis yAxisId="left" orientation="left" stroke="var(--color-expeditions)" />
                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-retours)" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="expeditions" yAxisId="left" fill="var(--color-expeditions)" radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="retours" yAxisId="right" stroke="var(--color-retours)" />
                        </ComposedChart>
                    </ChartContainer>
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
                        <div className="space-y-2"><Label htmlFor="name">Nom complet</Label><Input id="name" defaultValue={formData.name || ''} onChange={handleChange} required /></div>
                        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" defaultValue={formData.email || ''} onChange={handleChange} required /></div>
                        <div className="space-y-2"><Label htmlFor="role">Rôle</Label><Select name="role" defaultValue={formData.role} onValueChange={v => setFormData(f => ({...f, role: v as UserRole}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Admin-Gestionnaire">Admin-Gestionnaire</SelectItem><SelectItem value="Gestionnaire (SKOMPTAB)">Gestionnaire (SKOMPTAB)</SelectItem><SelectItem value="Stagiaire (SKOMPTAB)">Stagiaire (SKOMPTAB)</SelectItem><SelectItem value="Employé">Employé</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2">
                            <Label>Accès aux modules</Label>
                            <div className="flex flex-wrap gap-4 p-2 border rounded-md">
                                {MODULES.map(module => (
                                    <div key={module} className="flex items-center space-x-2">
                                        <Checkbox id={module} defaultChecked={formData.modules?.includes(module)} onCheckedChange={checked => handleModuleChange(module, !!checked)} />
                                        <Label htmlFor={module} className="font-normal">{module}</Label>
                                    </div>
                                ))}
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

function UserDetailModal({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: User | null }) {
    const { toast } = useToast();

    if (!user) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(`Email: ${user.email}\nMot de passe (temporaire): Abc@12345`);
        toast({ title: 'Identifiants copiés', description: 'Le mot de passe est un placeholder.' });
    };

    const handleResetPassword = () => {
        toast({ title: 'Mot de passe réinitialisé', description: `Un nouveau mot de passe a été généré pour ${user.name}.` });
    };

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
                    <Card>
                        <CardHeader><CardTitle className="text-base">Identifiants de connexion</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="space-y-2">
                                <Label htmlFor="user-email">Email</Label>
                                <Input id="user-email" defaultValue={user.email} readOnly />
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor="user-password">Mot de passe</Label>
                                <Input id="user-password" type="password" defaultValue="************" readOnly />
                           </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="w-full" onClick={handleCopy}><Copy className="mr-2 h-4 w-4" /> Copier les identifiants</Button>
                                <Button variant="secondary" className="w-full" onClick={handleResetPassword}>Réinitialiser le mot de passe</Button>
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

const regions = {
    'UEMOA': [{ code: 'CI', name: 'Côte d\'Ivoire' }, { code: 'SN', name: 'Sénégal' }, { code: 'BJ', name: 'Bénin' }],
    'Amérique du Nord': [{ code: 'US', name: 'États-Unis' }, { code: 'CA', name: 'Canada' }],
    'Europe': [{ code: 'FR', name: 'France' }, { code: 'DE', name: 'Allemagne' }, { code: 'ES', name: 'Espagne' }],
    'Asie-Pacifique': [{ code: 'JP', name: 'Japon' }, { code: 'CN', name: 'Chine' }, { code: 'SG', name: 'Singapour' }, { code: 'IN', name: 'Inde' }],
    'Afrique du Nord': [{ code: 'MA', name: 'Maroc' }, { code: 'TN', name: 'Tunisie' }, { code: 'DZ', name: 'Algérie' }, { code: 'EG', name: 'Égypte' }],
    'Autres': [{ code: 'ZA', name: 'Afrique du Sud' }, { code: 'BR', name: 'Brésil' }, { code: 'AU', name: 'Australie' }, { code: 'AE', name: 'Émirats Arabes Unis' }],
};

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-1.5"><Label className="text-xs font-semibold">{label} <span className="text-destructive">*</span></Label>{children}</div>
);

// --- FORM COMPONENTS PER REGION ---

const FormRegionDefault = () => (
    <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50">
        <p>Sélectionnez une région et un pays pour afficher le formulaire correspondant.</p>
    </div>
);

const FormRegionUEMOA = () => (
    <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
        <AccordionItem value="item-1"><AccordionTrigger>Informations légales OHADA</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Raison Sociale"><Input /></FormField><FormField label="Numéro RCCM"><Input /></FormField><FormField label="Numéro NIU"><Input /></FormField><FormField label="Numéro de Contribuable"><Input /></FormField><FormField label="Forme Juridique OHADA"><Input /></FormField><FormField label="Capital Social"><Input type="number" /></FormField><FormField label="Date d'Immatriculation RCCM"><Input type="date" /></FormField><FormField label="Greffe de Rattachement"><Input /></FormField></div></AccordionContent></AccordionItem>
        <AccordionItem value="item-2"><AccordionTrigger>Localisation & Fiscalité UEMOA</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><div className="col-span-2"><FormField label="Adresse Siège Social"><Textarea /></FormField></div><FormField label="Commune, Département, Région"><Input /></FormField><FormField label="Centre des Impôts"><Input /></FormField><FormField label="Téléphone"><Input /></FormField><FormField label="Email"><Input type="email" /></FormField><FormField label="Régime Fiscal"><Input /></FormField><FormField label="Numéro de Patente"><Input /></FormField><FormField label="Code Activité UEMOA"><Input /></FormField><FormField label="Commissaire aux Comptes"><Input /></FormField></div></AccordionContent></AccordionItem>
        <AccordionItem value="item-3"><AccordionTrigger>Paramètres ERP UEMOA</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Devise"><Input defaultValue="Franc CFA (XOF)" readOnly /></FormField><FormField label="Plan Comptable"><Input defaultValue="SYSCOHADA" readOnly /></FormField><FormField label="Fuseau Horaire"><Input defaultValue="GMT" readOnly /></FormField><FormField label="Langues"><Input defaultValue="Français" /></FormField></div></AccordionContent></AccordionItem>
    </Accordion>
);

const FormRegionUSA = () => (
    <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
        <AccordionItem value="item-1"><AccordionTrigger>Informations légales obligatoires</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Legal Business Name"><Input /></FormField><FormField label="DBA (Doing Business As)"><Input /></FormField><FormField label="EIN (Employer Identification Number)"><Input /></FormField><FormField label="State of Incorporation"><Input /></FormField><FormField label="Business Entity Type"><Input /></FormField><FormField label="Registered Agent"><Input /></FormField><FormField label="Date of Formation"><Input type="date" /></FormField></div></AccordionContent></AccordionItem>
        <AccordionItem value="item-2"><AccordionTrigger>Adresses et contact</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><div className="col-span-2"><FormField label="Principal Business Address"><Textarea /></FormField></div><div className="col-span-2"><FormField label="Registered Office Address"><Textarea /></FormField></div><FormField label="Phone"><Input /></FormField><FormField label="Email"><Input type="email" /></FormField></div></AccordionContent></AccordionItem>
        <AccordionItem value="item-3"><AccordionTrigger>Informations fiscales</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Federal Tax Classification"><Input /></FormField><FormField label="State Tax ID Numbers"><Input /></FormField><FormField label="Sales Tax Permit Numbers"><Input /></FormField><FormField label="NAICS Code"><Input /></FormField></div></AccordionContent></AccordionItem>
        <AccordionItem value="item-4"><AccordionTrigger>Paramètres ERP USA</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Currency"><Input defaultValue="USD" readOnly /></FormField><FormField label="Time Zone"><Input /></FormField><FormField label="Tax Year"><Input /></FormField><FormField label="Plan Comptable"><Input defaultValue="US GAAP" readOnly /></FormField></div></AccordionContent></AccordionItem>
    </Accordion>
);

const FormRegionCA = () => (
    <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
        <AccordionItem value="item-1"><AccordionTrigger>Informations légales</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Legal Name"><Input /></FormField><FormField label="Operating Name"><Input /></FormField><FormField label="Business Number (BN)"><Input /></FormField><FormField label="Corporation Number"><Input /></FormField><FormField label="Province/Territory of Incorporation"><Input /></FormField><FormField label="Business Structure"><Input /></FormField><div className="col-span-2"><FormField label="Registered Office"><Textarea /></FormField></div></div></AccordionContent></AccordionItem>
        <AccordionItem value="item-2"><AccordionTrigger>Informations fiscales</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="GST/HST Registration Number"><Input /></FormField><FormField label="Provincial Tax Numbers"><Input /></FormField><FormField label="NAICS Code"><Input /></FormField><FormField label="Payroll Account Numbers"><Input /></FormField></div></AccordionContent></AccordionItem>
        <AccordionItem value="item-3"><AccordionTrigger>Paramètres ERP Canada</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Currency"><Input defaultValue="CAD" readOnly /></FormField><FormField label="Languages"><Input defaultValue="English/French"/></FormField><FormField label="Plan Comptable"><Input defaultValue="ASPE/IFRS" /></FormField><FormField label="Tax Year"><Input /></FormField></div></AccordionContent></AccordionItem>
    </Accordion>
);

const FormRegionEU = () => (
    <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
        <AccordionItem value="item-1"><AccordionTrigger>Informations légales</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Legal Entity Name"><Input /></FormField><FormField label="Company Registration Number"><Input /></FormField><FormField label="VAT Identification Number"><Input /></FormField><FormField label="EORI Number"><Input /></FormField><FormField label="Legal Form"><Input /></FormField><FormField label="Share Capital"><Input type="number" /></FormField></div></AccordionContent></AccordionItem>
        <AccordionItem value="item-2"><AccordionTrigger>Paramètres ERP Europe</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Currency"><Input defaultValue="EUR" /></FormField><FormField label="Plan Comptable"><Input defaultValue="PCG Local/IFRS" /></FormField><div className="flex items-center space-x-2"><Checkbox id="gdpr"/><Label htmlFor="gdpr">GDPR Compliance Enabled</Label></div></div></AccordionContent></AccordionItem>
    </Accordion>
);

const FormJapan = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Japon</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Corporate Name (Kanji/Katakana/Romaji)"><Input /></FormField><FormField label="Corporate Number (法人番号)"><Input /></FormField><FormField label="Registration Prefecture"><Input /></FormField><FormField label="Business License Numbers"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);
const FormChina = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Chine</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Company Name (Chinese/English)"><Input /></FormField><FormField label="Unified Social Credit Code"><Input /></FormField><FormField label="Business License Number"><Input /></FormField><FormField label="Organization Code"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);
const FormSingapore = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Singapour</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Company Name"><Input /></FormField><FormField label="UEN (Unique Entity Number)"><Input /></FormField><FormField label="Company Type"><Input /></FormField><FormField label="ACRA Registration"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);
const FormIndia = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Inde</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Company Name"><Input /></FormField><FormField label="CIN (Corporate Identity Number)"><Input /></FormField><FormField label="PAN (Permanent Account Number)"><Input /></FormField><FormField label="GST Registration Number"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);

const FormMorocco = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Maroc</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Numéro RC"><Input /></FormField><FormField label="Identifiant Fiscal (IF)"><Input /></FormField><FormField label="Numéro CNSS"><Input /></FormField><FormField label="ICE"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);
const FormTunisia = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Tunisie</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Numéro Registre de Commerce"><Input /></FormField><FormField label="Matricule Fiscal"><Input /></FormField><FormField label="Code TVA"><Input /></FormField><FormField label="Code Douane"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);
const FormAlgeria = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Algérie</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Numéro RC"><Input /></FormField><FormField label="Numéro NIF"><Input /></FormField><FormField label="Numéro NIS"><Input /></FormField><FormField label="Code d'Activité"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);
const FormEgypt = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Égypte</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Commercial Registration Number"><Input /></FormField><FormField label="Tax Card Number"><Input /></FormField><FormField label="Social Insurance Number"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);

const FormSouthAfrica = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Afrique du Sud</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Company Registration Number"><Input /></FormField><FormField label="VAT Registration Number"><Input /></FormField><FormField label="CIPC Registration"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);
const FormBrazil = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Brésil</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Razão Social"><Input /></FormField><FormField label="CNPJ"><Input /></FormField><FormField label="Inscrição Estadual"><Input /></FormField><FormField label="CNAE Code"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);
const FormAustralia = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Australie</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Company Name"><Input /></FormField><FormField label="ACN"><Input /></FormField><FormField label="ABN"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);
const FormUAE = () => (<Accordion type="multiple" defaultValue={['item-1']}><AccordionItem value="item-1"><AccordionTrigger>Émirats Arabes Unis</AccordionTrigger><AccordionContent className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><FormField label="Trade License Number"><Input /></FormField><FormField label="VAT Registration Number"><Input /></FormField></div></AccordionContent></AccordionItem></Accordion>);

function CompanyInfoTab() {
  const [region, setRegion] = useState<keyof typeof regions | ''>('UEMOA');
  const [country, setCountry] = useState('CI');
  const { toast } = useToast();

  const handleRegionChange = (value: keyof typeof regions | '') => {
    setRegion(value);
    setCountry(''); // Reset country when region changes
  };
  
  const handleSave = () => {
    toast({
        title: "Configuration sauvegardée",
        description: `Les informations pour le pays ${country} dans la région ${region} ont été enregistrées.`,
    })
  }

  const renderForm = () => {
    if (!region || !country) return <FormRegionDefault />;
    switch(region) {
        case 'UEMOA': return <FormRegionUEMOA />;
        case 'Amérique du Nord':
            if (country === 'US') return <FormRegionUSA />;
            if (country === 'CA') return <FormRegionCA />;
            return <FormRegionDefault />;
        case 'Europe': return <FormRegionEU />;
        case 'Asie-Pacifique':
            if (country === 'JP') return <FormJapan />;
            if (country === 'CN') return <FormChina />;
            if (country === 'SG') return <FormSingapore />;
            if (country === 'IN') return <FormIndia />;
            return <FormRegionDefault />;
        case 'Afrique du Nord':
            if (country === 'MA') return <FormMorocco />;
            if (country === 'TN') return <FormTunisia />;
            if (country === 'DZ') return <FormAlgeria />;
            if (country === 'EG') return <FormEgypt />;
            return <FormRegionDefault />;
        case 'Autres':
            if (country === 'ZA') return <FormSouthAfrica />;
            if (country === 'BR') return <FormBrazil />;
            if (country === 'AU') return <FormAustralia />;
            if (country === 'AE') return <FormUAE />;
            return <FormRegionDefault />;
        default: return <FormRegionDefault />;
    }
  }

  return (
    <div className="mt-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Informations sur l'entreprise</CardTitle>
            <CardDescription>Configurez les informations légales et fiscales de votre entreprise en fonction de sa localisation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                 <div className="space-y-2">
                    <Label>Région d'opération</Label>
                    <Select value={region} onValueChange={handleRegionChange}>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez une région..." /></SelectTrigger>
                        <SelectContent>
                            {Object.keys(regions).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>Pays</Label>
                    <Select value={country} onValueChange={setCountry} disabled={!region}>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez un pays..." /></SelectTrigger>
                        <SelectContent>
                            {region && regions[region].map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
            </div>

            {renderForm()}
        </CardContent>
        <CardFooter>
            <Button onClick={handleSave} disabled={!region || !country}>Enregistrer les modifications</Button>
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

function OpeningModal() {
    const [step, setStep] = useState(1);
    const [balances, setBalances] = useState([
        { compte: '101000', libelle: 'Capital Social', soldeN1: 500000, report: 500000 },
        { compte: '211000', libelle: 'Terrains', soldeN1: 1000000, report: 1000000 },
        { compte: '281000', libelle: 'Amortissements', soldeN1: -200000, report: -200000 },
        { compte: '401000', libelle: 'Fournisseurs', soldeN1: -150000, report: -150000 },
        { compte: '411000', libelle: 'Clients', soldeN1: 300000, report: 300000 },
        { compte: '512000', libelle: 'Banque', soldeN1: -450000, report: -450000 },
    ]);
    const [editingRow, setEditingRow] = useState<string | null>(null);
    const [currentEditValue, setCurrentEditValue] = useState(0);

    const totals = useMemo(() => {
        const totalDebit = balances.filter(b => b.report > 0).reduce((sum, b) => sum + b.report, 0);
        const totalCredit = balances.filter(b => b.report < 0).reduce((sum, b) => sum + b.report, 0);
        return { totalDebit, totalCredit: -totalCredit };
    }, [balances]);

    const handleStartEdit = (compte: string, value: number) => {
        setEditingRow(compte);
        setCurrentEditValue(value);
    };

    const handleSaveEdit = () => {
        if (editingRow) {
            setBalances(current => 
                current.map(b => b.compte === editingRow ? { ...b, report: currentEditValue } : b)
            );
        }
        setEditingRow(null);
    };

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Ouverture d'un Nouvel Exercice Comptable</DialogTitle>
                <DialogDescription>Suivez les étapes pour initialiser le nouvel exercice fiscal.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Tabs value={`step-${step}`} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="step-1" onClick={() => setStep(1)}>1. Dates</TabsTrigger>
                        <TabsTrigger value="step-2" onClick={() => setStep(2)} disabled={step < 2}>2. Paramètres</TabsTrigger>
                        <TabsTrigger value="step-3" onClick={() => setStep(3)} disabled={step < 3}>3. A-nouveaux</TabsTrigger>
                        <TabsTrigger value="step-4" onClick={() => setStep(4)} disabled={step < 4}>4. Validation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="step-1" className="mt-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Date de début</Label><Input type="date" defaultValue="2025-01-01" /></div><div className="space-y-2"><Label>Date de fin</Label><Input type="date" defaultValue="2025-12-31" /></div></div></TabsContent>
                    <TabsContent value="step-2" className="mt-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Numérotation des pièces</Label><Select><SelectTrigger><SelectValue placeholder="Format..."/></SelectTrigger><SelectContent><SelectItem value="format1">JOURNAL-AAAA-####</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Comptes à reporter</Label><Select><SelectTrigger><SelectValue placeholder="Sélection..."/></SelectTrigger><SelectContent><SelectItem value="all">Tous les comptes de bilan</SelectItem></SelectContent></Select></div></div></TabsContent>
                    <TabsContent value="step-3" className="mt-4"><p>Saisissez ou validez les soldes à reporter pour le nouvel exercice.</p><div className="h-64 mt-2 overflow-auto border rounded-md"><Table>
                        <TableHeader><TableRow><TableHead>Compte</TableHead><TableHead>Libellé</TableHead><TableHead className="text-right">Solde N-1</TableHead><TableHead className="text-right">A-nouveau à reporter</TableHead><TableHead className="w-24 text-center">Action</TableHead></TableRow></TableHeader>
                        <TableBody>{balances.map((b, i) => <TableRow key={b.compte}>
                            <TableCell>{b.compte}</TableCell>
                            <TableCell>{b.libelle}</TableCell>
                            <TableCell className="text-right">{b.soldeN1.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                {editingRow === b.compte ? (
                                    <Input type="number" className="text-right h-8" value={currentEditValue} onChange={(e) => setCurrentEditValue(parseInt(e.target.value) || 0)} />
                                ) : (
                                    b.report.toLocaleString()
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                {editingRow === b.compte ? (
                                    <Button size="sm" onClick={handleSaveEdit}>Enregistrer</Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => handleStartEdit(b.compte, b.report)}>Modifier</Button>
                                )}
                            </TableCell>
                        </TableRow>)}</TableBody>
                    </Table></div></TabsContent>
                    <TabsContent value="step-4" className="mt-4"><div className="text-center p-8 space-y-4"><h3 className="text-lg font-semibold">Vérification de l'Équilibre</h3><div className="flex justify-around"><div className="p-4 rounded-md bg-muted"><p>Total Débit</p><p className="text-xl font-bold">{totals.totalDebit.toLocaleString()} FCFA</p></div><div className="p-4 rounded-md bg-muted"><p>Total Crédit</p><p className="text-xl font-bold">{totals.totalCredit.toLocaleString()} FCFA</p></div></div>{totals.totalDebit === totals.totalCredit ? <p className="text-green-600 font-bold">L'écriture d'à-nouveaux est équilibrée.</p> : <p className="text-red-600 font-bold">L'écriture est déséquilibrée de {(totals.totalDebit - totals.totalCredit).toLocaleString()} FCFA.</p>}</div></TabsContent>
                </Tabs>
            </div>
            <DialogFooter>
                {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Précédent</Button>}
                {step < 4 && <Button onClick={() => setStep(s => s + 1)} disabled={(step === 3 && totals.totalDebit !== totals.totalCredit)}>Suivant</Button>}
                {step === 4 && <DialogClose asChild><Button disabled={totals.totalDebit !== totals.totalCredit}>Ouvrir l'Exercice</Button></DialogClose>}
            </DialogFooter>
        </DialogContent>
    );
}

function ClosingModal() {
    const [step, setStep] = useState(1);
    const [checks, setChecks] = useState({ lettrage: false, rapprochements: false });

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Clôture de l'Exercice Comptable</DialogTitle>
                <DialogDescription>Validez les étapes pour clôturer définitivement l'exercice en cours.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Tabs value={`step-${step}`} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="step-1" onClick={() => setStep(1)}>1. Contrôles</TabsTrigger>
                        <TabsTrigger value="step-2" onClick={() => setStep(2)} disabled={step < 2}>2. Écritures</TabsTrigger>
                        <TabsTrigger value="step-3" onClick={() => setStep(3)} disabled={step < 3}>3. Affectation</TabsTrigger>
                        <TabsTrigger value="step-4" onClick={() => setStep(4)} disabled={step < 4}>4. Validation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="step-1" className="mt-4"><p>Veuillez confirmer que les contrôles suivants ont bien été effectués.</p><div className="space-y-2 mt-4"><div className="flex items-center space-x-2"><Checkbox id="lettrage" checked={checks.lettrage} onCheckedChange={(c) => setChecks(v => ({...v, lettrage: !!c}))} /><Label htmlFor="lettrage">Lettrage des comptes tiers terminé</Label></div><div className="flex items-center space-x-2"><Checkbox id="rapprochements" checked={checks.rapprochements} onCheckedChange={(c) => setChecks(v => ({...v, rapprochements: !!c}))} /><Label htmlFor="rapprochements">Rapprochements bancaires effectués et validés</Label></div></div></TabsContent>
                    <TabsContent value="step-2" className="mt-4"><p>Le système va générer automatiquement les écritures de clôture (amortissements, provisions, régularisations).</p><div className="p-4 bg-muted rounded-md mt-2 text-center text-sm">Simulation de la génération des écritures... <Loader2 className="inline-block h-4 w-4 animate-spin" /></div></TabsContent>
                    <TabsContent value="step-3" className="mt-4"><div className="space-y-4"><p>Le résultat de l'exercice est de <strong>12,540,000 FCFA</strong>. Veuillez choisir une affectation.</p><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Mise en réserve</Label><Input type="number" defaultValue="12540000"/></div><div className="space-y-2"><Label>Distribution de dividendes</Label><Input type="number" defaultValue="0"/></div></div></div></TabsContent>
                    <TabsContent value="step-4" className="mt-4"><div className="text-center p-8 space-y-4 text-destructive"><h3 className="text-lg font-bold">ATTENTION : Action Irréversible</h3><p>La validation finale va clôturer l'exercice. Aucune modification ne sera plus possible sur cette période. Les données seront archivées.</p></div></TabsContent>
                </Tabs>
            </div>
            <DialogFooter>
                {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Précédent</Button>}
                {step < 4 && <Button onClick={() => setStep(s => s + 1)} disabled={(step === 1 && (!checks.lettrage || !checks.rapprochements))}>Suivant</Button>}
                {step === 4 && <DialogClose asChild><Button variant="destructive">Clôturer Définitivement</Button></DialogClose>}
            </DialogFooter>
        </DialogContent>
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
