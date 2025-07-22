
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Building, Users, Briefcase, CalendarCheck, CalendarX, LogIn, BarChart, Pencil, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Mock Data
const users = [
    { id: 1, name: 'Admin Gestionnaire', email: 'admin@unikorp.com', role: 'Admin-Gestionnaire', avatar: 'https://placehold.co/100x100.png' },
    { id: 2, name: 'Jean Dupont', email: 'jean.dupont@unikorp.com', role: 'Employé', avatar: 'https://placehold.co/100x100.png' },
    { id: 3, name: 'Marie Comptable', email: 'marie.compta@unikorp.com', role: 'Gestionnaire', avatar: 'https://placehold.co/100x100.png' },
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
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Exercices Comptables</CardTitle>
                <CardDescription>Actions critiques pour la gestion des périodes comptables de l'entreprise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <h4 className="font-semibold">Ouvrir un nouvel exercice</h4>
                        <p className="text-sm text-muted-foreground">Initialise une nouvelle année comptable et fiscale.</p>
                    </div>
                    <Button variant="outline" onClick={() => openExerciceModal('open')}>
                        <CalendarCheck className="mr-2 h-4 w-4" /> Ouvrir un exercice
                    </Button>
                </div>
                 <div className="flex items-center justify-between p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-destructive">Clôturer l'exercice en cours</h4>
                        <p className="text-sm text-destructive/80">Figera définitivement les écritures de l'exercice actuel. Cette action est irréversible.</p>
                    </div>
                    <Button variant="destructive" onClick={() => openExerciceModal('close')}>
                        <CalendarX className="mr-2 h-4 w-4" /> Clôturer l'exercice
                    </Button>
                </div>
            </CardContent>
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
        </Card>
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
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard"><BarChart className="mr-2 h-4 w-4" />Tableau de bord</TabsTrigger>
                    <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Utilisateurs</TabsTrigger>
                    <TabsTrigger value="company"><Building className="mr-2 h-4 w-4" />Infos Entreprise</TabsTrigger>
                    <TabsTrigger value="access"><LogIn className="mr-2 h-4 w-4" />Accès ERP</TabsTrigger>
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
