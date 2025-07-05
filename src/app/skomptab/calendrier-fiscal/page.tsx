'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

export default function CalendrierFiscalPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const getBadgeVariant = (type: Deadline['type']) => {
        switch(type) {
            case 'TVA': return 'default';
            case 'IS': return 'destructive';
            case 'DSN': return 'secondary';
            case 'CFE': return 'outline';
        }
    }

    return (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Calendrier Fiscal</CardTitle>
                        <CardDescription>Visualisez vos échéances fiscales et sociales sur le calendrier.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            locale={fr}
                            modifiers={{ deadlines: deadlines.map(d => d.date) }}
                            modifiersClassNames={{ deadlines: 'border-2 border-primary rounded-full' }}
                        />
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Prochaines échéances</CardTitle>
                        <CardDescription>Liste des déclarations à venir.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {deadlines
                            .filter(d => d.date >= new Date())
                            .sort((a,b) => a.date.getTime() - b.date.getTime())
                            .map(deadline => (
                                <div key={deadline.label} className="flex items-center justify-between text-sm p-3 rounded-md bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{deadline.label}</p>
                                        <p className="text-xs text-muted-foreground">{format(deadline.date, 'EEEE dd MMMM yyyy', { locale: fr })}</p>
                                    </div>
                                    <Badge variant={getBadgeVariant(deadline.type)}>{deadline.type}</Badge>
                                </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
