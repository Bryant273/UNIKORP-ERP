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
import { Badge } from '@/components/ui/badge';
import { PlusCircle, FileText, Pencil, Trash2, Eye, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


// --- DATA TYPES & MOCK DATA ---

// Copied from modele-saisie/page.tsx for demonstration
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
      { id: 'e1', numeroCompte: '607000', tiers: '', libelle: 'Achats de marchandises', debit: '', credit: '' },
      { id: 'e2', numeroCompte: '445660', tiers: '', libelle: 'TVA déductible', debit: '', credit: '' },
      { id: 'e3', numeroCompte: '401000', tiers: 'FOURNISSEUR', libelle: 'Dette fournisseur', debit: '', credit: '' },
    ],
  },
  {
    id: 2,
    libelle: 'Vente de services',
    description: 'Modèle pour une vente de prestation de services avec TVA.',
    ecritures: [
        { id: 'e4', numeroCompte: '411000', tiers: 'CLIENT', libelle: 'Créance client', debit: '', credit: '' },
        { id: 'e5', numeroCompte: '706000', tiers: '', libelle: 'Prestations de services', debit: '', credit: '' },
        { id: 'e6', numeroCompte: '445710', tiers: '', libelle: 'TVA collectée', debit: '', credit: '' },
    ],
  },
  {
    id: 3,
    libelle: 'Paiement des salaires',
    description: 'Enregistrement du paiement des salaires nets.',
    ecritures: [
        { id: 'e7', numeroCompte: '421000', tiers: '', libelle: 'Personnel - Rémunérations dues', debit: '', credit: '' },
        { id: 'e8', numeroCompte: '512000', tiers: '', libelle: 'Banque', debit: '', credit: '' },
    ],
  },
];
// End of copied data

const MOCK_JOURNALS = [
    { code: 'AC', intitule: 'Journal des achats' },
    { code: 'VE', intitule: 'Journal des ventes' },
    { code: 'BNP', intitule: 'Journal de banque BNP' },
    { code: 'OD', intitule: 'Opérations diverses' },
];

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
    id: 1, dateSaisie: '2024-07-20', numeroCompta: 'AC-202407-0001', journal: 'AC', dateOperation: '2024-07-19', numeroPiece: 'F2024-150', libelleOperation: 'Achat marchandises Fournisseur Omega',
    lignes: [
      { id: 'l1', compte: '607000', libelle: 'Achats', debit: 1200, credit: 0, tiers: '' },
      { id: 'l2', compte: '445660', libelle: 'TVA déductible', debit: 240, credit: 0, tiers: '' },
      { id: 'l3', compte: '401000', libelle: 'Fournisseur Omega', debit: 0, credit: 1440, tiers: 'F_OMEGA' },
    ]
  },
  {
    id: 2, dateSaisie: '2024-07-21', numeroCompta: 'VE-202407-0003', journal: 'VE', dateOperation: '2024-07-20', numeroPiece: 'FACT-088', libelleOperation: 'Vente de services Client Alpha',
    lignes: []
  },
  {
    id: 3, dateSaisie: '2024-07-22', numeroCompta: 'BNP-202407-0012', journal: 'BNP', dateOperation: '2024-07-22', numeroPiece: 'VIR-56', libelleOperation: 'Paiement facture F2024-145',
    lignes: []
  },
  { id: 4, dateSaisie: '2024-07-23', numeroCompta: 'AC-202407-0002', journal: 'AC', dateOperation: '2024-07-22', numeroPiece: 'F2024-155', libelleOperation: 'Achat fournitures', lignes: [] },
  { id: 5, dateSaisie: '2024-07-24', numeroCompta: 'VE-202407-0004', journal: 'VE', dateOperation: '2024-07-23', numeroPiece: 'FACT-089', libelleOperation: 'Vente marchandises Client Beta', lignes: [] },
];

const defaultEcritureData: Omit<EcritureComptable, 'id' | 'numeroCompta'> = {
  dateSaisie: new Date().toISOString().split('T')[0],
  journal: '',
  dateOperation: new Date().toISOString().split('T')[0],
  numeroPiece: '',
  libelleOperation: '',
  lignes: [],
};

const ITEMS_PER_PAGE = 10;

export default function SaisieComptablePage() {
  const [ecritures, setEcritures] = useState<EcritureComptable[]>(initialEcritures);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Omit<EcritureComptable, 'id' | 'numeroCompta'>>(defaultEcritureData);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [ecritureToDelete, setEcritureToDelete] = useState<EcritureComptable | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const totalPages = Math.ceil(ecritures.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEcritures = ecritures.slice(startIndex, endIndex);

  const { totalDebit, totalCredit, solde } = useMemo(() => {
    const totalDebit = formData.lignes.reduce((acc, curr) => acc + (Number(curr.debit) || 0), 0);
    const totalCredit = formData.lignes.reduce((acc, curr) => acc + (Number(curr.credit) || 0), 0);
    const solde = totalDebit - totalCredit;
    return { totalDebit, totalCredit, solde };
  }, [formData.lignes]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...defaultEcritureData,
      dateSaisie: new Date().toISOString().split('T')[0],
      dateOperation: new Date().toISOString().split('T')[0],
      lignes: [],
    });
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (ecriture: EcritureComptable) => {
    setEditingId(ecriture.id);
    setFormData({
      dateSaisie: ecriture.dateSaisie,
      journal: ecriture.journal,
      dateOperation: ecriture.dateOperation,
      numeroPiece: ecriture.numeroPiece,
      libelleOperation: ecriture.libelleOperation,
      lignes: JSON.parse(JSON.stringify(ecriture.lignes)),
    });
    setIsModalOpen(true);
  };

  const handleSelectTemplate = (template: ModeleSaisie) => {
    setEditingId(null);
    const newLignes: LigneEcriture[] = template.ecritures.map(e => ({
      id: `new-${Date.now()}-${Math.random()}`,
      compte: e.numeroCompte,
      libelle: e.libelle,
      tiers: e.tiers,
      debit: 0,
      credit: 0
    }));
    setFormData({
      ...defaultEcritureData,
      libelleOperation: template.libelle,
      lignes: newLignes
    });
    setIsTemplateModalOpen(false);
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleLigneChange = (id: string, field: keyof LigneEcriture, value: string | number) => {
    const newLignes = formData.lignes.map(ligne => {
      if (ligne.id === id) {
        const updatedLigne = { ...ligne, [field]: value };
        if (field === 'debit' && Number(value) > 0) updatedLigne.credit = 0;
        if (field === 'credit' && Number(value) > 0) updatedLigne.debit = 0;
        return updatedLigne;
      }
      return ligne;
    });
    setFormData(prev => ({ ...prev, lignes: newLignes }));
  };
  
  const addLigne = () => {
    const newLigne: LigneEcriture = {
      id: `new-${Date.now()}`,
      compte: '',
      libelle: '',
      tiers: '',
      debit: 0,
      credit: 0
    };
    setFormData(prev => ({ ...prev, lignes: [...prev.lignes, newLigne] }));
  };

  const removeLigne = (id: string) => {
    setFormData(prev => ({ ...prev, lignes: prev.lignes.filter(l => l.id !== id) }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Math.abs(solde) > 0.001) {
      toast({ title: "Déséquilibre", description: "L'écriture n'est pas équilibrée.", variant: "destructive" });
      return;
    }
    
    if (editingId) {
      const updatedEcriture = { id: editingId, numeroCompta: ecritures.find(e => e.id === editingId)!.numeroCompta, ...formData };
      setEcritures(ecritures.map(e => e.id === editingId ? updatedEcriture : e));
      toast({ title: 'Écriture mise à jour', description: 'Modification enregistrée avec succès.' });
    } else {
      const newId = Math.max(...ecritures.map(e => e.id), 0) + 1;
      const numeroCompta = `${formData.journal.toUpperCase() || 'GEN'}-${formData.dateOperation.slice(0,7).replace('-', '')}-${String(newId).padStart(4, '0')}`;
      const newEcriture: EcritureComptable = { id: newId, numeroCompta, ...formData };
      setEcritures([...ecritures, newEcriture]);
      toast({ title: 'Écriture enregistrée', description: 'Nouvelle écriture ajoutée avec succès.' });
    }

    setIsModalOpen(false);
    setEditingId(null);
  };
  
  const handleDeleteEcriture = () => {
    if (ecritureToDelete) {
      setEcritures(ecritures.filter((e) => e.id !== ecritureToDelete.id));
      setEcritureToDelete(null);
       if (currentEcritures.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      toast({ title: 'Écriture supprimée', description: 'L\'écriture comptable a été supprimée avec succès.' });
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

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
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsTemplateModalOpen(true)}>
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
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Date de saisie</TableHead>
                <TableHead>N° Compta</TableHead>
                <TableHead>Journal</TableHead>
                <TableHead>Date de l'opération</TableHead>
                <TableHead>N° Pièce</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEcritures.map((ecriture, index) => (
                <TableRow key={ecriture.id} className="odd:bg-muted/50">
                  <TableCell className="text-muted-foreground">{startIndex + index + 1}</TableCell>
                  <TableCell>{new Date(ecriture.dateSaisie).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="font-mono">{ecriture.numeroCompta}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ecriture.journal}</Badge>
                  </TableCell>
                  <TableCell>{new Date(ecriture.dateOperation).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{ecriture.numeroPiece}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(ecriture)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir / Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(ecriture)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEcritureToDelete(ecriture)} className="text-destructive hover:text-destructive">
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
                Aucune écriture comptable pour le moment.
             </div>
           )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total de <span className="font-bold">{ecritures.length}</span> écritures comptables.
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Modifier l'écriture" : 'Nouvelle écriture comptable'}</DialogTitle>
              <DialogDescription>
                Remplissez les détails de l'écriture ci-dessous.
              </DialogDescription>
            </DialogHeader>
             <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="dateSaisie">Date de saisie</Label>
                      <Input id="dateSaisie" type="date" value={formData.dateSaisie} disabled />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="journal">Journal *</Label>
                      <Select 
                        onValueChange={(value) => setFormData(prev => ({...prev, journal: value}))} 
                        value={formData.journal}
                        required
                      >
                          <SelectTrigger id="journal">
                              <SelectValue placeholder="Sélectionnez un journal" />
                          </SelectTrigger>
                          <SelectContent>
                              {MOCK_JOURNALS.map(j => (
                                  <SelectItem key={j.code} value={j.code}>{`${j.code} - ${j.intitule}`}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="dateOperation">Date de l'opération *</Label>
                      <Input id="dateOperation" type="date" value={formData.dateOperation} onChange={handleFormChange} required/>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="numeroPiece">N° Pièce *</Label>
                        <Input id="numeroPiece" value={formData.numeroPiece} onChange={handleFormChange} required/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="libelleOperation">Libellé de l'opération *</Label>
                        <Input id="libelleOperation" value={formData.libelleOperation} onChange={handleFormChange} required/>
                    </div>
                </div>

                <div className="space-y-4">
                  <Label className="flex items-center gap-2"><List className="h-4 w-4"/>Lignes d'écriture</Label>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">COMPTE</TableHead>
                          <TableHead className="w-[120px]">TIERS</TableHead>
                          <TableHead>LIBELLÉ</TableHead>
                          <TableHead className="w-[150px]">DÉBIT</TableHead>
                          <TableHead className="w-[150px]">CRÉDIT</TableHead>
                          <TableHead className="w-[50px]">ACTION</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.lignes.map((ligne) => (
                          <TableRow key={ligne.id}>
                            <TableCell><Input placeholder="Compte" value={ligne.compte} onChange={(e) => handleLigneChange(ligne.id, 'compte', e.target.value)}/></TableCell>
                            <TableCell><Input placeholder="Tiers" value={ligne.tiers} onChange={(e) => handleLigneChange(ligne.id, 'tiers', e.target.value)}/></TableCell>
                            <TableCell><Input placeholder="Libellé" value={ligne.libelle} onChange={(e) => handleLigneChange(ligne.id, 'libelle', e.target.value)}/></TableCell>
                            <TableCell><Input type="number" placeholder="0.00" value={ligne.debit} onChange={(e) => handleLigneChange(ligne.id, 'debit', Number(e.target.value))}/></TableCell>
                            <TableCell><Input type="number" placeholder="0.00" value={ligne.credit} onChange={(e) => handleLigneChange(ligne.id, 'credit', Number(e.target.value))}/></TableCell>
                            <TableCell><Button variant="ghost" size="icon" type="button" onClick={() => removeLigne(ligne.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-between items-start pt-2">
                    <Button type="button" variant="default" size="sm" onClick={addLigne}><PlusCircle className="mr-2 h-4 w-4" />Ajouter une ligne</Button>
                    <div className="w-full max-w-sm space-y-2 text-sm p-4 border rounded-lg bg-muted/50">
                        <div className="flex justify-between"><span>Total Débit:</span><span className="font-mono font-semibold">{totalDebit.toFixed(2)} FCFA</span></div>
                        <div className="flex justify-between"><span>Total Crédit:</span><span className="font-mono font-semibold">{totalCredit.toFixed(2)} FCFA</span></div>
                        <Separator/>
                        <div className={`flex justify-between font-bold ${solde !== 0 ? 'text-destructive' : 'text-green-600'}`}>
                           <span>Solde:</span>
                           <span className="font-mono">{solde.toFixed(2)} FCFA</span>
                        </div>
                    </div>
                  </div>
                </div>
            </div>
            <DialogFooter className="pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>Utiliser un modèle de saisie</DialogTitle>
              <DialogDescription>
                Sélectionnez un modèle pour pré-remplir l'écriture.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {initialModeles.map(template => (
                  <Card key={template.id} className="hover:bg-accent transition-colors">
                    <CardHeader className="flex flex-row justify-between items-center p-4">
                        <div>
                           <CardTitle className="text-base">{template.libelle}</CardTitle>
                           <CardDescription>{template.description}</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                           Sélectionner
                        </Button>
                    </CardHeader>
                  </Card>
                ))}
            </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!ecritureToDelete} onOpenChange={(open) => !open && setEcritureToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. L'écriture comptable sera définitivement supprimée.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEcritureToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEcriture} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
