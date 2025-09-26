
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, PlusCircle, Upload, Download } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAtom } from 'jotai';
import { clientsAtom, fournisseursAtom } from '@/lib/store';


type CompteTiers = {
  id: number;
  numero: string;
  intitule: string;
  telephone: string;
};

type TiersType = 'Client' | 'Fournisseur';

const defaultFormData: Omit<CompteTiers, 'id'> & { type: TiersType } = {
  numero: '',
  intitule: '',
  type: 'Client',
  telephone: '',
};

const ITEMS_PER_PAGE = 10;

export default function ComptesTiersPage() {
  const [clients, setClients] = useAtom(clientsAtom);
  const [fournisseurs, setFournisseurs] = useAtom(fournisseursAtom);

  const [activeTab, setActiveTab] = useState('clients');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompte, setEditingCompte] = useState<CompteTiers | null>(null);
  const [editingType, setEditingType] = useState<TiersType>('Client');
  const [formData, setFormData] = useState(defaultFormData);
  const [compteToDelete, setCompteToDelete] = useState<CompteTiers | null>(null);
  const [deleteType, setDeleteType] = useState<TiersType | null>(null);
  const [currentPage, setCurrentPage] = useState({ clients: 1, fournisseurs: 1 });
  
  const { toast } = useToast();

  const { paginatedClients, totalClientPages } = useMemo(() => {
    const total = Math.ceil(clients.length / ITEMS_PER_PAGE);
    const start = (currentPage.clients - 1) * ITEMS_PER_PAGE;
    return {
        paginatedClients: clients.slice(start, start + ITEMS_PER_PAGE),
        totalClientPages: total
    }
  }, [clients, currentPage.clients]);

  const { paginatedFournisseurs, totalFournisseurPages } = useMemo(() => {
    const total = Math.ceil(fournisseurs.length / ITEMS_PER_PAGE);
    const start = (currentPage.fournisseurs - 1) * ITEMS_PER_PAGE;
    return {
        paginatedFournisseurs: fournisseurs.slice(start, start + ITEMS_PER_PAGE),
        totalFournisseurPages: total
    }
  }, [fournisseurs, currentPage.fournisseurs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleOpenCreateModal = () => {
    setEditingCompte(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (compte: CompteTiers, type: TiersType) => {
    setEditingCompte(compte);
    setEditingType(type);
    setFormData({
      numero: compte.numero,
      intitule: compte.intitule,
      type: type,
      telephone: compte.telephone,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompte(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const compteData = {
      id: editingCompte ? editingCompte.id : Date.now(),
      numero: formData.numero,
      intitule: formData.intitule,
      telephone: formData.telephone,
    };

    const targetAtom = formData.type === 'Client' ? setClients : setFournisseurs;

    if (editingCompte) {
      if (formData.type === editingType) {
        targetAtom(prev => prev.map(c => c.id === compteData.id ? compteData : c));
      } else {
        const sourceAtom = editingType === 'Client' ? setClients : setFournisseurs;
        sourceAtom(prev => prev.filter(c => c.id !== compteData.id));
        targetAtom(prev => [...prev, compteData]);
      }
    } else {
      targetAtom(prev => [...prev, compteData]);
    }

    handleCloseModal();
  };

  const handleDeleteCompte = () => {
    if (compteToDelete) {
      const targetAtom = deleteType === 'Client' ? setClients : setFournisseurs;
      targetAtom(prev => prev.filter(c => c.id !== compteToDelete.id));
      setCompteToDelete(null);
      setDeleteType(null);
    }
  };
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = activeTab === 'clients' ? clients : fournisseurs;
    const tableTitle = activeTab === 'clients' ? 'Clients' : 'Fournisseurs';

    doc.setFontSize(18);
    doc.text(`Liste des ${tableTitle}`, 105, 20, { align: 'center' });
    
    autoTable(doc, {
        startY: 30,
        head: [['Numéro', 'Intitulé', 'Téléphone']],
        body: tableData.map(c => [c.numero, c.intitule, c.telephone]),
        theme: 'striped',
        headStyles: { fillColor: '#1C2039' },
    });

    doc.save(`export_${activeTab}.pdf`);
  };

  const renderTable = (data: CompteTiers[], type: 'clients' | 'fournisseurs') => {
    const paginatedData = type === 'clients' ? paginatedClients : paginatedFournisseurs;
    const totalPages = type === 'clients' ? totalClientPages : totalFournisseurPages;
    const currentP = currentPage[type];

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(prev => ({ ...prev, [type]: newPage }));
        }
    };
    
    return (
        <>
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
                {paginatedData.map((compte) => (
                  <TableRow key={compte.id} className="odd:bg-muted/50">
                    <TableCell>{compte.numero}</TableCell>
                    <TableCell className="font-medium">{compte.intitule}</TableCell>
                    <TableCell>{compte.telephone}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(compte, type === 'clients' ? 'Client' : 'Fournisseur')}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setCompteToDelete(compte); setDeleteType(type === 'clients' ? 'Client' : 'Fournisseur'); }} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <CardFooter className="flex items-center justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Total de {data.length} {type}. Page {currentP} sur {totalPages}.
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentP - 1)}
                    disabled={currentP === 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentP + 1)}
                    disabled={currentP === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </CardFooter>
        </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Comptes Tiers</CardTitle>
              <CardDescription>Gestion des comptes clients et fournisseurs.</CardDescription>
            </div>
             <div className="flex gap-2">
               <Button variant="outline" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau tiers
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="clients" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
            </TabsList>
            <TabsContent value="clients" className="pt-4">
              {renderTable(clients, 'clients')}
            </TabsContent>
            <TabsContent value="fournisseurs" className="pt-4">
              {renderTable(fournisseurs, 'fournisseurs')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCompte ? 'Modifier le compte tiers' : 'Nouveau compte tiers'}</DialogTitle>
              <DialogDescription>
                {editingCompte ? 'Mettez à jour les informations du compte.' : 'Remplissez les informations ci-dessous.'}
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
               <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type</Label>
                <RadioGroup 
                  value={formData.type} 
                  onValueChange={(value: TiersType) => setFormData(f => ({...f, type: value}))} 
                  className="flex gap-4 col-span-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Client" id="client" />
                        <Label htmlFor="client" className="font-normal">Client</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Fournisseur" id="fournisseur" />
                        <Label htmlFor="fournisseur" className="font-normal">Fournisseur</Label>
                    </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!compteToDelete} onOpenChange={(open) => !open && setCompteToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le compte sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCompteToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCompte} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
