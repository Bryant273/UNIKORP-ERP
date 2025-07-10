
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type Indicator = {
    id: string;
    label: string;
    value: string | number;
    variation?: string;
};

type IndicatorCategory = {
    title: string;
    indicators: Indicator[];
};

const bilanSocialData: IndicatorCategory[] = [
    {
        title: "I. Emploi",
        indicators: [
            { id: 'i1', label: 'Effectif total au 31/12', value: 112, variation: '+8%' },
            { id: 'i2', label: 'Dont effectif permanent (CDI)', value: 98, variation: '+5%' },
            { id: 'i3', label: "Nombre d'embauches dans l'année", value: 15 },
            { id: 'i4', label: "Nombre de départs dans l'année", value: 7 },
            { id: 'i5', label: "Taux de rotation du personnel", value: '6.25%' },
        ]
    },
    {
        title: "II. Rémunérations et charges accessoires",
        indicators: [
            { id: 'r1', label: 'Masse salariale brute annuelle', value: '1 230 000 FCFA' },
            { id: 'r2', label: 'Rémunération moyenne mensuelle', value: '9 150 FCFA' },
            { id: 'r3', label: 'Montant des 10 plus hautes rémunérations', value: '350 000 FCFA' },
        ]
    },
    {
        title: "III. Conditions de santé et de sécurité",
        indicators: [
            { id: 's1', label: "Nombre d'accidents du travail avec arrêt", value: 2 },
            { id: 's2', label: 'Taux de fréquence des accidents', value: '17.8' },
            { id: 's3', label: "Nombre de maladies professionnelles déclarées", value: 0 },
        ]
    },
    {
        title: "IV. Formation",
        indicators: [
            { id: 'f1', label: "Pourcentage de la masse salariale consacré à la formation", value: '2.1%' },
            { id: 'f2', label: "Nombre total d'heures de formation", value: 850 },
            { id: 'f3', label: "Nombre de salariés ayant suivi une formation", value: 78 },
        ]
    },
     {
        title: "V. Relations professionnelles",
        indicators: [
            { id: 'rp1', label: "Nombre de réunions du CSE", value: 12 },
            { id: 'rp2', label: "Taux de participation aux élections professionnelles", value: '78%' },
        ]
    },
    {
        title: "VI. Conditions de travail",
        indicators: [
            { id: 'ct1', label: "Durée hebdomadaire moyenne du travail", value: '39.5 heures' },
            { id: 'ct2', label: "Taux d'absentéisme (hors congés)", value: '3.1%' },
        ]
    }
];

export default function BilanSocialPage() {
    const { toast } = useToast();

    const handleExport = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Bilan Social - Année 2023", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Édité le ${format(new Date(), 'dd/MM/yyyy')} par UNIKORP`, 105, 26, { align: 'center' });

        let startY = 40;
        
        bilanSocialData.forEach(category => {
            if (startY > 250) {
                doc.addPage();
                startY = 20;
            }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(category.title, 14, startY);
            startY += 5;

            autoTable(doc, {
                startY: startY,
                head: [['Indicateur', 'Valeur', 'Variation N-1']],
                body: category.indicators.map(ind => [ind.label, ind.value, ind.variation || '']),
                theme: 'grid'
            });

            startY = (doc as any).lastAutoTable.finalY + 15;
        });

        doc.save('Bilan_Social_2023.pdf');
        toast({ title: 'Exportation PDF lancée.' });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Bilan Social</CardTitle>
                        <CardDescription>Document de synthèse annuel sur les principales données sociales de l'entreprise.</CardDescription>
                    </div>
                    <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Exporter le bilan</Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Accordion type="multiple" defaultValue={['I. Emploi']} className="w-full">
                    {bilanSocialData.map((category) => (
                        <AccordionItem value={category.title} key={category.title}>
                            <AccordionTrigger className="text-lg">{category.title}</AccordionTrigger>
                            <AccordionContent>
                                <ul className="space-y-3 p-2">
                                    {category.indicators.map(indicator => (
                                        <li key={indicator.id} className="flex justify-between items-center text-sm border-b pb-2">
                                            <span className="text-muted-foreground">{indicator.label}</span>
                                            <div className="flex items-center gap-4">
                                                {indicator.variation && <Badge variant="outline">{indicator.variation}</Badge>}
                                                <span className="font-bold w-32 text-right">{indicator.value}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                 </Accordion>
            </CardContent>
        </Card>
    );
}
