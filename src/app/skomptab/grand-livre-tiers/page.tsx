
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/logo';

// Mock data
type EcritureLivreTiers = {
    id: number;
    numeroCompta: string;
    journal: string;
    date: string;
    compteGeneral: string;
    operation: string;
    tiersCode: string;
    tiersLibelle: string;
    dateEcriture: string;
    debit: number;
    credit: number;
};
const MOCK_ECRITURES_LIVRE_TIERS: EcritureLivreTiers[] = [
    // SEFIATOU OLAWNI - Supplier. Two unpaid invoices.
    { id: 1, numeroCompta: 'AC-2025-001', journal: 'Achats', date: '2025-01-31', compteGeneral: '4011', operation: 'ROULEAUX DE BOBINE ET PINCEAUX', tiersCode: 'SEFIATOU', tiersLibelle: 'SEFIATOU OLAWNI', dateEcriture: '2025-01-31', debit: 0, credit: 17000 },
    { id: 2, numeroCompta: 'AC-2025-002', journal: 'Achats', date: '2025-02-15', compteGeneral: '4011', operation: 'ACHAT PEINTURE', tiersCode: 'SEFIATOU', tiersLibelle: 'SEFIATOU OLAWNI', dateEcriture: '2025-02-15', debit: 0, credit: 17000 },

    // IVOIREWIN - Supplier. Two invoices, both paid. Zero balance.
    { id: 3, numeroCompta: 'AC-2025-010', journal: 'Achats', date: '2025-02-12', compteGeneral: '4011', operation: 'GASOIL', tiersCode: 'IVOIREWIN', tiersLibelle: 'IVOIREWIN', dateEcriture: '2025-02-12', debit: 0, credit: 655000 },
    { id: 4, numeroCompta: 'TR-2025-015', journal: 'Trésorerie', date: '2025-02-28', compteGeneral: '4011', operation: 'PAIEMENT FACTURE GASOIL', tiersCode: 'IVOIREWIN', tiersLibelle: 'IVOIREWIN', dateEcriture: '2025-02-28', debit: 655000, credit: 0 },
    { id: 5, numeroCompta: 'AC-2025-011', journal: 'Achats', date: '2025-03-20', compteGeneral: '4011', operation: 'GASOIL', tiersCode: 'IVOIREWIN', tiersLibelle: 'IVOIREWIN', dateEcriture: '2025-03-20', debit: 0, credit: 655000 },
    { id: 6, numeroCompta: 'TR-2025-018', journal: 'Trésorerie', date: '2025-03-31', compteGeneral: '4011', operation: 'PAIEMENT FACTURE GASOIL', tiersCode: 'IVOIREWIN', tiersLibelle: 'IVOIREWIN', dateEcriture: '2025-03-31', debit: 655000, credit: 0 },
    
    // CLIENT_ALPHA - Client. One invoice, unpaid.
    { id: 7, numeroCompta: 'VE-2025-005', journal: 'Ventes', date: '2025-03-10', compteGeneral: '4111', operation: 'VENTE PRESTATION', tiersCode: 'CLIENT_ALPHA', tiersLibelle: 'CLIENT ALPHA', dateEcriture: '2025-03-10', debit: 1200000, credit: 0 },
];

const MOCK_TIERS = [
    { code: 'SEFIATOU', intitule: 'SEFIATOU OLAWNI', type: 'Fournisseur', compteGeneral: '40110000396' },
    { code: 'IVOIREWIN', intitule: 'IVOIREWIN', type: 'Fournisseur', compteGeneral: '40110000397' },
    { code: 'CLIENT_ALPHA', intitule: 'CLIENT ALPHA', type: 'Client', compteGeneral: '41110000101' },
];

type GroupedData = Record<string, EcritureLivreTiers[]>;

export default function GrandLivreTiersPage() {
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);
    const [reportData, setReportData] = useState<GroupedData>({});
    const [printDateTime, setPrintDateTime] = useState('');
    const { toast } = useToast();

    // Filters
    const [period, setPeriod] = useState<DateRange | undefined>({
        from: new Date(2025, 0, 1),
        to: new Date(2025, 11, 31),
    });
    const [selectedTiers, setSelectedTiers] = useState<string[]>([]);

    const handleTierToggle = (tierCode: string) => {
        setSelectedTiers(prev => 
            prev.includes(tierCode) ? prev.filter(code => code !== tierCode) : [...prev, tierCode]
        );
    };

    useEffect(() => {
        if (isDisplayModalOpen) {
            setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
        }
    }, [isDisplayModalOpen]);

    const handleGenerate = () => {
        if (selectedTiers.length === 0) {
            toast({ title: "Aucun tiers sélectionné", description: "Veuillez sélectionner au moins un tiers.", variant: "destructive" });
            return;
        }

        const filteredEcritures = MOCK_ECRITURES_LIVRE_TIERS.filter(e => {
            if (!e.tiersCode) return false;
            const dateOp = new Date(e.date);
            const inPeriod = period?.from && period?.to && dateOp >= period.from && dateOp <= period.to;
            const inTiersSelection = selectedTiers.includes(e.tiersCode);
            return inPeriod && inTiersSelection;
        });

        if (filteredEcritures.length === 0) {
            toast({ title: "Aucune donnée", description: "Aucune écriture trouvée pour les filtres sélectionnés.", variant: "destructive" });
            return;
        }

        const groupedData = filteredEcritures.reduce((acc, ecriture) => {
            if (ecriture.tiersCode) {
                if (!acc[ecriture.tiersCode]) {
                    acc[ecriture.tiersCode] = [];
                }
                acc[ecriture.tiersCode].push(ecriture);
            }
            return acc;
        }, {} as GroupedData);
        
        Object.keys(groupedData).forEach(tiers => {
            groupedData[tiers].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });

        setReportData(groupedData);
        setIsSelectionModalOpen(false);
        setIsDisplayModalOpen(true);
    };
    
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Grand Livre Tiers', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Période du ${format(period!.from!, 'dd/MM/yyyy')} au ${format(period!.to!, 'dd/MM/yyyy')}`, 15, 30);
        
        let finalY = 35;

        Object.entries(reportData).forEach(([tiersCode, ecritures]) => {
            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            }

            const tiersInfo = MOCK_TIERS.find(t => t.code === tiersCode);
            doc.setFont('helvetica', 'bold');
            doc.text(`Tiers: ${tiersInfo?.compteGeneral || tiersCode} | ${tiersInfo?.intitule || ''}`, 15, finalY + 5);
            finalY += 10;
            
            const totalDebit = ecritures.reduce((acc, e) => acc + e.debit, 0);
            const totalCredit = ecritures.reduce((acc, e) => acc + e.credit, 0);
            const solde = totalDebit - totalCredit;

            const tableData = ecritures.map(e => [
                e.numeroCompta,
                e.journal,
                format(new Date(e.date), 'dd/MM/yyyy'),
                e.operation,
                e.debit > 0 ? e.debit.toLocaleString('fr-FR') : '',
                e.credit > 0 ? e.credit.toLocaleString('fr-FR') : '',
            ]);
            
            const tableFooter = [
                ['', '', '', { content: 'Total :', styles: { halign: 'right', fontStyle: 'bold' } }, { content: totalDebit.toLocaleString('fr-FR'), styles: { fontStyle: 'bold' } }, { content: totalCredit.toLocaleString('fr-FR'), styles: { fontStyle: 'bold' } }],
                ['', '', '', '', { content: 'Solde :', styles: { halign: 'right', fontStyle: 'bold' } }, { content: solde.toLocaleString('fr-FR'), styles: { fontStyle: 'bold' } }],
            ]

            autoTable(doc, {
                startY: finalY,
                head: [['N° Compta', 'Journal', 'Date', 'Opération', 'Débit', 'Crédit']],
                body: tableData,
                foot: tableFooter,
                theme: 'striped',
                headStyles: { fillColor: [226, 232, 240] },
                didDrawPage: (data) => {
                    finalY = data.cursor?.y || 20;
                }
            });
            finalY = (doc as any).lastAutoTable.finalY + 10;
        });

        doc.save(`grand_livre_tiers_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Grand Livre Tiers</CardTitle>
                    <CardDescription>Consultez le détail des mouvements par client et fournisseur.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Button size="lg" onClick={() => setIsSelectionModalOpen(true)}>
                        Générer le Grand Livre Tiers
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Consultation du Grand Livre Tiers</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                             <Label>Tiers à afficher</Label>
                            <ScrollArea className="h-60 rounded-md border">
                                <div className="p-4 space-y-2">
                                    {MOCK_TIERS.map(tier => (
                                        <div key={tier.code} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`tier-${tier.code}`}
                                                checked={selectedTiers.includes(tier.code)}
                                                onCheckedChange={() => handleTierToggle(tier.code)}
                                            />
                                            <Label htmlFor={`tier-${tier.code}`} className="font-normal flex items-center gap-2 cursor-pointer w-full">
                                                <span className="font-mono text-xs w-24 text-center">{tier.code}</span>
                                                <span>{tier.intitule} ({tier.type.toLowerCase()})</span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date de début</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {period?.from ? format(period.from, 'dd/MM/yyyy') : 'Sélectionnez'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={period?.from} onSelect={(date) => setPeriod(p => ({ from: date, to: p?.to }))} locale={fr} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Date de fin</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {period?.to ? format(period.to, 'dd/MM/yyyy') : 'Sélectionnez'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={period?.to} onSelect={(date) => setPeriod(p => ({ from: p?.from, to: date }))} locale={fr} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSelectionModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleGenerate}>Générer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDisplayModalOpen} onOpenChange={setIsDisplayModalOpen}>
                <DialogContent className="max-w-7xl">
                    <DialogHeader>
                        <DialogTitle>Grand Livre Tiers</DialogTitle>
                        <DialogDescription>
                            Période du {period?.from ? format(period.from, 'dd LLL yyyy', {locale: fr}) : ''} au {period?.to ? format(period.to, 'dd LLL yyyy', {locale: fr}) : ''}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
                         <div className="mb-4">
                            <div className="flex justify-between items-start p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Logo className="h-12 w-12 text-primary"/>
                                    <div>
                                        <p className="font-bold">Votre Société S.A.</p>
                                    </div>
                                </div>
                                <div className="text-right text-xs text-muted-foreground">
                                    <p><span className="font-semibold text-foreground">État :</span> Grand Livre Tiers</p>
                                    <p><span className="font-semibold text-foreground">Période :</span> {period?.from ? (period.to ? `${format(period.from, 'dd/MM/yyyy')} au ${format(period.to, 'dd/MM/yyyy')}` : format(period.from, 'dd/MM/yyyy')) : 'N/A'}</p>
                                    <p><span className="font-semibold text-foreground">Imprimé le :</span> {printDateTime}</p>
                                    <p><span className="font-semibold text-foreground">Par :</span> Utilisateur Unikorp</p>
                                </div>
                            </div>
                        </div>
                        {Object.entries(reportData).length > 0 ? Object.entries(reportData).map(([tiersCode, ecritures]) => {
                            const tiersInfo = MOCK_TIERS.find(t => t.code === tiersCode);
                            const totalDebit = ecritures.reduce((acc, e) => acc + e.debit, 0);
                            const totalCredit = ecritures.reduce((acc, e) => acc + e.credit, 0);
                            let solde = totalDebit - totalCredit;
                            // For suppliers (401), a credit balance is expected, so we inverse the logic for display
                            if (tiersInfo?.compteGeneral.startsWith('401')) {
                                solde = totalCredit - totalDebit;
                            }

                            return (
                                <div key={tiersCode} className="mb-4 break-inside-avoid">
                                    <h3 className="font-semibold text-base mb-2 p-2 rounded-md bg-secondary text-secondary-foreground">
                                        {tiersInfo?.compteGeneral} | {tiersInfo?.intitule}
                                    </h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>N° Compta</TableHead>
                                                <TableHead>Journal</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Opération</TableHead>
                                                <TableHead className="text-right">Débit</TableHead>
                                                <TableHead className="text-right">Crédit</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ecritures.map((ecriture: EcritureLivreTiers) => (
                                                <TableRow key={ecriture.id}>
                                                    <TableCell className="font-mono text-xs">{ecriture.numeroCompta}</TableCell>
                                                    <TableCell>{ecriture.journal}</TableCell>
                                                    <TableCell>{format(new Date(ecriture.date), 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell>{ecriture.operation}</TableCell>
                                                    <TableCell className="text-right font-mono">{ecriture.debit > 0 ? ecriture.debit.toLocaleString('fr-FR') : ''}</TableCell>
                                                    <TableCell className="text-right font-mono">{ecriture.credit > 0 ? ecriture.credit.toLocaleString('fr-FR') : ''}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-right font-bold">Total :</TableCell>
                                                <TableCell className="text-right font-bold font-mono">{totalDebit.toLocaleString('fr-FR')}</TableCell>
                                                <TableCell className="text-right font-bold font-mono">{totalCredit.toLocaleString('fr-FR')}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-right font-bold">Solde :</TableCell>
                                                <TableCell className={`text-right font-bold font-mono ${solde !== 0 ? 'text-red-500' : ''}`}>
                                                    {solde.toLocaleString('fr-FR')}
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </div>
                            )
                        }) : (
                            <div className="h-24 text-center">Aucune donnée pour les filtres sélectionnés.</div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDisplayModalOpen(false)}>Fermer</Button>
                        <Button onClick={handleExportPDF} disabled={Object.keys(reportData).length === 0}><Download className="mr-2 h-4 w-4"/>Exporter en PDF</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
