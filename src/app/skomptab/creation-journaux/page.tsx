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
  DialogClose,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, PlusCircle } from 'lucide-react';

type Journal = {
  code: string;
  intitule: string;
  type: 'Ventes' | 'Achats' | 'Trésorerie' | 'Opérations diverses';
  compteRattache: string;
  statut: 'Actif' | 'Inactif';
};

const dummyJournals: Journal[] = [
  {
    code: 'AC',
    intitule: 'Journal des achats',
    type: 'Achats',
    compteRattache: '607000',
    statut: 'Actif',
  },
  {
    code: 'VE',
    intitule: 'Journal des ventes',
    type: 'Ventes',
    compteRattache: '707000',
    statut: 'Actif',
  },
  {
    code: 'BQ',
    intitule: 'Journal de banque',
    type: 'Trésorerie',
    compteRattache: '512000',
    statut: 'Actif',
  },
  {
    code: 'OD',
    intitule: 'Journal des opérations diverses',
    type: 'Opérations diverses',
    compteRattache: 'N/A',
    statut: 'Inactif',
  },
];

export default function CreationJournauxPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <Button onClick={() => setIsModalOpen(true)}>
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
              {dummyJournals.map((journal) => (
                <TableRow key={journal.code}>
                  <TableCell className="font-medium">{journal.code}</TableCell>
                  <TableCell>{journal.intitule}</TableCell>
                  <TableCell>{journal.type}</TableCell>
                  <TableCell>{journal.compteRattache}</TableCell>
                  <TableCell>
                    <Badge variant={journal.statut === 'Actif' ? 'default' : 'secondary'}>
                      {journal.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nouveau journal</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouveau code journal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input id="code" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="intitule" className="text-right">
                Intitulé
              </Label>
              <Input id="intitule" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventes">Ventes</SelectItem>
                  <SelectItem value="achats">Achats</SelectItem>
                  <SelectItem value="tresorerie">Trésorerie</SelectItem>
                  <SelectItem value="operations-diverses">
                    Opérations diverses
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="compte" className="text-right">
                Compte rattaché
              </Label>
              <Input id="compte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="statut" className="text-right">
                Statut
              </Label>
              <Select defaultValue="actif">
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
