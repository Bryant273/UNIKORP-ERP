
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Building, Users, Briefcase, CalendarCheck, CalendarX, LogIn, BarChart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SuperAdminPage() {
    const router = useRouter();
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
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Portail Super Administrateur</h1>
                <p className="text-muted-foreground">Gérez les paramètres globaux de votre instance UNIKORP.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart /> Tableau de Bord</CardTitle>
                        <CardDescription>Gérez les exercices comptables.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full" variant="outline" onClick={() => openExerciceModal('open')}>
                            <CalendarCheck className="mr-2 h-4 w-4" /> Ouvrir un exercice
                        </Button>
                        <Button className="w-full" variant="destructive" onClick={() => openExerciceModal('close')}>
                            <CalendarX className="mr-2 h-4 w-4" /> Clôturer l'exercice
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> Gestion des Utilisateurs</CardTitle>
                        <CardDescription>Créez, modifiez et gérez les accès des utilisateurs de la plateforme.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" disabled>Gérer les utilisateurs</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building /> Informations Entreprise</CardTitle>
                        <CardDescription>Modifiez les informations légales et les paramètres de votre entreprise.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" disabled>Modifier les informations</Button>
                    </CardContent>
                </Card>
            </div>

            <Separator />

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
        </div>
    );
}
