
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- DATA TYPES & MOCK DATA ---

const MOCK_TFT_DATA = {
    resultatNet: 187000,
    dotationsAmortissements: 95000,
    variationBFR: -10000, // Une augmentation du BFR est une consommation de cash
    acquisitionsImmobilisations: -105000,
    cessionsImmobilisations: 0,
    augmentationCapital: 0,
    distributionDividendes: -137000,
    augmentationDettesFinancieres: 0,
    remboursementDettesFinancieres: -30000,
    tresorerieInitiale: 90000
};

type ReportLine = {
    ref: string;
    label: string;
    formule: string;
    value: number | null;
    isTitle?: boolean;
    isSubTotal?: boolean;
    isTotal?: boolean;
    isEmphasized?: boolean;
    isGrandTotal?: boolean;
    indent?: number;
};

const calculateTFT = (data: typeof MOCK_TFT_DATA): ReportLine[] => {
    // I. FLUX DE TRÉSORERIE LIÉS À L'ACTIVITÉ
    const capaciteAutofinancement = data.resultatNet + data.dotationsAmortissements;
    const fluxTresorerieActivite = capaciteAutofinancement + data.variationBFR;
    
    // II. FLUX DE TRÉSORERIE LIÉS AUX OPÉRATIONS D'INVESTISSEMENT
    const fluxTresorerieInvestissement = data.acquisitionsImmobilisations + data.cessionsImmobilisations;

    // III. FLUX DE TRÉSORERIE LIÉS AUX OPÉRATIONS DE FINANCEMENT
    const fluxTresorerieFinancement = data.augmentationCapital + data.distributionDividendes + data.augmentationDettesFinancieres + data.remboursementDettesFinancieres;

    // VARIATION
    const variationTresorerie = fluxTresorerieActivite + fluxTresorerieInvestissement + fluxTresorerieFinancement;
    const tresorerieFinale = data.tresorerieInitiale + variationTresorerie;

    return [
        { ref: '', label: "Flux de trésorerie des activités d'exploitation", formule: "", value: null, isTitle: true },
        { ref: 'A', label: "Résultat net de l'exercice", formule: "Extrait du Compte de Résultat", value: data.resultatNet, indent: 1 },
        { ref: 'B', label: "Dotations aux amortissements et provisions", formule: "Charges non décaissées", value: data.dotationsAmortissements, indent: 1 },
        { ref: '', label: "Capacité d'autofinancement (CAF)", formule: "Résultat Net + Dotations", value: capaciteAutofinancement, isSubTotal: true, indent: 1 },
        { ref: 'C', label: "Variation du Besoin en Fonds de Roulement (BFR)", formule: "Variation Stocks + Créances - Dettes", value: data.variationBFR, indent: 1 },
        { ref: 'I', label: "Flux de trésorerie généré par l'activité", formule: "CAF + Variation BFR", value: fluxTresorerieActivite, isTotal: true },

        { ref: '', label: '', formule: '', value: null }, // Spacer

        { ref: '', label: "Flux de trésorerie des activités d'investissement", formule: "", value: null, isTitle: true },
        { ref: 'D', label: "Acquisitions d'immobilisations", formule: "Décaissements", value: data.acquisitionsImmobilisations, indent: 1 },
        { ref: 'E', label: "Cessions d'immobilisations", formule: "Encaissements", value: data.cessionsImmobilisations, indent: 1 },
        { ref: 'II', label: "Flux de trésorerie lié aux opérations d'investissement", formule: "Acquisitions + Cessions", value: fluxTresorerieInvestissement, isTotal: true },
        
        { ref: '', label: '', formule: '', value: null }, // Spacer

        { ref: '', label: "Flux de trésorerie des activités de financement", formule: "", value: null, isTitle: true },
        { ref: 'F', label: "Augmentation de capital", formule: "Encaissements", value: data.augmentationCapital, indent: 1 },
        { ref: 'G', label: "Dividendes versés", formule: "Décaissements", value: data.distributionDividendes, indent: 1 },
        { ref: 'H', label: "Augmentation des dettes financières", formule: "Encaissements", value: data.augmentationDettesFinancieres, indent: 1 },
        { ref: 'I', label: "Remboursement des dettes financières", formule: "Décaissements", value: data.remboursementDettesFinancieres, indent: 1 },
        { ref: 'III', label: "Flux de trésorerie lié aux opérations de financement", formule: "Somme des opérations de financement", value: fluxTresorerieFinancement, isTotal: true },

        { ref: '', label: '', formule: '', value: null }, // Spacer
        
        { ref: 'IV', label: "Variation de la trésorerie nette de la période", formule: "Flux (Activité + Invest. + Finc.)", value: variationTresorerie, isEmphasized: true, isTotal: true },
        
        { ref: '', label: '', formule: '', value: null }, // Spacer
        
        { ref: 'V', label: "Trésorerie nette au début de la période", formule: "Report du bilan N-1", value: data.tresorerieInitiale, isGrandTotal: true, indent: 1 },
        { ref: 'VI', label: "Trésorerie nette à la fin de la période", formule: "Trésorerie Début + Variation", value: tresorerieFinale, isGrandTotal: true, indent: 1 },
    ];
};

const formatAmount = (amount: number) => {
    const formatted = amount.toLocaleString('fr-FR');
    return amount < 0 ? `(${Math.abs(amount).toLocaleString('fr-FR')})` : formatted;
};

export default function TableauFluxTresoreriePage() {
    const [modalStep, setModalStep] = useState<'closed' | 'selection' | 'display'>('closed');
    const [selectedYear, setSelectedYear] = useState<string>('2025');
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

        if (selectedYear !== '2025') {
            toast({ title: "Données non disponibles", description: `Le tableau des flux pour l'année ${selectedYear} n'est pas encore disponible.`, variant: "destructive" });
            return;
        }

        const data = calculateTFT(MOCK_TFT_DATA);
        setReportData(data);
        setModalStep('display');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SKOMPTAB";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const periodString = `Exercice ${selectedYear}`;
        
        const tableBody = reportData.map(line => {
            if (line.value === null) return [{ content: line.label, colSpan: 4, styles: { fontStyle: 'bold', fillColor: '#f1f5f9' } }];
            return [
                { content: line.ref, styles: { fontStyle: 'bold' } },
                { content: line.label, styles: { cellPadding: { left: 4 + (line.indent || 0) * 6 } } },
                { content: line.formule, styles: { fontStyle: 'italic', textColor: '#64748b', fontSize: 8 } },
                { content: formatAmount(line.value), styles: { halign: 'right' } }
            ];
        });

        autoTable(doc, {
            head: [['Ref.', 'Libellé', 'Formule', 'Valeur (FCFA)']],
            body: tableBody,
            theme: 'plain',
            didDrawPage: (data) => {
                doc.setFontSize(9); doc.setTextColor(150);
                doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
                doc.setDrawColor(220); doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
                doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
                doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
                doc.text(companyName, data.settings.margin.left + 15, 28);
                doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
                const rightX = doc.internal.pageSize.width - data.settings.margin.right;
                doc.text(`État : Tableau des Flux de Trésorerie`, rightX, 25, { align: 'right' });
                doc.text(`Période : ${periodString}`, rightX, 30, { align: 'right' });
                doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
                doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
                const pageCountTotal = (doc as any).internal.getNumberOfPages();
                doc.setFontSize(8); doc.setTextColor(150);
                doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left!, doc.internal.pageSize.height - 10);
            },
            margin: { top: 50 },
            willDrawCell: (data) => {
                const line = reportData[data.row.index];
                if (line?.isTotal || line?.isEmphasized || line?.isGrandTotal) {
                    doc.setFont(undefined, 'bold');
                }
                if (line?.isTotal) {
                     doc.setDrawColor(226, 232, 240); // slate-200
                     doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
                }
            }
        });

        doc.save(`tableau_flux_tresorerie_${selectedYear}.pdf`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Tableau des Flux de Trésorerie</CardTitle>
                    <CardDescription>Génération et consultation du tableau des flux de trésorerie.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Button size="lg" onClick={() => setModalStep('selection')}>
                        Générer le Tableau des Flux
                    </Button>
                </CardContent>
            </Card>

             <Dialog open={modalStep !== 'closed'} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className={modalStep === 'display' ? "max-w-4xl" : "sm:max-w-md"}>
                    {modalStep === 'selection' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Paramètres du Tableau des Flux</DialogTitle>
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
                                <DialogTitle>Tableau des Flux de Trésorerie</DialogTitle>
                                <DialogDescription>Exercice de l'année {selectedYear}.</DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto pr-4 border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Ref.</TableHead>
                                            <TableHead>Libellé</TableHead>
                                            <TableHead className="w-[300px]">Formule</TableHead>
                                            <TableHead className="text-right w-[150px]">Valeur (FCFA)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((line, index) => (
                                            <TableRow key={index} className={cn(
                                                (line.isTotal || line.isEmphasized || line.isGrandTotal) && "font-bold",
                                                line.isEmphasized && "bg-secondary",
                                                line.isGrandTotal && "border-y-2 border-primary/50 bg-primary/10"
                                            )}>
                                                 {line.value === null ? (
                                                    <TableCell colSpan={4} className="font-bold text-secondary-foreground bg-secondary py-2">{line.label}</TableCell>
                                                ) : (
                                                    <>
                                                        <TableCell className="font-mono text-xs">{line.ref}</TableCell>
                                                        <TableCell style={{ paddingLeft: `${1 + (line.indent || 0) * 1.5}rem` }}>
                                                            {line.label}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground italic">{line.formule}</TableCell>
                                                        <TableCell className={cn("text-right font-mono", line.value < 0 && "text-red-600")}>
                                                            {formatAmount(line.value)}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
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
        </>
    );
}
