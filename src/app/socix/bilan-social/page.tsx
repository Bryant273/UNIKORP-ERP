
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
import { Logo } from '@/components/logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
            { id: 'r1', label: 'Masse salariale brute annuelle', value: '1,23M FCFA' },
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
    const [selectedYear, setSelectedYear] = useState<string>((new Date().getFullYear() - 1).toString());

    const handleExport = () => {
        const doc = new jsPDF();
        const companyName = "UNIKORP";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SOCIX";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const printDateTime = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        
        let startY = 50;
        
        bilanSocialData.forEach((category, index) => {
            if (startY > 250) { // Simple page break logic
                doc.addPage();
                startY = 20;
            }
            if(index > 0) startY += 5; // Add space between sections

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(category.title, 14, startY);
            startY += 5;

            autoTable(doc, {
                startY: startY,
                head: [['Indicateur', 'Valeur', 'Variation N-1']],
                body: category.indicators.map(ind => [ind.label, ind.value, ind.variation || '']),
                theme: 'grid',
                headStyles: { fillColor: '#4A5568', textColor: '#FFFFFF' },
                 didDrawPage: (data) => {
                    // Header only on the first page for this multi-section document
                    if (data.pageNumber === 1) {
                        doc.setFontSize(9); doc.setTextColor(150);
                        doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
                        doc.setDrawColor(220); doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
                        doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
                        doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
                        doc.text(companyName, data.settings.margin.left + 15, 28);
                        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
                        const rightX = doc.internal.pageSize.width - data.settings.margin.right;
                        doc.text(`État : Bilan Social Annuel`, rightX, 25, { align: 'right' });
                        doc.text(`Exercice : ${selectedYear}`, rightX, 30, { align: 'right' });
                        doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
                        doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
                    }
                     // Footer on all pages
                    const pageCountTotal = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8); doc.setTextColor(150);
                    doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left!, doc.internal.pageSize.height - 10);
                },
                 margin: { top: 50 },
            });

            startY = (doc as any).lastAutoTable.finalY + 15;
        });

        doc.save(`Bilan_Social_${selectedYear}.pdf`);
        toast({ title: 'Exportation PDF lancée.' });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Bilan Social de l'Année {selectedYear}</CardTitle>
                        <CardDescription>Document de synthèse sur les principales données sociales de l'entreprise.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                         <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2022">2022</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Exporter le bilan</Button>
                    </div>
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
