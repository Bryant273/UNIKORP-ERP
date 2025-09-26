
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, ShieldCheck, Download, Users, Briefcase, Settings, BarChart2, DollarSign, Target, UserCheck, Ship, FileText, UserPlus, LogOut, FileEdit, CheckCircle, Clock, PlayCircle, StopCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { userRoleAtom } from '@/lib/store';
import ActionsPage from '../actions/page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart } from "recharts";

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

const allUsers: User[] = [
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

const moduleStats = {
    skomptab: { title: 'SKOMPTAB - Finance', kpis: [{label: 'Revenus', value: '15.2M FCFA'}, {label: 'Dépenses', value: '8.9M FCFA'}], icon: DollarSign },
    socix: { title: 'SOCIX - RH', kpis: [{label: 'Effectif', value: '112'}, {label: 'Recrutements', value: '4'}], icon: UserCheck },
    markos: { title: 'MARKOS - Marketing', kpis: [{label: 'Nouveaux Leads', value: '316'}, {label: 'Taux Conv.', value: '4.2%'}], icon: Target },
    logson: { title: 'LOGSON - Logistique', kpis: [{label: 'Commandes Expédiées', value: '1,480'}, {label: 'Valeur Stock', value: '250M FCFA'}], icon: Ship },
}

// --- COMPONENTS ---
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
                {Object.values(moduleStats).map(module => (
                    <Card key={module.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <module.icon className="h-4 w-4 text-muted-foreground"/> {module.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           {module.kpis.map(kpi => (
                                <div key={kpi.label} className="mt-2">
                                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                                    <p className="text-2xl font-bold">{kpi.value}</p>
                                </div>
                           ))}
                        </CardContent>
                    </Card>
                ))}
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
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Gestion des Utilisateurs</CardTitle>
                    <Button><PlusCircle className="mr-2 h-4 w-4"/>Inviter un utilisateur</Button>
                </div>
                <CardDescription>Ajoutez, modifiez ou suspendez les accès des utilisateurs à l'ERP.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead>Dernière connexion</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9"><AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person face" /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                                        <div><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                                    </div>
                                </TableCell>
                                <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                <TableCell className="text-center"><Badge variant={user.status === 'Actif' ? 'default' : 'destructive'} className={cn(user.status === 'Actif' && 'bg-green-100 text-green-800')}>{user.status}</Badge></TableCell>
                                <TableCell>{format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm', {locale: fr})}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
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
