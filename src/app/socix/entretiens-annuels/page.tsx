
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Eye, Calendar, CalendarCheck, ClipboardPaste } from 'lucide-react';
import { format } from 'date-fns';

// --- MOCK DATA & TYPES ---
type InterviewStatus = 'Planifié' | 'En cours' | 'Effectué';
type Interview = {
    id: string;
    employeeName: string;
    managerName: string;
    date: string;
    status: InterviewStatus;
    period: string;
    finalScore?: number;
};

const initialInterviews: Interview[] = [
    { id: 'int-1', employeeName: 'Jean Dupont', managerName: 'Marc Lefebvre', date: '2024-09-10', status: 'Planifié', period: 'Annuel 2024' },
    { id: 'int-2', employeeName: 'Sophie Martin', managerName: 'Isabelle Rossi', date: '2024-09-12', status: 'Planifié', period: 'Annuel 2024' },
    { id: 'int-3', employeeName: 'Lucas Petit', managerName: 'Jean Dupont', date: '2024-08-25', status: 'En cours', period: 'Semestriel S2 2024' },
    { id: 'int-4', employeeName: 'David Garcia', managerName: 'Awa Diallo', date: '2024-02-15', status: 'Effectué', period: 'Annuel 2023', finalScore: 88 },
    { id: 'int-5', employeeName: 'Camille Leroy', managerName: 'Elodie Dubois', date: '2024-02-20', status: 'Effectué', period: 'Annuel 2023', finalScore: 92 },
];

export default function EntretiensAnnuelsPage() {
    const [interviews] = useState(initialInterviews);

    const getStatusBadge = (status: InterviewStatus) => {
        switch (status) {
            case 'Planifié': return <Badge variant="outline">Planifié</Badge>;
            case 'En cours': return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
            case 'Effectué': return <Badge className="bg-green-100 text-green-800">Effectué</Badge>;
        }
    };
    
    const renderTable = (data: Interview[]) => {
        if (data.length === 0) {
            return <div className="text-center py-16 border-2 border-dashed rounded-lg"><p className="text-muted-foreground">Aucun entretien dans cette catégorie.</p></div>;
        }
        return (
            <Table>
                <TableHeader><TableRow><TableHead>Employé</TableHead><TableHead>Manager</TableHead><TableHead className="text-center">Date</TableHead><TableHead className="text-center">Période</TableHead><TableHead className="text-center">Score Final</TableHead><TableHead className="text-center">Statut</TableHead></TableRow></TableHeader>
                <TableBody>
                    {data.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.employeeName}</TableCell>
                            <TableCell>{item.managerName}</TableCell>
                            <TableCell className="text-center">{item.date}</TableCell>
                            <TableCell className="text-center">{item.period}</TableCell>
                            <TableCell className="text-center">{item.finalScore ? <Badge variant="default">{item.finalScore}/100</Badge> : '---'}</TableCell>
                            <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <Tabs defaultValue="planning">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl flex items-center gap-2"><CalendarCheck /> Entretiens Annuels</CardTitle>
                        <CardDescription>Planifiez, suivez et archivez les entretiens de performance.</CardDescription>
                    </div>
                </div>
                 <TabsList className="grid w-full grid-cols-3 mt-4">
                    <TabsTrigger value="planning"><Calendar className="mr-2 h-4 w-4"/>Planification</TabsTrigger>
                    <TabsTrigger value="scoring"><ClipboardPaste className="mr-2 h-4 w-4"/>Attribution des notes</TabsTrigger>
                    <TabsTrigger value="history"><Eye className="mr-2 h-4 w-4"/>Historique</TabsTrigger>
                </TabsList>
            </CardHeader>

            <TabsContent value="planning">
                <Card className="border-t-0 rounded-t-none">
                     <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Entretiens Planifiés</CardTitle>
                            <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Planifier un entretien</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {renderTable(interviews.filter(i => i.status === 'Planifié'))}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="scoring">
                <Card className="border-t-0 rounded-t-none">
                    <CardHeader>
                        <CardTitle className="text-lg">Entretiens à Noter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderTable(interviews.filter(i => i.status === 'En cours'))}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="history">
                 <Card className="border-t-0 rounded-t-none">
                     <CardHeader>
                        <CardTitle className="text-lg">Entretiens Effectués</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderTable(interviews.filter(i => i.status === 'Effectué'))}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

