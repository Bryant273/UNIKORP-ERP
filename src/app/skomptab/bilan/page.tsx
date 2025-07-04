
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
    numeroCompte?: string;
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
        { libelle: 'Frais de développement', numeroCompte: '201000', isSubItem: true, brut: 20000, amortissement: 5000, net: 15000, netN1: 10000 },
        { libelle: 'Concessions, brevets...', numeroCompte: '205000', isSubItem: true, brut: 70000, amortissement: 10000, net: 60000, netN1: 50000 },
        { libelle: 'Immobilisations corporelles', isSubTitle: true },
        { libelle: 'Terrains', numeroCompte: '211000', isSubItem: true, brut: 100000, amortissement: 0, net: 100000, netN1: 100000 },
        { libelle: 'Constructions', numeroCompte: '213000', isSubItem: true, brut: 250000, amortissement: 50000, net: 200000, netN1: 180000 },
        { libelle: 'Immobilisations financières', isSubTitle: true },
        { libelle: 'Titres de participation', numeroCompte: '261000', isSubItem: true, brut: 25000, amortissement: 0, net: 25000, netN1: 20000 },
        { libelle: 'Total Actif Immobilisé (I)', isTotal: true, brut: 465000, amortissement: 65000, net: 400000, netN1: 360000 },

        { libelle: 'ACTIF CIRCULANT', isHeader: true },
        { libelle: 'Stocks', isSubTitle: true },
        { libelle: 'Marchandises', numeroCompte: '370000', isSubItem: true, brut: 85000, amortissement: 5000, net: 80000, netN1: 75000 },
        { libelle: 'Créances', isSubTitle: true },
        { libelle: 'Clients et comptes rattachés', numeroCompte: '411000', isSubItem: true, brut: 150000, amortissement: 10000, net: 140000, netN1: 130000 },
        { libelle: 'Total Actif Circulant (II)', isTotal: true, brut: 235000, amortissement: 15000, net: 220000, netN1: 205000 },
        
        { libelle: 'TRÉSORERIE - ACTIF', isHeader: true },
        { libelle: 'Banques', numeroCompte: '512000', isSubTitle: true, brut: 90000, amortissement: 0, net: 90000, netN1: 95000 },
        { libelle: 'Caisse', numeroCompte: '530000', isSubTitle: true, brut: 5000, amortissement: 0, net: 5000, netN1: 5000 },
        { libelle: 'Total Trésorerie - Actif (III)', isTotal: true, brut: 95000, amortissement: 0, net: 95000, netN1: 100000 },

        { libelle: 'TOTAL ACTIF (I + II + III)', isGrandTotal: true, brut: 795000, amortissement: 80000, net: 715000, netN1: 665000 },
    ],
    passif: [
        { libelle: 'CAPITAUX PROPRES', isHeader: true },
        { libelle: 'Capital social', numeroCompte: '101000', isSubTitle: true, net: 200000, netN1: 200000 },
        { libelle: 'Réserves (légale, statutaires, ...)', numeroCompte: '106000', isSubTitle: true, net: 150000, netN1: 115000 },
        { libelle: "Résultat de l'exercice", numeroCompte: '120000', isSubTitle: true, net: 80000, netN1: 75000 },
        { libelle: 'Total Capitaux Propres (I)', isTotal: true, net: 430000, netN1: 390000 },
        
        { libelle: 'DETTES FINANCIÈRES', isHeader: true },
        { libelle: 'Emprunts et dettes assimilées', numeroCompte: '164000', isSubTitle: true, net: 150000, netN1: 180000 },
        { libelle: 'Total Dettes Financières (II)', isTotal: true, net: 150000, netN1: 180000 },

        { libelle: 'CAPITAUX PERMANENTS (I + II)', isTotal: true, net: 580000, netN1: 570000 },
        
        { libelle: 'PASSIF CIRCULANT', isHeader: true },
        { libelle: 'Dettes fournisseurs', numeroCompte: '401000', isSubTitle: true, net: 110000, netN1: 105000 },
        { libelle: 'Dettes fiscales et sociales', numeroCompte: '440000', isSubTitle: true, net: 20000, netN1: 15000 },
        { libelle: 'Total Passif Circulant (III)', isTotal: true, net: 130000, netN1: 120000 },
        
        { libelle: 'TRÉSORERIE - PASSIF', isHeader: true },
        { libelle: 'Concours bancaires courants', numeroCompte: '519000', isSubTitle: true, net: 5000, netN1: 10000 },
        { libelle: 'Total Trésorerie - Passif (IV)', isTotal: true, net: 5000, netN1: 10000 },
        
        { libelle: 'TOTAL PASSIF (I + II + III + IV)', isGrandTotal: true, net: 715000, netN1: 700000 },
    ],
    totalActif: 715000,
    totalPassif: 715000,
};

const MOCK_BILAN_FONCTIONNEL_2025: BilanData = {
    actif: [
        { libelle: 'EMPLOIS STABLES (Actif Immobilisé Brut)', isHeader: true },
        { libelle: 'Frais de développement', numeroCompte: '201000', isSubItem: true, net: 20000 },
        { libelle: 'Concessions, brevets...', numeroCompte: '205000', isSubItem: true, net: 70000 },
        { libelle: 'Terrains', numeroCompte: '211000', isSubItem: true, net: 100000 },
        { libelle: 'Constructions', numeroCompte: '213000', isSubItem: true, net: 250000 },
        { libelle: 'Titres de participation', numeroCompte: '261000', isSubItem: true, net: 25000 },
        { libelle: 'Total Emplois Stables', isTotal: true, net: 465000 },

        { libelle: 'ACTIF CIRCULANT', isHeader: true },
        { libelle: 'Actif Circulant d\'Exploitation', isSubTitle: true },
        { libelle: 'Stocks de marchandises (brut)', numeroCompte: '370000', isSubItem: true, net: 85000 },
        { libelle: 'Créances clients (brut)', numeroCompte: '411000', isSubItem: true, net: 150000 },
        { libelle: 'Total ACE', isTotal: true, net: 235000 },

        { libelle: 'Actif Circulant Hors Exploitation', isSubTitle: true },
        { libelle: 'Autres créances (pour démo)', numeroCompte: '467000', isSubItem: true, net: 0 },
        { libelle: 'Total ACHE', isTotal: true, net: 0 },

        { libelle: 'TRÉSORERIE ACTIVE', isHeader: true },
        { libelle: 'Banques', numeroCompte: '512000', isSubTitle: true, net: 90000 },
        { libelle: 'Caisse', numeroCompte: '530000', isSubTitle: true, net: 5000 },
        { libelle: 'Total Trésorerie Active', isTotal: true, net: 95000 },
        
        { libelle: 'TOTAL ACTIF', isGrandTotal: true, net: 795000 },
    ],
    passif: [
        { libelle: 'RESSOURCES STABLES', isHeader: true },
        { libelle: 'Capital social', numeroCompte: '101000', isSubItem: true, net: 200000 },
        { libelle: 'Réserves (légale, statutaires, ...)', numeroCompte: '106000', isSubItem: true, net: 150000 },
        { libelle: "Résultat de l'exercice", numeroCompte: '120000', isSubItem: true, net: 80000 },
        { libelle: 'Amortissements et provisions', isSubItem: true, net: 80000 },
        { libelle: 'Dettes financières (> 1 an)', numeroCompte: '164000', isSubItem: true, net: 150000 },
        { libelle: 'Total Ressources Stables', isTotal: true, net: 660000 },

        { libelle: 'PASSIF CIRCULANT', isHeader: true },
        { libelle: 'Passif Circulant d\'Exploitation', isSubTitle: true },
        { libelle: 'Dettes fournisseurs', numeroCompte: '401000', isSubItem: true, net: 110000 },
        { libelle: 'Dettes fiscales et sociales', numeroCompte: '440000', isSubItem: true, net: 20000 },
        { libelle: 'Total PCE', isTotal: true, net: 130000 },
        
        { libelle: 'Passif Circulant Hors Exploitation', isSubTitle: true },
        { libelle: 'Autres dettes (pour démo)', numeroCompte: '468000', isSubItem: true, net: 0 },
        { libelle: 'Total PCHE', isTotal: true, net: 0 },

        { libelle: 'TRÉSORERIE PASSIVE', isHeader: true },
        { libelle: 'Concours bancaires courants', numeroCompte: '519000', isSubTitle: true, net: 5000 },
        { libelle: 'Total Trésorerie Passive', isTotal: true, net: 5000 },
        
        { libelle: 'TOTAL PASSIF', isGrandTotal: true, net: 795000 },
    ],
    totalActif: 795000,
    totalPassif: 795000,
};

const MOCK_BILAN_FINANCIER_2025: BilanData = {
    actif: [
        { libelle: "Valeurs immobilisées ou actif à plus d'un an", isHeader: true },
        { libelle: 'Immobilisations incorporelles', numeroCompte: '20', isSubItem: true, net: 75000, netN1: 60000 },
        { libelle: 'Immobilisations corporelles', numeroCompte: '21', isSubItem: true, net: 300000, netN1: 280000 },
        { libelle: 'Immobilisations financières', numeroCompte: '26', isSubItem: true, net: 25000, netN1: 20000 },
        { libelle: "Total Actif à plus d'un an", isTotal: true, net: 400000, netN1: 360000 },

        { libelle: "Actif à moins d'un an", isHeader: true },
        { libelle: "Valeurs d'exploitation (A)", isSubTitle: true },
        { libelle: 'Marchandises (Stocks flottants)', numeroCompte: '370000', isSubItem: true, net: 80000, netN1: 75000 },
        { libelle: 'Total Valeurs d\'exploitation', isTotal: true, net: 80000, netN1: 75000 },
        { libelle: "Valeurs réalisables (B)", isSubTitle: true },
        { libelle: 'Clients et comptes rattachés', numeroCompte: '411000', isSubItem: true, net: 140000, netN1: 130000 },
        { libelle: 'Total Valeurs réalisables', isTotal: true, net: 140000, netN1: 130000 },
        { libelle: "Disponibilités (C)", isSubTitle: true },
        { libelle: 'Banques', numeroCompte: '512000', isSubItem: true, net: 90000, netN1: 95000 },
        { libelle: 'Caisse', numeroCompte: '530000', isSubItem: true, net: 5000, netN1: 5000 },
        { libelle: 'Total Disponibilités', isTotal: true, net: 95000, netN1: 100000 },
        { libelle: "Total Actif à moins d'un an (A+B+C)", isTotal: true, net: 315000, netN1: 305000 },
        
        { libelle: 'TOTAL ACTIF', isGrandTotal: true, net: 715000, netN1: 665000 },
    ],
    passif: [
        { libelle: 'Capitaux propres', isHeader: true },
        { libelle: 'Capital social', numeroCompte: '101000', isSubItem: true, net: 200000, netN1: 200000 },
        { libelle: 'Réserves', numeroCompte: '106000', isSubItem: true, net: 150000, netN1: 115000 },
        { libelle: "Résultat de l'exercice", numeroCompte: '120000', isSubItem: true, net: 80000, netN1: 75000 },
        { libelle: 'Total Capitaux Propres', isTotal: true, net: 430000, netN1: 390000 },
        
        { libelle: 'Dettes à long terme', isHeader: true },
        { libelle: 'Emprunts et dettes assimilées (> 1 an)', numeroCompte: '164000', isSubItem: true, net: 150000, netN1: 180000 },
        { libelle: 'Total Dettes à long terme', isTotal: true, net: 150000, netN1: 180000 },
        
        { libelle: 'Dettes à court terme', isHeader: true },
        { libelle: 'Dettes fournisseurs', numeroCompte: '401000', isSubItem: true, net: 110000, netN1: 105000 },
        { libelle: 'Dettes fiscales et sociales', numeroCompte: '440000', isSubItem: true, net: 20000, netN1: 15000 },
        { libelle: 'Concours bancaires courants', numeroCompte: '519000', isSubItem: true, net: 5000, netN1: 10000 },
        { libelle: 'Total Dettes à court terme', isTotal: true, net: 135000, netN1: 130000 },
        
        { libelle: 'TOTAL PASSIF', isGrandTotal: true, net: 715000, netN1: 700000 },
    ],
    totalActif: 715000,
    totalPassif: 715000,
};


const getBilanData = (year: string, type: BilanType): BilanData | null => {
    if (year === '2025') {
        if (type === 'comptable') return MOCK_BILAN_COMPTABLE_2025;
        if (type === 'fonctionnel') return MOCK_BILAN_FONCTIONNEL_2025;
        if (type === 'financier') return MOCK_BILAN_FINANCIER_2025;
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
                description: `La génération du bilan de type "${selectedType}" pour l'année ${selectedYear} n'est pas encore implémentée.`,
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
        
        const reportTitle = `Bilan ${selectedType} - Exercice ${selectedYear}`;
        
        const headStyles = { fillColor: '#e2e8f0', textColor: '#1e293b', fontStyle: 'bold' as const, lineWidth: 0.1 };
        const bodyStyles = { lineWidth: 0.1 };

        const drawHeader = (data: any) => {
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
            doc.setDrawColor(220);
            doc.line(data.settings.margin.left, 18, doc.internal.pageSize.getWidth() - data.settings.margin.right, 18);
            doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
            
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.setFont('helvetica', 'bold');
            doc.text(companyName, data.settings.margin.left + 15, 28);
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            const rightX = doc.internal.pageSize.getWidth() - data.settings.margin.right;
            doc.text(`État : ${reportTitle}`, rightX, 25, { align: 'right' });
            doc.text(`Imprimé le : ${printDateTime}`, rightX, 30, { align: 'right' });
            doc.text(`Par : ${userName}`, rightX, 35, { align: 'right' });
        };
        
        if (selectedType === 'comptable') {
            const generateActifTableBody = (lignes: BilanLigne[]) => lignes.map(ligne => [
                { content: ligne.numeroCompte || '', styles: { fontStyle: 'normal', cellWidth: 20 } },
                { content: ligne.libelle, styles: { fontStyle: (ligne.isHeader || ligne.isTotal || ligne.isGrandTotal) ? 'bold' : 'normal', cellWidth: 70 } },
                { content: formatAmount(ligne.brut), styles: { halign: 'right' as const } },
                { content: formatAmount(ligne.amortissement), styles: { halign: 'right' as const } },
                { content: formatAmount(ligne.net), styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
                { content: formatAmount(ligne.netN1), styles: { halign: 'right' as const } }
            ]);

            const generatePassifTableBody = (lignes: BilanLigne[]) => lignes.map(ligne => [
                { content: ligne.numeroCompte || '', styles: { fontStyle: 'normal', cellWidth: 20 } },
                { content: ligne.libelle, styles: { fontStyle: (ligne.isHeader || ligne.isTotal || ligne.isGrandTotal) ? 'bold' : 'normal', cellWidth: 100 } },
                { content: formatAmount(ligne.net), styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
                { content: formatAmount(ligne.netN1), styles: { halign: 'right' as const } }
            ]);

            autoTable(doc, { head: [['Compte', 'ACTIF', 'Brut', 'Amort. & Prov.', 'Net', 'Net N-1']], body: generateActifTableBody(reportData.actif), theme: 'grid', headStyles, bodyStyles, startY: 50, tableWidth: 180, margin: { left: 15 }, didDrawPage: drawHeader });
            doc.addPage();
            autoTable(doc, { head: [['Compte', 'PASSIF', 'Net', 'Net N-1']], body: generatePassifTableBody(reportData.passif), theme: 'grid', headStyles, bodyStyles, startY: 50, tableWidth: 180, margin: { left: 15 }, didDrawPage: drawHeader });
        } else if (selectedType === 'fonctionnel' || selectedType === 'financier') {
            const generateTableBody = (lignes: BilanLigne[]) => lignes.map(ligne => [
                { content: ligne.numeroCompte || '', styles: { fontStyle: 'normal', cellWidth: 25 } },
                { content: ligne.libelle, styles: { fontStyle: (ligne.isHeader || ligne.isTotal || ligne.isGrandTotal) ? 'bold' : 'normal', cellWidth: 95 } },
                { content: formatAmount(ligne.net), styles: { halign: 'right' as const, fontStyle: 'bold' as const } }
            ]);
            
            const headLabel = selectedType === 'fonctionnel' ? 'Valeur' : 'Valeur Nette';
            autoTable(doc, { head: [['Compte', 'ACTIF', headLabel]], body: generateTableBody(reportData.actif), theme: 'grid', headStyles, bodyStyles, startY: 50, tableWidth: 180, margin: { left: 15 }, didDrawPage: drawHeader });
            doc.addPage();
            autoTable(doc, { head: [['Compte', 'PASSIF', headLabel]], body: generateTableBody(reportData.passif), theme: 'grid', headStyles, bodyStyles, startY: 50, tableWidth: 180, margin: { left: 15 }, didDrawPage: drawHeader });
        }


        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8); doc.setTextColor(150);
            doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }

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
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                                {/* Actif Column */}
                                {selectedType === 'comptable' && (
                                <div className="space-y-2">
                                    <table className="w-full text-xs table-fixed">
                                        <colgroup>
                                            <col style={{width: '12%'}} />
                                            <col style={{width: '38%'}} />
                                            <col style={{width: '15%'}} />
                                            <col style={{width: '15%'}} />
                                            <col style={{width: '15%'}} />
                                            <col style={{width: '15%'}} />
                                        </colgroup>
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-1 font-semibold">Compte</th>
                                                <th className="text-left py-1 font-semibold">ACTIF</th>
                                                <th className="text-right py-1 font-semibold">Brut</th>
                                                <th className="text-right py-1 font-semibold">Amort.</th>
                                                <th className="text-right py-1 font-semibold">Net</th>
                                                <th className="text-right py-1 font-semibold">Net N-1</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.actif.map((ligne, idx) => (
                                                <tr key={`actif-${idx}`} className={cn(!ligne.isHeader && !ligne.isTotal && !ligne.isGrandTotal && "border-b border-dashed")}>
                                                    <td className="font-mono text-xs text-center py-1">{ligne.numeroCompte}</td>
                                                    <td className={cn("py-1", ligne.isHeader && "font-bold uppercase pt-2", ligne.isSubTitle && "pl-2 font-semibold", ligne.isSubItem && "pl-4", ligne.isTotal && "font-bold pt-2 border-t", ligne.isGrandTotal && "font-extrabold text-sm pt-2 border-t-2")}>{ligne.libelle}</td>
                                                    <td className="text-right font-mono py-1">{formatAmount(ligne.brut)}</td>
                                                    <td className="text-right font-mono py-1">{formatAmount(ligne.amortissement)}</td>
                                                    <td className={cn("text-right font-mono py-1", (ligne.isTotal || ligne.isGrandTotal) ? "font-bold" : "font-semibold")}>{formatAmount(ligne.net)}</td>
                                                    <td className="text-right font-mono py-1">{formatAmount(ligne.netN1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                )}
                                {(selectedType === 'fonctionnel' || selectedType === 'financier') && (
                                <div className="space-y-2">
                                     <table className="w-full text-xs table-fixed">
                                        <colgroup>
                                            <col style={{width: '20%'}} />
                                            <col style={{width: '60%'}} />
                                            <col style={{width: '20%'}} />
                                        </colgroup>
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-1 font-semibold">Compte</th>
                                                <th className="text-left py-1 font-semibold">ACTIF</th>
                                                <th className="text-right py-1 font-semibold">{selectedType === 'fonctionnel' ? 'Valeur' : 'Valeur Nette'}</th>
                                            </tr>
                                        </thead>
                                         <tbody>
                                            {reportData.actif.map((ligne, idx) => (
                                                <tr key={`actif-fonc-${idx}`} className={cn(!ligne.isHeader && !ligne.isTotal && !ligne.isGrandTotal && "border-b border-dashed")}>
                                                    <td className="font-mono text-xs text-center py-1">{ligne.numeroCompte}</td>
                                                    <td className={cn("py-1", ligne.isHeader && "font-bold uppercase pt-2", ligne.isSubTitle && "pl-2 font-semibold", ligne.isSubItem && "pl-4", ligne.isTotal && "font-bold pt-2 border-t", ligne.isGrandTotal && "font-extrabold text-sm pt-2 border-t-2")}>{ligne.libelle}</td>
                                                    <td className={cn("text-right font-mono py-1", (ligne.isTotal || ligne.isGrandTotal) ? "font-bold" : "font-semibold")}>{formatAmount(ligne.net)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                )}


                                {/* Passif Column */}
                                {selectedType === 'comptable' && (
                                <div className="space-y-2">
                                     <table className="w-full text-xs table-fixed">
                                        <colgroup>
                                            <col style={{width: '15%'}} />
                                            <col style={{width: '55%'}} />
                                            <col style={{width: '15%'}} />
                                            <col style={{width: '15%'}} />
                                        </colgroup>
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-1 font-semibold">Compte</th>
                                                <th className="text-left py-1 font-semibold">PASSIF</th>
                                                <th className="text-right py-1 font-semibold">Net</th>
                                                <th className="text-right py-1 font-semibold">Net N-1</th>
                                            </tr>
                                        </thead>
                                         <tbody>
                                            {reportData.passif.map((ligne, idx) => (
                                                <tr key={`passif-${idx}`} className={cn(!ligne.isHeader && !ligne.isTotal && !ligne.isGrandTotal && "border-b border-dashed")}>
                                                    <td className="font-mono text-xs text-center py-1">{ligne.numeroCompte}</td>
                                                    <td className={cn("py-1", ligne.isHeader && "font-bold uppercase pt-2", ligne.isSubTitle && "pl-2 font-semibold", ligne.isSubItem && "pl-4", ligne.isTotal && "font-bold pt-2 border-t", ligne.isGrandTotal && "font-extrabold text-sm pt-2 border-t-2")}>{ligne.libelle}</td>
                                                    <td className={cn("text-right font-mono py-1", (ligne.isTotal || ligne.isGrandTotal) ? "font-bold" : "font-semibold")}>{formatAmount(ligne.net)}</td>
                                                    <td className="text-right font-mono py-1">{formatAmount(ligne.netN1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                )}
                                {(selectedType === 'fonctionnel' || selectedType === 'financier') && (
                                <div className="space-y-2">
                                    <table className="w-full text-xs table-fixed">
                                        <colgroup>
                                            <col style={{width: '20%'}} />
                                            <col style={{width: '60%'}} />
                                            <col style={{width: '20%'}} />
                                        </colgroup>
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-1 font-semibold">Compte</th>
                                                <th className="text-left py-1 font-semibold">PASSIF</th>
                                                <th className="text-right py-1 font-semibold">{selectedType === 'fonctionnel' ? 'Valeur' : 'Valeur Nette'}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.passif.map((ligne, idx) => (
                                                <tr key={`passif-fonc-${idx}`} className={cn(!ligne.isHeader && !ligne.isTotal && !ligne.isGrandTotal && "border-b border-dashed")}>
                                                    <td className="font-mono text-xs text-center py-1">{ligne.numeroCompte}</td>
                                                    <td className={cn("py-1", ligne.isHeader && "font-bold uppercase pt-2", ligne.isSubTitle && "pl-2 font-semibold", ligne.isSubItem && "pl-4", ligne.isTotal && "font-bold pt-2 border-t", ligne.isGrandTotal && "font-extrabold text-sm pt-2 border-t-2")}>{ligne.libelle}</td>
                                                    <td className={cn("text-right font-mono py-1", (ligne.isTotal || ligne.isGrandTotal) ? "font-bold" : "font-semibold")}>{formatAmount(ligne.net)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                )}
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

    