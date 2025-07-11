
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon, Mail, Newspaper, MessageSquare } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- TYPES & MOCK DATA ---
type EventType = 'Blog' | 'LinkedIn' | 'Newsletter';
type CalendarEvent = {
  id: string;
  date: Date;
  title: string;
  type: EventType;
};

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'evt-1', date: new Date(2024, 7, 5), title: 'Article: Top 5 des stratégies CRM', type: 'Blog' },
  { id: 'evt-2', date: new Date(2024, 7, 7), title: 'Infographie: Le parcours client', type: 'LinkedIn' },
  { id: 'evt-3', date: new Date(2024, 7, 12), title: 'Newsletter d\'août', type: 'Newsletter' },
  { id: 'evt-4', date: new Date(2024, 7, 19), title: 'Article: Automatiser ses relances', type: 'Blog' },
  { id: 'evt-5', date: new Date(2024, 7, 22), title: 'Vidéo: Démo de la nouvelle feature', type: 'LinkedIn' },
  { id: 'evt-6', date: new Date(2024, 6, 28), title: 'Newsletter de juillet', type: 'Newsletter' },
];

const getEventTypeStyles = (type: EventType) => {
    switch (type) {
        case 'Blog': return { icon: <Newspaper className="h-3 w-3"/>, color: 'bg-blue-500 text-white' };
        case 'LinkedIn': return { icon: <MessageSquare className="h-3 w-3"/>, color: 'bg-sky-500 text-white' };
        case 'Newsletter': return { icon: <Mail className="h-3 w-3"/>, color: 'bg-purple-500 text-white' };
    }
};

export default function CalendrierEditorialPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const { toast } = useToast();

    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const weekDays = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    
    // Helper function to get the end of the week
    function endOfWeek(date: Date, options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 }) {
        const weekStartsOn = options?.weekStartsOn || 0;
        const day = date.getDay();
        const diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + diff);
        return endDate;
    }

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><CalendarIcon /> Calendrier Éditorial</CardTitle>
                            <CardDescription>Planifiez et visualisez vos publications de contenu marketing.</CardDescription>
                        </div>
                        <Button onClick={() => toast({title: "Fonctionnalité à venir"})}><PlusCircle className="mr-2 h-4 w-4" /> Planifier une publication</Button>
                    </div>
                     <div className="flex items-center justify-center gap-4 mt-6">
                        <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                        <h3 className="text-xl font-semibold w-48 text-center capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                        </h3>
                        <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 border-t border-l rounded-lg">
                        {weekDays.map(day => <div key={day} className="p-2 text-center font-semibold text-sm border-b border-r capitalize">{day}</div>)}
                        {days.map(day => {
                            const eventsOnDay = MOCK_EVENTS.filter(e => isSameDay(e.date, day));
                            return (
                                <div key={day.toISOString()} className={cn(
                                    "h-32 border-b border-r p-2 flex flex-col",
                                    !isSameMonth(day, currentMonth) && "bg-muted/50 text-muted-foreground"
                                )}>
                                    <span className="font-semibold text-xs">{format(day, 'd')}</span>
                                    <div className="flex-1 overflow-y-auto space-y-1 mt-1">
                                    {eventsOnDay.map(event => {
                                        const styles = getEventTypeStyles(event.type);
                                        return (
                                            <div
                                                key={event.id}
                                                className={`p-1 rounded-md text-xs cursor-pointer ${styles.color}`}
                                                onClick={() => setSelectedEvent(event)}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {styles.icon}
                                                    <span className="truncate">{event.title}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                         <DialogDescription>
                            Publication de type <Badge variant="secondary">{selectedEvent?.type}</Badge> prévue le {selectedEvent && format(selectedEvent.date, 'dd MMMM yyyy', {locale: fr})}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Détails de la publication ici...</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
