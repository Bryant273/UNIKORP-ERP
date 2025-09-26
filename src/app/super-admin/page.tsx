
'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from "react";
import { useAtom } from 'jotai';

import { userRoleAtom, type UserRole } from '@/lib/store';
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
import { PlusCircle, ShieldCheck, Download, Users, Briefcase, Settings, PlayCircle, StopCircle, UserPlus, Link2, Copy, Eye, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardPage from '../dashboard/page';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, Line, ComposedChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { type ChartConfig } from "@/components/ui/chart";
import { BarChart2, TrendingDown, TrendingUp, UserCheck, Ship } from 'lucide-react';

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
    { href: '/dashboard', label: 'Accès ERP', value: 'erp' },
];

// --- COMPONENTS ---

const skomptabChartData = [
  { month: "Jan", revenus: 4000, depenses: 2400, resultat: 1600 }, { month: "Fev", revenus: 3000, depenses: 1398, resultat: 1602 },
  { month: "Mar", revenus: 5000, depenses: 3200, resultat: 1800 }, { month: "Avr", revenus: 2780, depenses: 3908, resultat: -1128 },
  { month: "Mai", revenus: 6890, depenses: 4800, resultat: 2090 }, { month: "Juin", revenus: 7390, depenses: 3800, resultat: 3590 },
];
const skomptabChartConfig = {
  revenus: { label: "Revenus", color: "hsl(var(--chart-2))" },
  depenses: { label: "Dépenses", color: "hsl(var(--chart-1))" },
  resultat: { label: "Résultat Net", color: "hsl(var(--primary))" },
} satisfies ChartConfig

const markosKpis = [
    { title: "Nouveaux Leads (Mois)", value: "316", icon: Users },
    { title: "Coût par Lead", value: `${(1850).toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA` },
];

const logsonKpis = [
    { title: "Expéditions (Mois)", value: "1 480", icon: Ship },
    { title: "Taux de retours", value: "1.1%", icon: TrendingDown }
];
const socixKpis = [
    { title: "Masse Salariale", value: `${(89000).toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA` },
    { title: "Effectif Total", value: "112", icon: UserCheck },
];


function AdminDashboard() {
    const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Tableau de Bord de Supervision</h2>
                    <p className="text-muted-foreground">Vue globale de l'activité de l'entreprise pour le mois en cours.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsOpeningModalOpen(true)}><PlayCircle className="mr-2 h-4 w-4"/>Ouverture d'exercice</Button>
                    <Button variant="destructive" onClick={() => setIsClosingModalOpen(true)}><StopCircle className="mr-2 h-4 w-4"/>Clôture d'exercice</Button>
                </div>
            </div>
             <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* SKOMPTAB Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-primary"/>SKOMPTAB - Finance</CardTitle>
                        <CardDescription>Analyse des revenus, dépenses et rentabilité.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
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
                 {/* SOCIX Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-purple-500"/>SOCIX - RH</CardTitle>
                        <CardDescription>Indicateurs clés des ressources humaines.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-center">
                        {socixKpis.map(kpi => (
                            <div key={kpi.title} className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                                <p className="text-2xl font-bold">{kpi.value}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                 {/* MARKOS Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500"/>MARKOS - Marketing</CardTitle>
                        <CardDescription>Performance des leads et taux de conversion.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-center">
                       {markosKpis.map(kpi => (
                            <div key={kpi.title} className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                                <p className="text-2xl font-bold">{kpi.value}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                {/* LOGSON Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5 text-orange-500"/>LOGSON - Logistique</CardTitle>
                        <CardDescription>Suivi des expéditions et des retours.</CardDescription>
                    </CardHeader>
                     <CardContent className="grid grid-cols-2 gap-4 text-center">
                       {logsonKpis.map(kpi => (
                            <div key={kpi.title} className="p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                                <p className="text-2xl font-bold">{kpi.value}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

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
        </>
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

            {/* Add/Edit User Modal */}
            <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} onSave={handleSaveUser} userToEdit={editingUser} />

            {/* Invite User Modal */}
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

    React.useEffect(() => {
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
    return (
        <Card>
            <CardHeader>
                <CardTitle>Paramètres de l'entreprise</CardTitle>
                <CardDescription>Gérez les informations générales de votre entreprise et les exercices comptables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input id="companyName" defaultValue="UNIKORP S.A."/>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="font-semibold">Exercices Comptables</h3>
                     <Table>
                        <TableHeader><TableRow><TableHead>Année</TableHead><TableHead>Date Début</TableHead><TableHead>Date Fin</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell>2024</TableCell><TableCell>01/01/2024</TableCell><TableCell>31/12/2024</TableCell><TableCell><Badge>Ouvert</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm">Clôturer</Button></TableCell></TableRow>
                            <TableRow><TableCell>2023</TableCell><TableCell>01/01/2023</TableCell><TableCell>31/12/2023</TableCell><TableCell><Badge variant="secondary">Clôturé</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" disabled>Rouvrir</Button></TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
             <CardFooter>
                <Button className="ml-auto">Enregistrer les modifications</Button>
            </CardFooter>
        </Card>
    )
}


export default function SuperAdminPage() {
    const [role] = useAtom(userRoleAtom);
    const hasActionLogAccess = role === 'Compte Entreprise';
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <AdminDashboard />;
            case 'users': return <UserManagement />;
            case 'actions': return hasActionLogAccess ? <ActionsPage /> : null;
            case 'settings': return <CompanySettings />;
            default: return <AdminDashboard />;
        }
    };
    
    return (
        <div className="space-y-6">
             <nav className="bg-primary border-b px-4 sm:px-6 -mx-6 -mt-6">
              <div className="flex items-center gap-4">
                {navItems.map((link) => {
                    const isErpAccess = link.value === 'erp';
                    if (link.value === 'actions' && !hasActionLogAccess) return null;
                    return (
                      <Link href={link.href} key={link.href}>
                        <div
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:text-white rounded-t-md',
                            activeTab === link.value && !isErpAccess && 'bg-background text-primary'
                          )}
                        >
                          {link.label}
                        </div>
                      </Link>
                    )
                })}
              </div>
            </nav>

            <div className="pt-2">
              {renderContent()}
            </div>
        </div>
    );
}

    