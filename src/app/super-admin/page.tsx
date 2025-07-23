
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, Building, KeyRound, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


function DashboardTab() {
  return (
    <div className="mt-6">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Gestion des Exercices Comptables</CardTitle>
                <CardDescription>Ouvrez un nouvel exercice ou clôturez l'exercice en cours pour archiver les données.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-4">
                <Button variant="outline" size="lg">Ouvrir un nouvel exercice</Button>
                <Button variant="destructive" size="lg">Clôturer l'exercice en cours</Button>
            </CardContent>
        </Card>
    </div>
  );
}

const mockUsers = [
    { id: 'usr-1', name: 'Jean Dupont', email: 'jean.dupont@unikorp.com', role: 'Admin-Gestionnaire', status: 'Actif' },
    { id: 'usr-2', name: 'Sophie Martin', email: 'sophie.martin@unikorp.com', role: 'Gestionnaire (MARKOS)', status: 'Actif' },
    { id: 'usr-3', name: 'David Garcia', email: 'david.garcia@unikorp.com', role: 'Stagiaire (SKOMPTAB)', status: 'Inactif' },
];

function UsersTab() {
  return (
     <div className="mt-6">
        <Card>
            <CardHeader>
                <CardTitle>Utilisateurs</CardTitle>
                <CardDescription>Gérez les utilisateurs et leurs permissions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={user.status === 'Actif' ? 'default' : 'destructive'} className={user.status === 'Actif' ? 'bg-green-100 text-green-800' : ''}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
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
