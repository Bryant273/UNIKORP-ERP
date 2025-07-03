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
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, PlusCircle } from 'lucide-react';

type DeclarationType = 'TVA' | 'IS' | 'Liasses Fiscales' | 'Autre';

type ModeleDeclaration = {
  id: number;
  libelle: string;
  description: string;
  type: DeclarationType;
};

const initialModeles: ModeleDeclaration[] = [
  {
    id: 1,
    libelle: 'Déclaration de TVA (CA3)',
    description: 'Modèle mensuel pour la déclaration de la Taxe sur la Valeur Ajoutée.',
    type: 'TVA',
  },
  {
    id: 2,
    libelle: 'Liasse Fiscale (2050)',
    description: 'Ensemble des documents fiscaux pour le bilan annuel.',
    type: 'Liasses Fiscales',
  },
  {
    id: 3,
    libelle: 'Acompte Impôt sur les Sociétés',
    description: 'Modèle pour le calcul et la déclaration des acomptes IS trimestriels.',
    type: 'IS',
  },
];

const defaultFormData: Omit<ModeleDeclaration, 'id'> = {
  libelle: '',
  description: '',
  type: 'Autre',
};

export default function ModeleDeclarationPage() {
  const [modeles, setModeles] = useState<ModeleDeclaration[]>(initialModeles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModele, setEditingModele] = useState<ModeleDeclaration | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [modeleToDelete, setModeleToDelete] = useState<ModeleDeclaration | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const handleOpenCreateModal = () => {
    setIsViewMode(false);
    setEditingModele(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (modele: ModeleDeclaration) => {
    setIsViewMode(false);
    setEditingModele(modele);
    setFormData({
      libelle: modele.libelle,
      description: modele.description,
      type: modele.type,
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (modele: ModeleDeclaration) => {
    setIsViewMode(true);
    setEditingModele(modele);
    setFormData({
      libelle: modele.libelle,
      description: modele.description,
      type: modele.type,
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

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as DeclarationType }));
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
      const newModele: ModeleDeclaration = {
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
              <CardTitle className="text-2xl">Modèles de déclaration</CardTitle>
              <CardDescription>
                Créez et gérez vos modèles pour les déclarations fiscales et sociales.
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
                <TableHead>Libellé</TableHead>
                <TableHead className="w-[180px]">Type de déclaration</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modeles.map((modele) => (
                <TableRow key={modele.id}>
                  <TableCell className="font-medium">{modele.libelle}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{modele.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{modele.description}</TableCell>
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
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-xl" onInteractOutside={(e) => { if (!isViewMode) e.preventDefault()}} onEscapeKeyDown={(e) => { if (!isViewMode) e.preventDefault()}}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isViewMode ? 'Détails du modèle' : editingModele ? 'Modifier le modèle' : 'Nouveau modèle de déclaration'}
              </DialogTitle>
              <DialogDescription>
                {isViewMode ? 'Consultez les détails de ce modèle.' : 'Définissez les informations de base de votre modèle.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="libelle">Libellé du modèle</Label>
                  <Input id="libelle" value={formData.libelle} onChange={handleInputChange} required disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type de déclaration</Label>
                   <Select value={formData.type} onValueChange={handleSelectChange} disabled={isViewMode}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TVA">TVA</SelectItem>
                      <SelectItem value="IS">IS (Impôt sur les Sociétés)</SelectItem>
                      <SelectItem value="Liasses Fiscales">Liasses Fiscales</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleInputChange} disabled={isViewMode}/>
              </div>
              <div className="space-y-2">
                <Label>Contenu du modèle</Label>
                <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50">
                    <p>L'éditeur de contenu pour les modèles de déclaration sera implémenté ici.<br/>Vous pourrez y ajouter des champs, des calculs et définir la structure.</p>
                </div>
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
