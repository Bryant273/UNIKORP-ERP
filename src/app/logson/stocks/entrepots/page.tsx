
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, PlusCircle, Warehouse, MapPin } from 'lucide-react';
import { useAtom } from 'jotai';
import { entrepotsAtom } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

type Entrepot = {
    id: number;
    nom: string;
    localisation: string;
    capacite: number; // en m³
    tauxRemplissage: number; // en %
};

const defaultFormData: Omit<Entrepot, 'id' | 'tauxRemplissage'> = {
  nom: '',
  localisation: '',
  capacite: 0,
};

const ITEMS_PER_PAGE = 10;

export default function EntrepotsPage() {
  const [entrepots, setEntrepots] = useAtom(entrepotsAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntrepot, setEditingEntrepot] = useState<Entrepot | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [entrepotToDelete, setEntrepotToDelete] = useState<Entrepot | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();

  const totalPages = Math.ceil(entrepots.length / ITEMS_PER_PAGE);
  const paginatedEntrepots = entrepots.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: id === 'capacite' ? parseFloat(value) : value }));
  };
  
  const handleOpenCreateModal = () => {
    setEditingEntrepot(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (entrepot: Entrepot) => {
    setEditingEntrepot(entrepot);
    setFormData({
      nom: entrepot.nom,
      localisation: entrepot.localisation,
      capacite: entrepot.capacite,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntrepot(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntrepot) {
      setEntrepots(
        entrepots.map((eItem) =>
          eItem.id === editingEntrepot.id ? { ...editingEntrepot, ...formData } : eItem
        )
      );
      toast({ title: "Entrepôt modifié."});
    } else {
      const newEntrepot: Entrepot = {
        id: Date.now(),
        tauxRemplissage: 0, // Initial fill rate is 0
        ...formData,
      };
      setEntrepots([...entrepots, newEntrepot]);
      toast({ title: "Entrepôt créé."});
    }
    handleCloseModal();
  };

  const handleDeleteEntrepot = () => {
    if (entrepotToDelete) {
      setEntrepots(entrepots.filter((eItem) => eItem.id !== entrepotToDelete.id));
      setEntrepotToDelete(null);
      toast({ title: "Entrepôt supprimé."});
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
              <CardTitle className="text-2xl">Entrepôts</CardTitle>
              <CardDescription>Gérez vos entrepôts et emplacements de stockage.</CardDescription>
            </div>
            <Button onClick={handleOpenCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvel entrepôt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead className="text-right">Capacité</TableHead>
                  <TableHead className="w-[250px]">Taux de Remplissage</TableHead>
                  <TableHead className="w-[100px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntrepots.map((entrepot) => (
                  <TableRow key={entrepot.id} className="odd:bg-muted/50">
                    <TableCell className="font-medium">{entrepot.nom}</TableCell>
                    <TableCell className="text-muted-foreground">{entrepot.localisation}</TableCell>
                    <TableCell className="text-right">{entrepot.capacite.toLocaleString('fr-FR')} m³</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                             <Progress value={entrepot.tauxRemplissage} className="w-[80%]"/>
                             <span className="text-xs font-semibold">{entrepot.tauxRemplissage}%</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(entrepot)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEntrepotToDelete(entrepot)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {entrepots.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                 <p className="text-muted-foreground">Aucun entrepôt n'a été créé.</p>
                </div>
              )}
        </CardContent>
         {entrepots.length > 0 &&
            <CardFooter className="flex items-center justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Total de {entrepots.length} entrepôts. Page {currentPage} sur {totalPages}.
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
            }
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingEntrepot ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}</DialogTitle>
              <DialogDescription>
                {editingEntrepot ? 'Mettez à jour les informations de l\'entrepôt.' : 'Remplissez les informations ci-dessous.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de l'entrepôt</Label>
                <Input id="nom" value={formData.nom} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localisation">Localisation</Label>
                <Input id="localisation" value={formData.localisation} onChange={handleInputChange} required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="capacite">Capacité totale (m³)</Label>
                <Input id="capacite" type="number" value={formData.capacite || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!entrepotToDelete} onOpenChange={(open) => !open && setEntrepotToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. L'entrepôt sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEntrepotToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEntrepot} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
