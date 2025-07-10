
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Clock, Coffee, Moon, Sun } from 'lucide-react';
import { addDays, format, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Mock Data
const teams = [
    { id: 'equipe-a', name: 'Équipe A' },
    { id: 'equipe-b', name: 'Équipe B' },
    { id: 'equipe-c', name: 'Équipe C' },
];

const shifts = {
    matin: { label: 'Matin (6h-14h)', icon: <Sun className="h-4 w-4 text-yellow-500"/> },
    aprem: { label: 'Après-midi (14h-22h)', icon: <Coffee className="h-4 w-4 text-orange-500"/> },
    nuit: { label: 'Nuit (22h-6h)', icon: <Moon className="h-4 w-4 text-blue-500"/> },
    repos: { label: 'Repos', icon: null },
};

const generateSchedule = (weekStart: Date, teamId: string) => {
    const day = weekStart.getDate();
    let pattern;
    switch(teamId) {
        case 'equipe-a': pattern = ['matin', 'matin', 'matin', 'aprem', 'aprem', 'repos', 'repos']; break;
        case 'equipe-b': pattern = ['repos', 'repos', 'matin', 'matin', 'matin', 'aprem', 'aprem']; break;
        case 'equipe-c': pattern = ['aprem', 'aprem', 'repos', 'repos', 'matin', 'matin', 'matin']; break;
        default: pattern = Array(7).fill('repos');
    }
    // Rotate pattern based on day to simulate change over time
    const rotatedPattern = [...pattern.slice((day % 7)), ...pattern.slice(0, (day % 7))];
    return rotatedPattern;
};


export default function AlternanceEquipesPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedTeam, setSelectedTeam] = useState('all');

    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

    const changeWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => addDays(prev, direction === 'prev' ? -7 : 7));
    };

    const filteredTeams = selectedTeam === 'all' ? teams : teams.filter(t => t.id === selectedTeam);

    return (
        <Card className="w-full">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Alternance des Équipes</CardTitle>
                        <CardDescription>Gérez les plannings rotatifs, cycles de travail et horaires décalés.</CardDescription>
                    </div>
                 </div>
                 <div className="flex items-center justify-between pt-4">
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Toutes les équipes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les équipes</SelectItem>
                            {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => changeWeek('prev')}><ChevronLeft className="h-4 w-4 mr-1"/> Sem. Précédente</Button>
                        <span className="font-semibold text-sm text-center w-40">
                            {format(startOfCurrentWeek, 'dd MMM', {locale: fr})} - {format(addDays(startOfCurrentWeek, 6), 'dd MMM yyyy', {locale: fr})}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => changeWeek('next')}>Sem. Suivante <ChevronRight className="h-4 w-4 ml-1"/></Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Équipe</TableHead>
                                {weekDays.map(day => (
                                    <TableHead key={day.toISOString()} className="text-center capitalize">
                                        {format(day, 'eee dd/MM', {locale: fr})}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTeams.map(team => {
                                const schedule = generateSchedule(startOfCurrentWeek, team.id);
                                return (
                                <TableRow key={team.id}>
                                    <TableCell className="font-semibold">{team.name}</TableCell>
                                    {schedule.map((shiftKey, index) => {
                                        const shift = shifts[shiftKey as keyof typeof shifts];
                                        return (
                                            <TableCell key={`${team.id}-${index}`} className={cn("text-center", shift.label === 'Repos' && "bg-muted/50")}>
                                                <div className="flex items-center justify-center gap-2">
                                                    {shift.icon}
                                                    <span className="text-xs">{shift.label}</span>
                                                </div>
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
                 <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <Card><CardHeader><CardTitle className="text-base">Heures Supplémentaires (Semaine)</CardTitle><CardDescription>Total: <span className="font-bold">24 heures</span></CardDescription></CardHeader></Card>
                    <Card><CardHeader><CardTitle className="text-base">Congés & RTT Posés</CardTitle><CardDescription>Total: <span className="font-bold">5 jours</span></CardDescription></CardHeader></Card>
                    <Card><CardHeader><CardTitle className="text-base">Compétences Disponibles</CardTitle><CardDescription><Badge>Opérateur Qualifié</Badge> <Badge>Maintenance N2</Badge></CardDescription></CardHeader></Card>
                 </div>
            </CardContent>
        </Card>
    );
}
