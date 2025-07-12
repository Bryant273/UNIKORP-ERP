
'use client';

import { useState, useMemo } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useAtom } from 'jotai';
import { clientsAtom } from '@/lib/store';


type CompteTiers = {
  id: number;
  numero: string;
  intitule: string;
  telephone: string;
};

const defaultFormData: Omit<CompteTiers, 'id'> = {
  numero: '',
  intitule: '',
  telephone: '',
};

const ITEMS_PER_PAGE = 10;

export default function ClientsPage() {
  const [clients, setClients] = useAtom(clientsAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CompteTiers | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [clientToDelete, setClientToDelete] = useState<CompteTiers | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();

  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const paginatedClients = clients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleOpenCreateModal = () => {
    setEditingClient(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (compte: CompteTiers) => {
    setEditingClient(compte);
    setFormData({
      numero: compte.numero,
      intitule: compte.intitule,
      telephone: compte.telephone,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      setClients(
        clients.map((c) =>
          c.id === editingClient.id ? { ...editingClient, ...formData } : c
        )
      );
    } else {
      const newClient: CompteTiers = {
        id: Date.now(),
        ...formData,
      };
      setClients([...clients, newClient]);
    }
    handleCloseModal();
  };

  const handleDeleteClient = () => {
    if (clientToDelete) {
      setClients(clients.filter((c) => c.id !== clientToDelete.id));
      setClientToDelete(null);
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
    doc.text(`Liste des Clients`, 105, 20, { align: 'center' });
    
    autoTable(doc, {
        startY: 30,
        head: [['Numéro', 'Intitulé', 'Téléphone']],
        body: clients.map(c => [c.numero, c.intitule, c.telephone]),
        theme: 'striped',
        headStyles: { fillColor: '#1C2039' },
    });

    doc.save(`export_clients.pdf`);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Clients</CardTitle>
              <CardDescription>Gestion de la base de données clients.</CardDescription>
            </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau client
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] text-center font-semibold">Numéro</TableHead>
                  <TableHead className="text-center font-semibold">Intitulé</TableHead>
                  <TableHead className="text-center font-semibold">Téléphone</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client) => (
                  <TableRow key={client.id} className="odd:bg-muted/50">
                    <TableCell className="text-center">{client.numero}</TableCell>
                    <TableCell className="font-medium text-center">{client.intitule}</TableCell>
                    <TableCell className="text-center">{client.telephone}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(client)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setClientToDelete(client)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {clients.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                 <p className="text-muted-foreground">Aucun client dans la base de données.</p>
                </div>
              )}
            </CardContent>
            {clients.length > 0 &&
            <CardFooter className="flex items-center justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Total de {clients.length} clients. Page {currentPage} sur {totalPages}.
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
              <DialogTitle>{editingClient ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
              <DialogDescription>
                {editingClient ? 'Mettez à jour les informations du client.' : 'Remplissez les informations ci-dessous.'}
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
      
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le client sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setClientToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
