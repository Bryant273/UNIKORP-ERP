
'use client';

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, PlusCircle, List } from 'lucide-react';

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
  {
    id: 3,
    libelle: 'Paiement des salaires',
    description: 'Enregistrement du paiement des salaires nets.',
    ecritures: [
        { id: 'e7', numeroCompte: '421000', tiers: '', libelle: 'Personnel - Rémunérations dues', debit: 'SALAIRE_NET', credit: '' },
        { id: 'e8', numeroCompte: '512000', tiers: '', libelle: 'Banque', debit: '', credit: 'SALAIRE_NET' },
    ],
  },
];

const defaultFormData: Omit<ModeleSaisie, 'id'> = {
  libelle: '',
  description: '',
  ecritures: [],
};

const ITEMS_PER_PAGE = 10;

export default function ModeleSaisiePage() {
  const [modeles, setModeles] = useState<ModeleSaisie[]>(initialModeles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModele, setEditingModele] = useState<ModeleSaisie | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [modeleToDelete, setModeleToDelete] = useState<ModeleSaisie | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(modeles.length / ITEMS_PER_PAGE);
  const paginatedModeles = modeles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  const handleOpenCreateModal = () => {
    setIsViewMode(false);
    setEditingModele(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (modele: ModeleSaisie) => {
    setIsViewMode(false);
    setEditingModele(modele);
    setFormData({
      libelle: modele.libelle,
      description: modele.description,
      ecritures: JSON.parse(JSON.stringify(modele.ecritures)),
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (modele: ModeleSaisie) => {
    setIsViewMode(true);
    setEditingModele(modele);
    setFormData({
      libelle: modele.libelle,
      description: modele.description,
      ecritures: JSON.parse(JSON.stringify(modele.ecritures)),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingModele(null);
    setIsViewMode(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleEcritureChange = (id: string, field: keyof Omit<EcritureModele, 'id'>, value: string) => {
    const newEcritures = [...formData.ecritures];
    const index = newEcritures.findIndex(e => e.id === id);
    if (index === -1) return;
    
    const ecriture = { ...newEcritures[index], [field]: value };

    if (field === 'debit' && value) {
        ecriture.credit = '';
    } else if (field === 'credit' && value) {
        ecriture.debit = '';
    }

    newEcritures[index] = ecriture;
    setFormData(prev => ({ ...prev, ecritures: newEcritures }));
  };

  const addEcritureRow = () => {
    setFormData(prev => ({
      ...prev,
      ecritures: [
        ...prev.ecritures,
        { id: `new-${Date.now()}`, numeroCompte: '', tiers: '', libelle: '', debit: '', credit: '' },
      ],
    }));
  };

  const removeEcritureRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ecritures: prev.ecritures.filter(e => e.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModele) {
      setModeles(
        modeles.map((m) =>
          m.id === editingModele.id ? { ...editingModele, ...formData } : m
        )
      );
    } else {
      const newModele: ModeleSaisie = {
        id: Date.now(),
        ...formData,
      };
      setModeles([...modeles, newModele]);
    }
    handleCloseModal();
  };

  const handleDeleteModele = () => {
    if (modeleToDelete) {
      setModeles(modeles.filter((m) => m.id !== modeleToDelete.id));
      setModeleToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Modèles de saisie</CardTitle>
              <CardDescription>
                Créez et gérez vos modèles pour accélérer la saisie comptable.
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau modèle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Libellé</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="w-[180px] text-center font-semibold">Nb. Écritures</TableHead>
                <TableHead className="w-[150px] text-center font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedModeles.map((modele) => (
                <TableRow key={modele.id} className="odd:bg-muted/50">
                  <TableCell className="font-medium">{modele.libelle}</TableCell>
                  <TableCell className="text-muted-foreground">{modele.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{modele.ecritures.length} lignes</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenViewModal(modele)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(modele)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setModeleToDelete(modele)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {modeles.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Aucun modèle de saisie pour le moment.</p>
              <Button variant="link" onClick={handleOpenCreateModal}>Créer votre premier modèle</Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total de {modeles.length} modèles. Page {currentPage} sur {totalPages}.
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

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-6xl" onInteractOutside={(e) => { if (!isViewMode) e.preventDefault()}} onEscapeKeyDown={(e) => { if (!isViewMode) e.preventDefault()}}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isViewMode ? 'Détails du modèle' : editingModele ? 'Modifier le modèle' : 'Nouveau modèle de saisie'}
              </DialogTitle>
              <DialogDescription>
                {isViewMode ? 'Consultez les détails de ce modèle.' : 'Définissez les informations et les écritures de votre modèle.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="space-y-2">
                <Label htmlFor="libelle">Libellé du modèle</Label>
                <Input id="libelle" value={formData.libelle} onChange={handleInputChange} required disabled={isViewMode} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleInputChange} disabled={isViewMode}/>
              </div>
              <div className="space-y-4">
                <Label className="flex items-center gap-2"><List className="h-4 w-4"/>Lignes d'écriture</Label>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-center font-semibold">N°</TableHead>
                        <TableHead className="font-semibold">Compte général</TableHead>
                        <TableHead className="font-semibold">Tiers</TableHead>
                        <TableHead className="font-semibold">Libellé</TableHead>
                        <TableHead className="w-[150px] font-semibold">Débit</TableHead>
                        <TableHead className="w-[150px] font-semibold">Crédit</TableHead>
                        <TableHead className="w-[50px] text-center font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.ecritures.map((ecriture, index) => (
                        <TableRow key={ecriture.id} className="odd:bg-muted/50">
                          <TableCell className="text-muted-foreground text-center">{index + 1}</TableCell>
                          <TableCell>
                            <Input placeholder="Ex: 607000" value={ecriture.numeroCompte} onChange={(e) => handleEcritureChange(ecriture.id, 'numeroCompte', e.target.value)} disabled={isViewMode} />
                          </TableCell>
                          <TableCell>
                            <Input placeholder="Ex: FOURNISSEUR" value={ecriture.tiers} onChange={(e) => handleEcritureChange(ecriture.id, 'tiers', e.target.value)} disabled={isViewMode} />
                          </TableCell>
                          <TableCell>
                            <Input placeholder="Ex: Achats de marchandises" value={ecriture.libelle} onChange={(e) => handleEcritureChange(ecriture.id, 'libelle', e.target.value)} disabled={isViewMode} />
                          </TableCell>
                          <TableCell>
                            <Input placeholder="Ex: MONTANT_HT" value={ecriture.debit} onChange={(e) => handleEcritureChange(ecriture.id, 'debit', e.target.value)} disabled={isViewMode} />
                          </TableCell>
                          <TableCell>
                            <Input placeholder="Ex: MONTANT_TTC" value={ecriture.credit} onChange={(e) => handleEcritureChange(ecriture.id, 'credit', e.target.value)} disabled={isViewMode} />
                          </TableCell>
                          <TableCell className="text-center">
                            {!isViewMode && (
                              <Button variant="ghost" size="icon" type="button" onClick={() => removeEcritureRow(ecriture.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                 {!isViewMode && (
                  <div className="flex justify-start">
                    <Button type="button" variant="outline" size="sm" onClick={addEcritureRow}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter une ligne
                    </Button>
                  </div>
                 )}
              </div>
            </div>
            <DialogFooter className="pt-4 border-t mt-4">
              {isViewMode ? (
                 <Button type="button" variant="outline" onClick={handleCloseModal}>Fermer</Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={handleCloseModal}>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!modeleToDelete} onOpenChange={(open) => !open && setModeleToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le modèle sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setModeleToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteModele} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
