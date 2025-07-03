
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type TiersType = 'Client' | 'Fournisseur';

type CompteTiers = {
  id: number;
  numero: string;
  intitule: string;
  type: TiersType;
  telephone: string;
  solde: number;
};

const initialComptes: CompteTiers[] = [
  { id: 1, numero: '411CLIENT1', intitule: 'Client Alpha', type: 'Client', telephone: '0123456789', solde: 1250.75 },
  { id: 2, numero: '401FOURN1', intitule: 'Fournisseur Omega', type: 'Fournisseur', telephone: '0987654321', solde: -3400.00 },
  { id: 3, numero: '411CLIENT2', intitule: 'Client Beta', type: 'Client', telephone: '0123456788', solde: 0 },
  { id: 4, numero: '401FOURN2', intitule: 'Fournisseur Gamma', type: 'Fournisseur', telephone: '0987654322', solde: -500.20 },
  { id: 5, numero: '411CLIENT3', intitule: 'Client Gamma', type: 'Client', telephone: '0123456787', solde: 5680.50 },
];

const defaultFormData: Omit<CompteTiers, 'id' | 'solde'> = {
  numero: '',
  intitule: '',
  type: 'Client',
  telephone: '',
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
};

export default function ComptesTiersPage() {
  const [comptes, setComptes] = useState<CompteTiers[]>(initialComptes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompte, setEditingCompte] = useState<CompteTiers | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [compteToDelete, setCompteToDelete] = useState<CompteTiers | null>(null);

  const clients = comptes.filter(c => c.type === 'Client');
  const fournisseurs = comptes.filter(c => c.type === 'Fournisseur');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleOpenCreateModal = () => {
    setEditingCompte(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (compte: CompteTiers) => {
    setEditingCompte(compte);
    setFormData({
      numero: compte.numero,
      intitule: compte.intitule,
      type: compte.type,
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
    if (editingCompte) {
      setComptes(
        comptes.map((c) =>
          c.id === editingCompte.id ? { ...editingCompte, ...formData } : c
        )
      );
    } else {
      const newCompte: CompteTiers = {
        id: Date.now(),
        ...formData,
        solde: 0,
      };
      setComptes([...comptes, newCompte]);
    }
    handleCloseModal();
  };

  const handleDeleteCompte = () => {
    if (compteToDelete) {
      setComptes(comptes.filter((c) => c.id !== compteToDelete.id));
      setCompteToDelete(null);
    }
  };
  
  const renderTable = (data: CompteTiers[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Numéro</TableHead>
          <TableHead>Intitulé</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead className="text-right">Solde</TableHead>
          <TableHead className="text-right w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((compte) => (
          <TableRow key={compte.id}>
            <TableCell className="font-mono">{compte.numero}</TableCell>
            <TableCell className="font-medium">{compte.intitule}</TableCell>
            <TableCell>{compte.telephone}</TableCell>
            <TableCell className="text-right font-mono">{formatCurrency(compte.solde)}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(compte)}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setCompteToDelete(compte)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Comptes Tiers</CardTitle>
              <CardDescription>Gestion des comptes clients et fournisseurs.</CardDescription>
            </div>
            <Button onClick={handleOpenCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau tiers
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="clients" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
            </TabsList>
            <TabsContent value="clients">
              {renderTable(clients)}
            </TabsContent>
            <TabsContent value="fournisseurs">
              {renderTable(fournisseurs)}
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
