
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, Fingerprint, Check, X, Clock, UserCheck, UserX, UserClock, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type AttendanceStatus = 'Présent' | 'Absent' | 'En Retard' | 'Départ Anticipé';
type AttendanceLog = {
    id: string;
    employeeName: string;
    status: AttendanceStatus;
    heureArrivee?: string;
    heureDepart?: string;
    heuresTravaillees?: string;
};

const MOCK_ATTENDANCE_LOG: AttendanceLog[] = [
    { id: 'emp-001', employeeName: 'Jean Dupont', status: 'Présent', heureArrivee: '08:55', heureDepart: '18:05', heuresTravaillees: '8h10' },
    { id: 'emp-002', employeeName: 'Sophie Martin', status: 'En Retard', heureArrivee: '09:15', heureDepart: '18:00', heuresTravaillees: '7h45' },
    { id: 'emp-003', employeeName: 'David Garcia', status: 'Absent', },
    { id: 'emp-004', employeeName: 'Lucas Petit', status: 'Présent', heureArrivee: '08:48', heureDepart: '18:02', heuresTravaillees: '8h14' },
    { id: 'emp-005', employeeName: 'Camille Leroy', status: 'Départ Anticipé', heureArrivee: '09:00', heureDepart: '16:30', heuresTravaillees: '6h30' },
];

export default function PointagePage() {
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [log, setLog] = useState(MOCK_ATTENDANCE_LOG);
    
    const kpis = {
        present: log.filter(l => l.status === 'Présent' || l.status === 'En Retard' || l.status === 'Départ Anticipé').length,
        absent: log.filter(l => l.status === 'Absent').length,
        late: log.filter(l => l.status === 'En Retard').length,
        early: log.filter(l => l.status === 'Départ Anticipé').length,
    }

    const getStatusBadge = (status: AttendanceStatus) => {
        switch(status) {
            case 'Présent': return <Badge><Check className="mr-1 h-3 w-3"/>Présent</Badge>;
            case 'Absent': return <Badge variant="destructive"><X className="mr-1 h-3 w-3"/>Absent</Badge>;
            case 'En Retard': return <Badge variant="secondary" className="bg-yellow-200 text-yellow-800"><Clock className="mr-1 h-3 w-3"/>En Retard</Badge>;
            case 'Départ Anticipé': return <Badge variant="secondary" className="bg-orange-200 text-orange-800"><LogOut className="mr-1 h-3 w-3"/>Départ Anticipé</Badge>;
        }
    }
    
    return (
        <div className="grid lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2"><Fingerprint /> Suivi du Pointage</CardTitle>
                                <CardDescription>Consultez les présences, absences et retards pour une journée donnée.</CardDescription>
                            </div>
                            <Button><Download className="mr-2 h-4 w-4"/> Exporter l'état</Button>
                        </div>
                    </CardHeader>
                     <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                            <Card><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Présents</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpis.present}</div></CardContent></Card>
                            <Card><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Absents</CardTitle><UserX className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpis.absent}</div></CardContent></Card>
                            <Card><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Retards</CardTitle><UserClock className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpis.late}</div></CardContent></Card>
                            <Card><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Départs Anticipés</CardTitle><LogOut className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpis.early}</div></CardContent></Card>
                        </div>
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Employé</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center">Heure d'arrivée</TableHead>
                                <TableHead className="text-center">Heure de départ</TableHead>
                                <TableHead className="text-center">Heures travaillées</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {log.map(l => (
                                    <TableRow key={l.id}>
                                        <TableCell className="font-medium">{l.employeeName}</TableCell>
                                        <TableCell className="text-center">{getStatusBadge(l.status)}</TableCell>
                                        <TableCell className="text-center">{l.heureArrivee || '---'}</TableCell>
                                        <TableCell className="text-center">{l.heureDepart || '---'}</TableCell>
                                        <TableCell className="text-center">{l.heuresTravaillees || '---'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </CardContent>
                </Card>
            </div>
             <div className="lg:sticky lg:top-24">
                 <Card>
                    <CardHeader><CardTitle className="text-base">Sélectionner une date</CardTitle></CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            locale={fr}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
