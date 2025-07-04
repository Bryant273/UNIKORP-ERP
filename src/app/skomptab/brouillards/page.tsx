
'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2, Eye, ShieldCheck, AlertTriangle } from 'lucide-react';

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
  },
];

const calculateTotalsForEcriture = (lignes: LigneEcriture[]) => {
  const totalDebit = lignes.reduce((acc, l) => acc + l.debit, 0);
  const totalCredit = lignes.reduce((acc, l) => acc + l.credit, 0);
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
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Ecriture | null>(null);

  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    if (!formData) return { totalDebit: 0, totalCredit: 0, isBalanced: true };
    return calculateTotalsForEcriture(formData.lignes);
  }, [formData]);

  const resetModalState = () => {
    setIsModalOpen(false);
    setEditingEcriture(null);
    setFormData(null);
    setIsViewMode(false);
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
    if (!formData || !editingEcriture) return;

    if (!isBalanced) {
      toast({ title: "Déséquilibre", description: "L'écriture doit être équilibrée avant de pouvoir être enregistrée.", variant: "destructive" });
      return;
    }

    setEcritures(ecritures.map(e => e.id === editingEcriture.id ? formData : e));
    resetModalState();
    toast({ title: 'Modifications enregistrées', description: 'L\'écriture a été mise à jour dans le brouillard.' });
  };
  
  const handleLigneChange = (id: string, field: keyof LigneEcriture, value: string | number) => {
    if (!formData) return;
    const newLignes = formData.lignes.map(ligne => {
      if (ligne.id === id) {
        const updatedLigne = { ...ligne, [field]: value };
        if (field === 'debit' && Number(value) > 0) updatedLigne.credit = 0;
        if (field === 'credit' && Number(value) > 0) updatedLigne.debit = 0;
        return updatedLigne;
      }
      return ligne;
    });
    setFormData(prev => prev ? { ...prev, lignes: newLignes } : null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-2xl">Saisie & Brouillard Comptable</CardTitle>
                <CardDescription>
                    Saisissez, modifiez et validez les écritures comptables avant leur intégration définitive.
                </CardDescription>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Saisir une nouvelle écriture
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Op.</TableHead>
                <TableHead>Journal</TableHead>
                <TableHead>N° Pièce</TableHead>
                <TableHead>Libellé</TableHead>
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
                    <TableCell>{ecriture.dateOperation}</TableCell>
                    <TableCell><Badge variant="outline">{ecriture.journal}</Badge></TableCell>
                    <TableCell className="font-mono">{ecriture.numeroPiece}</TableCell>
                    <TableCell className="font-medium">{ecriture.libelleOperation}</TableCell>
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
        <DialogContent className="max-w-4xl">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <DialogTitle>{isViewMode ? 'Consulter l\'écriture' : 'Modifier l\'écriture'}</DialogTitle>
                    <DialogDescription>
                        {isViewMode ? `Détails de l'écriture pour la pièce ${formData?.numeroPiece}.` : 'Modifiez les lignes de l\'écriture. Assurez-vous que l\'écriture est équilibrée.'}
                    </DialogDescription>
                </DialogHeader>
                {formData && (
                  <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1"><Label>Journal</Label><p className="font-semibold">{formData.journal}</p></div>
                        <div className="space-y-1"><Label>Date Opération</Label><p className="font-semibold">{formData.dateOperation}</p></div>
                        <div className="space-y-1"><Label>N° Pièce</Label><p className="font-semibold">{formData.numeroPiece}</p></div>
                     </div>
                     <div className="space-y-1"><Label>Libellé Opération</Label><p className="font-semibold">{formData.libelleOperation}</p></div>
                     <Separator/>
                     <Table>
                        <TableHeader><TableRow><TableHead>Compte</TableHead><TableHead>Tiers</TableHead><TableHead>Libellé</TableHead><TableHead>Débit</TableHead><TableHead>Crédit</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {formData.lignes.map(ligne => (
                                <TableRow key={ligne.id}>
                                    <TableCell><Input value={ligne.compte} onChange={e => handleLigneChange(ligne.id, 'compte', e.target.value)} disabled={isViewMode}/></TableCell>
                                    <TableCell><Input value={ligne.tiers} onChange={e => handleLigneChange(ligne.id, 'tiers', e.target.value)} disabled={isViewMode}/></TableCell>
                                    <TableCell><Input value={ligne.libelle} onChange={e => handleLigneChange(ligne.id, 'libelle', e.target.value)} disabled={isViewMode}/></TableCell>
                                    <TableCell><Input type="number" value={ligne.debit || ''} onChange={e => handleLigneChange(ligne.id, 'debit', parseFloat(e.target.value))} disabled={isViewMode}/></TableCell>
                                    <TableCell><Input type="number" value={ligne.credit || ''} onChange={e => handleLigneChange(ligne.id, 'credit', parseFloat(e.target.value))} disabled={isViewMode}/></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                     <div className="w-full max-w-sm space-y-2 text-sm p-4 border rounded-lg bg-muted/50 ml-auto">
                        <div className="flex justify-between"><span>Total Débit:</span><span className="font-mono font-semibold">{totalDebit.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Total Crédit:</span><span className="font-mono font-semibold">{totalCredit.toFixed(2)}</span></div>
                        <Separator/>
                        <div className={`flex justify-between font-bold ${!isBalanced ? 'text-destructive' : 'text-green-600'}`}>
                           <span>Solde:</span>
                           <span className="font-mono">{(totalDebit - totalCredit).toFixed(2)}</span>
                        </div>
                    </div>
                  </div>
                )}
                <DialogFooter className="pt-4 border-t mt-4">
                  {isViewMode ? (
                     <Button type="button" variant="outline" onClick={resetModalState}>Fermer</Button>
                  ) : (
                    <>
                      <Button type="button" variant="outline" onClick={resetModalState}>Annuler</Button>
                      <Button type="submit" disabled={!isBalanced}>Enregistrer</Button>
                    </>
                  )}
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
    </>
  );
}
