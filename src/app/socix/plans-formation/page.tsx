
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BookOpenCheck, Users, Award, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// --- MOCK DATA & TYPES ---
type Training = {
    id: string;
    date: Date;
    title: string;
    description: string;
    category: 'Technique' | 'Management' | 'Soft Skills';
    duration: string;
    participants: { id: string; name: string; avatarUrl: string }[];
    syllabus: { title: string; points: string[] }[];
    skillsToAcquire: string[];
    status: 'Planifiée' | 'Terminée' | 'Annulée';
};

const MOCK_TRAININGS: Training[] = [
    {
        id: 'train-1',
        date: new Date(2024, 8, 16), // Septembre 16
        title: 'Formation Avancée Next.js',
        description: 'Maîtriser les Server Components et les nouvelles fonctionnalités de Next.js 14+.',
        category: 'Technique',
        duration: '3 jours',
        participants: [
            { id: 'emp-001', name: 'Jean Dupont', avatarUrl: 'https://placehold.co/100x100.png' },
            { id: 'emp-004', name: 'Lucas Petit', avatarUrl: 'https://placehold.co/100x100.png' },
        ],
        syllabus: [
            { title: 'Jour 1: Fondamentaux du App Router', points: ['Server Components vs Client Components', 'Layouts et Templates', 'Gestion du chargement et des erreurs'] },
            { title: 'Jour 2: Techniques Avancées', points: ['Server Actions', 'Streaming de l\'UI', 'Optimisation des performances'] },
            { title: 'Jour 3: Déploiement & Pratique', points: ['Déploiement sur Vercel', 'Atelier pratique : construire une mini-app'] },
        ],
        skillsToAcquire: ['Next.js App Router', 'Server Components', 'Server Actions', 'Optimisation Web'],
        status: 'Planifiée'
    },
    {
        id: 'train-2',
        date: new Date(2024, 9, 7), // Octobre 7
        title: 'Leadership pour Nouveaux Managers',
        description: 'Acquérir les compétences de base pour manager une équipe avec succès.',
        category: 'Management',
        duration: '2 jours',
        participants: [
            { id: 'emp-002', name: 'Sophie Martin', avatarUrl: 'https://placehold.co/100x100.png' },
        ],
        syllabus: [
            { title: 'Jour 1: Posture et Communication', points: ['Définir son style de leadership', 'Communication efficace et feedback constructif'] },
            { title: 'Jour 2: Animation d\'équipe', points: ['Délégation et autonomisation', 'Gestion des conflits'] },
        ],
        skillsToAcquire: ['Management', 'Leadership', 'Communication Interpersonnelle'],
        status: 'Planifiée'
    },
    {
        id: 'train-3',
        date: new Date(2024, 6, 22), // Juillet 22
        title: 'Fondamentaux de la Comptabilité',
        description: 'Formation de base pour les non-comptables.',
        category: 'Technique',
        duration: '1 jour',
        participants: [
            { id: 'emp-005', name: 'Camille Leroy', avatarUrl: 'https://placehold.co/100x100.png' },
        ],
        syllabus: [
            { title: 'Matin: Les grands principes', points: ['Lire un bilan', 'Comprendre un compte de résultat'] },
            { title: 'Après-midi: Cas pratiques', points: ['Analyse de la rentabilité d\'un projet'] },
        ],
        skillsToAcquire: ['Comptabilité Générale'],
        status: 'Terminée'
    },
];

export default function PlansFormationPage() {
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

    const getCategoryBadge = (category: Training['category']) => {
        switch (category) {
            case 'Technique': return <Badge variant="secondary">Technique</Badge>;
            case 'Management': return <Badge variant="default" className="bg-purple-600">Management</Badge>;
            case 'Soft Skills': return <Badge variant="outline">Soft Skills</Badge>;
        }
    };

     const getStatusBadge = (status: Training['status']) => {
        switch (status) {
            case 'Planifiée': return <Badge variant="outline">Planifiée</Badge>;
            case 'Terminée': return <Badge className="bg-green-100 text-green-800">Terminée</Badge>;
            case 'Annulée': return <Badge variant="destructive">Annulée</Badge>;
        }
    };

    const handleDateClick = (date: Date | undefined) => {
        if (!date) return;
        const clickedTraining = MOCK_TRAININGS.find(t => format(t.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
        if (clickedTraining) {
            setSelectedTraining(clickedTraining);
        }
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2"><BookOpenCheck /> Plans de Formation</CardTitle>
                    <CardDescription>Consultez le calendrier des formations planifiées et la liste complète.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                         <h3 className="text-lg font-semibold mb-2">Calendrier des Formations</h3>
                         <p className="text-sm text-muted-foreground mb-4">Cliquez sur une date surlignée pour voir les détails de la formation.</p>
                        <div className="flex justify-center">
                             <Calendar
                                mode="single"
                                onDayClick={handleDateClick}
                                className="rounded-md border p-4"
                                locale={fr}
                                modifiers={{ trainings: MOCK_TRAININGS.map(t => t.date) }}
                                modifiersClassNames={{ trainings: 'border-2 border-primary rounded-full cursor-pointer' }}
                            />
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-4">Liste des Formations</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Titre de la Formation</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead className="text-center">Date</TableHead>
                                    <TableHead className="text-center">Statut</TableHead>
                                    <TableHead className="w-[150px] text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_TRAININGS.map(training => (
                                    <TableRow key={training.id} className="odd:bg-muted/50">
                                        <TableCell className="font-medium">{training.title}</TableCell>
                                        <TableCell>{getCategoryBadge(training.category)}</TableCell>
                                        <TableCell className="text-center">{format(training.date, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell className="text-center">{getStatusBadge(training.status)}</TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedTraining(training)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Voir détails
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedTraining} onOpenChange={() => setSelectedTraining(null)}>
                <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{selectedTraining?.title}</DialogTitle>
                        <DialogDescription className="flex items-center gap-4">
                            {selectedTraining && getCategoryBadge(selectedTraining.category)}
                            <span>Durée : {selectedTraining?.duration}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="py-4 space-y-6">
                             <p className="text-sm text-muted-foreground">{selectedTraining?.description}</p>
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><Award className="h-4 w-4 text-primary"/>Compétences à acquérir</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTraining?.skillsToAcquire.map(skill => <Badge key={skill}>{skill}</Badge>)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-primary"/>Participants</h3>
                                <ul className="space-y-2">
                                    {selectedTraining?.participants.map(p => (
                                        <li key={p.id} className="flex items-center gap-3 p-2 border rounded-md">
                                            <Avatar className="h-8 w-8"><AvatarImage src={p.avatarUrl} data-ai-hint="person face" /><AvatarFallback>{p.name.charAt(0)}</AvatarFallback></Avatar>
                                            <span className="text-sm font-medium">{p.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">Programme de la formation</h3>
                                <div className="space-y-3">
                                    {selectedTraining?.syllabus.map(s => (
                                        <div key={s.title}>
                                            <p className="font-medium text-sm">{s.title}</p>
                                            <ul className="list-disc list-inside pl-4 text-sm text-muted-foreground">
                                                {s.points.map(point => <li key={point}>{point}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTraining(null)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
