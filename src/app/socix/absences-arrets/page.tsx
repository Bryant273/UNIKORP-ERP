
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, Fingerprint, Check, X, Clock, UserCheck, UserX, LogOut } from 'lucide-react';
import { format, differenceInMinutes, parse, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type AttendanceStatus = 'Présent' | 'Absent' | 'En Retard' | 'Départ Anticipé' | 'Attente';
type AttendanceLog = {
    id: string;
    employeeName: string;
    status: AttendanceStatus;
    heureArrivee?: string;
    heureDepart?: string;
    heuresTravaillees?: string;
    justification?: string;
};

const MOCK_EMPLOYEES = [
    { id: 'emp-001', name: 'Jean Dupont' },
    { id: 'emp-002', name: 'Sophie Martin' },
    { id: 'emp-003', name: 'David Garcia' },
    { id: 'emp-004', name: 'Lucas Petit' },
    { id: 'emp-005', name: 'Camille Leroy' },
];

// Function to generate a fresh log for a given date
const generateDailyLog = (date: Date): AttendanceLog[] => {
    // To simulate different data per day, we can use the day of the month
    const daySeed = date.getDate();
    return MOCK_EMPLOYEES.map((emp, index) => {
        // Only generate data for past/present days for realism
        if (format(date, 'yyyy-MM-dd') > format(new Date(), 'yyyy-MM-dd')) {
            return { id: emp.id, employeeName: emp.name, status: 'Attente' };
        }
        // Make some employees absent based on a pattern
        if ((daySeed + index) % 5 === 0) {
            return { id: emp.id, employeeName: emp.name, status: 'Absent', justification: 'Congé maladie' };
        }
        return { id: emp.id, employeeName: emp.name, status: 'Attente' };
    });
};

const STANDARD_START_TIME = setMinutes(setHours(new Date(), 9), 0); // 09:00
const STANDARD_END_TIME = setMinutes(setHours(new Date(), 18), 0); // 18:00

export default function PointagePage() {
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [log, setLog] = useState<AttendanceLog[]>([]);
    const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
    const [justificationTarget, setJustificationTarget] = useState<{id: string, name: string} | null>(null);
    const [justificationText, setJustificationText] = useState('');

    useEffect(() => {
        if (date) {
            setLog(generateDailyLog(date));
        }
    }, [date]);

    const isToday = date ? format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false;

    const kpis = useMemo(() => ({
        present: log.filter(l => l.status === 'Présent' || l.status === 'En Retard' || l.status === 'Départ Anticipé').length,
        absent: log.filter(l => l.status === 'Absent').length,
        late: log.filter(l => l.status === 'En Retard').length,
        early: log.filter(l => l.status === 'Départ Anticipé').length,
    }), [log]);

    const handleClockIn = (employeeId: string) => {
        const now = new Date();
        const arrivalTime = format(now, 'HH:mm');
        const isLate = now > STANDARD_START_TIME;
        
        setLog(prevLog => prevLog.map(l =>
            l.id === employeeId ? {
                ...l,
                heureArrivee: arrivalTime,
                status: isLate ? 'En Retard' : 'Présent'
            } : l
        ));
        toast({ title: 'Pointage enregistré', description: `Arrivée de ${log.find(l=>l.id === employeeId)?.employeeName} à ${arrivalTime}.` });
    };

    const handleClockOut = (employeeId: string) => {
        const now = new Date();
        const departureTime = format(now, 'HH:mm');
        const employeeLog = log.find(l => l.id === employeeId);

        if (!employeeLog || !employeeLog.heureArrivee) return;

        const arrivalDate = parse(employeeLog.heureArrivee, 'HH:mm', new Date());
        const departureDate = parse(departureTime, 'HH:mm', new Date());
        const minutesWorked = differenceInMinutes(departureDate, arrivalDate);
        const hours = Math.floor(minutesWorked / 60);
        const minutes = minutesWorked % 60;
        const workedHours = `${hours}h${String(minutes).padStart(2, '0')}`;
        
        const isEarly = now < STANDARD_END_TIME;

        setLog(prevLog => prevLog.map(l =>
            l.id === employeeId ? {
                ...l,
                heureDepart: departureTime,
                heuresTravaillees: workedHours,
                status: (l.status === 'En Retard' || !isEarly) ? l.status : 'Départ Anticipé'
            } : l
        ));
        toast({ title: 'Pointage enregistré', description: `Départ de ${employeeLog.employeeName} à ${departureTime}.` });
    };

    const handleOpenJustificationModal = (employeeId: string, employeeName: string) => {
        setJustificationTarget({ id: employeeId, name: employeeName });
        setIsJustificationModalOpen(true);
    };

    const handleSubmitJustification = (e: React.FormEvent) => {
        e.preventDefault();
        if (!justificationTarget) return;

        setLog(prevLog => prevLog.map(l =>
            l.id === justificationTarget.id ? {
                ...l,
                status: 'Absent',
                justification: justificationText,
                heureArrivee: undefined,
                heureDepart: undefined,
                heuresTravaillees: undefined
            } : l
        ));

        toast({ title: 'Absence justifiée', description: `L'absence de ${justificationTarget.name} a été enregistrée.` });
        setIsJustificationModalOpen(false);
        setJustificationText('');
        setJustificationTarget(null);
    };


    const getStatusBadge = (status: AttendanceStatus) => {
        switch(status) {
            case 'Présent': return <Badge><Check className="mr-1 h-3 w-3"/>Présent</Badge>;
            case 'Absent': return <Badge variant="destructive"><X className="mr-1 h-3 w-3"/>Absent</Badge>;
            case 'En Retard': return <Badge variant="secondary" className="bg-yellow-200 text-yellow-800"><Clock className="mr-1 h-3 w-3"/>En Retard</Badge>;
            case 'Départ Anticipé': return <Badge variant="secondary" className="bg-orange-200 text-orange-800"><LogOut className="mr-1 h-3 w-3"/>Départ Anticipé</Badge>;
            case 'Attente': return <Badge variant="outline">En attente</Badge>;
        }
    }
    
    return (
        <>
        <div className="grid lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2"><Fingerprint /> Suivi du Pointage</CardTitle>
                                <CardDescription>Consultez les présences, absences et retards pour une journée donnée.</CardDescription>
                            </div>
                            <Button disabled><Download className="mr-2 h-4 w-4"/> Exporter l'état</Button>
                        </div>
                    </CardHeader>
                     <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                            <Card><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Présents</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpis.present}</div></CardContent></Card>
                            <Card><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Absents</CardTitle><UserX className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpis.absent}</div></CardContent></Card>
                            <Card><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Retards</CardTitle><Clock className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpis.late}</div></CardContent></Card>
                            <Card><CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">Départs Anticipés</CardTitle><LogOut className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpis.early}</div></CardContent></Card>
                        </div>
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Employé</TableHead>
                                <TableHead className="text-center">Statut du Jour</TableHead>
                                <TableHead className="w-[300px] text-center">Actions de Pointage</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {log.map(l => (
                                    <TableRow key={l.id} className="odd:bg-muted/50">
                                        <TableCell className="font-medium">{l.employeeName}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center">
                                                {getStatusBadge(l.status)}
                                                {l.heureArrivee && (
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {l.heureArrivee} {l.heureDepart && `- ${l.heureDepart}`}
                                                        {l.heuresTravaillees && ` (${l.heuresTravaillees})`}
                                                    </span>
                                                )}
                                                {l.status === 'Absent' && l.justification && (
                                                    <span className="text-xs text-muted-foreground mt-1 italic">"{l.justification}"</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Button size="sm" variant="outline" onClick={() => handleClockIn(l.id)} disabled={!!l.heureArrivee || !isToday}>Arrivée</Button>
                                                <Button size="sm" variant="outline" onClick={() => handleClockOut(l.id)} disabled={!l.heureArrivee || !!l.heureDepart || !isToday}>Départ</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleOpenJustificationModal(l.id, l.employeeName)} disabled={!isToday || !!l.heureArrivee}>
                                                    <X className="mr-1 h-4 w-4"/>
                                                    Absent
                                                </Button>
                                            </div>
                                        </TableCell>
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
                            disabled={(d) => d > new Date()}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>

        <Dialog open={isJustificationModalOpen} onOpenChange={setIsJustificationModalOpen}>
            <DialogContent>
                 <form onSubmit={handleSubmitJustification}>
                    <DialogHeader>
                        <DialogTitle>Justifier l'absence de {justificationTarget?.name}</DialogTitle>
                        <DialogDescription>
                            Veuillez indiquer le motif de l'absence pour la journée du {date ? format(date, 'dd/MM/yyyy') : ''}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="justification">Motif de l'absence</Label>
                        <Textarea 
                            id="justification"
                            value={justificationText}
                            onChange={(e) => setJustificationText(e.target.value)}
                            placeholder="Ex: Congé maladie, absence autorisée..."
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsJustificationModalOpen(false)}>Annuler</Button>
                        <Button type="submit">Enregistrer l'absence</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        </>
    );
}
