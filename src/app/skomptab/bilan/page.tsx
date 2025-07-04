'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

type BilanType = 'comptable' | 'fonctionnel' | 'financier';

type BilanLigne = {
    libelle: string;
    brut?: number | null;
    amortissement?: number | null;
    net?: number | null;
    netN1?: number | null;
    isHeader?: boolean;
    isSubTitle?: boolean;
    isSubItem?: boolean;
    isTotal?: boolean;
    isGrandTotal?: boolean;
    isFootnote?: boolean;
};


type BilanData = {
    actif: BilanLigne[];
    passif: BilanLigne[];
    totalActif: number;
    totalPassif: number;
};

// --- MOCK DATA ---
const MOCK_BILAN_COMPTABLE_2025: BilanData = {
    actif: [
        { libelle: 'ACTIF IMMOBILISÉ', isHeader: true },
        { libelle: 'Immobilisations incorporelles', isSubTitle: true },
        { libelle: 'Frais de recherche et développement', isSubItem: true, brut: 20000, amortissement: 5000, net: 15000, netN1: 10000 },
        { libelle: 'Concessions, brevets, licences...', isSubItem: true, brut: 70000, amortissement: 10000, net: 60000, netN1: 50000 },
        { libelle: 'Immobilisations corporelles', isSubTitle: true },
        { libelle: 'Terrains', isSubItem: true, brut: 100000, amortissement: 0, net: 100000, netN1: 100000 },
        { libelle: 'Constructions', isSubItem: true, brut: 250000, amortissement: 50000, net: 200000, netN1: 180000 },
        { libelle: 'Immobilisations financières', isSubTitle: true },
        { libelle: 'Participations', isSubItem: true, brut: 25000, amortissement: 0, net: 25000, netN1: 20000 },
        { libelle: 'Total I', isTotal: true, brut: 465000, amortissement: 65000, net: 400000, netN1: 360000 },

        { libelle: 'ACTIF CIRCULANT', isHeader: true },
        { libelle: 'Stocks et en-cours', isSubTitle: true, brut: 85000, amortissement: 0, net: 85000, netN1: 80000 },
        { libelle: 'Créances', isSubTitle: true },
        { libelle: 'Créances clients et comptes rattachés', isSubItem: true, brut: 150000, amortissement: 0, net: 150000, netN1: 140000 },
        { libelle: 'Disponibilités', isSubTitle: true, brut: 95000, amortissement: 0, net: 95000, netN1: 100000 },
        { libelle: 'Total II', isTotal: true, brut: 330000, amortissement: 0, net: 330000, netN1: 320000 },
        
        { libelle: 'Charges constatées d\'avance', isSubTitle: true, brut: 20000, amortissement: 0, net: 20000, netN1: 15000 },
        
        { libelle: 'TOTAL ACTIF', isGrandTotal: true, brut: 815000, amortissement: 65000, net: 750000, netN1: 695000 },
    ],
    passif: [
        { libelle: 'CAPITAUX PROPRES', isHeader: true },
        { libelle: 'Capital social ou individuel', isSubTitle: true, net: 200000, netN1: 200000 },
        { libelle: 'Réserves', isSubTitle: true },
        { libelle: 'Réserve légale', isSubItem: true, net: 20000, netN1: 15000 },
        { libelle: 'Autres réserves', isSubItem: true, net: 130000, netN1: 100000 },
        { libelle: "Résultat de l'exercice", isSubTitle: true, net: 80000, netN1: 75000 },
        { libelle: 'Total I', isTotal: true, net: 430000, netN1: 390000 },
        { libelle: 'DETTES', isHeader: true },
        { libelle: 'Dettes financières', isSubTitle: true, net: 200000, netN1: 220000 },
        { libelle: 'Dettes fournisseurs', isSubTitle: true, net: 110000, netN1: 105000 },
        { libelle: 'Dettes fiscales et sociales', isSubTitle: true, net: 10000, netN1: 10000 },
        { libelle: 'Total II', isTotal: true, net: 320000, netN1: 335000 },
        { libelle: 'TOTAL PASSIF', isGrandTotal: true, net: 750000, netN1: 725000 },
    ],
    totalActif: 750000,
    totalPassif: 750000,
};

const getBilanData = (year: string, type: BilanType): BilanData | null => {
    if (type === 'comptable') {
        return MOCK_BILAN_COMPTABLE_2025;
    }
    return null;
};

const formatAmount = (amount?: number | null) => {
    if (amount === null || amount === undefined) return '';
    return amount.toLocaleString('fr-FR');
}

export default function BilanPage() {
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);
    
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedType, setSelectedType] = useState<BilanType>('comptable');

    const [reportData, setReportData] = useState<BilanData | null>(null);
    const [printDateTime, setPrintDateTime] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (isDisplayModalOpen) {
            setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
        }
    }, [isDisplayModalOpen]);

    const handleGenerate = () => {
        const data = getBilanData(selectedYear, selectedType);
        if (!data) {
            toast({
                title: "Fonctionnalité non disponible",
                description: `La génération du bilan de type "${selectedType}" n'est pas encore implémentée.`,
                variant: "destructive",
            });
            return;
        }
        setReportData(data);
        setIsSelectionModalOpen(false);
        setIsDisplayModalOpen(true);
    };

    const handleExportPDF = () => {
        if (!reportData) return;
        const doc = new jsPDF();
        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SKOMPTAB";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const reportTitle = `Bilan comptable - Exercice ${selectedYear}`;
        
        const headStyles = { fillColor: '#e2e8f0', textColor: '#1e293b', fontStyle: 'bold' as const, lineWidth: 0.1 };
        const bodyStyles = { lineWidth: 0.1 };
        const footStyles = { fillColor: '#e2e8f0', textColor: '#1e293b', fontStyle: 'bold' as const, lineWidth: 0.1 };

        const generateTableBody = (lignes: BilanLigne[], isActif: boolean) => {
            return lignes.map(ligne => {
                const libelleCell = { content: ligne.libelle, styles: { fontStyle: (ligne.isHeader || ligne.isTotal || ligne.isGrandTotal) ? 'bold' : 'normal', cellWidth: isActif ? 50: 80 }};
                if(isActif) {
                    return [
                        libelleCell,
                        { content: formatAmount(ligne.brut), styles: { halign: 'right' as const } },
                        { content: formatAmount(ligne.amortissement), styles: { halign: 'right' as const } },
                        { content: formatAmount(ligne.net), styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
                        { content: formatAmount(ligne.netN1), styles: { halign: 'right' as const } }
                    ];
                }
                return [
                    libelleCell,
                    { content: formatAmount(ligne.net), styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
                    { content: formatAmount(ligne.netN1), styles: { halign: 'right' as const } }
                ];
            });
        };

        const actifBody = generateTableBody(reportData.actif, true);
        const passifBody = generateTableBody(reportData.passif, false);

        // Header
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, 20, 15);
        doc.setDrawColor(220);
        doc.line(20, 18, 190, 18);
        doc.addImage(logoDataUri, 'PNG', 20, 22, 12, 12);
        
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, 35, 28);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`État : ${reportTitle}`, 190, 25, { align: 'right' });
        doc.text(`Imprimé le : ${printDateTime}`, 190, 30, { align: 'right' });
        doc.text(`Par : ${userName}`, 190, 35, { align: 'right' });

        // Actif Table
        autoTable(doc, {
            head: [['ACTIF', 'Brut', 'Amort.', 'Net', 'Net N-1']],
            body: actifBody,
            theme: 'grid',
            headStyles: headStyles,
            bodyStyles: bodyStyles,
            footStyles: footStyles,
            startY: 50,
            tableWidth: 180,
            margin: { left: 15 }
        });

        // Passif Table - needs to be on a new page or below
        const finalY = (doc as any).lastAutoTable.finalY || 50;

        autoTable(doc, {
            head: [['PASSIF', 'Net', 'Net N-1']],
            body: passifBody,
            theme: 'grid',
            headStyles: headStyles,
            bodyStyles: bodyStyles,
            footStyles: footStyles,
            startY: finalY + 10,
            tableWidth: 180,
            margin: { left: 15 }
        });


        doc.save(`bilan_${selectedType}_${selectedYear}.pdf`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Bilan</CardTitle>
                    <CardDescription>Générez et consultez les différents types de bilans financiers.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Button size="lg" onClick={() => setIsSelectionModalOpen(true)}>
                        Générer un Bilan
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Paramètres du Bilan</DialogTitle>
                        <DialogDescription>Choisissez l'exercice et le type de bilan à générer.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="year-select">Exercice fiscal (année)</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger id="year-select"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2023">2023</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type-select">Type de bilan</Label>
                            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as BilanType)}>
                                <SelectTrigger id="type-select"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="comptable">Bilan comptable</SelectItem>
                                    <SelectItem value="fonctionnel">Bilan fonctionnel</SelectItem>
                                    <SelectItem value="financier">Bilan financier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSelectionModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleGenerate}>Générer le Bilan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDisplayModalOpen} onOpenChange={setIsDisplayModalOpen}>
                <DialogContent className="max-w-7xl">
                    <DialogHeader>
                        <DialogTitle>Bilan {selectedType} - Exercice {selectedYear}</DialogTitle>
                        <DialogDescription>
                            Aperçu du bilan. Vous pouvez l'exporter en PDF.
                        </DialogDescription>
                    </DialogHeader>
                    {reportData ? (
                         <div className="max-h-[70vh] overflow-y-auto p-2 border rounded-md bg-muted/20">
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Actif Column */}
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-center border-b-2 pb-1 mb-2">ACTIF</h3>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-1 font-semibold w-1/2">Libellé</th>
                                                <th className="text-right py-1 font-semibold">Brut</th>
                                                <th className="text-right py-1 font-semibold">Amort.</th>
                                                <th className="text-right py-1 font-semibold">Net</th>
                                                <th className="text-right py-1 font-semibold">Net N-1</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.actif.map((ligne, idx) => (
                                                <tr key={idx} className={cn(!ligne.isHeader && !ligne.isTotal && !ligne.isGrandTotal && "border-b border-dashed")}>
                                                    <td className={cn("py-1", ligne.isHeader && "font-bold uppercase pt-2", ligne.isSubTitle && "pl-2 font-semibold", ligne.isSubItem && "pl-4", ligne.isTotal && "font-bold pt-2", ligne.isGrandTotal && "font-extrabold text-sm pt-2")}>{ligne.libelle}</td>
                                                    <td className="text-right font-mono py-1">{formatAmount(ligne.brut)}</td>
                                                    <td className="text-right font-mono py-1">{formatAmount(ligne.amortissement)}</td>
                                                    <td className={cn("text-right font-mono py-1", (ligne.isTotal || ligne.isGrandTotal) ? "font-bold" : "font-semibold")}>{formatAmount(ligne.net)}</td>
                                                    <td className="text-right font-mono py-1">{formatAmount(ligne.netN1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Passif Column */}
                                <div className="space-y-2">
                                     <h3 className="text-lg font-bold text-center border-b-2 pb-1 mb-2">PASSIF</h3>
                                     <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-1 font-semibold w-3/4">Libellé</th>
                                                <th className="text-right py-1 font-semibold">Net</th>
                                                <th className="text-right py-1 font-semibold">Net N-1</th>
                                            </tr>
                                        </thead>
                                         <tbody>
                                            {reportData.passif.map((ligne, idx) => (
                                                <tr key={idx} className={cn(!ligne.isHeader && !ligne.isTotal && !ligne.isGrandTotal && "border-b border-dashed")}>
                                                    <td className={cn("py-1", ligne.isHeader && "font-bold uppercase pt-2", ligne.isSubTitle && "pl-2 font-semibold", ligne.isSubItem && "pl-4", ligne.isTotal && "font-bold pt-2", ligne.isGrandTotal && "font-extrabold text-sm pt-2")}>{ligne.libelle}</td>
                                                    <td className={cn("text-right font-mono py-1", (ligne.isTotal || ligne.isGrandTotal) ? "font-bold" : "font-semibold")}>{formatAmount(ligne.net)}</td>
                                                    <td className="text-right font-mono py-1">{formatAmount(ligne.netN1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                             </div>
                         </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">Erreur lors de la génération du rapport.</div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDisplayModalOpen(false)}>Fermer</Button>
                        <Button onClick={handleExportPDF} disabled={!reportData}><Download className="mr-2 h-4 w-4"/>Exporter en PDF</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
