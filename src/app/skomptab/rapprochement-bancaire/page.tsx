'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Eye, Pencil, Trash2, PlusCircle, ArrowLeft, Calendar as CalendarIcon, Sparkles, Loader2, Link2, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


// --- DATA TYPES & MOCK DATA ---

type LigneReleve = {
  id: number;
  date: string;
  libelle: string;
  debit: number;
  credit: number;
  lettre: boolean;
};

type LigneJournal = {
  id: number;
  date: string;
  libelle: string;
  debit: number;
  credit: number;
  lettre: boolean;
};

type Rapprochement = {
  id: number;
  date: string;
  periode: string;
  journal: string;
  journalCode: string;
  soldeInitial: number;
  lignesReleve: LigneReleve[];
  lignesJournal: LigneJournal[];
};

const MOCK_JOURNALS_TRESORERIE = [
    { code: 'BNP', intitule: 'BNP Paribas', soldeInitial: 15230.50 },
    { code: 'SG', intitule: 'Société Générale', soldeInitial: 8750.20 },
    { code: 'CAISSE', intitule: 'Caisse principale', soldeInitial: 1200.00 },
];

const MOCK_LIGNES_JOURNAL: LigneJournal[] = [
    { id: 101, date: '2024-07-02', libelle: 'Paiement Fournisseur TechCorp', debit: 5400, credit: 0, lettre: false },
    { id: 102, date: '2024-07-05', libelle: 'Encaissement Client Innovate Inc.', debit: 0, credit: 12500, lettre: false },
    { id: 103, date: '2024-07-10', libelle: 'Prélèvement Loyer', debit: 1200, credit: 0, lettre: false },
    { id: 104, date: '2024-07-15', libelle: 'Virement de SG', debit: 0, credit: 10000, lettre: false },
    { id: 105, date: '2024-07-20', libelle: 'Paiement note de frais J. Dupont', debit: 255.50, credit: 0, lettre: false },
    { id: 106, date: '2024-07-25', libelle: 'Encaissement Client Global Sol.', debit: 0, credit: 4800, lettre: false },
];

const initialRapprochements: Rapprochement[] = [
  { id: 1, date: '2024-07-05', periode: 'Juin 2024', journal: 'BNP Paribas', journalCode: 'BNP', soldeInitial: 15230.50, lignesReleve: [], lignesJournal: [] },
  { id: 2, date: '2024-06-04', periode: 'Mai 2024', journal: 'BNP Paribas', journalCode: 'BNP', soldeInitial: 15230.50, lignesReleve: [], lignesJournal: [] },
  { id: 3, date: '2024-05-06', periode: 'Avril 2024', journal: 'Société Générale', journalCode: 'SG', soldeInitial: 8750.20, lignesReleve: [], lignesJournal: [] },
];

export default function RapprochementBancairePage() {
  const [rapprochements, setRapprochements] = useState<Rapprochement[]>(initialRapprochements);
  const [view, setView] = useState<'list' | 'reconciliation'>('list');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // State for reconciliation view
  const [editingRapprochementId, setEditingRapprochementId] = useState<number | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [rapprochementToDelete, setRapprochementToDelete] = useState<Rapprochement | null>(null);

  const [journalCode, setJournalCode] = useState<string>('');
  const [period, setPeriod] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });
  const [lignesReleve, setLignesReleve] = useState<LigneReleve[]>([]);
  const [lignesJournal, setLignesJournal] = useState<LigneJournal[]>([]);

  const selectedJournal = MOCK_JOURNALS_TRESORERIE.find(j => j.code === journalCode);
  const soldeInitialJournal = selectedJournal?.soldeInitial || 0;

  const resetReconciliationState = () => {
    setEditingRapprochementId(null);
    setIsViewMode(false);
    setJournalCode('');
    setLignesReleve([]);
    setLignesJournal([]);
  };

  const handleStartNew = () => {
    resetReconciliationState();
    setLignesReleve([
        { id: 1, date: format(new Date(), 'yyyy-MM-dd'), libelle: '', debit: 0, credit: 0, lettre: false },
    ]);
    setLignesJournal(MOCK_LIGNES_JOURNAL.map(l => ({...l, lettre: false})));
    setView('reconciliation');
  };

  const loadRapprochement = (rapprochement: Rapprochement, viewMode: boolean) => {
    setEditingRapprochementId(rapprochement.id);
    setIsViewMode(viewMode);
    setJournalCode(rapprochement.journalCode);
    setLignesReleve(rapprochement.lignesReleve.length > 0 ? rapprochement.lignesReleve : []); // Load saved lines or empty
    setLignesJournal(rapprochement.lignesJournal.length > 0 ? rapprochement.lignesJournal : MOCK_LIGNES_JOURNAL); // Load saved lines or mock
    const [month, year] = rapprochement.periode.split(' ');
    const monthIndex = fr.localize?.month(fr.months.indexOf(month as any), {width: 'long'});
    const fromDate = new Date(parseInt(year), fr.months.indexOf(month as any), 1);
    setPeriod({
      from: fromDate,
      to: new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0),
    });
    setView('reconciliation');
  };

  const handleSaveRapprochement = () => {
    const periodString = period?.from ? format(period.from, 'MMMM yyyy', { locale: fr }) : 'Période inconnue';
    const journalInfo = MOCK_JOURNALS_TRESORERIE.find(j => j.code === journalCode);
    if (!journalInfo) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un journal.", variant: "destructive" });
      return;
    }

    const rapprochementData = {
      date: new Date().toISOString().split('T')[0],
      periode: periodString.charAt(0).toUpperCase() + periodString.slice(1),
      journal: journalInfo.intitule,
      journalCode: journalInfo.code,
      soldeInitial: journalInfo.soldeInitial,
      lignesReleve,
      lignesJournal,
    };

    if (editingRapprochementId) {
      setRapprochements(prev => prev.map(r => r.id === editingRapprochementId ? { ...r, ...rapprochementData } : r));
      toast({ title: 'Rapprochement modifié', description: 'Vos modifications ont été enregistrées.' });
    } else {
      const newId = Math.max(0, ...rapprochements.map(r => r.id)) + 1;
      setRapprochements(prev => [...prev, { id: newId, ...rapprochementData }]);
      toast({ title: 'Rapprochement enregistré', description: 'Le nouveau rapprochement a été ajouté à l\'historique.' });
    }
    setView('list');
    resetReconciliationState();
  };

  const handleDeleteRapprochement = () => {
    if (rapprochementToDelete) {
        setRapprochements(prev => prev.filter(r => r.id !== rapprochementToDelete.id));
        setRapprochementToDelete(null);
        toast({ title: 'Rapprochement supprimé' });
    }
  };

  const handleLigneReleveChange = (id: number, field: keyof Omit<LigneReleve, 'id' | 'lettre'>, value: string) => {
    setLignesReleve(prev => prev.map(ligne => 
      ligne.id === id ? { ...ligne, [field]: field === 'debit' || field === 'credit' ? parseFloat(value) || 0 : value } : ligne
    ));
  };
  
  const addLigneReleve = () => {
    setLignesReleve(prev => [
        ...prev,
        { id: Date.now(), date: format(new Date(), 'yyyy-MM-dd'), libelle: '', debit: 0, credit: 0, lettre: false }
    ]);
  };
  
  const handleLettreChange = (type: 'releve' | 'journal', id: number) => {
    if (type === 'releve') {
        setLignesReleve(prev => prev.map(l => l.id === id ? {...l, lettre: !l.lettre} : l));
    } else {
        setLignesJournal(prev => prev.map(l => l.id === id ? {...l, lettre: !l.lettre} : l));
    }
  };

  const handleAiMatching = () => {
    setIsProcessing(true);
    toast({ title: 'Rapprochement intelligent en cours...', description: "L'IA analyse les transactions..." });
    setTimeout(() => {
        let releveMatched = new Set<number>();
        let journalMatched = new Set<number>();

        const newLignesJournal = lignesJournal.map(jl => {
            if (journalMatched.has(jl.id)) return { ...jl, lettre: true };
            const montantJournal = jl.debit || jl.credit;
            const match = lignesReleve.find(rl => {
                if (releveMatched.has(rl.id)) return false;
                const montantReleve = rl.debit || rl.credit;
                return montantJournal === montantReleve && (rl.debit > 0) === (jl.debit > 0);
            });

            if (match) {
                releveMatched.add(match.id);
                journalMatched.add(jl.id);
                return { ...jl, lettre: true };
            }
            return { ...jl, lettre: false };
        });

        const newLignesReleve = lignesReleve.map(rl => ({ ...rl, lettre: releveMatched.has(rl.id) }));

        setLignesJournal(newLignesJournal);
        setLignesReleve(newLignesReleve);
        setIsProcessing(false);
        toast({ title: 'Rapprochement terminé !', description: `${releveMatched.size} correspondances trouvées.` });

    }, 2500);
  };

  const { totalReleve, soldeFinalReleve, totalJournal, soldeFinalJournal, ecart } = useMemo(() => {
      const totalDebitReleve = lignesReleve.filter(l => l.lettre).reduce((acc, l) => acc + l.debit, 0);
      const totalCreditReleve = lignesReleve.filter(l => l.lettre).reduce((acc, l) => acc + l.credit, 0);
      const totalReleve = totalCreditReleve - totalDebitReleve;
      const soldeFinalReleve = (soldeInitialJournal + totalReleve);

      const totalDebitJournal = lignesJournal.filter(l => l.lettre).reduce((acc, l) => acc + l.debit, 0);
      const totalCreditJournal = lignesJournal.filter(l => l.lettre).reduce((acc, l) => acc + l.credit, 0);
      const totalJournal = totalCreditJournal - totalDebitJournal;
      const soldeFinalJournal = (soldeInitialJournal + totalJournal);

      const ecart = soldeFinalReleve - soldeFinalJournal;

      return { totalReleve, soldeFinalReleve, totalJournal, soldeFinalJournal, ecart };
  }, [lignesReleve, lignesJournal, soldeInitialJournal]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const journalInfo = MOCK_JOURNALS_TRESORERIE.find(j => j.code === journalCode);
    const periodString = period?.from ? (period.to ? `${format(period.from, 'dd/MM/yy')} - ${format(period.to, 'dd/MM/yy')}` : format(period.from, 'dd/MM/yy')) : 'N/A';

    doc.setFontSize(18);
    doc.text('Rapprochement Bancaire', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Journal: ${journalInfo?.intitule || 'N/A'}`, 15, 30);
    doc.text(`Période: ${periodString}`, 15, 36);

    doc.setFontSize(14);
    doc.text('Relevé Bancaire', 15, 50);
    autoTable(doc, {
      startY: 55,
      head: [['Lettré', 'Date', 'Libellé', 'Débit', 'Crédit']],
      body: lignesReleve.map(l => [l.lettre ? 'X' : '', l.date, l.libelle, l.debit.toFixed(2), l.credit.toFixed(2)]),
    });

    let finalY = (doc as any).lastAutoTable.finalY;

    doc.setFontSize(14);
    doc.text('Journal de Trésorerie', 15, finalY + 15);
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Lettré', 'Date', 'Libellé', 'Débit', 'Crédit']],
      body: lignesJournal.map(l => [l.lettre ? 'X' : '', format(new Date(l.date), 'dd/MM/yyyy'), l.libelle, l.debit.toFixed(2), l.credit.toFixed(2)]),
    });
    
    finalY = (doc as any).lastAutoTable.finalY;
    
    doc.setFontSize(14);
    doc.text('Synthèse', 15, finalY + 15);
    doc.setFontSize(10);
    doc.text(`Solde initial: ${soldeInitialJournal.toFixed(2)}`, 15, finalY + 22);
    doc.text(`Solde final relevé (lettré): ${soldeFinalReleve.toFixed(2)}`, 15, finalY + 29);
    doc.text(`Solde final comptable (lettré): ${soldeFinalJournal.toFixed(2)}`, 15, finalY + 36);
    doc.setFont('helvetica', 'bold');
    doc.text(`Écart: ${ecart.toFixed(2)}`, 15, finalY + 43);

    doc.save(`rapprochement_${journalCode}_${periodString.replace(/\s/g, '')}.pdf`);
  };


  if (view === 'reconciliation') {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setView('list')}><ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste</Button>
            <h1 className="text-2xl font-bold tracking-tight">{isViewMode ? 'Détails du Rapprochement' : 'Nouveau Rapprochement'}</h1>
            <Button variant="outline" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" /> Exporter PDF</Button>
        </div>

        {/* Settings */}
        <Card>
            <CardHeader><CardTitle>1. Paramètres du rapprochement</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Journal de trésorerie</Label>
                     <Select value={journalCode} onValueChange={setJournalCode} disabled={isViewMode}>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez un journal..." /></SelectTrigger>
                        <SelectContent>
                            {MOCK_JOURNALS_TRESORERIE.map(j => <SelectItem key={j.code} value={j.code}>{j.intitule}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Période de rapprochement</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isViewMode}>
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
            </CardContent>
        </Card>

        {/* Reconciliation Workspace */}
        <div className="grid lg:grid-cols-5 gap-6 items-start">
            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle>2. Relevé Bancaire</CardTitle>
                    <CardDescription>Saisissez les lignes du relevé.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Libellé</TableHead>
                                    <TableHead className="text-right">Débit</TableHead>
                                    <TableHead className="text-right">Crédit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lignesReleve.map(ligne => (
                                    <TableRow key={ligne.id}>
                                        <TableCell><Checkbox checked={ligne.lettre} onCheckedChange={() => handleLettreChange('releve', ligne.id)} disabled={isViewMode}/></TableCell>
                                        <TableCell><Input type="date" value={ligne.date} className="min-w-[120px] h-8" onChange={e => handleLigneReleveChange(ligne.id, 'date', e.target.value)} disabled={isViewMode}/></TableCell>
                                        <TableCell><Input placeholder="Libellé" value={ligne.libelle} className="h-8" onChange={e => handleLigneReleveChange(ligne.id, 'libelle', e.target.value)} disabled={isViewMode}/></TableCell>
                                        <TableCell><Input type="number" placeholder="0.00" value={ligne.debit || ''} className="text-right h-8" onChange={e => handleLigneReleveChange(ligne.id, 'debit', e.target.value)} disabled={isViewMode}/></TableCell>
                                        <TableCell><Input type="number" placeholder="0.00" value={ligne.credit || ''} className="text-right h-8" onChange={e => handleLigneReleveChange(ligne.id, 'credit', e.target.value)} disabled={isViewMode}/></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {!isViewMode && <Button variant="outline" size="sm" className="mt-4" onClick={addLigneReleve}><PlusCircle className="mr-2 h-4 w-4"/> Ajouter une ligne</Button>}
                </CardContent>
            </Card>

            <div className="lg:col-span-1 flex items-center justify-center pt-16">
                 <Button size="lg" className="w-full h-24 flex-col gap-2" onClick={handleAiMatching} disabled={isProcessing || isViewMode}>
                    {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Sparkles className="h-8 w-8 text-yellow-300" />}
                    <span>{isProcessing ? 'Analyse...' : 'Rapprochement IA'}</span>
                </Button>
            </div>

             <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle>3. Journal de Trésorerie</CardTitle>
                    <CardDescription>Mouvements enregistrés dans Unikorp.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="border rounded-md max-h-[420px] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-secondary">
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Libellé</TableHead>
                                    <TableHead className="text-right">Débit</TableHead>
                                    <TableHead className="text-right">Crédit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {lignesJournal.map(ligne => (
                                    <TableRow key={ligne.id}>
                                        <TableCell><Checkbox checked={ligne.lettre} onCheckedChange={() => handleLettreChange('journal', ligne.id)} disabled={isViewMode}/></TableCell>
                                        <TableCell>{format(new Date(ligne.date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{ligne.libelle}</TableCell>
                                        <TableCell className="text-right font-mono">{ligne.debit > 0 ? ligne.debit.toFixed(2) : ''}</TableCell>
                                        <TableCell className="text-right font-mono">{ligne.credit > 0 ? ligne.credit.toFixed(2) : ''}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader><CardTitle>4. Synthèse et Validation</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2 rounded-lg border p-4">
                    <h3 className="font-semibold">Relevé Bancaire</h3>
                    <Separator/>
                    <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <dt>Solde initial (reporté)</dt>
                            <dd className="font-mono">{soldeInitialJournal.toFixed(2)}</dd>
                        </div>
                         <div className="flex justify-between text-green-600">
                            <dt>Total crédits lettrés</dt>
                            <dd className="font-mono">{lignesReleve.filter(l => l.lettre).reduce((acc, l) => acc + l.credit, 0).toFixed(2)}</dd>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <dt>Total débits lettrés</dt>
                            <dd className="font-mono">-{lignesReleve.filter(l => l.lettre).reduce((acc, l) => acc + l.debit, 0).toFixed(2)}</dd>
                        </div>
                        <Separator/>
                        <div className="flex justify-between font-bold">
                            <dt>Nouveau Solde Relevé</dt>
                            <dd className="font-mono">{soldeFinalReleve.toFixed(2)}</dd>
                        </div>
                    </dl>
                </div>
                 <div className="space-y-2 rounded-lg border p-4">
                    <h3 className="font-semibold">Journal de Trésorerie</h3>
                    <Separator/>
                     <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <dt>Solde initial</dt>
                            <dd className="font-mono">{soldeInitialJournal.toFixed(2)}</dd>
                        </div>
                         <div className="flex justify-between text-green-600">
                            <dt>Total crédits lettrés</dt>
                            <dd className="font-mono">{lignesJournal.filter(l => l.lettre).reduce((acc, l) => acc + l.credit, 0).toFixed(2)}</dd>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <dt>Total débits lettrés</dt>
                            <dd className="font-mono">-{lignesJournal.filter(l => l.lettre).reduce((acc, l) => acc + l.debit, 0).toFixed(2)}</dd>
                        </div>
                        <Separator/>
                        <div className="flex justify-between font-bold">
                            <dt>Nouveau Solde Comptable</dt>
                            <dd className="font-mono">{soldeFinalJournal.toFixed(2)}</dd>
                        </div>
                    </dl>
                </div>
                 <div className="space-y-2 rounded-lg border p-4 flex flex-col justify-center items-center gap-2 bg-muted/50">
                    <h3 className="font-semibold">Écart de rapprochement</h3>
                    <p className={`text-3xl font-bold font-mono ${ecart !== 0 ? 'text-destructive' : 'text-green-600'}`}>{ecart.toFixed(2)}</p>
                    {ecart === 0 && <Badge>Rapprochement équilibré</Badge>}
                </div>
            </CardContent>
            {!isViewMode &&
                <CardFooter>
                    <Button size="lg" className="ml-auto" disabled={ecart !== 0} onClick={handleSaveRapprochement}>
                        <Link2 className="mr-2 h-4 w-4"/>
                        Valider et enregistrer le rapprochement
                    </Button>
                </CardFooter>
            }
        </Card>
      </div>
    )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Rapprochement Bancaire</CardTitle>
            <CardDescription>Consultez l'historique de vos rapprochements bancaires.</CardDescription>
          </div>
          <Button onClick={handleStartNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Lancer un nouveau rapprochement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date de rapprochement</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Journal</TableHead>
              <TableHead className="text-right w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rapprochements.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{format(new Date(r.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="font-medium">{r.periode}</TableCell>
                <TableCell><Badge variant="outline">{r.journal}</Badge></TableCell>
                <TableCell className="text-right">
                   <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => loadRapprochement(r, true)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => loadRapprochement(r, false)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setRapprochementToDelete(r)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    <AlertDialog open={!!rapprochementToDelete} onOpenChange={() => setRapprochementToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
            <AlertDialogDescription>
                Cette action est irréversible et supprimera définitivement ce rapprochement de l'historique.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRapprochement} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
