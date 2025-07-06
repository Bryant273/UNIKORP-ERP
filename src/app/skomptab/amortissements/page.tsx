
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow, TableFooter } from '@/components/ui/table';
import { Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- DATA TYPES & MOCK DATA ---

type Immobilisation = {
  codeImmo: string;
  libelle: string;
  dateAcquisition: string;
  valeurBrute: number;
  duree: number; // in years
  typeAmortissement: 'Linéaire';
};

const MOCK_IMMOBILISATIONS: Immobilisation[] = [
  { codeImmo: 'IMMO-001', libelle: 'Serveur Dell PowerEdge', dateAcquisition: '2023-01-15', valeurBrute: 500000, duree: 5, typeAmortissement: 'Linéaire' },
  { codeImmo: 'IMMO-002', libelle: 'Logiciel de comptabilité SAGE', dateAcquisition: '2024-03-01', valeurBrute: 250000, duree: 3, typeAmortissement: 'Linéaire' },
  { codeImmo: 'IMMO-003', libelle: 'Véhicule de service Renault Kangoo', dateAcquisition: '2022-07-20', valeurBrute: 2200000, duree: 5, typeAmortissement: 'Linéaire' },
  { codeImmo: 'IMMO-004', libelle: 'Mobilier de bureau', dateAcquisition: '2024-01-01', valeurBrute: 800000, duree: 10, typeAmortissement: 'Linéaire' },
  { codeImmo: 'IMMO-005', libelle: 'Immeuble administratif', dateAcquisition: '2020-01-01', valeurBrute: 50000000, duree: 20, typeAmortissement: 'Linéaire' },
];

type ReportLine = {
    codeImmo: string;
    libelle: string;
    dateAcquisition: string;
    valeurBrute: number;
    amortissementAnterieur: number;
    dotationExercice: number;
    amortissementCumule: number;
    valeurNetteComptable: number;
};

const calculateAmortissementReport = (selectedYear: number): ReportLine[] => {
    return MOCK_IMMOBILISATIONS.map(immo => {
        const dateAcq = new Date(immo.dateAcquisition);
        const anneeAcq = dateAcq.getFullYear();
        const dotationAnnuelle = immo.valeurBrute / immo.duree;

        const anneeFinAmortissement = anneeAcq + immo.duree - 1;

        const amortissementAnterieur = Math.min(immo.valeurBrute, dotationAnnuelle * Math.max(0, selectedYear - anneeAcq));
        
        let dotationExercice = 0;
        if (selectedYear >= anneeAcq && selectedYear <= anneeFinAmortissement) {
            const dejaAmorti = amortissementAnterieur;
            dotationExercice = Math.min(dotationAnnuelle, immo.valeurBrute - dejaAmorti);
        }
        
        const amortissementCumule = Math.min(immo.valeurBrute, amortissementAnterieur + dotationExercice);
        const valeurNetteComptable = immo.valeurBrute - amortissementCumule;

        return {
            codeImmo: immo.codeImmo,
            libelle: immo.libelle,
            dateAcquisition: immo.dateAcquisition,
            valeurBrute: immo.valeurBrute,
            amortissementAnterieur,
            dotationExercice,
            amortissementCumule,
            valeurNetteComptable,
        };
    });
};

const formatAmount = (amount: number) => {
    if (amount === null || amount === undefined) return '';
    return amount.toLocaleString('fr-FR');
};

export default function AmortissementsPage() {
    const [modalStep, setModalStep] = useState<'closed' | 'selection' | 'display'>('closed');
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [reportData, setReportData] = useState<ReportLine[]>([]);
    const [printDateTime, setPrintDateTime] = useState('');
    const { toast } = useToast();

    const handleCloseModal = () => {
        setModalStep('closed');
    };

    useEffect(() => {
        if (modalStep === 'display') {
            setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
        }
    }, [modalStep]);

    const handleGenerate = () => {
        if (!selectedYear) {
            toast({ title: "Année invalide", description: "Veuillez sélectionner un exercice.", variant: "destructive" });
            return;
        }

        const data = calculateAmortissementReport(Number(selectedYear));
        setReportData(data);
        setModalStep('display');
    };
    
    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SKOMPTAB";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const periodString = `Exercice ${selectedYear}`;
        
        const tableHead = [["Code", "Libellé", "Date Acq.", "Valeur Brute", "Amort. Antérieur", "Dotation Exercice", "Amort. Cumulé", "VNC"]];
        const tableBody = reportData.map(line => [
            line.codeImmo,
            line.libelle,
            format(new Date(line.dateAcquisition), 'dd/MM/yyyy'),
            formatAmount(line.valeurBrute),
            formatAmount(line.amortissementAnterieur),
            formatAmount(line.dotationExercice),
            formatAmount(line.amortissementCumule),
            formatAmount(line.valeurNetteComptable),
        ]);
        
        autoTable(doc, {
            head: tableHead,
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [226, 232, 240] },
            didDrawPage: (data) => {
                doc.setFontSize(9); doc.setTextColor(150);
                doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
                doc.setDrawColor(220); doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
                doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
                doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
                doc.text(companyName, data.settings.margin.left + 15, 28);
                doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
                const rightX = doc.internal.pageSize.width - data.settings.margin.right;
                doc.text(`État : Tableau des Amortissements`, rightX, 25, { align: 'right' });
                doc.text(`Période : ${periodString}`, rightX, 30, { align: 'right' });
                doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
                doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
                const pageCountTotal = (doc as any).internal.getNumberOfPages();
                doc.setFontSize(8); doc.setTextColor(150);
                doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left!, doc.internal.pageSize.height - 10);
            },
            margin: { top: 50 },
        });

        doc.save(`etat_amortissements_${selectedYear}.pdf`);
    };

    const totals = React.useMemo(() => {
        return reportData.reduce((acc, line) => {
            acc.valeurBrute += line.valeurBrute;
            acc.amortissementAnterieur += line.amortissementAnterieur;
            acc.dotationExercice += line.dotationExercice;
            acc.amortissementCumule += line.amortissementCumule;
            acc.valeurNetteComptable += line.valeurNetteComptable;
            return acc;
        }, {
            valeurBrute: 0,
            amortissementAnterieur: 0,
            dotationExercice: 0,
            amortissementCumule: 0,
            valeurNetteComptable: 0,
        });
    }, [reportData]);

    return (
        <div className="w-full">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">État des Amortissements</CardTitle>
                    <CardDescription>Générez et consultez le tableau des amortissements des immobilisations.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Button size="lg" onClick={() => setModalStep('selection')}>
                        Générer l'état des amortissements
                    </Button>
                </CardContent>
            </Card>

             <Dialog open={modalStep !== 'closed'} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className={modalStep === 'display' ? "max-w-7xl" : "sm:max-w-md"}>
                    {modalStep === 'selection' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Paramètres de l'état</DialogTitle>
                                <DialogDescription>Choisissez l'exercice pour générer le rapport.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year-select">Exercice fiscal</Label>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger id="year-select"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2025">2025</SelectItem>
                                            <SelectItem value="2024">2024</SelectItem>
                                            <SelectItem value="2023">2023</SelectItem>
                                            <SelectItem value="2022">2022</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleCloseModal}>Annuler</Button>
                                <Button onClick={handleGenerate}>Suivant</Button>
                            </DialogFooter>
                        </>
                    )}
                    
                     {modalStep === 'display' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Tableau des Amortissements</DialogTitle>
                                <DialogDescription>Exercice de l'année {selectedYear}.</DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto pr-4 border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Libellé</TableHead>
                                            <TableHead>Date Acq.</TableHead>
                                            <TableHead className="text-right">Valeur Brute</TableHead>
                                            <TableHead className="text-right">Amort. Antérieur</TableHead>
                                            <TableHead className="text-right">Dotation Exercice</TableHead>
                                            <TableHead className="text-right">Amort. Cumulé</TableHead>
                                            <TableHead className="text-right">VNC</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((line, index) => (
                                            <TableRow key={line.codeImmo} className={index % 2 !== 0 ? 'bg-muted' : ''}>
                                                <TableCell>{line.codeImmo}</TableCell>
                                                <TableCell>{line.libelle}</TableCell>
                                                <TableCell>{format(new Date(line.dateAcquisition), 'dd/MM/yyyy')}</TableCell>
                                                <TableCell className="text-right">{formatAmount(line.valeurBrute)} FCFA</TableCell>
                                                <TableCell className="text-right">{formatAmount(line.amortissementAnterieur)} FCFA</TableCell>
                                                <TableCell className="text-right">{formatAmount(line.dotationExercice)} FCFA</TableCell>
                                                <TableCell className="text-right">{formatAmount(line.amortissementCumule)} FCFA</TableCell>
                                                <TableCell className="text-right font-bold">{formatAmount(line.valeurNetteComptable)} FCFA</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow className="font-bold bg-secondary">
                                            <TableCell colSpan={3} className="text-right">Totaux</TableCell>
                                            <TableCell className="text-right">{formatAmount(totals.valeurBrute)} FCFA</TableCell>
                                            <TableCell className="text-right">{formatAmount(totals.amortissementAnterieur)} FCFA</TableCell>
                                            <TableCell className="text-right">{formatAmount(totals.dotationExercice)} FCFA</TableCell>
                                            <TableCell className="text-right">{formatAmount(totals.amortissementCumule)} FCFA</TableCell>
                                            <TableCell className="text-right">{formatAmount(totals.valeurNetteComptable)} FCFA</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setModalStep('selection')}><ArrowLeft className="mr-2 h-4 w-4" /> Précédent</Button>
                                <div className="flex-grow" />
                                <Button variant="outline" onClick={handleCloseModal}>Fermer</Button>
                                <Button onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" />Exporter en PDF</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
