
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- DATA TYPES & MOCK DATA ---
const MOCK_ACCOUNT_BALANCES = {
    // These values are taken from compte-de-resultat for consistency
    '701': 1250000,
    '601': -800000,
    '6031': 25000,
    '702': 450000,
    '705': 150000,
    '707': 75000,
    '73': -15000,
    '72': 50000,
    '71': 20000,
    '602': -120000, '6032': -8000, '604': -30000, '605': -25000, '6033': 3000, '61': -45000, '62': -60000,
    '63': -12000,
    '64': -110000,
    '75': 5000,
    '65': -18000,
    '781': 10000,
    '681': -95000,
    '66': -250000,
    '77': 15000,
    '67': -22000,
    '89': -45000,
};


type SigLine = {
    label: string;
    value: number | null;
    isTotal?: boolean;
    isEmphasized?: boolean;
    isGrandTotal?: boolean;
};

const calculateSIG = (balances: Record<string, number>): SigLine[] => {
    const get = (keys: (string | number)[]) => keys.reduce((sum, key) => sum + (balances[key.toString()] || 0), 0);
    
    // Using SYSCOHADA logic for consistency with Compte de Résultat page
    const margeCommerciale = get(['701']) + get(['601']) + get(['6031']);
    
    const productionDeLExercice = get(['702','705','707']) + get(['72']) + get(['71']);

    const consommationsTiers = get(['602', '6032', '604', '605', '6033', '61', '62']);
    
    const valeurAjoutee = margeCommerciale + productionDeLExercice + consommationsTiers;

    const subventionsExploitation = Math.abs(get(['73'])); // Subventions are credits
    const chargesPersonnel = get(['64']);
    const impotsTaxes = get(['63']);
    const EBE = valeurAjoutee + subventionsExploitation + chargesPersonnel + impotsTaxes;

    const reprisesExploitation = get(['781']);
    const dotationsExploitation = get(['681']);
    const autresProduits = get(['75']);
    const autresCharges = get(['65']);
    const resultatExploitation = EBE + reprisesExploitation + dotationsExploitation + autresProduits + autresCharges;

    const resultatFinancier = get(['66']); // Simplified

    const resultatActivitesOrdinaires = resultatExploitation + resultatFinancier;

    const resultatHAO = get(['77']) + get(['67']);

    const impotsSurResultat = get(['89']);

    const resultatNet = resultatActivitesOrdinaires + resultatHAO + impotsSurResultat;

    return [
        { label: "Marge commerciale", value: margeCommerciale, isTotal: true },
        { label: "Production de l'exercice", value: productionDeLExercice, isTotal: false },
        { label: "Valeur ajoutée", value: valeurAjoutee, isTotal: true },
        { label: "Excédent brut d'exploitation (EBE)", value: EBE, isTotal: true },
        { label: "Résultat d'exploitation", value: resultatExploitation, isTotal: true, isEmphasized: true },
        { label: "Résultat financier", value: resultatFinancier, isTotal: true },
        { label: "Résultat des activités ordinaires", value: resultatActivitesOrdinaires, isTotal: true, isEmphasized: true },
        { label: "Résultat hors activités ordinaires", value: resultatHAO, isTotal: true },
        { label: "Impôts sur le résultat", value: impotsSurResultat, isTotal: false },
        { label: "Résultat net", value: resultatNet, isGrandTotal: true },
    ];
};

const formatAmount = (amount: number) => {
    const formatted = amount.toLocaleString('fr-FR');
    return amount < 0 ? `(${formatted.replace('-', '')})` : formatted;
};


export default function TableauSigPage() {
    const [modalStep, setModalStep] = useState<'closed' | 'selection' | 'display'>('closed');
    const [selectedYear, setSelectedYear] = useState<string>('2025');
    const [reportData, setReportData] = useState<SigLine[]>([]);
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
            toast({ title: "Données non disponibles", description: `Le tableau des SIG pour l'année ${selectedYear} n'est pas encore disponible.`, variant: "destructive" });
            return;
        }

        const data = calculateSIG(MOCK_ACCOUNT_BALANCES);
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
            if (line.value === null) return [{ content: '', colSpan: 2, styles: { minCellHeight: 5 } }];
            return [
                { content: line.label, styles: { fontStyle: (line.isTotal || line.isGrandTotal) ? 'bold' : 'normal' } },
                { content: formatAmount(line.value), styles: { halign: 'right', fontStyle: (line.isTotal || line.isGrandTotal) ? 'bold' : 'normal' } }
            ];
        });

        autoTable(doc, {
            head: [['Solde Intermédiaire de Gestion', 'Montant (FCFA)']],
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
                doc.text(`État : Tableau des SIG`, rightX, 25, { align: 'right' });
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
                if (line?.isTotal && !line.isEmphasized) {
                    doc.setFillColor(241, 245, 249); // bg-slate-100
                }
                 if (line?.isEmphasized) {
                    doc.setFillColor(226, 232, 240); // bg-slate-200
                }
                 if (line?.isGrandTotal) {
                    doc.setFillColor(203, 213, 225); // bg-slate-300
                }
            }
        });

        doc.save(`tableau_sig_${selectedYear}.pdf`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Tableau des SIG</CardTitle>
                    <CardDescription>Génération et consultation du tableau des Soldes Intermédiaires de Gestion.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                   <Button size="lg" onClick={() => setModalStep('selection')}>
                        Générer le Tableau des SIG
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={modalStep !== 'closed'} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className={modalStep === 'display' ? "max-w-3xl" : "sm:max-w-md"}>
                    {modalStep === 'selection' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Paramètres du Tableau des SIG</DialogTitle>
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
                                <DialogTitle>Tableau des Soldes Intermédiaires de Gestion</DialogTitle>
                                <DialogDescription>Exercice de l'année {selectedYear}.</DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto pr-4 border rounded-md">
                                <Table>
                                    <TableBody>
                                        {reportData.map((line, index) => (
                                            <TableRow key={index} className={cn(
                                                (line.isTotal || line.isGrandTotal) && "font-bold",
                                                line.isTotal && !line.isEmphasized && "bg-muted/50",
                                                line.isEmphasized && "bg-secondary",
                                                line.isGrandTotal && "border-y-2 border-primary/50 bg-primary/10"
                                            )}>
                                                 {line.value === null ? (
                                                    <TableCell colSpan={2} className="h-4"></TableCell>
                                                ) : (
                                                    <>
                                                        <TableCell>{line.label}</TableCell>
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
