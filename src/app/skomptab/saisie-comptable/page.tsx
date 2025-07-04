
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
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, FileText, PlusCircle, Scale, List, Calendar as CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// --- TYPES & MOCK DATA ---

type LigneEcriture = {
  id: string;
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  tiers: string;
};

type EcritureComptable = {
  id: number;
  dateSaisie: string;
  numeroCompta: string;
  journal: string;
  dateOperation: string;
  numeroPiece: string;
  libelleOperation: string;
  lignes: LigneEcriture[];
};

const initialEcritures: EcritureComptable[] = [
  {
    id: 1,
    dateSaisie: '2024-07-20',
    numeroCompta: 'AC-202407-0001',
    journal: 'AC',
    dateOperation: '2024-07-19',
    numeroPiece: 'F2024-150',
    libelleOperation: 'Achat de matières premières - Fournisseur A',
    lignes: [
      { id: 'l1-1', compte: '601000', tiers: 'FOURN_A', libelle: 'Achat Mat. Prem.', debit: 1500, credit: 0 },
      { id: 'l1-2', compte: '445660', tiers: '', libelle: 'TVA déductible', debit: 300, credit: 0 },
      { id: 'l1-3', compte: '401000', tiers: 'FOURN_A', libelle: 'Dette Fournisseur A', debit: 0, credit: 1800 },
    ],
  },
  {
    id: 2,
    dateSaisie: '2024-07-21',
    numeroCompta: 'VE-202407-0003',
    journal: 'VE',
    dateOperation: '2024-07-20',
    numeroPiece: 'FACT-088',
    libelleOperation: 'Vente de services - Client B',
    lignes: [
      { id: 'l2-1', compte: '411000', tiers: 'CLIENT_B', libelle: 'Créance Client B', debit: 2400, credit: 0 },
      { id: 'l2-2', compte: '706000', tiers: '', libelle: 'Prestation de service', debit: 0, credit: 2000 },
      { id: 'l2-3', compte: '445710', tiers: '', libelle: 'TVA collectée', debit: 0, credit: 400 },
    ],
  },
];

const defaultEcritureData: Omit<EcritureComptable, 'id' | 'numeroCompta'> = {
    dateSaisie: new Date().toISOString().split('T')[0],
    journal: '',
    dateOperation: new Date().toISOString().split('T')[0],
    numeroPiece: '',
    libelleOperation: '',
    lignes: [
        { id: `line-${Date.now()}-1`, compte: '', tiers: '', libelle: '', debit: 0, credit: 0 },
        { id: `line-${Date.now()}-2`, compte: '', tiers: '', libelle: '', debit: 0, credit: 0 },
    ]
}

const ITEMS_PER_PAGE = 10;

export default function SaisieComptablePage() {
  const [ecritures, setEcritures] = useState<EcritureComptable[]>(initialEcritures);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingEcriture, setEditingEcriture] = useState<EcritureComptable | null>(null);
  const [ecritureToDelete, setEcritureToDelete] = useState<EcritureComptable | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState(defaultEcritureData);
  const { toast } = useToast();

  const totalPages = Math.ceil(ecritures.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEcritures = ecritures.slice(startIndex, endIndex);

  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    if (!formData) return { totalDebit: 0, totalCredit: 0, isBalanced: true };
    const totalDebit = formData.lignes.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
    const totalCredit = formData.lignes.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;
    return { totalDebit, totalCredit, isBalanced };
  }, [formData]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleDelete = () => {
    if (ecritureToDelete) {
        setEcritures(ecritures.filter(e => e.id !== ecritureToDelete.id));
        setEcritureToDelete(null);
        toast({ title: "Écriture supprimée", description: "L'écriture a été retirée du journal." });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEcriture(null);
    setIsViewMode(false);
  }

  const handleOpenCreateModal = () => {
    setEditingEcriture(null);
    setFormData(defaultEcritureData);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleOpenModal = (ecriture: EcritureComptable, viewMode: boolean) => {
    setEditingEcriture(ecriture);
    setFormData(JSON.parse(JSON.stringify(ecriture))); // Deep copy
    setIsViewMode(viewMode);
    setIsModalOpen(true);
  }

  const handleFormChange = (field: keyof Omit<EcritureComptable, 'id' | 'lignes' | 'numeroCompta'>, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleLigneChange = (id: string, field: keyof Omit<LigneEcriture, 'id'>, value: string | number) => {
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
        toast({ title: "Déséquilibre", description: "L'écriture doit être équilibrée avant de pouvoir être enregistrée.", variant: "destructive" });
        return;
    }

    if(editingEcriture) {
        const updatedEcriture = {...formData, id: editingEcriture.id, numeroCompta: editingEcriture.numeroCompta };
        setEcritures(ecritures.map(e => e.id === editingEcriture.id ? updatedEcriture : e));
        toast({ title: "Écriture modifiée avec succès." });
    } else {
        const newEcriture: EcritureComptable = {
            id: Date.now(),
            numeroCompta: `${formData.journal}-${format(new Date(), 'yyyyMM')}-${Math.floor(Math.random() * 999) + 1}`,
            ...formData,
        };
        setEcritures(prev => [newEcriture, ...prev]);
        toast({ title: "Écriture enregistrée avec succès." });
    }
    closeModal();
  }


  return (
    <>
      <Card>
        <CardHeader>
           <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Saisie Comptable</CardTitle>
              <CardDescription>
                Enregistrez, consultez et gérez vos écritures comptables.
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
                <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Utiliser un modèle
                </Button>
                <Button onClick={handleOpenCreateModal}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Enregistrer une écriture
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Date de saisie</TableHead>
                <TableHead>N° Compta</TableHead>
                <TableHead>Journal</TableHead>
                <TableHead>Date de l'opération</TableHead>
                <TableHead>N° Pièce</TableHead>
                <TableHead className="w-[180px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEcritures.map((ecriture, index) => (
                <TableRow key={ecriture.id} className="odd:bg-muted/50">
                  <TableCell className="text-muted-foreground text-center">{startIndex + index + 1}</TableCell>
                  <TableCell>{new Date(ecriture.dateSaisie).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="font-mono">{ecriture.numeroCompta}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ecriture.journal}</Badge>
                  </TableCell>
                  <TableCell>{new Date(ecriture.dateOperation).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{ecriture.numeroPiece}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(ecriture, true)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(ecriture, false)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setEcritureToDelete(ecriture)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {ecritures.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucune écriture comptable enregistrée.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total de {ecritures.length} écritures comptables.
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-6xl">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <PlusCircle/>
                        {isViewMode ? 'Détails de l\'écriture' : editingEcriture ? 'Modifier une écriture comptable' : 'Saisie d\'une écriture comptable'}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                    {/* General Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Date de saisie</Label>
                            <Input value={format(new Date(formData.dateSaisie), 'dd/MM/yyyy')} disabled/>
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
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="numeroPiece">N° Pièce *</Label>
                        <Input id="numeroPiece" value={formData.numeroPiece} onChange={(e) => handleFormChange('numeroPiece', e.target.value)} disabled={isViewMode}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="libelleOperation">Libellé de l'opération *</Label>
                        <Input id="libelleOperation" value={formData.libelleOperation} onChange={(e) => handleFormChange('libelleOperation', e.target.value)} disabled={isViewMode}/>
                    </div>

                    <Separator/>

                    {/* Entry Lines */}
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
                                        <TableCell><Input type="number" placeholder="0.00" value={ligne.debit || ''} onChange={(e) => handleLigneChange(ligne.id, 'debit', e.target.value)} disabled={isViewMode} className="text-center"/></TableCell>
                                        <TableCell><Input type="number" placeholder="0.00" value={ligne.credit || ''} onChange={(e) => handleLigneChange(ligne.id, 'credit', e.target.value)} disabled={isViewMode} className="text-center"/></TableCell>
                                        <TableCell className="text-center">
                                            {!isViewMode && <Button type="button" variant="ghost" size="icon" onClick={() => removeLigne(ligne.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                                        </TableCell>
                                    </TableRow>
                                 ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-between items-start">
                            <Button type="button" variant="default" onClick={addLigne} disabled={isViewMode}><PlusCircle className="mr-2 h-4 w-4"/>Ajouter une ligne</Button>
                            <div className="w-full max-w-sm space-y-2 text-sm">
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
                 <DialogFooter className="pt-4 border-t mt-4 gap-2">
                    {!isViewMode && <Button type="button" variant="outline" className="mr-auto"><Scale className="mr-2 h-4 w-4"/>Équilibrer l'écriture</Button>}
                    <Button type="button" variant="outline" onClick={closeModal}>
                        {isViewMode ? 'Fermer' : 'Annuler'}
                    </Button>
                    {!isViewMode && <Button type="submit" disabled={!isBalanced}>Enregistrer</Button>}
                 </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={!!ecritureToDelete} onOpenChange={() => setEcritureToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette écriture ?</AlertDialogTitle>
                <AlertDialogDescription>Cette action est irréversible et supprimera définitivement l'écriture comptable.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
