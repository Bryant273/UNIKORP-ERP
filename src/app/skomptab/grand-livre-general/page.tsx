
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

// Mock data
const MOCK_ECRITURES_LIVRE = [
    { id: 1, dateSaisie: '2024-07-01', numeroCompta: 'AC-001', journal: 'AC', dateOperation: '2024-07-01', numeroPiece: 'F001', libelle: 'Achat initial', compte: '607000', debit: 1500, credit: 0 },
    { id: 2, dateSaisie: '2024-07-05', numeroCompta: 'AC-002', journal: 'AC', dateOperation: '2024-07-04', numeroPiece: 'F002', libelle: 'Achat complémentaire', compte: '607000', debit: 750, credit: 0 },
    { id: 3, dateSaisie: '2024-07-10', numeroCompta: 'AC-005', journal: 'AC', dateOperation: '2024-07-10', numeroPiece: 'F005', libelle: 'Achat Matériel X', compte: '607000', debit: 2200, credit: 0 },
    { id: 4, dateSaisie: '2024-07-02', numeroCompta: 'VE-001', journal: 'VE', dateOperation: '2024-07-02', numeroPiece: 'INV001', libelle: 'Service de conseil', compte: '706000', debit: 0, credit: 3000 },
    { id: 5, dateSaisie: '2024-07-15', numeroCompta: 'VE-002', journal: 'VE', dateOperation: '2024-07-14', numeroPiece: 'INV002', libelle: 'Développement Web', compte: '706000', debit: 0, credit: 5000 },
    { id: 6, dateSaisie: '2024-07-01', numeroCompta: 'AC-001', journal: 'AC', dateOperation: '2024-07-01', numeroPiece: 'F001', libelle: 'TVA / Achat initial', compte: '445660', debit: 270, credit: 0 },
];
const MOCK_COMPTES = [
    { numero: '445660', intitule: 'TVA déductible' },
    { numero: '607000', intitule: 'Achats de marchandises' },
    { numero: '706000', intitule: 'Prestations de services' }
];

type GroupedData = Record<string, (typeof MOCK_ECRITURES_LIVRE)>;

export default function GrandLivreGeneralPage() {
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
    const [compteDebut, setCompteDebut] = useState('');
    const [compteFin, setCompteFin] = useState('');

    useEffect(() => {
        if (isDisplayModalOpen) {
            setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
        }
    }, [isDisplayModalOpen]);

    const handleGenerate = () => {
        const filteredEcritures = MOCK_ECRITURES_LIVRE.filter(e => {
            const dateOp = new Date(e.dateOperation);
            const inPeriod = period?.from && period?.to && dateOp >= period.from && dateOp <= period.to;
            const inCompteRange = (!compteDebut || e.compte >= compteDebut) && (!compteFin || e.compte <= compteFin);
            return inPeriod && inCompteRange;
        });

        if (filteredEcritures.length === 0) {
            toast({ title: "Aucune donnée", description: "Aucune écriture trouvée pour les filtres sélectionnés.", variant: "destructive" });
            return;
        }

        const groupedData = filteredEcritures.reduce((acc, ecriture) => {
            if (!acc[ecriture.compte]) {
                acc[ecriture.compte] = [];
            }
            acc[ecriture.compte].push(ecriture);
            return acc;
        }, {} as GroupedData);
        
        Object.keys(groupedData).forEach(compte => {
            groupedData[compte].sort((a,b) => new Date(a.dateOperation).getTime() - new Date(b.dateOperation).getTime());
        });

        setReportData(groupedData);
        setIsSelectionModalOpen(false);
        setIsDisplayModalOpen(true);
    };
    
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Grand Livre Général', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Période du ${format(period!.from!, 'dd/MM/yyyy')} au ${format(period!.to!, 'dd/MM/yyyy')}`, 15, 30);
        
        let finalY = 35;

        Object.entries(reportData).forEach(([compte, ecritures]) => {
            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            }

            const compteInfo = MOCK_COMPTES.find(c => c.numero === compte);
            doc.setFont('helvetica', 'bold');
            doc.text(`Compte: ${compte} - ${compteInfo?.intitule || ''}`, 15, finalY + 5);
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

        doc.save(`grand_livre_general_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Grand Livre Général</CardTitle>
                    <CardDescription>Consultez le détail des mouvements par compte général.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Button size="lg" onClick={() => setIsSelectionModalOpen(true)}>
                        Générer le Grand Livre
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Paramètres du Grand Livre</DialogTitle>
                        <DialogDescription>
                            Choisissez la période et les comptes à afficher.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Période</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {period?.from ? (period.to ? `${format(period.from, 'dd/MM/yy')} - ${format(period.to, 'dd/MM/yy')}`: format(period.from, 'dd/MM/yyyy')) : 'Sélectionnez'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="range" selected={period} onSelect={setPeriod} numberOfMonths={2} locale={fr} />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="compteDebut">Compte de début</Label>
                                <Input id="compteDebut" value={compteDebut} onChange={(e) => setCompteDebut(e.target.value)} placeholder="Ex: 600000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="compteFin">Compte de fin</Label>
                                <Input id="compteFin" value={compteFin} onChange={(e) => setCompteFin(e.target.value)} placeholder="Ex: 799999" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSelectionModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleGenerate}>Générer l'état</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDisplayModalOpen} onOpenChange={setIsDisplayModalOpen}>
                <DialogContent className="max-w-7xl">
                    <DialogHeader>
                        <DialogTitle>Grand Livre Général</DialogTitle>
                        <DialogDescription>
                            Période du {period?.from ? format(period.from, 'dd LLL yyyy', {locale: fr}) : ''} au {period?.to ? format(period.to, 'dd LLL yyyy', {locale: fr}) : ''}.
                            Imprimé le {printDateTime}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
                        {Object.entries(reportData).length > 0 ? Object.entries(reportData).map(([compte, ecritures]) => {
                            let runningBalance = 0;
                            const compteInfo = MOCK_COMPTES.find(c => c.numero === compte);
                            return (
                                <div key={compte}>
                                    <h3 className="font-semibold text-lg mb-2 bg-muted p-2 rounded-md">
                                        Compte: {compte} - {compteInfo?.intitule || 'Inconnu'}
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
