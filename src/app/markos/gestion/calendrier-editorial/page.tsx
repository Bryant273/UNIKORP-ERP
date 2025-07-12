
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon, Mail, Newspaper, MessageSquare, Download, Mic, Video, Presentation, BarChart, Image as ImageIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// --- TYPES & MOCK DATA ---
type EventType = 'Article' | 'Blog' | 'LinkedIn' | 'Newsletter' | 'Webinaire' | 'Podcast' | 'Vidéo' | 'Infographie';
type Channel = 'LinkedIn' | 'Facebook' | 'Blog' | 'Instagram' | 'Twitter';
type CalendarEvent = {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: EventType;
  channels?: Channel[];
  visualUrl?: string;
};

const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'evt-1', date: new Date(2024, 7, 5), title: 'Article: Top 5 des stratégies CRM', description: "Un article de fond analysant les 5 meilleures stratégies de CRM pour les PME en 2024.", type: 'Article', channels: ['Blog', 'LinkedIn'] },
  { id: 'evt-2', date: new Date(2024, 7, 7), title: 'Infographie: Le parcours client', description: "Visualisation complète du parcours client moderne, de la découverte à la fidélisation.", type: 'Infographie', channels: ['LinkedIn', 'Twitter'], visualUrl: 'https://placehold.co/600x800.png' },
  { id: 'evt-3', date: new Date(2024, 7, 12), title: 'Newsletter d\'août', description: "Newsletter mensuelle avec les actualités de l'entreprise, les promotions et un aperçu des nouveautés.", type: 'Newsletter', channels: [] },
  { id: 'evt-4', date: new Date(2024, 7, 19), title: 'Article: Automatiser ses relances', description: "Guide pratique pour automatiser les relances clients et améliorer la trésorerie.", type: 'Article', channels: ['Blog'] },
  { id: 'evt-5', date: new Date(2024, 7, 22), title: 'Vidéo: Démo de la nouvelle feature', description: "Courte vidéo de démonstration de la nouvelle fonctionnalité de reporting analytique.", type: 'Vidéo', channels: ['LinkedIn'], visualUrl: 'https://placehold.co/1280x720.png' },
  { id: 'evt-6', date: new Date(2024, 6, 28), title: 'Newsletter de juillet', description: "Bilan du premier semestre et annonce des objectifs du S2.", type: 'Newsletter', channels: [] },
  { id: 'evt-7', date: new Date(2024, 7, 15), title: 'Webinaire: Le futur du CRM', description: "Session en direct avec des experts sur les tendances futures du CRM et de l'IA.", type: 'Webinaire', channels: ['LinkedIn', 'Facebook'] },
];

const eventTypes: EventType[] = ['Article', 'Blog', 'LinkedIn', 'Newsletter', 'Webinaire', 'Podcast', 'Vidéo', 'Infographie'];

const getEventTypeStyles = (type: EventType) => {
    switch (type) {
        case 'Article': return { icon: <Newspaper className="h-3 w-3"/>, color: 'bg-blue-500 text-white' };
        case 'Blog': return { icon: <Newspaper className="h-3 w-3"/>, color: 'bg-blue-600 text-white' };
        case 'LinkedIn': return { icon: <MessageSquare className="h-3 w-3"/>, color: 'bg-sky-500 text-white' };
        case 'Newsletter': return { icon: <Mail className="h-3 w-3"/>, color: 'bg-purple-500 text-white' };
        case 'Webinaire': return { icon: <Presentation className="h-3 w-3"/>, color: 'bg-teal-500 text-white' };
        case 'Podcast': return { icon: <Mic className="h-3 w-3"/>, color: 'bg-orange-500 text-white' };
        case 'Vidéo': return { icon: <Video className="h-3 w-3"/>, color: 'bg-red-500 text-white' };
        case 'Infographie': return { icon: <BarChart className="h-3 w-3"/>, color: 'bg-indigo-500 text-white' };
    }
};

export default function CalendrierEditorialPage() {
    const [events, setEvents] = useState(MOCK_EVENTS);
    const [currentMonth, setCurrentMonth] = useState(new Date(2024, 7, 1));
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const { toast } = useToast();

    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const weekDays = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    
    const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        const newEvent: CalendarEvent = { id: `evt-${Date.now()}`, ...eventData };
        setEvents(prev => [...prev, newEvent].sort((a,b) => a.date.getTime() - b.date.getTime()));
        setIsPlanningModalOpen(false);
        toast({ title: 'Publication planifiée', description: `"${eventData.title}" a été ajouté au calendrier.`});
    };

    const handleExportPDF = (range: DateRange | undefined) => {
        if (!range?.from || !range?.to) {
            toast({ title: 'Erreur', description: 'Veuillez sélectionner une plage de dates valide.', variant: 'destructive' });
            return;
        }

        const doc = new jsPDF();
        const companyName = "UNIKORP";
        const userName = "Utilisateur Unikorp";
        const moduleName = "MARKOS";
        const printDateTime = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        const periodString = `${format(range.from, 'dd/MM/yyyy')} au ${format(range.to, 'dd/MM/yyyy')}`;
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        
        autoTable(doc, {
            head: [['Date', 'Type', 'Titre de la Publication']],
            body: events
                .filter(e => e.date >= range.from! && e.date <= range.to!)
                .map(e => [format(e.date, 'dd/MM/yyyy'), e.type, e.title]),
            startY: 50,
            theme: 'striped',
            headStyles: { fillColor: '#1e3a8a' },
            didDrawPage: (data) => {
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
                doc.setDrawColor(220);
                doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
                
                doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
                
                doc.setFontSize(14);
                doc.setTextColor(40, 40, 40);
                doc.setFont('helvetica', 'bold');
                doc.text(companyName, data.settings.margin.left + 15, 28);
                
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100);
                const rightX = doc.internal.pageSize.width - data.settings.margin.right;
                doc.text(`État : Calendrier Éditorial`, rightX, 25, { align: 'right' });
                doc.text(`Période : ${periodString}`, rightX, 30, { align: 'right' });
                doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
                doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
            },
            margin: { top: 50 },
        });

        doc.save(`calendrier_editorial_${format(new Date(), 'yyyyMMdd')}.pdf`);
        toast({ title: "Exportation PDF réussie" });
        setIsExportModalOpen(false);
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><CalendarIcon /> Calendrier Éditorial</CardTitle>
                            <CardDescription>Planifiez et visualisez vos publications de contenu marketing.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setIsExportModalOpen(true)}><Download className="mr-2 h-4 w-4" /> Exporter</Button>
                            <Button onClick={() => setIsPlanningModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Planifier une publication</Button>
                        </div>
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
                            const eventsOnDay = events.filter(e => isSameDay(e.date, day));
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
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                         <DialogDescription>
                            Publication de type <Badge variant="secondary">{selectedEvent?.type}</Badge> prévue le {selectedEvent && format(selectedEvent.date, 'dd MMMM yyyy', {locale: fr})}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label className="text-sm font-semibold">Description</Label>
                            <p className="text-sm text-muted-foreground">{selectedEvent?.description || "Aucune description."}</p>
                        </div>
                        <Separator/>
                         <div>
                            <Label className="text-sm font-semibold">Canaux</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {selectedEvent?.channels && selectedEvent.channels.length > 0 ? (
                                    selectedEvent.channels.map(channel => <Badge key={channel} variant="outline">{channel}</Badge>)
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucun canal spécifié.</p>
                                )}
                            </div>
                        </div>
                        {selectedEvent?.visualUrl && (
                             <div>
                                <Label className="text-sm font-semibold">Visuel Associé</Label>
                                <div className="mt-2 rounded-md border overflow-hidden">
                                     <Image src={selectedEvent.visualUrl} alt={selectedEvent.title} width={400} height={400} className="w-full h-auto object-cover" data-ai-hint="publication image"/>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <PlanningModal isOpen={isPlanningModalOpen} onClose={() => setIsPlanningModalOpen(false)} onSave={handleAddEvent} />
            <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={handleExportPDF} />
        </>
    );
}

// --- MODAL COMPONENTS ---

const CHANNELS: Channel[] = ['LinkedIn', 'Facebook', 'Blog', 'Instagram', 'Twitter'];

function PlanningModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: Omit<CalendarEvent, 'id'>) => void }) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState<EventType>('Article');
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [channels, setChannels] = useState<Channel[]>([]);
    const [visual, setVisual] = useState<File | null>(null);
    const [description, setDescription] = useState('');

    const handleChannelChange = (channel: Channel, checked: boolean) => {
        setChannels(prev => 
            checked ? [...prev, channel] : prev.filter(c => c !== channel)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && date) {
            onSave({ title, type, date, description, channels, visualUrl: visual ? URL.createObjectURL(visual) : undefined });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Planifier une Publication</DialogTitle>
                        <DialogDescription>Remplissez les détails ci-dessous.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Titre</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez brièvement le contenu..."/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type de contenu</Label>
                                <Select value={type} onValueChange={(v: EventType) => setType(v)}>
                                    <SelectTrigger id="type"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {eventTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Date de publication</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, 'dd/MM/yyyy') : <span>Choisir une date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} /></PopoverContent>
                                </Popover>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Canaux de diffusion</Label>
                            <div className="flex flex-wrap gap-4 p-4 border rounded-md">
                                {CHANNELS.map(channel => (
                                    <div key={channel} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`channel-${channel}`} 
                                            checked={channels.includes(channel)}
                                            onCheckedChange={(checked) => handleChannelChange(channel, !!checked)}
                                        />
                                        <Label htmlFor={`channel-${channel}`} className="font-normal">{channel}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="visual">Visuel</Label>
                             <Input id="visual" type="file" accept="image/*" onChange={(e) => setVisual(e.target.files?.[0] || null)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Planifier</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ExportModal({ isOpen, onClose, onExport }: { isOpen: boolean, onClose: () => void, onExport: (range: DateRange | undefined) => void }) {
    const [range, setRange] = useState<DateRange | undefined>({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Exporter le Calendrier</DialogTitle>
                    <DialogDescription>Sélectionnez une plage de dates pour votre export PDF.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                    <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={1} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={() => onExport(range)}>Générer PDF</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
