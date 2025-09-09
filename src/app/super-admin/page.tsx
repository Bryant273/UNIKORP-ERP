
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart, Legend, PieChart, Pie } from "recharts";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, ShieldCheck, Download, Users, Briefcase, Settings, BarChart2, DollarSign, Target, UserCheck, Ship, FileText, UserPlus, LogOut, FileEdit, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAtom } from 'jotai';
import { userRoleAtom } from '@/lib/store';
import ActionsPage from '../actions/page';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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

export default function SuperAdminPage() {
    const [role] = useAtom(userRoleAtom);
    const hasActionLogAccess = role === 'Compte Entreprise';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Panneau d'Administration</h1>
            </div>

            <Tabs defaultValue="dashboard">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="users">Gestion des Utilisateurs</TabsTrigger>
                    {hasActionLogAccess && <TabsTrigger value="actions">Journal des Actions</TabsTrigger>}
                    <TabsTrigger value="settings">Configuration</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard" className="mt-4">
                    <AdminDashboard />
                </TabsContent>
                <TabsContent value="users" className="mt-4">
                    <UserManagement />
                </TabsContent>
                {hasActionLogAccess && 
                    <TabsContent value="actions" className="mt-4">
                        <ActionsPage />
                    </TabsContent>
                }
                <TabsContent value="settings" className="mt-4">
                    <CompanySettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function AdminDashboard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Vue d'ensemble de l'activité</CardTitle>
                <CardDescription>Indicateurs clés de la performance de l'entreprise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     <Card><CardHeader className="pb-2"><CardDescription>Utilisateurs Actifs</CardDescription><CardTitle className="text-3xl">4</CardTitle></CardHeader></Card>
                     <Card><CardHeader className="pb-2"><CardDescription>Factures générées (Mois)</CardDescription><CardTitle className="text-3xl">142</CardTitle></CardHeader></Card>
                     <Card><CardHeader className="pb-2"><CardDescription>Employés Gérés</CardDescription><CardTitle className="text-3xl">112</CardTitle></CardHeader></Card>
                     <Card><CardHeader className="pb-2"><CardDescription>Livraisons en cours</CardDescription><CardTitle className="text-3xl">18</CardTitle></CardHeader></Card>
                </div>
            </CardContent>
        </Card>
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
