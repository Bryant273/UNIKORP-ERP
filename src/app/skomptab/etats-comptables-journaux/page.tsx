
'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


// MOCK DATA
const MOCK_JOURNALS = [
  { code: 'AC', intitule: 'Journal des achats' },
  { code: 'VE', intitule: 'Journal des ventes' },
  { code: 'BNP', intitule: 'Journal de banque BNP' },
  { code: 'OD', intitule: 'Opérations diverses' },
];

type LigneJournal = {
    date: string;
    numeroPiece: string;
    numeroCompte: string;
    tiers: string;
    libelleEcriture: string;
    debit: number;
    credit: number;
}

const generateMockData = (journalCode: string, period: DateRange): LigneJournal[] => {
    if (journalCode === 'AC') {
        return [
            // First operation from image
            { date: '2024-01-15', numeroPiece: 'F2401-001', numeroCompte: '602100', tiers: '', libelleEcriture: 'Matières premières', debit: 1000000, credit: 0 },
            { date: '2024-01-15', numeroPiece: 'F2401-001', numeroCompte: '445660', tiers: '', libelleEcriture: 'TVA déductible', debit: 180000, credit: 0 },
            { date: '2024-01-15', numeroPiece: 'F2401-001', numeroCompte: '401000', tiers: 'FOURN001', libelleEcriture: 'Xmaginsie', debit: 0, credit: 1180000 },
            // Second operation from image
            { date: '2024-01-22', numeroPiece: 'F2401-002', numeroCompte: '601400', tiers: '', libelleEcriture: 'Fournitures consommables', debit: 500000, credit: 0 },
            { date: '2024-01-22', numeroPiece: 'F2401-002', numeroCompte: '445660', tiers: '', libelleEcriture: 'TVA déductible', debit: 90000, credit: 0 },
            { date: '2024-01-22', numeroPiece: 'F2401-002', numeroCompte: '401000', tiers: 'FOURN002', libelleEcriture: 'FournisPlus', debit: 0, credit: 590000 },
        ];
    }
    if (journalCode === 'VE') {
         return [
            { date: '2024-07-08', numeroPiece: 'V2407-015', numeroCompte: '411000', tiers: 'Client X', libelleEcriture: 'Facture Client X', debit: 2400000, credit: 0 },
            { date: '2024-07-08', numeroPiece: 'V2407-015', numeroCompte: '707000', tiers: '', libelleEcriture: 'Vente Matériel', debit: 0, credit: 2000000 },
            { date: '2024-07-08', numeroPiece: 'V2407-015', numeroCompte: '445710', tiers: '', libelleEcriture: 'TVA / Vente Matériel', debit: 0, credit: 400000 },
        ];
    }
    return [];
};


export default function EtatsComptablesJournauxPage() {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);

  const [selectedJournal, setSelectedJournal] = useState<string | null>(null);
  const [period, setPeriod] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(2024, 0, 31),
  });
  
  const [journalData, setJournalData] = useState<LigneJournal[]>([]);
  const { toast } = useToast();

  const handleShowJournal = () => {
    if (!selectedJournal || !period?.from) {
        toast({
            title: "Sélection requise",
            description: "Veuillez sélectionner un journal et une période.",
            variant: "destructive",
        });
        return;
    }
    const data = generateMockData(selectedJournal, period);
    setJournalData(data);
    setIsSelectionModalOpen(false);
    setIsDisplayModalOpen(true);
  };
  
  const totalDebit = journalData.reduce((acc, item) => acc + item.debit, 0);
  const totalCredit = journalData.reduce((acc, item) => acc + item.credit, 0);

  const groupedData = useMemo(() => {
    return journalData.reduce((acc, ligne) => {
        const key = ligne.numeroPiece;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(ligne);
        return acc;
    }, {} as Record<string, LigneJournal[]>);
  }, [journalData]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const journalInfo = MOCK_JOURNALS.find(j => j.code === selectedJournal);
    const periodString = period?.from ? (period.to ? `${format(period.from, 'dd/MM/yyyy')} au ${format(period.to, 'dd/MM/yyyy')}` : format(period.from, 'dd/MM/yyyy')) : 'N/A';
    
    doc.setFontSize(18);
    doc.text(`Journal des Opérations - ${journalInfo?.intitule || ''}`, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Période du ${periodString}`, 105, 28, { align: 'center' });

    const tableBody = Object.values(groupedData).flatMap(lignes => {
        const firstRow = [
            { content: format(new Date(lignes[0].date), 'dd/MM/yyyy'), rowSpan: lignes.length, styles: { halign: 'center', valign: 'middle' } },
            lignes[0].numeroCompte,
            lignes[0].tiers || '-',
            lignes[0].libelleEcriture,
            { content: lignes[0].debit > 0 ? lignes[0].debit.toLocaleString('fr-FR') : '', styles: { textColor: [0, 128, 0] } },
            { content: lignes[0].credit > 0 ? lignes[0].credit.toLocaleString('fr-FR') : '', styles: { textColor: [255, 0, 0] } },
        ];
        const otherRows = lignes.slice(1).map(ligne => ([
            ligne.numeroCompte,
            ligne.tiers || '-',
            ligne.libelleEcriture,
            { content: ligne.debit > 0 ? ligne.debit.toLocaleString('fr-FR') : '', styles: { textColor: [0, 128, 0] } },
            { content: ligne.credit > 0 ? ligne.credit.toLocaleString('fr-FR') : '', styles: { textColor: [255, 0, 0] } },
        ]));
        return [firstRow, ...otherRows];
    });

    autoTable(doc, {
        startY: 35,
        head: [['Date', 'Compte Général', 'Tiers', 'Libellé', 'Débit', 'Crédit']],
        body: tableBody,
        foot: [[{content: 'Totaux', colSpan: 4, styles: { halign: 'right' }}, {content: totalDebit.toLocaleString('fr-FR'), styles: {halign: 'center'}}, {content: totalCredit.toLocaleString('fr-FR'), styles: {halign: 'center'}}]],
        theme: 'striped',
        headStyles: { fillColor: [241, 245, 249], textColor: [45, 55, 72], fontStyle: 'bold', halign: 'center' },
        footStyles: { fillColor: [226, 232, 240], fontStyle: 'bold' },
        bodyStyles: { halign: 'center' },
        didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(10);
            doc.text(`Page ${String(pageCount)}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    });

    doc.save(`journal_${selectedJournal}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Consultation des journaux</CardTitle>
          <CardDescription>
            Sélectionnez un journal et une période pour afficher le détail des opérations comptables.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Button size="lg" onClick={() => setIsSelectionModalOpen(true)}>
            Afficher un journal
          </Button>
        </CardContent>
      </Card>

      {/* --- Selection Modal --- */}
      <Dialog open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Paramètres du Journal</DialogTitle>
                <DialogDescription>
                    Choisissez le journal et la période à consulter.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="journal">Journal</Label>
                    <Select onValueChange={setSelectedJournal}>
                        <SelectTrigger id="journal">
                            <SelectValue placeholder="Sélectionnez un journal..." />
                        </SelectTrigger>
                        <SelectContent>
                            {MOCK_JOURNALS.map(j => <SelectItem key={j.code} value={j.code}>{j.intitule}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
                <Button variant="outline" onClick={() => setIsSelectionModalOpen(false)}>Retour</Button>
                <Button onClick={handleShowJournal}>Afficher</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* --- Display Modal --- */}
      <Dialog open={isDisplayModalOpen} onOpenChange={setIsDisplayModalOpen}>
        <DialogContent className="max-w-5xl">
            <DialogHeader>
                <DialogTitle>Journal - {MOCK_JOURNALS.find(j => j.code === selectedJournal)?.intitule}</DialogTitle>
                <DialogDescription>
                    Période du {period?.from ? format(period.from, 'dd LLL yyyy', {locale: fr}) : ''} au {period?.to ? format(period.to, 'dd LLL yyyy', {locale: fr}) : ''}.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4">
                 <Table>
                    <TableHeader className="sticky top-0 bg-secondary">
                        <TableRow>
                            <TableHead className="w-[120px] text-center">Date</TableHead>
                            <TableHead className="w-[120px] text-center">Compte Général</TableHead>
                            <TableHead className="w-[150px] text-center">Tiers</TableHead>
                            <TableHead className="text-center">Libellé</TableHead>
                            <TableHead className="w-[120px] text-center">Débit</TableHead>
                            <TableHead className="w-[120px] text-center">Crédit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {journalData.length > 0 ? Object.values(groupedData).map((lignes, groupIndex) => (
                            <React.Fragment key={groupIndex}>
                                {lignes.map((ligne, ligneIndex) => (
                                    <TableRow key={`${groupIndex}-${ligneIndex}`} className="even:bg-muted/30">
                                        {ligneIndex === 0 && (
                                            <TableCell rowSpan={lignes.length} className="text-center align-middle font-medium border-r">
                                                {format(new Date(ligne.date), 'dd/MM/yyyy')}
                                            </TableCell>
                                        )}
                                        <TableCell className="text-center font-mono">{ligne.numeroCompte}</TableCell>
                                        <TableCell className="text-center">{ligne.tiers || '-'}</TableCell>
                                        <TableCell className="text-center">{ligne.libelleEcriture}</TableCell>
                                        <TableCell className="text-center font-mono text-green-600">{ligne.debit > 0 ? ligne.debit.toLocaleString('fr-FR') : ''}</TableCell>
                                        <TableCell className="text-center font-mono text-red-600">{ligne.credit > 0 ? ligne.credit.toLocaleString('fr-FR') : ''}</TableCell>
                                    </TableRow>
                                ))}
                                { (groupIndex < Object.values(groupedData).length - 1) && <TableRow><TableCell colSpan={6} className="p-0 h-px bg-border"></TableCell></TableRow>}
                            </React.Fragment>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Aucune donnée pour ce journal sur cette période.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {journalData.length > 0 &&
                      <TableFooter>
                          <TableRow className="bg-secondary">
                              <TableCell colSpan={4} className="text-center font-bold">Totaux</TableCell>
                              <TableCell className="text-center font-bold font-mono">{totalDebit.toLocaleString('fr-FR')}</TableCell>
                              <TableCell className="text-center font-bold font-mono">{totalCredit.toLocaleString('fr-FR')}</TableCell>
                          </TableRow>
                          <TableRow>
                              <TableCell colSpan={4}></TableCell>
                              <TableCell colSpan={2} className="text-center font-bold">
                                  {totalDebit.toFixed(2) === totalCredit.toFixed(2) ? "Équilibré" : "Déséquilibré"}
                              </TableCell>
                          </TableRow>
                      </TableFooter>
                    }
                 </Table>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDisplayModalOpen(false)}>Fermer</Button>
                <Button onClick={handleExportPDF} disabled={journalData.length === 0}><Download className="mr-2 h-4 w-4"/>Exporter en PDF</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
