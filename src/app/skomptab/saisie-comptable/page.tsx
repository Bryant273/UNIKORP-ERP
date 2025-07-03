'use client';

import { useState } from 'react';
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
import { PlusCircle, FileText, Pencil, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Data types
type LigneEcriture = {
  id: number;
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
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

// Mock Data
const initialEcritures: EcritureComptable[] = [
  {
    id: 1,
    dateSaisie: '2024-07-20',
    numeroCompta: 'AC-202407-0001',
    journal: 'AC 1',
    dateOperation: '2024-07-19',
    numeroPiece: 'F2024-150',
    libelleOperation: 'Achat marchandises Fournisseur Omega',
    lignes: [],
  },
  {
    id: 2,
    dateSaisie: '2024-07-21',
    numeroCompta: 'VE-202407-0003',
    journal: 'VE 1',
    dateOperation: '2024-07-20',
    numeroPiece: 'FACT-088',
    libelleOperation: 'Vente de services Client Alpha',
    lignes: [],
  },
  {
    id: 3,
    dateSaisie: '2024-07-22',
    numeroCompta: 'BNP-202407-0012',
    journal: 'BNP 01',
    dateOperation: '2024-07-22',
    numeroPiece: 'VIR-56',
    libelleOperation: 'Paiement facture F2024-145',
    lignes: [],
  },
  { id: 4, dateSaisie: '2024-07-23', numeroCompta: 'AC-202407-0002', journal: 'AC 1', dateOperation: '2024-07-22', numeroPiece: 'F2024-155', libelleOperation: 'Achat fournitures', lignes: [] },
  { id: 5, dateSaisie: '2024-07-24', numeroCompta: 'VE-202407-0004', journal: 'VE 1', dateOperation: '2024-07-23', numeroPiece: 'FACT-089', libelleOperation: 'Vente marchandises Client Beta', lignes: [] },
];

const ITEMS_PER_PAGE = 10;

export default function SaisieComptablePage() {
  const [ecritures, setEcritures] = useState<EcritureComptable[]>(initialEcritures);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingEcriture, setEditingEcriture] = useState<EcritureComptable | null>(null);
  const [ecritureToDelete, setEcritureToDelete] = useState<EcritureComptable | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const totalPages = Math.ceil(ecritures.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEcritures = ecritures.slice(startIndex, endIndex);

  const handleOpenCreateModal = () => {
    setEditingEcriture(null);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (ecriture: EcritureComptable) => {
    setEditingEcriture(ecriture);
    setIsModalOpen(true);
  };
  
  const handleOpenTemplateModal = () => {
    setIsTemplateModalOpen(true);
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
              <Button variant="outline" onClick={handleOpenTemplateModal}>
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
                <TableRow key={ecriture.id}>
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
                       <Button variant="ghost" size="icon" onClick={() => { /* View logic */ }}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
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

      {/* Placeholder Modal for new/edit entry */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingEcriture ? 'Modifier l\'écriture' : 'Nouvelle écriture comptable'}</DialogTitle>
              <DialogDescription>
                Remplissez les détails de l'écriture ci-dessous.
              </DialogDescription>
            </DialogHeader>
             <div className="py-4">
                <p>Le formulaire de saisie est en cours de construction.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Placeholder Modal for templates */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>Utiliser un modèle de saisie</DialogTitle>
              <DialogDescription>
                Sélectionnez un modèle pour pré-remplir l'écriture.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p>La liste des modèles est en cours de construction.</p>
            </div>
             <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTemplateModalOpen(false)}>Annuler</Button>
              <Button type="submit">Charger le modèle</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog for deletion */}
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
