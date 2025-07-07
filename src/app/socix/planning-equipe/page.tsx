
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, CalendarDays, Plane, Briefcase, Heart, Building, PlusCircle } from 'lucide-react';
import { format, startOfWeek, addDays, getWeek, startOfMonth, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';

type EventType = 'Congé Payé' | 'Télétravail' | 'Déplacement' | 'Maladie' | 'Formation';
type ScheduleEvent = {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD
    type: EventType;
};

const MOCK_EMPLOYEES = [
    { id: 'emp-001', name: 'Jean Dupont', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-002', name: 'Sophie Martin', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-004', name: 'Lucas Petit', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-005', name: 'Camille Leroy', avatarUrl: 'https://placehold.co/100x100.png' },
];

// More extensive mock data for a monthly view
const initialEvents: ScheduleEvent[] = [
    { id: 'evt-1', employeeId: 'emp-001', date: '2024-08-05', type: 'Congé Payé' },
    { id: 'evt-2', employeeId: 'emp-001', date: '2024-08-06', type: 'Congé Payé' },
    { id: 'evt-3', employeeId: 'emp-002', date: '2024-08-07', type: 'Déplacement' },
    { id: 'evt-4', employeeId: 'emp-005', date: '2024-08-08', type: 'Télétravail' },
    { id: 'evt-5', employeeId: 'emp-005', date: '2024-08-09', type: 'Télétravail' },
    { id: 'evt-6', employeeId: 'emp-004', date: '2024-08-12', type: 'Maladie' },
    { id: 'evt-7', employeeId: 'emp-004', date: '2024-08-13', type: 'Maladie' },
    { id: 'evt-8', employeeId: 'emp-001', date: '2024-08-20', type: 'Formation' },
    { id: 'evt-9', employeeId: 'emp-002', date: '2024-08-20', type: 'Formation' },
];

const getEventTypeStyles = (type: EventType) => {
    switch (type) {
        case 'Congé Payé': return { icon: <Plane className="h-4 w-4"/>, color: 'bg-blue-500' };
        case 'Télétravail': return { icon: <Briefcase className="h-4 w-4"/>, color: 'bg-green-500' };
        case 'Déplacement': return { icon: <Building className="h-4 w-4"/>, color: 'bg-purple-500' };
        case 'Maladie': return { icon: <Heart className="h-4 w-4"/>, color: 'bg-red-500' };
        case 'Formation': return { icon: <Briefcase className="h-4 w-4" />, color: 'bg-yellow-500' };
    }
};

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2000, i), 'MMMM', { locale: fr }),
}));

export default function PlanningEquipePage() {
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

    const changeWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => addDays(prev, direction === 'prev' ? -7 : 7));
    };

    const handleMonthChange = (monthIndex: number) => {
        setCurrentDate(prev => startOfWeek(setMonth(prev, monthIndex), { weekStartsOn: 1 }));
    };

    const handleYearChange = (year: number) => {
        setCurrentDate(prev => startOfWeek(setYear(prev, year), { weekStartsOn: 1 }));
    };
    
    const handleAddEvent = (employeeId: string, type: EventType, range: DateRange) => {
        if (!range.from || !range.to) {
            toast({ title: 'Erreur', description: 'Veuillez sélectionner une plage de dates.', variant: 'destructive'});
            return;
        }

        const newEvents: ScheduleEvent[] = [];
        let currentDate = range.from;
        while (currentDate <= range.to) {
            newEvents.push({
                id: `evt-${Math.random()}`,
                employeeId,
                type,
                date: format(currentDate, 'yyyy-MM-dd')
            });
            currentDate = addDays(currentDate, 1);
        }
        setEvents(prev => [...prev, ...newEvents]);
        toast({ title: 'Événement ajouté', description: `Le planning de ${MOCK_EMPLOYEES.find(e => e.id === employeeId)?.name} a été mis à jour.`});
        setIsModalOpen(false);
    };

    return (
        <>
            <Card>
                <CardHeader>
                     <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><CalendarDays /> Planning Mensuel</CardTitle>
                            <CardDescription>Planifiez les activités de l'équipe et consultez le planning par semaine.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                             <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                                 <PlusCircle className="mr-2 h-4 w-4"/>
                                 Ajouter au planning
                             </Button>
                         </div>
                    </div>
                     <div className="flex items-center justify-between mt-4">
                        <Select value={String(getMonth(currentDate))} onValueChange={(v) => handleMonthChange(Number(v))}>
                            <SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger>
                            <SelectContent>{MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={String(getYear(currentDate))} onValueChange={(v) => handleYearChange(Number(v))}>
                             <SelectTrigger className="w-[120px]"><SelectValue/></SelectTrigger>
                            <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                        <div className="flex-1"/>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Aujourd'hui</Button>
                            <Button variant="outline" size="icon" onClick={() => changeWeek('prev')}><ChevronLeft className="h-4 w-4" /></Button>
                            <span className="font-semibold text-sm text-center w-36">Semaine {getWeek(currentDate, {weekStartsOn: 1})}</span>
                            <Button variant="outline" size="icon" onClick={() => changeWeek('next')}><ChevronRight className="h-4 w-4" /></Button>
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
                                        const event = events.find(e => e.employeeId === emp.id && e.date === format(day, 'yyyy-MM-dd'));
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
                     <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        {Object.entries({ 
                            'Congé Payé': getEventTypeStyles('Congé Payé'), 
                            'Télétravail': getEventTypeStyles('Télétravail'), 
                            'Déplacement': getEventTypeStyles('Déplacement'), 
                            'Maladie': getEventTypeStyles('Maladie'),
                            'Formation': getEventTypeStyles('Formation'),
                        }).map(([type, { color }]) => (
                            <div key={type} className="flex items-center gap-2">
                               <div className={`w-4 h-4 rounded ${color}`}/> <span>{type}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <PlanningModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddEvent} />
        </>
    );
}


function PlanningModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (employeeId: string, type: EventType, range: DateRange) => void }) {
    const [employeeId, setEmployeeId] = useState('');
    const [type, setType] = useState<EventType>('Congé Payé');
    const [range, setRange] = useState<DateRange | undefined>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (employeeId && type && range) {
            onSave(employeeId, type, range);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader><DialogTitle>Planifier un événement</DialogTitle><DialogDescription>Ajoutez un événement pour un employé sur une ou plusieurs journées.</DialogDescription></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2"><Label htmlFor="employee">Employé</Label><Select name="employee" onValueChange={setEmployeeId}><SelectTrigger><SelectValue placeholder="Sélectionnez un employé..." /></SelectTrigger><SelectContent>{MOCK_EMPLOYEES.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label htmlFor="type">Type d'événement</Label><Select name="type" onValueChange={(v: EventType) => setType(v)}><SelectTrigger><SelectValue placeholder="Sélectionnez un type..." /></SelectTrigger><SelectContent>{['Congé Payé', 'Télétravail', 'Déplacement', 'Maladie', 'Formation'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                        <div className="space-y-2"><Label>Période</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarDays className="mr-2 h-4 w-4" />
                                        {range?.from ? (
                                            range.to ? `${format(range.from, 'dd LLL yyyy', {locale: fr})} - ${format(range.to, 'dd LLL yyyy', {locale: fr})}` : format(range.from, 'dd LLL yyyy', {locale: fr})
                                        ) : (
                                            'Sélectionnez une plage de dates'
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} locale={fr} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Annuler</Button><Button type="submit">Ajouter au planning</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
