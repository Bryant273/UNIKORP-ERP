
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
const MOCK_ECRITURES_LIVRE = [
    // Compte 607000 - Achats de marchandises
    { id: 1, dateSaisie: '2025-01-10', numeroCompta: 'AC-001', journal: 'AC', dateOperation: '2025-01-10', numeroPiece: 'F001', libelle: 'Achat initial Fournisseur A', compte: '607000', debit: 1500, credit: 0 },
    { id: 2, dateSaisie: '2025-01-15', numeroCompta: 'AC-002', journal: 'AC', dateOperation: '2025-01-14', numeroPiece: 'F002', libelle: 'Achat complémentaire Fournisseur B', compte: '607000', debit: 750, credit: 0 },
    { id: 3, dateSaisie: '2025-01-20', numeroCompta: 'AC-005', journal: 'AC', dateOperation: '2025-01-20', numeroPiece: 'F005', libelle: 'Achat Matériel X Fournisseur A', compte: '607000', debit: 2200, credit: 0 },
    
    // Compte 706000 - Prestations de services
    { id: 4, dateSaisie: '2025-02-02', numeroCompta: 'VE-001', journal: 'VE', dateOperation: '2025-02-02', numeroPiece: 'INV001', libelle: 'Service de conseil Client X', compte: '706000', debit: 0, credit: 3000 },
    { id: 5, dateSaisie: '2025-02-15', numeroCompta: 'VE-002', journal: 'VE', dateOperation: '2025-02-14', numeroPiece: 'INV002', libelle: 'Développement Web Client Y', compte: '706000', debit: 0, credit: 5000 },
    
    // Compte 445660 - TVA déductible
    { id: 6, dateSaisie: '2025-01-10', numeroCompta: 'AC-001', journal: 'AC', dateOperation: '2025-01-10', numeroPiece: 'F001', libelle: 'TVA / Achat initial', compte: '445660', debit: 270, credit: 0 },
    { id: 7, dateSaisie: '2025-01-15', numeroCompta: 'AC-002', journal: 'AC', dateOperation: '2025-01-14', numeroPiece: 'F002', libelle: 'TVA / Achat complémentaire', compte: '445660', debit: 135, credit: 0 },
    { id: 8, dateSaisie: '2025-01-20', numeroCompta: 'AC-005', journal: 'AC', dateOperation: '2025-01-20', numeroPiece: 'F005', libelle: 'TVA / Achat Matériel X', compte: '445660', debit: 396, credit: 0 },

    // Compte 445710 - TVA Collectée
    { id: 9, dateSaisie: '2025-02-02', numeroCompta: 'VE-001', journal: 'VE', dateOperation: '2025-02-02', numeroPiece: 'INV001', libelle: 'TVA / Service de conseil', compte: '445710', debit: 0, credit: 540 },
    { id: 10, dateSaisie: '2025-02-15', numeroCompta: 'VE-002', journal: 'VE', dateOperation: '2025-02-14', numeroPiece: 'INV002', libelle: 'TVA / Développement Web', compte: '445710', debit: 0, credit: 900 },

    // Compte 512000 - Banque
    { id: 11, dateSaisie: '2025-02-04', numeroCompta: 'BNP-001', journal: 'BNP', dateOperation: '2025-02-04', numeroPiece: 'PAY001', libelle: 'Paiement Fournisseur A', compte: '512000', debit: 0, credit: 1770 },
    { id: 12, dateSaisie: '2025-02-18', numeroCompta: 'BNP-002', journal: 'BNP', dateOperation: '2025-02-18', numeroPiece: 'REC001', libelle: 'Réception paiement Client X', compte: '512000', debit: 3540, credit: 0 },
    { id: 13, dateSaisie: '2025-02-20', numeroCompta: 'BNP-003', journal: 'BNP', dateOperation: '2025-02-20', numeroPiece: 'PAY002', libelle: 'Paiement Fournisseur B', compte: '512000', debit: 0, credit: 885 },

    // Compte 625000 - Déplacements
    { id: 14, dateSaisie: '2025-03-25', numeroCompta: 'OD-001', journal: 'OD', dateOperation: '2025-03-25', numeroPiece: 'NDF01', libelle: 'Note de frais Jean D.', compte: '625000', debit: 120, credit: 0 },
];
const MOCK_COMPTES = [
    { numero: '445660', intitule: 'TVA déductible' },
    { numero: '445710', intitule: 'TVA Collectée' },
    { numero: '512000', intitule: 'Banque' },
    { numero: '607000', intitule: 'Achats de marchandises' },
    { numero: '625000', intitule: 'Déplacements, missions et réceptions' },
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
        from: new Date(2025, 0, 1),
        to: new Date(2025, 11, 31),
    });
    const [selectedComptes, setSelectedComptes] = useState<string[]>([]);
    
    const handleCompteToggle = (compteNumero: string) => {
        setSelectedComptes(prev => 
            prev.includes(compteNumero) ? prev.filter(code => code !== compteNumero) : [...prev, compteNumero]
        );
    };

    useEffect(() => {
        if (isDisplayModalOpen) {
            setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
        }
    }, [isDisplayModalOpen]);

    const handleGenerate = () => {
        if (selectedComptes.length === 0) {
            toast({ title: "Aucun compte sélectionné", description: "Veuillez sélectionner au moins un compte.", variant: "destructive" });
            return;
        }

        const filteredEcritures = MOCK_ECRITURES_LIVRE.filter(e => {
            const dateOp = new Date(e.dateOperation);
            const inPeriod = period?.from && period?.to && dateOp >= period.from && dateOp <= period.to;
            const inCompteSelection = selectedComptes.includes(e.compte);
            return inPeriod && inCompteSelection;
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
                             <Label>Comptes à afficher</Label>
                            <ScrollArea className="h-60 rounded-md border p-4">
                                <div className="space-y-2">
                                    {MOCK_COMPTES.map(compte => (
                                        <div key={compte.numero} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`compte-${compte.numero}`}
                                                checked={selectedComptes.includes(compte.numero)}
                                                onCheckedChange={() => handleCompteToggle(compte.numero)}
                                            />
                                            <Label htmlFor={`compte-${compte.numero}`} className="font-normal flex items-center gap-2 cursor-pointer w-full">
                                                <span className="font-mono text-xs p-1 bg-muted rounded-sm w-20 text-center">{compte.numero}</span>
                                                <span>{compte.intitule}</span>
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
                                    <p><span className="font-semibold text-foreground">État :</span> Grand Livre Général</p>
                                    <p><span className="font-semibold text-foreground">Période :</span> {period?.from ? (period.to ? `${format(period.from, 'dd/MM/yyyy')} au ${format(period.to, 'dd/MM/yyyy')}` : format(period.from, 'dd/MM/yyyy')) : 'N/A'}</p>
                                    <p><span className="font-semibold text-foreground">Imprimé le :</span> {printDateTime}</p>
                                    <p><span className="font-semibold text-foreground">Par :</span> Utilisateur Unikorp</p>
                                </div>
                            </div>
                        </div>
                        {Object.entries(reportData).length > 0 ? Object.entries(reportData).map(([compte, ecritures]) => {
                            const compteInfo = MOCK_COMPTES.find(c => c.numero === compte);
                            const totalDebit = ecritures.reduce((acc, e) => acc + e.debit, 0);
                            const totalCredit = ecritures.reduce((acc, e) => acc + e.credit, 0);
                            const solde = totalDebit - totalCredit;
                            return (
                                <div key={compte}>
                                    <h3 className="font-semibold text-lg mb-2 bg-secondary text-secondary-foreground p-2 rounded-md">
                                        Compte: {compte} - {compteInfo?.intitule || 'Inconnu'}
                                    </h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date Op.</TableHead>
                                                <TableHead>Journal</TableHead>
                                                <TableHead>N° Pièce</TableHead>
                                                <TableHead>Libellé</TableHead>
                                                <TableHead className="text-right">Débit</TableHead>
                                                <TableHead className="text-right">Crédit</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ecritures.map((ecriture: any) => (
                                                <TableRow key={ecriture.id}>
                                                    <TableCell>{format(new Date(ecriture.dateOperation), 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell>{ecriture.journal}</TableCell>
                                                    <TableCell>{ecriture.numeroPiece}</TableCell>
                                                    <TableCell>{ecriture.libelle}</TableCell>
                                                    <TableCell className="text-right font-mono">{ecriture.debit > 0 ? ecriture.debit.toFixed(2) : ''}</TableCell>
                                                    <TableCell className="text-right font-mono">{ecriture.credit > 0 ? ecriture.credit.toFixed(2) : ''}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-right font-bold">Total :</TableCell>
                                                <TableCell className="text-right font-bold font-mono">{totalDebit.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold font-mono">{totalCredit.toFixed(2)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-right font-bold">Solde :</TableCell>
                                                <TableCell className="text-right font-bold font-mono">{solde.toFixed(2)}</TableCell>
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
