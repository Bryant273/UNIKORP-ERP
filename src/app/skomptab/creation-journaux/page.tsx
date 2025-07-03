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
import { Pencil, Trash2, PlusCircle } from 'lucide-react';

type JournalType = 'Ventes' | 'Achats' | 'Trésorerie' | 'Opérations diverses';
type JournalStatut = 'Actif' | 'Inactif';

type Journal = {
  id: number;
  code: string;
  intitule: string;
  type: JournalType;
  compteRattache: string;
  statut: JournalStatut;
};

const initialJournals: Journal[] = [
  {
    id: 1,
    code: 'AC 1',
    intitule: 'Journal des achats',
    type: 'Achats',
    compteRattache: '',
    statut: 'Actif',
  },
  {
    id: 2,
    code: 'VE 1',
    intitule: 'Journal des ventes',
    type: 'Ventes',
    compteRattache: '',
    statut: 'Actif',
  },
  {
    id: 3,
    code: 'BNP 01',
    intitule: 'Journal de banque BNP',
    type: 'Trésorerie',
    compteRattache: '512000',
    statut: 'Actif',
  },
  {
    id: 4,
    code: 'OD',
    intitule: 'Journal des opérations diverses',
    type: 'Opérations diverses',
    compteRattache: '',
    statut: 'Inactif',
  },
];

const defaultFormData: Omit<Journal, 'id'> = {
  code: '',
  intitule: '',
  type: 'Ventes',
  compteRattache: '',
  statut: 'Actif',
};

export default function CreationJournauxPage() {
  const [journals, setJournals] = useState<Journal[]>(initialJournals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: 'type' | 'statut') => (value: string) => {
    const isTreasury = name === 'type' && value !== 'Trésorerie';
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      compteRattache: isTreasury ? '' : prev.compteRattache,
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingJournal(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (journal: Journal) => {
    setEditingJournal(journal);
    setFormData({
      code: journal.code,
      intitule: journal.intitule,
      type: journal.type,
      compteRattache: journal.compteRattache,
      statut: journal.statut,
    });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJournal(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJournal) {
      setJournals(
        journals.map((j) =>
          j.id === editingJournal.id ? { ...editingJournal, ...formData } : j
        )
      );
    } else {
      const newJournal: Journal = {
        id: Date.now(),
        ...formData,
      };
      setJournals([...journals, newJournal]);
    }
    handleCloseModal();
  };

  const handleDeleteJournal = () => {
    if (journalToDelete) {
      setJournals(journals.filter((j) => j.id !== journalToDelete.id));
      setJournalToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Codes journaux</CardTitle>
              <CardDescription>
                Créez et gérez les codes journaux de votre organisation.
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau journal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Intitulé</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Compte rattaché</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journals.map((journal) => (
                <TableRow key={journal.id}>
                  <TableCell className="font-medium">{journal.code}</TableCell>
                  <TableCell>{journal.intitule}</TableCell>
                  <TableCell>{journal.type}</TableCell>
                  <TableCell>{journal.compteRattache || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={journal.statut === 'Actif' ? 'default' : 'secondary'}>
                      {journal.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(journal)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setJournalToDelete(journal)} className="text-destructive hover:text-destructive">
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingJournal ? 'Modifier le journal' : 'Nouveau journal'}</DialogTitle>
              <DialogDescription>
                {editingJournal ? 'Mettez à jour les informations du journal.' : 'Remplissez les informations ci-dessous pour créer un nouveau code journal.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" value={formData.code} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="intitule" className="text-right">Intitulé</Label>
                <Input id="intitule" value={formData.intitule} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select value={formData.type} onValueChange={handleSelectChange('type')}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ventes">Ventes</SelectItem>
                    <SelectItem value="Achats">Achats</SelectItem>
                    <SelectItem value="Trésorerie">Trésorerie</SelectItem>
                    <SelectItem value="Opérations diverses">Opérations diverses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.type === 'Trésorerie' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="compteRattache" className="text-right">Compte rattaché</Label>
                  <Input id="compteRattache" value={formData.compteRattache} onChange={handleInputChange} className="col-span-3" required />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="statut" className="text-right">Statut</Label>
                <Select value={formData.statut} onValueChange={handleSelectChange('statut')}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!journalToDelete} onOpenChange={(open) => !open && setJournalToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le code journal sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setJournalToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteJournal} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
