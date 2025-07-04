
'use client';

import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2, Eye, ShieldCheck, Download, List, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// --- DATA TYPES & MOCK DATA ---

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

const initialEcritures: Ecriture[] = [
  {
    id: 1,
    dateOperation: '2024-07-25',
    journal: 'AC',
    numeroPiece: 'F24-AC-001',
    libelleOperation: 'Achat de matières premières - Fournisseur A',
    lignes: [
      { id: 'l1-1', compte: '601000', tiers: '', libelle: 'Achat Mat. Prem.', debit: 1500, credit: 0 },
      { id: 'l1-2', compte: '445660', tiers: '', libelle: 'TVA déductible', debit: 300, credit: 0 },
      { id: 'l1-3', compte: '401000', tiers: 'FOURN_A', libelle: 'Fournisseur A', debit: 0, credit: 1800 },
    ],
    statut: 'brouillard',
    saisiePar: 'Jean Stagiaire',
  },
  {
    id: 2,
    dateOperation: '2024-07-26',
    journal: 'VE',
    numeroPiece: 'F24-VE-001',
    libelleOperation: 'Vente de services - Client B',
    lignes: [
      { id: 'l2-1', compte: '411000', tiers: 'CLIENT_B', libelle: 'Client B', debit: 2400, credit: 0 },
      { id: 'l2-2', compte: '706000', tiers: '', libelle: 'Prestation de service', debit: 0, credit: 2000 },
      { id: 'l2-3', compte: '445710', tiers: '', libelle: 'TVA collectée', debit: 0, credit: 400 },
    ],
    statut: 'validee',
    saisiePar: 'Marie Comptable',
  },
  {
    id: 3,
    dateOperation: '2024-07-27',
    journal: 'OD',
    numeroPiece: 'F24-OD-001',
    libelleOperation: 'Écriture de salaire - Incomplète',
    lignes: [
      { id: 'l3-1', compte: '641000', tiers: '', libelle: 'Rémunérations', debit: 3000, credit: 0 },
      { id: 'l3-2', compte: '421000', tiers: '', libelle: 'Personnel - Rémunérations dues', debit: 0, credit: 2300 },
    ],
    statut: 'brouillard',
    saisiePar: 'Jean Stagiaire',
  },
];

type EcritureModele = {
  id: string;
  numeroCompte: string;
  tiers: string;
  libelle: string;
  debit: string;
  credit: string;
};

type ModeleSaisie = {
  id: number;
  libelle: string;
  description: string;
  ecritures: EcritureModele[];
};

const initialModeles: ModeleSaisie[] = [
  {
    id: 1,
    libelle: 'Achat de marchandises',
    description: 'Modèle pour enregistrer un achat simple de marchandises avec TVA.',
    ecritures: [
      { id: 'e1', numeroCompte: '607000', tiers: '', libelle: 'Achats de marchandises', debit: 'MONTANT_HT', credit: '' },
      { id: 'e2', numeroCompte: '445660', tiers: '', libelle: 'TVA déductible', debit: 'MONTANT_TVA', credit: '' },
      { id: 'e3', numeroCompte: '401000', tiers: 'FOURNISSEUR', libelle: 'Dette fournisseur', debit: '', credit: 'MONTANT_TTC' },
    ],
  },
  {
    id: 2,
    libelle: 'Vente de services',
    description: 'Modèle pour une vente de prestation de services avec TVA.',
    ecritures: [
        { id: 'e4', numeroCompte: '411000', tiers: 'CLIENT', libelle: 'Créance client', debit: 'MONTANT_TTC', credit: '' },
        { id: 'e5', numeroCompte: '706000', tiers: '', libelle: 'Prestations de services', debit: '', credit: 'MONTANT_HT' },
        { id: 'e6', numeroCompte: '445710', tiers: '', libelle: 'TVA collectée', debit: '', credit: 'MONTANT_TVA' },
    ],
  },
];

const defaultEcritureData: Omit<Ecriture, 'id' | 'statut' | 'saisiePar'> = {
    dateOperation: new Date().toISOString().split('T')[0],
    journal: '',
    numeroPiece: '',
    libelleOperation: '',
    lignes: [
        { id: `line-${Date.now()}-1`, compte: '', tiers: '', libelle: '', debit: 0, credit: 0 },
        { id: `line-${Date.now()}-2`, compte: '', tiers: '', libelle: '', debit: 0, credit: 0 },
    ]
}

const calculateTotalsForEcriture = (lignes: LigneEcriture[]) => {
  const totalDebit = lignes.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalCredit = lignes.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
  return { totalDebit, totalCredit, isBalanced };
};

export default function BrouillardsPage() {
  const [ecritures, setEcritures] = useState<Ecriture[]>(initialEcritures);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEcriture, setEditingEcriture] = useState<Ecriture | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [ecritureToDelete, setEcritureToDelete] = useState<Ecriture | null>(null);
  const [ecritureToValidate, setEcritureToValidate] = useState<Ecriture | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Omit<Ecriture, 'id' | 'statut' | 'saisiePar'>>(defaultEcritureData);

  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    if (!formData) return { totalDebit: 0, totalCredit: 0, isBalanced: true };
    return calculateTotalsForEcriture(formData.lignes);
  }, [formData]);

  const resetModalState = () => {
    setIsModalOpen(false);
    setEditingEcriture(null);
    setFormData(defaultEcritureData);
    setIsViewMode(false);
  };

  const handleOpenCreateModal = () => {
    setEditingEcriture(null);
    setFormData(defaultEcritureData);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleOpenModal = (ecriture: Ecriture, viewMode: boolean) => {
    setEditingEcriture(ecriture);
    setFormData(JSON.parse(JSON.stringify(ecriture)));
    setIsViewMode(viewMode || ecriture.statut === 'validee');
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (ecritureToDelete) {
      setEcritures(ecritures.filter(e => e.id !== ecritureToDelete.id));
      setEcritureToDelete(null);
      toast({ title: 'Écriture supprimée', description: 'L\'écriture a été retirée du brouillard.' });
    }
  };

  const handleValidate = () => {
    if (ecritureToValidate) {
        setEcritures(ecritures.map(e => e.id === ecritureToValidate.id ? { ...e, statut: 'validee' } : e));
        setEcritureToValidate(null);
        toast({
            title: 'Écriture validée !',
            description: "L'écriture est maintenant définitive et ne peut plus être modifiée.",
            className: 'bg-green-100 border-green-300 text-green-800'
        });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      toast({ title: "Déséquilibre", description: "L'écriture doit être équilibrée avant de pouvoir être enregistrée.", variant: "destructive" });
      return;
    }

    if (editingEcriture) {
      setEcritures(ecritures.map(e => e.id === editingEcriture.id ? { ...editingEcriture, ...formData } : e));
      toast({ title: 'Modifications enregistrées', description: 'L\'écriture a été mise à jour dans le brouillard.' });
    } else {
        const newEcriture: Ecriture = {
            id: Date.now(),
            ...formData,
            statut: 'brouillard',
            saisiePar: 'Jean Stagiaire' // Placeholder for current user
        }
        setEcritures([newEcriture, ...ecritures]);
        toast({ title: 'Écriture ajoutée au brouillard.'})
    }
    
    resetModalState();
  };
  
  const handleLigneChange = (id: string, field: keyof LigneEcriture, value: string | number) => {
    setFormData(prev => {
        const newLignes = prev.lignes.map(ligne => {
            if (ligne.id === id) {
                const updatedLigne = { ...ligne, [field]: value };
                if (field === 'debit' && Number(value) > 0) updatedLigne.credit = 0;
                if (field === 'credit' && Number(value) > 0) updatedLigne.debit = 0;
                return updatedLigne;
            }
            return ligne;
        });
        return {...prev, lignes: newLignes};
    })
  };

  const handleFormChange = (field: keyof Omit<Ecriture, 'id' | 'lignes' | 'statut' | 'saisiePar'>, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const addLigne = () => {
    setFormData(prev => ({
        ...prev,
        lignes: [...prev.lignes, { id: `line-${Date.now()}`, compte: '', tiers: '', libelle: '', debit: 0, credit: 0 }]
    }));
  };

  const removeLigne = (id: string) => {
     setFormData(prev => ({
        ...prev,
        lignes: prev.lignes.filter(l => l.id !== id)
    }));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = ecritures.map(e => {
        const { isBalanced } = calculateTotalsForEcriture(e.lignes);
        return [
            e.dateOperation,
            e.numeroPiece,
            e.libelleOperation,
            e.saisiePar,
            isBalanced ? 'Équilibrée' : 'Déséquilibrée',
            e.statut === 'validee' ? 'Validée' : 'En Brouillard'
        ];
    });

    doc.setFontSize(18);
    doc.text('État du Brouillard Comptable', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR')}`, 15, 30);
    
    autoTable(doc, {
        startY: 35,
        head: [['Date Op.', 'N° Pièce', 'Libellé', 'Saisi par', 'Équilibre', 'Statut']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [28, 32, 57] },
    });

    doc.save(`etat_brouillard_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleSelectTemplate = (template: ModeleSaisie) => {
    const newLignes = template.ecritures.map(e => ({
        id: `line-${Date.now()}-${e.id}`,
        compte: e.numeroCompte,
        tiers: e.tiers,
        libelle: e.libelle,
        debit: 0,
        credit: 0
    }));

    setFormData(prev => ({
        ...prev,
        libelleOperation: template.libelle,
        lignes: newLignes
    }));

    setIsTemplateModalOpen(false);
    handleOpenCreateModal();
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-2xl">Brouillards</CardTitle>
                <CardDescription>
                    Consultez, modifiez et validez les écritures comptables avant leur intégration définitive.
                </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
                <Button variant="outline" onClick={handleExportPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter Brouillard
                </Button>
                <Button variant="outline" onClick={() => setIsTemplateModalOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Utiliser un modèle
                </Button>
                <Button onClick={handleOpenCreateModal}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Saisir une nouvelle écriture
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Op.</TableHead>
                <TableHead>N° Pièce</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Saisi par</TableHead>
                <TableHead className="text-center">Équilibre</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="w-[180px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ecritures.map((ecriture) => {
                const { isBalanced } = calculateTotalsForEcriture(ecriture.lignes);
                return (
                  <TableRow key={ecriture.id} className="odd:bg-muted/50">
                    <TableCell>{new Date(ecriture.dateOperation).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="font-mono">{ecriture.numeroPiece}</TableCell>
                    <TableCell className="font-medium">{ecriture.libelleOperation}</TableCell>
                    <TableCell>{ecriture.saisiePar}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={isBalanced ? 'default' : 'destructive'} className={isBalanced ? 'bg-green-100 text-green-800' : ''}>
                        {isBalanced ? 'Équilibrée' : 'Déséquilibrée'}
                      </Badge>
                    </TableCell>
                     <TableCell className="text-center">
                      <Badge variant={ecriture.statut === 'validee' ? 'secondary' : 'default'} className={ecriture.statut === 'validee' ? '' : 'bg-yellow-100 text-yellow-800'}>
                        {ecriture.statut === 'validee' ? 'Validée' : 'En Brouillard'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(ecriture, true)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(ecriture, false)} disabled={ecriture.statut === 'validee'}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setEcritureToDelete(ecriture)} className="text-destructive hover:text-destructive" disabled={ecriture.statut === 'validee'}><Trash2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setEcritureToValidate(ecriture)} disabled={!isBalanced || ecriture.statut === 'validee'} className="text-green-600 hover:text-green-700 disabled:opacity-50"><ShieldCheck className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
           {ecritures.length === 0 && (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Le brouillard est vide. Saisissez une nouvelle écriture pour commencer.</p>
             </div>
           )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={resetModalState}>
        <DialogContent className="max-w-6xl">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <PlusCircle/>
                        {isViewMode ? 'Détails de l\'écriture' : editingEcriture ? 'Modifier une écriture' : 'Saisie d\'une écriture'}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                     {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="dateOperation">Date de l'opération *</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.dateOperation && "text-muted-foreground")} disabled={isViewMode}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.dateOperation ? format(new Date(formData.dateOperation), "dd/MM/yyyy") : <span>Choisir une date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={new Date(formData.dateOperation)} onSelect={(date) => handleFormChange('dateOperation', date?.toISOString().split('T')[0] || '')} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="journal">Journal *</Label>
                            <Select value={formData.journal} onValueChange={(value) => handleFormChange('journal', value)} disabled={isViewMode}>
                                <SelectTrigger id="journal">
                                    <SelectValue placeholder="Sélectionnez un journal" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AC">AC - Achats</SelectItem>
                                    <SelectItem value="VE">VE - Ventes</SelectItem>
                                    <SelectItem value="BNP">BNP - Banque</SelectItem>
                                    <SelectItem value="OD">OD - Opérations diverses</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Saisi par</Label>
                            <Input value={editingEcriture?.saisiePar || 'Jean Stagiaire'} disabled/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="numeroPiece">N° Pièce *</Label>
                          <Input id="numeroPiece" value={formData.numeroPiece} onChange={(e) => handleFormChange('numeroPiece', e.target.value)} disabled={isViewMode}/>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="libelleOperation">Libellé de l'opération *</Label>
                          <Input id="libelleOperation" value={formData.libelleOperation} onChange={(e) => handleFormChange('libelleOperation', e.target.value)} disabled={isViewMode}/>
                        </div>
                    </div>
                    <Separator/>
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2"><List/> Lignes d'écriture</h3>
                        <div className="border rounded-lg">
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">N°</TableHead>
                                    <TableHead className="text-center">Compte général</TableHead>
                                    <TableHead className="text-center">Tiers</TableHead>
                                    <TableHead className="text-center">Libellé</TableHead>
                                    <TableHead className="w-[150px] text-center">Débit</TableHead>
                                    <TableHead className="w-[150px] text-center">Crédit</TableHead>
                                    <TableHead className="w-[50px] text-center">Action</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                 {formData.lignes.map((ligne, index) => (
                                    <TableRow key={ligne.id}>
                                        <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                                        <TableCell><Input placeholder="Saisir un compte" value={ligne.compte} onChange={(e) => handleLigneChange(ligne.id, 'compte', e.target.value)} disabled={isViewMode} className="text-center"/></TableCell>
                                        <TableCell><Input placeholder="Saisir un tiers" value={ligne.tiers} onChange={(e) => handleLigneChange(ligne.id, 'tiers', e.target.value)} disabled={isViewMode} className="text-center"/></TableCell>
                                        <TableCell><Input placeholder="Libellé" value={ligne.libelle} onChange={(e) => handleLigneChange(ligne.id, 'libelle', e.target.value)} disabled={isViewMode} className="text-center"/></TableCell>
                                        <TableCell><Input type="number" placeholder="0.00" value={ligne.debit || ''} onChange={(e) => handleLigneChange(ligne.id, 'debit', parseFloat(e.target.value))} disabled={isViewMode} className="text-center"/></TableCell>
                                        <TableCell><Input type="number" placeholder="0.00" value={ligne.credit || ''} onChange={(e) => handleLigneChange(ligne.id, 'credit', parseFloat(e.target.value))} disabled={isViewMode} className="text-center"/></TableCell>
                                        <TableCell className="text-center">
                                            {!isViewMode && <Button type="button" variant="ghost" size="icon" onClick={() => removeLigne(ligne.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                                        </TableCell>
                                    </TableRow>
                                 ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-between items-start">
                           {!isViewMode && <Button type="button" variant="default" onClick={addLigne} disabled={isViewMode}><PlusCircle className="mr-2 h-4 w-4"/>Ajouter une ligne</Button>}
                            <div className="w-full max-w-sm space-y-2 text-sm ml-auto">
                                <div className="flex justify-between"><span>Total Débit:</span><span className="font-mono font-semibold">{totalDebit.toFixed(2)} FCFA</span></div>
                                <div className="flex justify-between"><span>Total Crédit:</span><span className="font-mono font-semibold">{totalCredit.toFixed(2)} FCFA</span></div>
                                <Separator/>
                                <div className={`flex justify-between font-bold ${!isBalanced ? 'text-destructive' : 'text-green-600'}`}>
                                    <span>Solde:</span>
                                    <span className="font-mono">{(totalDebit - totalCredit).toFixed(2)} FCFA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="pt-4 border-t mt-4">
                  <Button type="button" variant="outline" onClick={resetModalState}>
                      {isViewMode ? 'Fermer' : 'Annuler'}
                  </Button>
                  {!isViewMode && <Button type="submit" disabled={!isBalanced}>Enregistrer</Button>}
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!ecritureToDelete} onOpenChange={() => setEcritureToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette écriture ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. L'écriture sera définitivement supprimée du brouillard.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!ecritureToValidate} onOpenChange={() => setEcritureToValidate(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Valider l'écriture comptable ?</AlertDialogTitle>
                <AlertDialogDescription>Cette action est irréversible. Une fois validée, l'écriture sera définitivement enregistrée dans les journaux et ne pourra plus être modifiée ou supprimée.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleValidate} className="bg-green-600 hover:bg-green-700">Valider</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Utiliser un modèle de saisie</DialogTitle>
                <DialogDescription>Sélectionnez un modèle pour pré-remplir une nouvelle écriture.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {initialModeles.map(modele => (
                    <Card key={modele.id} className="hover:bg-accent transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between p-4">
                            <div>
                                <h3 className="font-semibold">{modele.libelle}</h3>
                                <p className="text-sm text-muted-foreground">{modele.description}</p>
                            </div>
                            <Button onClick={() => handleSelectTemplate(modele)}>Sélectionner</Button>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
