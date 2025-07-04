
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
    lignes: [
      { id: 'l2-1', compte: '411000', tiers: 'CLIENT_B', libelle: 'Client B', debit: 2400, credit: 0 },
      { id: 'l2-2', compte: '706000', tiers: '', libelle: 'Prestation de service', debit: 0, credit: 2000 },
      { id: 'l2-3', compte: '445710', tiers: '', libelle: 'TVA collectée', debit: 0, credit: 400 },
    ],
    statut: 'validee', saisiePar: 'Marie Comptable',
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
    lignes: [
      { id: 'l4-1', compte: '606400', tiers: '', libelle: 'Achat fournitures', debit: 250, credit: 0 },
      { id: 'l4-2', compte: '445660', tiers: '', libelle: 'TVA déductible', debit: 50, credit: 0 },
      { id: 'l4-3', compte: '401000', tiers: 'FOURN_B', libelle: 'Fournisseur B', debit: 0, credit: 300 },
    ],
    statut: 'brouillard', saisiePar: 'Marie Comptable',
  }
];

const MOCK_JOURNALS = [
  { code: 'AC', intitule: 'Journal des achats' },
  { code: 'VE', intitule: 'Journal des ventes' },
  { code: 'BNP', intitule: 'Journal de banque BNP' },
  { code: 'OD', intitule: 'Opérations diverses' },
];
const MOCK_STAGIAIRES = ['Jean Stagiaire', 'Marie Comptable'];

type GroupedEcriture = {
  dateOperation: string;
  numeroPiece: string;
  libelleOperation: string;
  saisiePar: string;
  statut: 'brouillard' | 'validee';
  lignes: LigneEcriture[];
  totalDebit: number;
  totalCredit: number;
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
  
  const groupedData = useMemo(() => {
    return brouillardData.reduce((acc, ecriture) => {
        const key = ecriture.numeroPiece;
        if (!acc[key]) {
            const totalDebit = ecriture.lignes.reduce((sum, l) => sum + l.debit, 0);
            const totalCredit = ecriture.lignes.reduce((sum, l) => sum + l.credit, 0);
            acc[key] = {
                dateOperation: ecriture.dateOperation,
                numeroPiece: ecriture.numeroPiece,
                libelleOperation: ecriture.libelleOperation,
                saisiePar: ecriture.saisiePar,
                statut: ecriture.statut,
                lignes: ecriture.lignes,
                totalDebit,
                totalCredit
            };
        }
        return acc;
    }, {} as Record<string, GroupedEcriture>);
  }, [brouillardData]);

  const totalDebit = Object.values(groupedData).reduce((acc, group) => acc + group.totalDebit, 0);
  const totalCredit = Object.values(groupedData).reduce((acc, group) => acc + group.totalCredit, 0);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const companyName = "Votre Société S.A.";
    const userName = "Utilisateur Unikorp";
    const moduleName = "SKOMPTAB";
    const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';

    const tableBody = Object.values(groupedData).flatMap(group => {
        const firstRow = [
            { content: format(new Date(group.dateOperation), 'dd MM yyyy'), rowSpan: group.lignes.length, styles: { halign: 'center', valign: 'middle' } },
            { content: group.numeroPiece, rowSpan: group.lignes.length, styles: { halign: 'center', valign: 'middle' } },
            group.lignes[0].compte,
            group.lignes[0].tiers || '-',
            group.lignes[0].libelle,
            { content: group.lignes[0].debit > 0 ? group.lignes[0].debit.toLocaleString('fr-FR') : '', styles: { halign: 'right' } },
            { content: group.lignes[0].credit > 0 ? group.lignes[0].credit.toLocaleString('fr-FR') : '', styles: { halign: 'right' } },
            { content: group.saisiePar, rowSpan: group.lignes.length, styles: { halign: 'center', valign: 'middle' } },
            { content: group.statut === 'validee' ? 'Validée' : 'Brouillard', rowSpan: group.lignes.length, styles: { halign: 'center', valign: 'middle' } },
        ];
        const otherRows = group.lignes.slice(1).map(ligne => ([
            ligne.compte,
            ligne.tiers || '-',
            ligne.libelle,
            { content: ligne.debit > 0 ? ligne.debit.toLocaleString('fr-FR') : '', styles: { halign: 'right' } },
            { content: ligne.credit > 0 ? ligne.credit.toLocaleString('fr-FR') : '', styles: { halign: 'right' } },
        ]));
        return [firstRow, ...otherRows];
    });

    autoTable(doc, {
        head: [['Date Op.', 'N° Pièce', 'Compte', 'Tiers', 'Libellé', 'Débit', 'Crédit', 'Saisi par', 'Statut']],
        body: tableBody,
        foot: [[{content: 'Totaux', colSpan: 5, styles: { halign: 'right' }}, {content: totalDebit.toLocaleString('fr-FR'), styles: {halign: 'right'}}, {content: totalCredit.toLocaleString('fr-FR'), styles: {halign: 'right'}}, '', '']],
        theme: 'striped',
        headStyles: { fillColor: [241, 245, 249], textColor: [45, 55, 72], fontStyle: 'bold', halign: 'center' },
        footStyles: { fillColor: [226, 232, 240], fontStyle: 'bold' },
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
            doc.text(`Période : ${period?.from ? format(period.from, 'dd MM yy') : ''} - ${period?.to ? format(period.to, 'dd MM yy') : ''}`, 190, 30, { align: 'right' });
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
        <DialogContent className="max-w-7xl">
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
                            <TableHead className="w-[120px] text-center">Date Op.</TableHead>
                            <TableHead className="w-[120px] text-center">N° Pièce</TableHead>
                            <TableHead className="text-center">Compte</TableHead>
                            <TableHead className="text-center">Tiers</TableHead>
                            <TableHead className="text-center">Libellé</TableHead>
                            <TableHead className="w-[120px] text-center">Débit</TableHead>
                            <TableHead className="w-[120px] text-center">Crédit</TableHead>
                            <TableHead className="w-[150px] text-center">Saisi par</TableHead>
                            <TableHead className="w-[120px] text-center">Statut</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {brouillardData.length > 0 ? Object.values(groupedData).map((group, groupIndex) => (
                            <React.Fragment key={group.numeroPiece}>
                                {group.lignes.map((ligne, ligneIndex) => (
                                    <TableRow key={`${group.numeroPiece}-${ligne.id}`} className={groupIndex % 2 !== 0 ? 'bg-muted/5' : ''}>
                                        {ligneIndex === 0 && (
                                            <>
                                                <TableCell rowSpan={group.lignes.length} className="text-center align-middle font-medium border-r">
                                                    {format(new Date(group.dateOperation), 'dd/MM/yyyy')}
                                                </TableCell>
                                                <TableCell rowSpan={group.lignes.length} className="text-center align-middle font-mono border-r">
                                                    {group.numeroPiece}
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell className="text-center font-mono">{ligne.compte}</TableCell>
                                        <TableCell className="text-center">{ligne.tiers || '-'}</TableCell>
                                        <TableCell className="text-left">{ligneIndex === 0 ? <span className="font-semibold">{group.libelleOperation}</span> : <span className="pl-4 text-muted-foreground">{ligne.libelle}</span>}</TableCell>
                                        <TableCell className="text-right font-mono text-green-600">{ligne.debit > 0 ? ligne.debit.toLocaleString('fr-FR', {minimumFractionDigits: 2}) : ''}</TableCell>
                                        <TableCell className="text-right font-mono text-red-600">{ligne.credit > 0 ? ligne.credit.toLocaleString('fr-FR', {minimumFractionDigits: 2}) : ''}</TableCell>
                                        {ligneIndex === 0 && (
                                            <>
                                                <TableCell rowSpan={group.lignes.length} className="text-center align-middle border-l">
                                                    {group.saisiePar}
                                                </TableCell>
                                                <TableCell rowSpan={group.lignes.length} className="text-center align-middle border-l">
                                                  <Badge variant={group.statut === 'validee' ? 'secondary' : 'default'} className={group.statut === 'validee' ? '' : 'bg-yellow-100 text-yellow-800'}>
                                                    {group.statut === 'validee' ? 'Validée' : 'En Brouillard'}
                                                  </Badge>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">Aucune donnée pour les filtres sélectionnés.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {brouillardData.length > 0 &&
                      <TableFooter>
                          <TableRow className="bg-secondary font-bold">
                              <TableCell colSpan={5} className="text-right">Totaux</TableCell>
                              <TableCell className="text-right font-mono">{totalDebit.toLocaleString('fr-FR', {minimumFractionDigits: 2})}</TableCell>
                              <TableCell className="text-right font-mono">{totalCredit.toLocaleString('fr-FR', {minimumFractionDigits: 2})}</TableCell>
                              <TableCell colSpan={2}></TableCell>
                          </TableRow>
                      </TableFooter>
                    }
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
