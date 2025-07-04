'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Download, ArrowLeft } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';

// --- MOCK DATA ---
const MOCK_ECRITURES = [
    // Before period (for initial balance)
    { dateOperation: '2024-12-15', compte: '607000', debit: 500, credit: 0 },
    { dateOperation: '2024-12-20', compte: '706000', debit: 0, credit: 1200 },
    { dateOperation: '2024-12-25', compte: '512000', debit: 1200, credit: 500 },

    // Inside period (Jan 2025)
    { dateOperation: '2025-01-10', compte: '607000', debit: 1500, credit: 0 },
    { dateOperation: '2025-01-14', compte: '607000', debit: 750, credit: 0 },
    { dateOperation: '2025-01-20', compte: '706000', debit: 0, credit: 3000 },
    { dateOperation: '2025-01-22', compte: '512000', debit: 3000, credit: 2250 },
    { dateOperation: '2025-01-25', compte: '625000', debit: 120, credit: 0 },
    { dateOperation: '2025-01-28', compte: '512000', debit: 0, credit: 120 },
];

const MOCK_COMPTES = [
    { numero: '512000', intitule: 'Banque' },
    { numero: '607000', intitule: 'Achats de marchandises' },
    { numero: '625000', intitule: 'Déplacements, missions et réceptions' },
    { numero: '706000', intitule: 'Prestations de services' }
];

type BalanceType = 'simple' | '4col' | '6col' | '8col';

type BalanceRow = {
    numero: string;
    intitule: string;
    soldeInitialDebit: number;
    soldeInitialCredit: number;
    mouvementDebit: number;
    mouvementCredit: number;
    cumulDebit: number;
    cumulCredit: number;
    soldeFinalDebit: number;
    soldeFinalCredit: number;
};

const BALANCE_TYPE_CONFIG: Record<BalanceType, { label: string; keys: (keyof BalanceRow)[]; headers: string[] }> = {
  simple: { label: 'Simplifiée (2 colonnes)', keys: ['numero', 'intitule', 'cumulDebit', 'cumulCredit'], headers: ['Compte', 'Intitulé', 'Total Débit', 'Total Crédit'] },
  '4col': { label: '4 colonnes', keys: ['numero', 'intitule', 'mouvementDebit', 'mouvementCredit', 'soldeFinalDebit', 'soldeFinalCredit'], headers: ['Compte', 'Intitulé', 'Mvt Débit', 'Mvt Crédit', 'Solde Débiteur', 'Solde Créditeur'] },
  '6col': { label: '6 colonnes', keys: ['numero', 'intitule', 'soldeInitialDebit', 'soldeInitialCredit', 'mouvementDebit', 'mouvementCredit', 'soldeFinalDebit', 'soldeFinalCredit'], headers: ['Compte', 'Intitulé', 'SI Débit', 'SI Crédit', 'Mvt Débit', 'Mvt Crédit', 'SF Débiteur', 'SF Créditeur'] },
  '8col': { label: '8 colonnes', keys: ['numero', 'intitule', 'soldeInitialDebit', 'soldeInitialCredit', 'mouvementDebit', 'mouvementCredit', 'cumulDebit', 'cumulCredit', 'soldeFinalDebit', 'soldeFinalCredit'], headers: ['Compte', 'Intitulé', 'SI Débit', 'SI Crédit', 'Mvt Débit', 'Mvt Crédit', 'Cumul Débit', 'Cumul Crédit', 'SF Débiteur', 'SF Créditeur'] }
};


export default function BalanceGeneralePage() {
    const [modalStep, setModalStep] = useState<'closed' | 'selection' | 'display'>('closed');
    
    const [period, setPeriod] = useState<DateRange | undefined>({ from: new Date(2025, 0, 1), to: new Date(2025, 0, 31) });
    const [balanceType, setBalanceType] = useState<BalanceType>('8col');

    const [reportData, setReportData] = useState<BalanceRow[]>([]);
    const [printDateTime, setPrintDateTime] = useState('');
    const { toast } = useToast();
    
    const handleCloseModal = () => {
        setModalStep('closed');
    }

    useEffect(() => {
        if (modalStep === 'display') {
            setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
        }
    }, [modalStep]);

    const handleGenerate = () => {
        if (!period?.from || !period?.to) {
            toast({ title: "Période invalide", description: "Veuillez sélectionner une date de début et de fin.", variant: "destructive" });
            return;
        }

        const data: BalanceRow[] = [];
        for (const compte of MOCK_COMPTES) {
            const initialEcritures = MOCK_ECRITURES.filter(e => e.compte === compte.numero && new Date(e.dateOperation) < period.from!);
            const initialDebit = initialEcritures.reduce((acc, e) => acc + e.debit, 0);
            const initialCredit = initialEcritures.reduce((acc, e) => acc + e.credit, 0);
            const initialSolde = initialDebit - initialCredit;

            const periodEcritures = MOCK_ECRITURES.filter(e => e.compte === compte.numero && new Date(e.dateOperation) >= period.from! && new Date(e.dateOperation) <= period.to!);
            const mouvementDebit = periodEcritures.reduce((acc, e) => acc + e.debit, 0);
            const mouvementCredit = periodEcritures.reduce((acc, e) => acc + e.credit, 0);

            const cumulDebit = initialDebit + mouvementDebit;
            const cumulCredit = initialCredit + mouvementCredit;

            const finalSolde = cumulDebit - cumulCredit;
            
            data.push({
                numero: compte.numero,
                intitule: compte.intitule,
                soldeInitialDebit: initialSolde > 0 ? initialSolde : 0,
                soldeInitialCredit: initialSolde < 0 ? -initialSolde : 0,
                mouvementDebit,
                mouvementCredit,
                cumulDebit,
                cumulCredit,
                soldeFinalDebit: finalSolde > 0 ? finalSolde : 0,
                soldeFinalCredit: finalSolde < 0 ? -finalSolde : 0,
            });
        }
        
        setReportData(data);
        setModalStep('display');
    };

    const tableConfig = BALANCE_TYPE_CONFIG[balanceType];
    const totals = useMemo(() => {
        if (!reportData) return {};
        return tableConfig.keys.reduce((acc, key) => {
            if (typeof reportData[0]?.[key as keyof BalanceRow] === 'number') {
                acc[key as keyof BalanceRow] = reportData.reduce((sum, row) => sum + (Number(row[key as keyof BalanceRow]) || 0), 0);
            }
            return acc;
        }, {} as Partial<BalanceRow>);
    }, [reportData, tableConfig.keys]);

    const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SKOMPTAB";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const periodString = period?.from ? (period.to ? `${format(period.from, 'dd LLL yy', { locale: fr })} au ${format(period.to, 'dd LLL yy', { locale: fr })}` : format(period.from, 'dd LLL yy', { locale: fr })) : 'N/A';
        
        const pdfTableBody = reportData.map(row => tableConfig.keys.map(key => {
            const value = row[key as keyof BalanceRow];
            if (key === 'numero' || key === 'intitule') return value;
            return typeof value === 'number' && value !== 0 ? value.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '';
        }));

        const pdfTableFooter = [tableConfig.keys.map((key, index) => {
            if (index === 1) return 'TOTAUX';
            const totalValue = totals[key as keyof BalanceRow];
            if(typeof totalValue === 'number') return totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
            return '';
        })];

        autoTable(doc, {
            head: [tableConfig.headers],
            body: pdfTableBody,
            foot: pdfTableFooter,
            theme: 'striped',
            headStyles: { fillColor: [226, 232, 240], halign: 'center' },
            footStyles: { fillColor: [241, 245, 249], fontStyle: 'bold' },
            didDrawPage: (data) => {
                doc.setFontSize(9); doc.setTextColor(150);
                doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, 20, 15);
                doc.setDrawColor(220); doc.line(20, 18, 277, 18);
                doc.addImage(logoDataUri, 'PNG', 20, 22, 12, 12);
                doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
                doc.text(companyName, 35, 28);
                doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
                doc.text(`État : Balance Générale`, 277, 25, { align: 'right' });
                doc.text(`Période : ${periodString}`, 277, 30, { align: 'right' });
                doc.text(`Imprimé le : ${printDateTime}`, 277, 35, { align: 'right' });
                doc.text(`Par : ${userName}`, 277, 40, { align: 'right' });
                const pageCountTotal = (doc as any).internal.getNumberOfPages();
                doc.setFontSize(8); doc.setTextColor(150);
                doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left!, doc.internal.pageSize.height - 10);
            },
            margin: { top: 50 }
        });
        doc.save(`balance_generale_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Balance Générale</CardTitle>
                    <CardDescription>Consultez la balance générale des comptes pour une période donnée.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Button size="lg" onClick={() => setModalStep('selection')}>
                        Générer la Balance Générale
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={modalStep !== 'closed'} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className={modalStep === 'display' ? "max-w-7xl" : "sm:max-w-md"}>
                    {modalStep === 'selection' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Paramètres de la Balance</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Type de Balance</Label>
                                    <Select value={balanceType} onValueChange={(v) => setBalanceType(v as BalanceType)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(BALANCE_TYPE_CONFIG).map(([key, { label }]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date de début</Label>
                                        <Popover>
                                            <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{period?.from ? format(period.from, 'dd/MM/yyyy') : 'Sélectionnez'}</Button></PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={period?.from} onSelect={(date) => setPeriod(p => ({ ...p, from: date }))} locale={fr} /></PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date de fin</Label>
                                        <Popover>
                                            <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{period?.to ? format(period.to, 'dd/MM/yyyy') : 'Sélectionnez'}</Button></PopoverTrigger>
                                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={period?.to} onSelect={(date) => setPeriod(p => ({ ...p, to: date }))} locale={fr} /></PopoverContent>
                                        </Popover>
                                    </div>
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
                                <DialogTitle>Balance Générale</DialogTitle>
                                <DialogDescription>
                                     Période du {period?.from ? format(period.from, 'dd LLL yyyy', {locale: fr}) : ''} au {period?.to ? format(period.to, 'dd LLL yyyy', {locale: fr}) : ''}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto pr-4">
                                 <Table>
                                    <TableHeader><TableRow>
                                        {tableConfig.headers.map(h => <TableHead key={h} className={h.includes('Compte') || h.includes('Intitulé') ? 'text-left' : 'text-right'}>{h}</TableHead>)}
                                    </TableRow></TableHeader>
                                    <TableBody>
                                        {reportData.map((row) => (
                                            <TableRow key={row.numero}>
                                                {tableConfig.keys.map(key => (
                                                    <TableCell key={key} className={key.includes('numero') || key.includes('intitule') ? 'text-left font-medium' : 'text-right font-mono'}>
                                                        {typeof row[key] === 'number' && (row[key] as number) === 0 ? '' : typeof row[key] === 'number' ? (row[key] as number).toLocaleString('fr-FR', {minimumFractionDigits: 2}) : row[key]}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-right font-bold">TOTAUX</TableCell>
                                             {tableConfig.keys.slice(2).map(key => (
                                                 <TableCell key={`total-${key}`} className="text-right font-bold font-mono">
                                                     {(totals[key as keyof BalanceRow] || 0).toLocaleString('fr-FR', {minimumFractionDigits: 2})}
                                                 </TableCell>
                                             ))}
                                        </TableRow>
                                    </TableFooter>
                                 </Table>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setModalStep('selection')}><ArrowLeft className="mr-2 h-4 w-4"/> Précédent</Button>
                                <div className="flex-grow" />
                                <Button variant="outline" onClick={handleCloseModal}>Fermer</Button>
                                <Button onClick={handleExportPDF}><Download className="mr-2 h-4 w-4"/>Exporter en PDF</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
