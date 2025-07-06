
'use client';

import React, { useState, useEffect } from 'react';
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

const MOCK_TFT_DATA_SYSCOHADA = {
    tresorerieNetteInitiale: 90000,
    cafg: 272000,
    actifCirculantHAO: 0,
    variationStocks: -15000,
    variationCreances: -25000,
    variationPassifCirculant: 12000,
    
    decaissAcqIncorp: -30000,
    decaissAcqCorp: -75000,
    decaissAcqFin: 0,
    encaissCessImmoIC: 0,
    encaissCessImmoFin: 0,

    augmCapital: 0,
    subventions: 0,
    prelevements: 0,
    dividendesVerses: -137000,
    
    emprunts: 0,
    autresDettesFin: 0,
    remboursementEmprunts: -30000,
};

type ReportLine = {
    ref: string;
    label: string;
    value: number | null;
    isTitle?: boolean;
    isSubTotal?: boolean;
    isTotal?: boolean;
    isGrandTotal?: boolean;
    isEmphasized?: boolean;
    indent?: number;
};


const calculateTFT = (data: typeof MOCK_TFT_DATA_SYSCOHADA): ReportLine[] => {
    // I. FLUX DE TRÉSORERIE LIÉS À L'ACTIVITÉ
    const variationBF = data.variationStocks + data.variationCreances + data.variationPassifCirculant + data.actifCirculantHAO;
    const fluxTresorerieActivite = data.cafg + variationBF;
    
    // II. FLUX DE TRÉSORERIE LIÉS AUX OPÉRATIONS D'INVESTISSEMENT
    const fluxTresorerieInvestissement = data.decaissAcqIncorp + data.decaissAcqCorp + data.decaissAcqFin + data.encaissCessImmoIC + data.encaissCessImmoFin;

    // III. FLUX DE TRÉSORERIE LIÉS AUX OPÉRATIONS DE FINANCEMENT
    const fluxFinancementPropres = data.augmCapital + data.subventions + data.prelevements + data.dividendesVerses;
    const fluxFinancementEtrangers = data.emprunts + data.autresDettesFin + data.remboursementEmprunts;
    const fluxTresorerieFinancement = fluxFinancementPropres + fluxFinancementEtrangers;

    // VARIATION
    const variationTresorerie = fluxTresorerieActivite + fluxTresorerieInvestissement + fluxTresorerieFinancement;
    const tresorerieFinale = data.tresorerieNetteInitiale + variationTresorerie;

    return [
        { ref: 'ZA', label: "Trésorerie nette au 1er janvier", value: data.tresorerieNetteInitiale, isTotal: true, isEmphasized: true},
        { ref: '', label: "Flux de trésorerie provenant des activités opérationnelles", value: null, isTitle: true },
        { ref: 'FA', label: "Capacité d'Autofinancement Globale (CAFG)", value: data.cafg, indent: 1 },
        { ref: 'FB', label: "Actif circulant HAO", value: data.actifCirculantHAO, indent: 1 },
        { ref: 'FC', label: "Variation des stocks", value: data.variationStocks, indent: 1 },
        { ref: 'FD', label: "Variation des créances", value: data.variationCreances, indent: 1 },
        { ref: 'FE', label: "Variation du passif circulant", value: data.variationPassifCirculant, indent: 1 },
        { ref: '', label: "Variation du BF lié aux activités opérationnelles", value: variationBF, isSubTotal: true, indent: 1 },
        { ref: 'ZB', label: "Flux de trésorerie provenant des activités opérationnelles", value: fluxTresorerieActivite, isTotal: true },

        { ref: '', label: '', value: null },

        { ref: '', label: "Flux de trésorerie provenant des activités d'investissement", value: null, isTitle: true },
        { ref: 'FF', label: "Décaissements liés aux acquisitions d'immobilisations incorporelles", value: data.decaissAcqIncorp, indent: 1 },
        { ref: 'FG', label: "Décaissements liés aux acquisitions d'immobilisations corporelles", value: data.decaissAcqCorp, indent: 1 },
        { ref: 'FH', label: "Décaissements liés aux acquisitions d'immobilisations financières", value: data.decaissAcqFin, indent: 1 },
        { ref: 'FI', label: "Encaissements liés aux cessions d'immobilisations incorporelles et corporelles", value: data.encaissCessImmoIC, indent: 1 },
        { ref: 'FJ', label: "Encaissements liés aux cessions d'immobilisations financières", value: data.encaissCessImmoFin, indent: 1 },
        { ref: 'ZC', label: "Flux de trésorerie provenant des activités d'investissement", value: fluxTresorerieInvestissement, isTotal: true },
        
        { ref: '', label: '', value: null },

        { ref: '', label: "Flux de trésorerie provenant du financement par les capitaux propres", value: null, isTitle: true },
        { ref: 'FK', label: "Augmentations de capital par apports nouveaux", value: data.augmCapital, indent: 1 },
        { ref: 'FL', label: "Subventions d'investissement reçues", value: data.subventions, indent: 1 },
        { ref: 'FM', label: "Prélèvements sur le capital", value: data.prelevements, indent: 1 },
        { ref: 'FN', label: "Dividendes versés", value: data.dividendesVerses, indent: 1 },
        { ref: 'ZD', label: "Flux de trésorerie provenant des capitaux propres", value: fluxFinancementPropres, isTotal: true },

        { ref: '', label: "Trésorerie provenant du financement par les capitaux étrangers", value: null, isTitle: true },
        { ref: 'FO', label: "Emprunts", value: data.emprunts, indent: 1 },
        { ref: 'FP', label: "Autres dettes financières", value: data.autresDettesFin, indent: 1 },
        { ref: 'FQ', label: "Remboursements des emprunts et autres dettes financières", value: data.remboursementEmprunts, indent: 1 },
        { ref: 'ZE', label: "Flux de trésorerie provenant des capitaux étrangers", value: fluxFinancementEtrangers, isTotal: true },

        { ref: 'ZF', label: "Flux de trésorerie provenant des activités de financement", value: fluxTresorerieFinancement, isTotal: true },
        
        { ref: '', label: '', value: null },
        
        { ref: 'ZG', label: "VARIATION DE LA TRÉSORERIE NETTE DE LA PÉRIODE", value: variationTresorerie, isGrandTotal: true },
        
        { ref: 'ZH', label: "Trésorerie nette au 31 Décembre", value: tresorerieFinale, isGrandTotal: true, isEmphasized: true },
    ];
};

const formatAmount = (amount: number | null) => {
    if (amount === null || amount === undefined) return '';
    return amount.toLocaleString('fr-FR');
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

        const data = calculateTFT(MOCK_TFT_DATA_SYSCOHADA);
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
            if (line.value === null) return [{ content: line.label, colSpan: 3, styles: { fontStyle: 'bold', fillColor: '#f1f5f9' } }];
            return [
                { content: line.ref, styles: { fontStyle: 'bold' } },
                { content: line.label, styles: { cellPadding: { left: 4 + (line.indent || 0) * 6 } } },
                { content: formatAmount(line.value), styles: { halign: 'right' } }
            ];
        });

        autoTable(doc, {
            head: [['Ref.', 'Libellé', 'Valeur (FCFA)']],
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
                                            <TableHead className="text-right w-[150px]">Valeur (FCFA)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((line, index) => (
                                            <TableRow key={index} className={cn(
                                                (line.isTotal || line.isGrandTotal || line.isEmphasized) && "font-bold",
                                                line.isEmphasized && "bg-secondary",
                                                line.isGrandTotal && "border-y-2 border-primary/50 bg-primary/10"
                                            )}>
                                                 {line.value === null ? (
                                                    <TableCell colSpan={3} className="font-bold text-secondary-foreground bg-secondary py-2">{line.label}</TableCell>
                                                ) : (
                                                    <>
                                                        <TableCell className="text-xs">{line.ref}</TableCell>
                                                        <TableCell style={{ paddingLeft: `${1 + (line.indent || 0) * 1.5}rem` }} className={cn(line.isSubTotal && "italic text-muted-foreground")}>
                                                            {line.label}
                                                        </TableCell>
                                                        <TableCell className={cn("text-right", line.value < 0 && "text-red-600")}>
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
