
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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

// Mock data
const MOCK_ECRITURES_LIVRE_TIERS = [
    { id: 6, dateSaisie: '2024-07-01', numeroCompta: 'AC-001', journal: 'AC', dateOperation: '2024-07-01', numeroPiece: 'F001', libelle: 'Achat initial', compte: '401000', tiers: 'FOURN_A', debit: 0, credit: 1770 },
    { id: 7, dateSaisie: '2024-07-04', numeroCompta: 'BNP-001', journal: 'BNP', dateOperation: '2024-07-04', numeroPiece: 'PAY001', libelle: 'Paiement F001', compte: '401000', tiers: 'FOURN_A', debit: 1770, credit: 0 },
    { id: 8, dateSaisie: '2024-07-05', numeroCompta: 'AC-002', journal: 'AC', dateOperation: '2024-07-04', numeroPiece: 'F002', libelle: 'Achat complémentaire', compte: '401000', tiers: 'FOURN_B', debit: 0, credit: 750 },
    { id: 9, dateSaisie: '2024-07-02', numeroCompta: 'VE-001', journal: 'VE', dateOperation: '2024-07-02', numeroPiece: 'INV001', libelle: 'Vente de services', compte: '411000', tiers: 'CLIENT_X', debit: 3000, credit: 0 },
    { id: 10, dateSaisie: '2024-07-18', numeroCompta: 'BNP-002', journal: 'BNP', dateOperation: '2024-07-18', numeroPiece: 'REC001', libelle: 'Réception paiement INV001', compte: '411000', tiers: 'CLIENT_X', debit: 0, credit: 3000 },
    { id: 11, dateSaisie: '2024-07-15', numeroCompta: 'VE-002', journal: 'VE', dateOperation: '2024-07-14', numeroPiece: 'INV002', libelle: 'Développement Web', compte: '411000', tiers: 'CLIENT_Y', debit: 5000, credit: 0 },
];
const MOCK_TIERS = [
    { code: 'FOURN_A', intitule: 'Fournisseur A', type: 'Fournisseur' },
    { code: 'FOURN_B', intitule: 'Fournisseur B', type: 'Fournisseur' },
    { code: 'CLIENT_X', intitule: 'Client X', type: 'Client' },
    { code: 'CLIENT_Y', intitule: 'Client Y', type: 'Client' },
];

type GroupedData = Record<string, (typeof MOCK_ECRITURES_LIVRE_TIERS)>;

export default function GrandLivreTiersPage() {
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);
    const [reportData, setReportData] = useState<GroupedData>({});
    const [printDateTime, setPrintDateTime] = useState('');
    const { toast } = useToast();

    // Filters
    const [period, setPeriod] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(new Date().getFullYear(), 11, 31),
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
            if (!e.tiers) return false;
            const dateOp = new Date(e.dateOperation);
            const inPeriod = period?.from && period?.to && dateOp >= period.from && dateOp <= period.to;
            const inTiersSelection = selectedTiers.includes(e.tiers);
            return inPeriod && inTiersSelection;
        });

        if (filteredEcritures.length === 0) {
            toast({ title: "Aucune donnée", description: "Aucune écriture trouvée pour les filtres sélectionnés.", variant: "destructive" });
            return;
        }

        const groupedData = filteredEcritures.reduce((acc, ecriture) => {
            if (ecriture.tiers) {
                if (!acc[ecriture.tiers]) {
                    acc[ecriture.tiers] = [];
                }
                acc[ecriture.tiers].push(ecriture);
            }
            return acc;
        }, {} as GroupedData);
        
        Object.keys(groupedData).forEach(tiers => {
            groupedData[tiers].sort((a,b) => new Date(a.dateOperation).getTime() - new Date(b.dateOperation).getTime());
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
            doc.text(`Tiers: ${tiersCode} - ${tiersInfo?.intitule || ''}`, 15, finalY + 5);
            finalY += 10;
            
            let runningBalance = 0;
            const tableData = ecritures.map(e => {
                runningBalance += e.debit - e.credit;
                return [
                    format(new Date(e.dateSaisie), 'dd/MM/yy'),
                    e.numeroCompta,
                    format(new Date(e.dateOperation), 'dd/MM/yy'),
                    e.numeroPiece,
                    e.journal,
                    e.libelle,
                    e.debit > 0 ? e.debit.toFixed(2) : '',
                    e.credit > 0 ? e.credit.toFixed(2) : '',
                    runningBalance.toFixed(2)
                ];
            });

            autoTable(doc, {
                startY: finalY,
                head: [['Date Saisie', 'N° Saisie', 'Date Op.', 'N° Pièce', 'Journal', 'Libellé', 'Débit', 'Crédit', 'Solde']],
                body: tableData,
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
                            Imprimé le {printDateTime}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
                        {Object.entries(reportData).length > 0 ? Object.entries(reportData).map(([tiersCode, ecritures]) => {
                            let runningBalance = 0;
                            const tiersInfo = MOCK_TIERS.find(t => t.code === tiersCode);
                            return (
                                <div key={tiersCode}>
                                    <h3 className="font-semibold text-lg mb-2 bg-muted p-2 rounded-md">
                                        Tiers: {tiersCode} - {tiersInfo?.intitule || 'Inconnu'}
                                    </h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date Saisie</TableHead>
                                                <TableHead>N° Saisie</TableHead>
                                                <TableHead>Date Op.</TableHead>
                                                <TableHead>N° Pièce</TableHead>
                                                <TableHead>Journal</TableHead>
                                                <TableHead>Libellé</TableHead>
                                                <TableHead className="text-right">Débit</TableHead>
                                                <TableHead className="text-right">Crédit</TableHead>
                                                <TableHead className="text-right">Solde</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ecritures.map((ecriture: any) => {
                                                runningBalance += ecriture.debit - ecriture.credit;
                                                return (
                                                    <TableRow key={ecriture.id}>
                                                        <TableCell>{format(new Date(ecriture.dateSaisie), 'dd/MM/yy')}</TableCell>
                                                        <TableCell className="font-mono">{ecriture.numeroCompta}</TableCell>
                                                        <TableCell>{format(new Date(ecriture.dateOperation), 'dd/MM/yy')}</TableCell>
                                                        <TableCell>{ecriture.numeroPiece}</TableCell>
                                                        <TableCell>{ecriture.journal}</TableCell>
                                                        <TableCell>{ecriture.libelle}</TableCell>
                                                        <TableCell className="text-right font-mono">{ecriture.debit > 0 ? ecriture.debit.toFixed(2) : ''}</TableCell>
                                                        <TableCell className="text-right font-mono">{ecriture.credit > 0 ? ecriture.credit.toFixed(2) : ''}</TableCell>
                                                        <TableCell className="text-right font-mono font-semibold">{runningBalance.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
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
