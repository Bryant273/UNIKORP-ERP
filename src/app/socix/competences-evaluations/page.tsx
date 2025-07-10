
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Eye, Star, ClipboardList, ClipboardCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- MOCK DATA & TYPES ---

type Skill = {
    id: string;
    name: string;
    category: 'Technique' | 'Comportementale' | 'Langue';
    employeeCount: number;
};

const MOCK_SKILLS: Skill[] = [
    { id: 'sk-1', name: 'React.js & Next.js', category: 'Technique', employeeCount: 5 },
    { id: 'sk-2', name: 'Gestion de Projet Agile', category: 'Comportementale', employeeCount: 8 },
    { id: 'sk-3', name: 'Anglais (C1)', category: 'Langue', employeeCount: 12 },
    { id: 'sk-4', name: 'Analyse Financière', category: 'Technique', employeeCount: 3 },
    { id: 'sk-5', name: 'Leadership', category: 'Comportementale', employeeCount: 6 },
];

type EmployeeSkill = {
    employeeId: string;
    employeeName: string;
    employeeAvatar: string;
    score: number;
};

const MOCK_EMPLOYEE_SKILLS: Record<string, EmployeeSkill[]> = {
    'sk-1': [
        { employeeId: 'emp-001', employeeName: 'Jean Dupont', employeeAvatar: 'https://placehold.co/100x100.png', score: 95 },
        { employeeId: 'emp-004', employeeName: 'Lucas Petit', employeeAvatar: 'https://placehold.co/100x100.png', score: 80 },
    ],
    'sk-3': [
        { employeeId: 'emp-002', employeeName: 'Sophie Martin', employeeAvatar: 'https://placehold.co/100x100.png', score: 92 },
        { employeeId: 'emp-005', employeeName: 'Camille Leroy', employeeAvatar: 'https://placehold.co/100x100.png', score: 88 },
    ]
};

type EvaluationStatus = 'Planifiée' | 'Terminée';
type Evaluation = {
    id: string;
    title: string;
    skillId: string;
    skillName: string;
    date: string;
    participantCount: number;
    status: EvaluationStatus;
};

const MOCK_EVALUATIONS: Evaluation[] = [
    { id: 'eval-1', title: 'Évaluation React Q3', skillId: 'sk-1', skillName: 'React.js & Next.js', date: '2024-09-15', participantCount: 5, status: 'Planifiée' },
    { id: 'eval-2', title: 'Test d\'Anglais général', skillId: 'sk-3', skillName: 'Anglais (C1)', date: '2024-06-20', participantCount: 10, status: 'Terminée' },
    { id: 'eval-3', title: 'Certification Agile', skillId: 'sk-2', skillName: 'Gestion de Projet Agile', date: '2024-10-01', participantCount: 8, status: 'Planifiée' },
];

export default function CompetencesEvaluationsPage() {
    const [viewingSkill, setViewingSkill] = useState<Skill | null>(null);

    const getCategoryBadge = (category: Skill['category']) => {
        switch (category) {
            case 'Technique': return <Badge variant="secondary">Technique</Badge>;
            case 'Comportementale': return <Badge variant="default" className="bg-purple-600">Comportementale</Badge>;
            case 'Langue': return <Badge variant="outline">Langue</Badge>;
        }
    };

    return (
        <>
            <Tabs defaultValue="skills">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Star /> Compétences & Évaluations</CardTitle>
                            <CardDescription>Suivez les compétences acquises et gérez les évaluations de performance.</CardDescription>
                        </div>
                    </div>
                    <TabsList className="grid w-full grid-cols-2 mt-4">
                        <TabsTrigger value="skills"><ClipboardList className="mr-2 h-4 w-4"/> Référentiel de Compétences</TabsTrigger>
                        <TabsTrigger value="evaluations"><ClipboardCheck className="mr-2 h-4 w-4"/> Sessions d'Évaluation</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <TabsContent value="skills">
                    <Card className="border-t-0 rounded-t-none">
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader><TableRow><TableHead>Compétence</TableHead><TableHead>Catégorie</TableHead><TableHead className="text-center">Employés Compétents</TableHead><TableHead className="w-[120px] text-center">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {MOCK_SKILLS.map(skill => (
                                        <TableRow key={skill.id}>
                                            <TableCell className="font-medium">{skill.name}</TableCell>
                                            <TableCell>{getCategoryBadge(skill.category)}</TableCell>
                                            <TableCell className="text-center">{skill.employeeCount}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" onClick={() => setViewingSkill(skill)}><Eye className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="evaluations">
                    <Card className="border-t-0 rounded-t-none">
                         <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Évaluations Planifiées et Passées</CardTitle>
                                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Planifier une évaluation</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Titre de l'évaluation</TableHead><TableHead>Compétence Associée</TableHead><TableHead className="text-center">Date</TableHead><TableHead className="text-center">Participants</TableHead><TableHead className="text-center">Statut</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {MOCK_EVALUATIONS.map(ev => (
                                        <TableRow key={ev.id}>
                                            <TableCell className="font-medium">{ev.title}</TableCell>
                                            <TableCell>{ev.skillName}</TableCell>
                                            <TableCell className="text-center">{ev.date}</TableCell>
                                            <TableCell className="text-center">{ev.participantCount}</TableCell>
                                            <TableCell className="text-center"><Badge variant={ev.status === 'Terminée' ? 'default' : 'outline'}>{ev.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Dialog open={!!viewingSkill} onOpenChange={() => setViewingSkill(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Employés maîtrisant : {viewingSkill?.name}</DialogTitle>
                        <DialogDescription>Liste des employés et leur score d'évaluation pour cette compétence.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ul className="space-y-3">
                            {(MOCK_EMPLOYEE_SKILLS[viewingSkill?.id || ''] || []).map(empSkill => (
                                <li key={empSkill.employeeId} className="flex items-center justify-between p-2 rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10"><AvatarImage src={empSkill.employeeAvatar} data-ai-hint="person face" /><AvatarFallback>{empSkill.employeeName.charAt(0)}</AvatarFallback></Avatar>
                                        <span className="font-medium">{empSkill.employeeName}</span>
                                    </div>
                                    <Badge>Score: {empSkill.score}/100</Badge>
                                </li>
                            ))}
                             {(MOCK_EMPLOYEE_SKILLS[viewingSkill?.id || ''] || []).length === 0 && <p className="text-center text-muted-foreground py-4">Aucun employé évalué pour cette compétence.</p>}
                        </ul>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setViewingSkill(null)}>Fermer</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

