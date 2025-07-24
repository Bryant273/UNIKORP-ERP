
'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { Pencil, Trash2, PlusCircle, Download } from 'lucide-react';
import { useAtom } from 'jotai';
import { transporteursAtom, type Transporteur } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

const defaultFormData: Omit<Transporteur, 'id'> = {
  numero: '',
  intitule: '',
  telephone: '',
};

const ITEMS_PER_PAGE = 10;

export default function TransporteursPage() {
  const [transporteurs, setTransporteurs] = useAtom(transporteursAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransporteur, setEditingTransporteur] = useState<Transporteur | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [transporteurToDelete, setTransporteurToDelete] = useState<Transporteur | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();

  const totalPages = Math.ceil(transporteurs.length / ITEMS_PER_PAGE);
  const paginatedTransporteurs = transporteurs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleOpenCreateModal = () => {
    setEditingTransporteur(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (transporteur: Transporteur) => {
    setEditingTransporteur(transporteur);
    setFormData({
      numero: transporteur.numero,
      intitule: transporteur.intitule,
      telephone: transporteur.telephone,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransporteur(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransporteur) {
      setTransporteurs(
        transporteurs.map((t) =>
          t.id === editingTransporteur.id ? { ...editingTransporteur, ...formData } : t
        )
      );
      toast({ title: 'Transporteur modifié' });
    } else {
      const newTransporteur: Transporteur = {
        id: Date.now(),
        ...formData,
      };
      setTransporteurs([...transporteurs, newTransporteur]);
      toast({ title: 'Transporteur créé' });
    }
    handleCloseModal();
  };

  const handleDeleteTransporteur = () => {
    if (transporteurToDelete) {
      setTransporteurs(transporteurs.filter((t) => t.id !== transporteurToDelete.id));
      setTransporteurToDelete(null);
      toast({ title: 'Transporteur supprimé' });
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Liste des Transporteurs`, 105, 20, { align: 'center' });
    autoTable(doc, {
        startY: 30,
        head: [['Numéro', 'Intitulé', 'Téléphone']],
        body: transporteurs.map(t => [t.numero, t.intitule, t.telephone]),
        theme: 'striped',
        headStyles: { fillColor: '#1C2039' },
    });
    doc.save(`export_transporteurs.pdf`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Transporteurs</CardTitle>
              <CardDescription>Gérez la base de données de vos partenaires de livraison.</CardDescription>
            </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau transporteur
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] font-semibold">Numéro</TableHead>
                  <TableHead className="font-semibold">Intitulé</TableHead>
                  <TableHead className="font-semibold">Téléphone</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransporteurs.map((transporteur) => (
                  <TableRow key={transporteur.id} className="odd:bg-muted/50">
                    <TableCell>{transporteur.numero}</TableCell>
                    <TableCell className="font-medium">{transporteur.intitule}</TableCell>
                    <TableCell>{transporteur.telephone}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(transporteur)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setTransporteurToDelete(transporteur)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {transporteurs.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">Aucun transporteur dans la base de données.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
         {transporteurs.length > 0 &&
            <CardFooter className="flex items-center justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Total de {transporteurs.length} transporteurs. Page {currentPage} sur {totalPages}.
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
        <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingTransporteur ? 'Modifier le transporteur' : 'Nouveau transporteur'}</DialogTitle>
              <DialogDescription>
                {editingTransporteur ? 'Mettez à jour les informations du transporteur.' : 'Remplissez les informations ci-dessous.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numero" className="text-right">Numéro</Label>
                <Input id="numero" value={formData.numero} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="intitule" className="text-right">Intitulé</Label>
                <Input id="intitule" value={formData.intitule} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telephone" className="text-right">Téléphone</Label>
                <Input id="telephone" value={formData.telephone} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!transporteurToDelete} onOpenChange={(open) => !open && setTransporteurToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le transporteur sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setTransporteurToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteTransporteur} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
