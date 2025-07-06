
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Deadline = {
    date: Date;
    label: string;
    type: 'TVA' | 'IS' | 'DSN' | 'CFE';
};

const deadlines: Deadline[] = [
    { date: new Date(2024, 7, 20), label: 'Déclaration de TVA (Juillet)', type: 'TVA' },
    { date: new Date(2024, 8, 5), label: 'Déclaration Sociale Nominative (DSN)', type: 'DSN' },
    { date: new Date(2024, 8, 15), label: 'Acompte IS T3', type: 'IS' },
    { date: new Date(2024, 8, 20), label: 'Déclaration de TVA (Août)', type: 'TVA' },
    { date: new Date(2024, 11, 15), label: 'Paiement CFE', type: 'CFE' },
];

function CalendrierFiscalMainContent() {
    const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
    const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);

    const getBadgeVariant = (type: Deadline['type']) => {
        switch(type) {
            case 'TVA': return 'default';
            case 'IS': return 'destructive';
            case 'DSN': return 'secondary';
            case 'CFE': return 'outline';
        }
    }
    
    const handleDateClick = (date: Date | undefined) => {
        if (!date) return;
        const clickedDeadline = deadlines.find(d => new Date(d.date).toDateString() === date.toDateString());
        if (clickedDeadline) {
            setSelectedDeadline(clickedDeadline);
            setIsDeadlineModalOpen(true);
        }
    }

    return (
        <>
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Calendrier Fiscal Interactif</CardTitle>
                <CardDescription>
                    Explorez le calendrier pour visualiser vos échéances. Cliquez sur une date surlignée pour obtenir les détails.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                     <Calendar
                        mode="single"
                        onDayClick={handleDateClick}
                        className="rounded-md border p-4"
                        locale={fr}
                        modifiers={{ deadlines: deadlines.map(d => d.date) }}
                        modifiersClassNames={{ deadlines: 'border-2 border-primary rounded-full cursor-pointer' }}
                    />
                </div>
                <div className="md:col-span-1">
                    <h3 className="font-semibold text-lg mb-4">Prochaines échéances</h3>
                     <div className="space-y-4">
                        {deadlines
                            .filter(d => d.date >= new Date())
                            .sort((a,b) => a.date.getTime() - b.date.getTime())
                            .slice(0, 5)
                            .map(deadline => (
                                <div key={deadline.label} className="flex items-start justify-between text-sm p-3 rounded-md bg-muted/50">
                                    <div>
                                        <p className="font-medium">{deadline.label}</p>
                                        <p className="text-xs text-muted-foreground">{format(deadline.date, 'EEEE dd MMMM', { locale: fr })}</p>
                                    </div>
                                    <Badge variant={getBadgeVariant(deadline.type)}>{deadline.type}</Badge>
                                </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Dialog open={isDeadlineModalOpen} onOpenChange={setIsDeadlineModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Détail de l'échéance</DialogTitle>
                    <DialogDescription>
                        Informations pour l'échéance du {selectedDeadline ? format(selectedDeadline.date, 'dd MMMM yyyy', { locale: fr }) : ''}.
                    </DialogDescription>
                </DialogHeader>
                {selectedDeadline && (
                    <div className="space-y-4 py-4">
                        <p><strong>Type :</strong> <Badge variant={getBadgeVariant(selectedDeadline.type)}>{selectedDeadline.type}</Badge></p>
                        <p><strong>Désignation :</strong> {selectedDeadline.label}</p>
                        <p><strong>Date limite :</strong> {format(selectedDeadline.date, 'EEEE dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeadlineModalOpen(false)}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}

export default function CalendrierFiscalPage() {
    return (
        <CalendrierFiscalMainContent />
    );
}

