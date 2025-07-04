'use client';

import React, { useState } from 'react';
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
    jour: string;
    numeroPiece: string;
    numeroCompte: string;
    libelleCompte: string;
    libelleEcriture: string;
    debit: number;
    credit: number;
}

const generateMockData = (journalCode: string, period: DateRange): LigneJournal[] => {
    if (journalCode === 'AC') {
        return [
            { jour: '05', numeroPiece: 'F2407-001', numeroCompte: '607000', libelleCompte: 'Achats Marchandises', libelleEcriture: 'Achat Mat. Prem. Fournisseur A', debit: 1200.00, credit: 0 },
            { jour: '05', numeroPiece: 'F2407-001', numeroCompte: '445660', libelleCompte: 'TVA Déductible', libelleEcriture: 'TVA / Achat Mat. Prem.', debit: 216.00, credit: 0 },
            { jour: '05', numeroPiece: 'F2407-001', numeroCompte: '401000', libelleCompte: 'Fournisseurs', libelleEcriture: 'Facture Fournisseur A', debit: 0, credit: 1416.00 },
            { jour: '12', numeroPiece: 'F2407-002', numeroCompte: '601000', libelleCompte: 'Achats Stockés', libelleEcriture: 'Achat Stock Fournisseur B', debit: 3500.00, credit: 0 },
            { jour: '12', numeroPiece: 'F2407-002', numeroCompte: '445660', libelleCompte: 'TVA Déductible', libelleEcriture: 'TVA / Achat Stock', debit: 630.00, credit: 0 },
            { jour: '12', numeroPiece: 'F2407-002', numeroCompte: '401000', libelleCompte: 'Fournisseurs', libelleEcriture: 'Facture Fournisseur B', debit: 0, credit: 4130.00 },
        ];
    }
    if (journalCode === 'VE') {
         return [
            { jour: '08', numeroPiece: 'V2407-015', numeroCompte: '411000', libelleCompte: 'Clients', libelleEcriture: 'Facture Client X', debit: 2400.00, credit: 0 },
            { jour: '08', numeroPiece: 'V2407-015', numeroCompte: '707000', libelleCompte: 'Ventes Marchandises', libelleEcriture: 'Vente Matériel', debit: 0, credit: 2000.00 },
            { jour: '08', numeroPiece: 'V2407-015', numeroCompte: '445710', libelleCompte: 'TVA Collectée', libelleEcriture: 'TVA / Vente Matériel', debit: 0, credit: 400.00 },
        ];
    }
    return [];
};


export default function EtatsComptablesJournauxPage() {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);

  const [selectedJournal, setSelectedJournal] = useState<string | null>(null);
  const [period, setPeriod] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const journalInfo = MOCK_JOURNALS.find(j => j.code === selectedJournal);
    const periodString = period?.from ? (period.to ? `${format(period.from, 'dd/MM/yyyy')} au ${format(period.to, 'dd/MM/yyyy')}` : format(period.from, 'dd/MM/yyyy')) : 'N/A';
    
    doc.setFontSize(18);
    doc.text(`Journal des Opérations - ${journalInfo?.intitule || ''}`, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Période du ${periodString}`, 105, 28, { align: 'center' });

    autoTable(doc, {
        startY: 35,
        head: [['Jour', 'N° Pièce', 'N° Compte', 'Libellé Écriture', 'Débit', 'Crédit']],
        body: journalData.map(l => [l.jour, l.numeroPiece, l.numeroCompte, l.libelleEcriture, l.debit.toFixed(2), l.credit.toFixed(2)]),
        foot: [['Totaux', '', '', '', totalDebit.toFixed(2), totalCredit.toFixed(2)]],
        theme: 'striped',
        headStyles: { fillColor: [28, 32, 57] },
        footStyles: { fillColor: [22, 25, 45], fontStyle: 'bold' },
        didDrawPage: (data) => {
            // Footer
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
                <div className="space-y-2">
                    <Label>Période</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {period?.from ? (
                                    period.to ? `${format(period.from, 'dd/MM/yy', { locale: fr })} - ${format(period.to, 'dd/MM/yy', { locale: fr })}` : format(period.from, 'dd/MM/yyyy')
                                ) : 'Sélectionnez une période'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="range" selected={period} onSelect={setPeriod} numberOfMonths={2} locale={fr}/>
                        </PopoverContent>
                    </Popover>
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
        <DialogContent className="max-w-4xl">
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
                            <TableHead className="w-[50px] text-center">Jour</TableHead>
                            <TableHead className="text-center">N° Pièce</TableHead>
                            <TableHead className="text-center">N° Compte</TableHead>
                            <TableHead className="text-center">Libellé écriture</TableHead>
                            <TableHead className="w-[120px] text-right">Débit</TableHead>
                            <TableHead className="w-[120px] text-right">Crédit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {journalData.length > 0 ? journalData.map((ligne, index) => (
                             <TableRow key={index} className="odd:bg-muted/50">
                                <TableCell className="text-center">{ligne.jour}</TableCell>
                                <TableCell className="text-center">{ligne.numeroPiece}</TableCell>
                                <TableCell className="text-center font-mono">{ligne.numeroCompte}</TableCell>
                                <TableCell className="text-center">{ligne.libelleEcriture}</TableCell>
                                <TableCell className="text-right font-mono">{ligne.debit > 0 ? ligne.debit.toFixed(2) : ''}</TableCell>
                                <TableCell className="text-right font-mono">{ligne.credit > 0 ? ligne.credit.toFixed(2) : ''}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Aucune donnée pour ce journal sur cette période.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {journalData.length > 0 &&
                      <TableFooter>
                          <TableRow className="bg-secondary">
                              <TableCell colSpan={4} className="text-right font-bold">Totaux</TableCell>
                              <TableCell className="text-right font-bold font-mono">{totalDebit.toFixed(2)}</TableCell>
                              <TableCell className="text-right font-bold font-mono">{totalCredit.toFixed(2)}</TableCell>
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
