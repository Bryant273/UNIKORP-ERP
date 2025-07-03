'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, PlusCircle } from 'lucide-react';

type EcritureModele = {
  id: string;
  numeroCompte: string;
  libelle: string;
  sens: 'Debit' | 'Credit';
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
      { id: 'e1', numeroCompte: '607000', libelle: 'Achats de marchandises', sens: 'Debit' },
      { id: 'e2', numeroCompte: '445660', libelle: 'TVA déductible', sens: 'Debit' },
      { id: 'e3', numeroCompte: '401000', libelle: 'Fournisseurs', sens: 'Credit' },
    ],
  },
  {
    id: 2,
    libelle: 'Vente de services',
    description: 'Modèle pour une vente de prestation de services avec TVA.',
    ecritures: [
        { id: 'e4', numeroCompte: '411000', libelle: 'Clients', sens: 'Debit' },
        { id: 'e5', numeroCompte: '706000', libelle: 'Prestations de services', sens: 'Credit' },
        { id: 'e6', numeroCompte: '445710', libelle: 'TVA collectée', sens: 'Credit' },
    ],
  },
  {
    id: 3,
    libelle: 'Paiement des salaires',
    description: 'Enregistrement du paiement des salaires nets.',
    ecritures: [
        { id: 'e7', numeroCompte: '421000', libelle: 'Personnel - Rémunérations dues', sens: 'Debit' },
        { id: 'e8', numeroCompte: '512000', libelle: 'Banque', sens: 'Credit' },
    ],
  },
];

const defaultFormData: Omit<ModeleSaisie, 'id'> = {
  libelle: '',
  description: '',
  ecritures: [],
};

export default function ModeleSaisiePage() {
  const [modeles, setModeles] = useState<ModeleSaisie[]>(initialModeles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModele, setEditingModele] = useState<ModeleSaisie | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [modeleToDelete, setModeleToDelete] = useState<ModeleSaisie | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

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
      ecritures: [...modele.ecritures],
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (modele: ModeleSaisie) => {
    setIsViewMode(true);
    setEditingModele(modele);
    setFormData({
      libelle: modele.libelle,
      description: modele.description,
      ecritures: [...modele.ecritures],
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

  const handleEcritureChange = (index: number, field: keyof Omit<EcritureModele, 'id'>, value: string) => {
    const updatedEcritures = [...formData.ecritures];
    updatedEcritures[index] = { ...updatedEcritures[index], [field]: value };
    setFormData(prev => ({ ...prev, ecritures: updatedEcritures }));
  };

  const addEcritureRow = () => {
    setFormData(prev => ({
      ...prev,
      ecritures: [
        ...prev.ecritures,
        { id: `new-${Date.now()}`, numeroCompte: '', libelle: '', sens: 'Debit' },
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
          {modeles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px]">Nb. Écritures</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modeles.map((modele) => (
                  <TableRow key={modele.id}>
                    <TableCell className="font-medium">{modele.libelle}</TableCell>
                    <TableCell className="text-muted-foreground">{modele.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{modele.ecritures.length} écritures</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Aucun modèle de saisie pour le moment.</p>
              <Button variant="link" onClick={handleOpenCreateModal}>Créer votre premier modèle</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl" onInteractOutside={(e) => { if (!isViewMode) e.preventDefault()}} onEscapeKeyDown={(e) => { if (!isViewMode) e.preventDefault()}}>
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
              <div className="space-y-2">
                <Label>Écritures comptables</Label>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">N° Compte</TableHead>
                        <TableHead>Libellé de l'écriture</TableHead>
                        <TableHead className="w-[120px]">Sens</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.ecritures.map((ecriture, index) => (
                        <TableRow key={ecriture.id}>
                          <TableCell>
                            <Input value={ecriture.numeroCompte} onChange={(e) => handleEcritureChange(index, 'numeroCompte', e.target.value)} disabled={isViewMode}/>
                          </TableCell>
                          <TableCell>
                            <Input value={ecriture.libelle} onChange={(e) => handleEcritureChange(index, 'libelle', e.target.value)} disabled={isViewMode}/>
                          </TableCell>
                          <TableCell>
                            <Select value={ecriture.sens} onValueChange={(value) => handleEcritureChange(index, 'sens', value)} disabled={isViewMode}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Debit">Débit</SelectItem>
                                <SelectItem value="Credit">Crédit</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
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
                  <Button type="button" variant="outline" size="sm" onClick={addEcritureRow}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une ligne
                  </Button>
                )}
              </div>
            </div>
            <DialogFooter className="pt-4">
              {isViewMode ? (
                 <Button type="button" onClick={handleCloseModal}>Fermer</Button>
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
