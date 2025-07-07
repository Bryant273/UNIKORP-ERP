
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, CalendarDays, Plane, Briefcase, Heart, Building } from 'lucide-react';
import { format, startOfWeek, addDays, getWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

type EventType = 'Congé Payé' | 'Télétravail' | 'Déplacement' | 'Maladie';
type ScheduleEvent = {
    id: string;
    employeeId: string;
    date: string;
    type: EventType;
};

const MOCK_EMPLOYEES = [
    { id: 'emp-001', name: 'Jean Dupont', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-002', name: 'Sophie Martin', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-004', name: 'Lucas Petit', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-005', name: 'Camille Leroy', avatarUrl: 'https://placehold.co/100x100.png' },
];

const MOCK_EVENTS: ScheduleEvent[] = [
    { id: 'evt-1', employeeId: 'emp-001', date: '2024-08-05', type: 'Congé Payé' },
    { id: 'evt-2', employeeId: 'emp-001', date: '2024-08-06', type: 'Congé Payé' },
    { id: 'evt-3', employeeId: 'emp-002', date: '2024-08-07', type: 'Déplacement' },
    { id: 'evt-4', employeeId: 'emp-005', date: '2024-08-08', type: 'Télétravail' },
    { id: 'evt-5', employeeId: 'emp-005', date: '2024-08-09', type: 'Télétravail' },
];

const getEventTypeStyles = (type: EventType) => {
    switch (type) {
        case 'Congé Payé': return { icon: <Plane className="h-4 w-4"/>, color: 'bg-blue-500' };
        case 'Télétravail': return { icon: <Briefcase className="h-4 w-4"/>, color: 'bg-green-500' };
        case 'Déplacement': return { icon: <Building className="h-4 w-4"/>, color: 'bg-purple-500' };
        case 'Maladie': return { icon: <Heart className="h-4 w-4"/>, color: 'bg-red-500' };
    }
};

export default function PlanningEquipePage() {
    const [currentDate, setCurrentDate] = useState(new Date('2024-08-05'));
    
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

    const changeWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => addDays(prev, direction === 'prev' ? -7 : 7));
    };

    return (
        <Card>
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl flex items-center gap-2"><CalendarDays /> Planning de l'Équipe</CardTitle>
                        <CardDescription>Visualisez le planning des absences et présences de vos équipes.</CardDescription>
                    </div>
                     <div className="flex items-center gap-4">
                        <Select defaultValue="all"><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les départements</SelectItem><SelectItem value="IT">IT</SelectItem></SelectContent></Select>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => changeWeek('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="font-semibold text-sm text-center w-36">Semaine {getWeek(currentDate, {weekStartsOn: 1})} - {format(currentDate, 'MMMM yyyy', {locale: fr})}</span>
                            <Button variant="outline" size="icon" onClick={() => changeWeek('next')}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <div className="grid grid-cols-[200px_repeat(7,1fr)]">
                        <div className="p-3 font-semibold border-r border-b">Employé</div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="p-3 text-center border-b">
                                <p className="font-semibold text-sm capitalize">{format(day, 'eee', {locale: fr})}</p>
                                <p className="text-xs text-muted-foreground">{format(day, 'dd')}</p>
                            </div>
                        ))}
                        {MOCK_EMPLOYEES.map(emp => (
                            <React.Fragment key={emp.id}>
                                <div className="p-3 border-r flex items-center gap-3">
                                    <Avatar className="h-8 w-8"><AvatarImage src={emp.avatarUrl} data-ai-hint="person face"/><AvatarFallback>{emp.name.charAt(0)}</AvatarFallback></Avatar>
                                    <span className="text-sm font-medium">{emp.name}</span>
                                </div>
                                {weekDays.map(day => {
                                    const event = MOCK_EVENTS.find(e => e.employeeId === emp.id && e.date === format(day, 'yyyy-MM-dd'));
                                    const styles = event ? getEventTypeStyles(event.type) : null;
                                    return (
                                        <div key={`${emp.id}-${day.toISOString()}`} className="border-l p-2 h-16 flex items-center justify-center">
                                            {event && styles && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center ${styles.color}`}>
                                                                {styles.icon}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>{event.type}</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    )
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                 <div className="flex gap-4 mt-4 text-sm">
                    {Object.entries({ 'Congé Payé': getEventTypeStyles('Congé Payé'), 'Télétravail': getEventTypeStyles('Télétravail'), 'Déplacement': getEventTypeStyles('Déplacement'), 'Maladie': getEventTypeStyles('Maladie') }).map(([type, { color }]) => (
                        <div key={type} className="flex items-center gap-2">
                           <div className={`w-4 h-4 rounded ${color}`}/> <span>{type}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
