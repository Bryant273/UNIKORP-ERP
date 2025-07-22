
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
import { Pencil, Trash2, PlusCircle, Warehouse, MapPin, Eye, Download } from 'lucide-react';
import { useAtom } from 'jotai';
import { entrepotsAtom, produitsAtom, type Produit } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

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
  const [viewingEntrepot, setViewingEntrepot] = useState<Entrepot | null>(null);
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
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Liste des Entrepôts`, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Édité le: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 26, { align: 'center' });
    
    autoTable(doc, {
        startY: 35,
        head: [['Nom', 'Localisation', 'Capacité (m³)', 'Remplissage (%)']],
        body: entrepots.map(e => [e.nom, e.localisation, e.capacite.toLocaleString('fr-FR'), e.tauxRemplissage]),
        theme: 'striped',
        headStyles: { fillColor: '#1e3a8a' },
    });
    doc.save('liste_entrepots.pdf');
    toast({ title: "Exportation PDF réussie" });
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
            <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4"/>Exporter</Button>
                <Button onClick={handleOpenCreateModal}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nouvel entrepôt
                </Button>
            </div>
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
                  <TableHead className="w-[150px] text-center">Actions</TableHead>
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
                          <Button variant="ghost" size="icon" onClick={() => setViewingEntrepot(entrepot)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(entrepot)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEntrepotToDelete(entrepot)} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
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
      <ViewWarehouseModal isOpen={!!viewingEntrepot} onClose={() => setViewingEntrepot(null)} entrepot={viewingEntrepot} />
    </>
  );
}


function ViewWarehouseModal({ isOpen, onClose, entrepot }: { isOpen: boolean, onClose: () => void, entrepot: Entrepot | null }) {
    const [produits] = useAtom(produitsAtom);
    const { toast } = useToast();

    const produitsDansEntrepot = useMemo(() => {
        if (!entrepot) return [];
        return produits.filter(p => p.entrepotId === entrepot.id);
    }, [produits, entrepot]);
    
    if (!entrepot) return null;
    
    const handleDownloadReport = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Rapport de l'Entrepôt : ${entrepot.nom}`, 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Édité le: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 26, { align: 'center' });

        autoTable(doc, {
            body: [
                ['Localisation', entrepot.localisation],
                ['Capacité', `${entrepot.capacite.toLocaleString('fr-FR')} m³`],
                ['Taux de remplissage', `${entrepot.tauxRemplissage}%`],
            ],
            startY: 35,
            theme: 'grid',
        });
        
        doc.setFontSize(12);
        doc.text("Contenu du Stock", 14, (doc as any).lastAutoTable.finalY + 15);
        autoTable(doc, {
            head: [['Référence', 'Nom du Produit', 'Stock Actuel']],
            body: produitsDansEntrepot.map(p => [p.reference, p.name, p.stock]),
            startY: (doc as any).lastAutoTable.finalY + 20,
            theme: 'striped',
        });

        doc.save(`rapport_entrepot_${entrepot.nom.replace(/\s+/g, '_')}.pdf`);
        toast({ title: "Exportation PDF réussie" });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Détails de l'Entrepôt : {entrepot.nom}</DialogTitle>
                    <DialogDescription>{entrepot.localisation}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Capacité</CardTitle></CardHeader>
                            <CardContent><p className="text-2xl font-bold">{entrepot.capacite.toLocaleString('fr-FR')} m³</p></CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-base">Taux de Remplissage</CardTitle></CardHeader>
                            <CardContent>
                                <Progress value={entrepot.tauxRemplissage} className="h-3" />
                                <p className="text-right text-sm font-bold mt-2">{entrepot.tauxRemplissage}%</p>
                            </CardContent>
                        </Card>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Produits Stockés</h4>
                        <div className="border rounded-md max-h-64 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Nom du Produit</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {produitsDansEntrepot.length > 0 ? (
                                        produitsDansEntrepot.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                                                <TableCell>{p.name}</TableCell>
                                                <TableCell className="text-right font-bold">{p.stock}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">Cet entrepôt est vide.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={handleDownloadReport}><Download className="mr-2 h-4 w-4"/>Exporter le rapport</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
