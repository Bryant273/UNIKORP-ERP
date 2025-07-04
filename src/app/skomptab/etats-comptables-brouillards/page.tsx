
'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';

// --- TYPES & MOCK DATA ---

type LigneEcriture = {
  id: string;
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  tiers: string;
};

type Ecriture = {
  id: number;
  dateOperation: string;
  journal: string;
  numeroPiece: string;
  libelleOperation: string;
  lignes: LigneEcriture[];
  statut: 'brouillard' | 'validee';
  saisiePar: string;
};

const MOCK_ECRITURES_BROUILLARD: Ecriture[] = [
  {
    id: 1, dateOperation: '2024-07-25', journal: 'AC', numeroPiece: 'F24-AC-001', libelleOperation: 'Achat de matières premières - Fournisseur A',
    lignes: [
      { id: 'l1-1', compte: '601000', tiers: '', libelle: 'Achat Mat. Prem.', debit: 1500, credit: 0 },
      { id: 'l1-2', compte: '445660', tiers: '', libelle: 'TVA déductible', debit: 300, credit: 0 },
      { id: 'l1-3', compte: '401000', tiers: 'FOURN_A', libelle: 'Fournisseur A', debit: 0, credit: 1800 },
    ],
    statut: 'brouillard', saisiePar: 'Jean Stagiaire',
  },
  {
    id: 2, dateOperation: '2024-07-26', journal: 'VE', numeroPiece: 'F24-VE-001', libelleOperation: 'Vente de services - Client B',
    lignes: [], statut: 'validee', saisiePar: 'Marie Comptable',
  },
  {
    id: 3, dateOperation: '2024-07-27', journal: 'OD', numeroPiece: 'F24-OD-001', libelleOperation: 'Écriture de salaire - Incomplète',
    lignes: [
      { id: 'l3-1', compte: '641000', tiers: '', libelle: 'Rémunérations', debit: 3000, credit: 0 },
      { id: 'l3-2', compte: '421000', tiers: '', libelle: 'Personnel - Rémunérations dues', debit: 0, credit: 2300 },
    ],
    statut: 'brouillard', saisiePar: 'Jean Stagiaire',
  },
  {
    id: 4, dateOperation: '2024-08-01', journal: 'AC', numeroPiece: 'F24-AC-002', libelleOperation: 'Achat fournitures',
    lignes: [], statut: 'brouillard', saisiePar: 'Marie Comptable',
  }
];

const MOCK_JOURNALS = [
  { code: 'AC', intitule: 'Journal des achats' },
  { code: 'VE', intitule: 'Journal des ventes' },
  { code: 'BNP', intitule: 'Journal de banque BNP' },
  { code: 'OD', intitule: 'Opérations diverses' },
];
const MOCK_STAGIAIRES = ['Jean Stagiaire', 'Marie Comptable'];

const calculateTotalsForEcriture = (lignes: LigneEcriture[]) => {
  const totalDebit = lignes.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalCredit = lignes.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
  return { totalDebit, totalCredit, isBalanced };
};

export default function EtatsComptablesBrouillardsPage() {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);

  const [selectedJournal, setSelectedJournal] = useState<string | null>(null);
  const [selectedStagiaire, setSelectedStagiaire] = useState<string | null>(null);
  const [period, setPeriod] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });
  
  const [brouillardData, setBrouillardData] = useState<Ecriture[]>([]);
  const [printDateTime, setPrintDateTime] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    if (isDisplayModalOpen) {
        setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
    }
  }, [isDisplayModalOpen]);

  const handleShowJournal = () => {
    if (!period?.from) {
        toast({ title: "Sélection requise", description: "Veuillez sélectionner une période.", variant: "destructive" });
        return;
    }

    const filteredData = MOCK_ECRITURES_BROUILLARD.filter(e => {
        const dateOp = new Date(e.dateOperation);
        const inPeriod = period.from && period.to && dateOp >= period.from && dateOp <= period.to;
        const journalMatch = !selectedJournal || e.journal === selectedJournal;
        const stagiaireMatch = !selectedStagiaire || e.saisiePar === selectedStagiaire;
        return inPeriod && journalMatch && stagiaireMatch;
    });

    setBrouillardData(filteredData);
    setIsSelectionModalOpen(false);
    setIsDisplayModalOpen(true);
  };
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const companyName = "Votre Société S.A.";
    const userName = "Utilisateur Unikorp";
    const moduleName = "SKOMPTAB";
    const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';

    const tableBody = brouillardData.map(e => {
        const { isBalanced } = calculateTotalsForEcriture(e.lignes);
        return [
            format(new Date(e.dateOperation), 'dd/MM/yyyy'),
            e.numeroPiece,
            e.libelleOperation,
            e.saisiePar,
            isBalanced ? 'Équilibrée' : 'Déséquilibrée',
            e.statut === 'validee' ? 'Validée' : 'En Brouillard'
        ];
    });

    autoTable(doc, {
        head: [['Date Op.', 'N° Pièce', 'Libellé', 'Saisi par', 'Équilibre', 'Statut']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [241, 245, 249], textColor: [45, 55, 72], fontStyle: 'bold', halign: 'center' },
        didDrawPage: (data) => {
            // Header
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(`Imprimé depuis UNIKORP® - ${moduleName}`, 20, 15);
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
            doc.text(`État du Brouillard`, 190, 25, { align: 'right' });
            doc.text(`Période : ${period?.from ? format(period.from, 'dd/MM/yy') : ''} - ${period?.to ? format(period.to, 'dd/MM/yy') : ''}`, 190, 30, { align: 'right' });
            doc.text(`Imprimé le : ${printDateTime}`, 190, 35, { align: 'right' });
            doc.text(`Par : ${userName}`, 190, 40, { align: 'right' });

            // Footer
            const pageCountTotal = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
        margin: { top: 50 }
    });

    doc.save(`etat_brouillard_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Consultation des Brouillards</CardTitle>
          <CardDescription>
            Filtrez et consultez l'état des brouillards comptables.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Button size="lg" onClick={() => setIsSelectionModalOpen(true)}>
            Générer un état de brouillard
          </Button>
        </CardContent>
      </Card>

      {/* --- Selection Modal --- */}
      <Dialog open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Paramètres de l'état</DialogTitle>
                <DialogDescription>
                    Choisissez les filtres pour générer votre état.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="journal">Journal (Optionnel)</Label>
                    <Select onValueChange={setSelectedJournal}>
                        <SelectTrigger id="journal">
                            <SelectValue placeholder="Tous les journaux" />
                        </SelectTrigger>
                        <SelectContent>
                            {MOCK_JOURNALS.map(j => <SelectItem key={j.code} value={j.code}>{j.intitule}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stagiaire">Saisi par (Optionnel)</Label>
                    <Select onValueChange={setSelectedStagiaire}>
                        <SelectTrigger id="stagiaire">
                            <SelectValue placeholder="Tous les utilisateurs" />
                        </SelectTrigger>
                        <SelectContent>
                            {MOCK_STAGIAIRES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
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
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsSelectionModalOpen(false)}>Annuler</Button>
                <Button onClick={handleShowJournal}>Générer l'état</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* --- Display Modal --- */}
      <Dialog open={isDisplayModalOpen} onOpenChange={setIsDisplayModalOpen}>
        <DialogContent className="max-w-6xl">
            <DialogHeader>
                <DialogTitle>État du Brouillard</DialogTitle>
                <DialogDescription>
                    Période du {period?.from ? format(period.from, 'dd LLL yyyy', {locale: fr}) : ''} au {period?.to ? format(period.to, 'dd LLL yyyy', {locale: fr}) : ''}.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4">
                 <Table>
                    <TableHeader className="sticky top-0 bg-secondary">
                        <TableRow>
                            <TableHead className="text-center">Date Op.</TableHead>
                            <TableHead className="text-center">N° Pièce</TableHead>
                            <TableHead className="text-center">Libellé</TableHead>
                            <TableHead className="text-center">Saisi par</TableHead>
                            <TableHead className="text-center">Équilibre</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {brouillardData.length > 0 ? brouillardData.map(e => {
                            const { isBalanced } = calculateTotalsForEcriture(e.lignes);
                            return (
                                <TableRow key={e.id}>
                                    <TableCell className="text-center">{format(new Date(e.dateOperation), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-center font-mono">{e.numeroPiece}</TableCell>
                                    <TableCell className="text-center">{e.libelleOperation}</TableCell>
                                    <TableCell className="text-center">{e.saisiePar}</TableCell>
                                    <TableCell className="text-center">
                                      <Badge variant={isBalanced ? 'default' : 'destructive'} className={isBalanced ? 'bg-green-100 text-green-800' : ''}>
                                        {isBalanced ? 'Équilibrée' : 'Déséquilibrée'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge variant={e.statut === 'validee' ? 'secondary' : 'default'} className={e.statut === 'validee' ? '' : 'bg-yellow-100 text-yellow-800'}>
                                        {e.statut === 'validee' ? 'Validée' : 'En Brouillard'}
                                      </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Aucune donnée pour les filtres sélectionnés.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                 </Table>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDisplayModalOpen(false)}>Fermer</Button>
                <Button onClick={handleExportPDF} disabled={brouillardData.length === 0}><Download className="mr-2 h-4 w-4"/>Exporter en PDF</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
