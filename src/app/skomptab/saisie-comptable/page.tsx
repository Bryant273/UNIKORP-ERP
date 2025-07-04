'use client';

import React, { useState } from 'react';
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
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// --- DATA TYPES & MOCK DATA ---

type LigneEcriture = {
  id: string;
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  tiers: string;
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

const initialEcritures: EcritureComptable[] = [
  {
    id: 2,
    dateSaisie: '2024-07-21',
    numeroCompta: 'VE-202407-0003',
    journal: 'VE',
    dateOperation: '2024-07-20',
    numeroPiece: 'FACT-088',
    libelleOperation: 'Vente de services - Client B',
    lignes: [
      { id: 'l2-1', compte: '411000', tiers: 'CLIENT_B', libelle: 'Client B', debit: 2400, credit: 0 },
      { id: 'l2-2', compte: '706000', tiers: '', libelle: 'Prestation de service', debit: 0, credit: 2000 },
      { id: 'l2-3', compte: '445710', tiers: '', libelle: 'TVA collectée', debit: 0, credit: 400 },
    ],
  },
    {
    id: 1,
    dateSaisie: '2024-07-20',
    numeroCompta: 'AC-202407-0015',
    journal: 'AC',
    dateOperation: '2024-07-19',
    numeroPiece: 'F24-AC-001',
    libelleOperation: 'Achat de matières premières - Fournisseur A',
    lignes: [
      { id: 'l1-1', compte: '601000', tiers: '', libelle: 'Achat Mat. Prem.', debit: 1500, credit: 0 },
      { id: 'l1-2', compte: '445660', tiers: '', libelle: 'TVA déductible', debit: 300, credit: 0 },
      { id: 'l1-3', compte: '401000', tiers: 'FOURN_A', libelle: 'Fournisseur A', debit: 0, credit: 1800 },
    ],
  },
  {
    id: 5,
    dateSaisie: '2024-07-24',
    numeroCompta: 'VE-202407-0004',
    journal: 'VE',
    dateOperation: '2024-07-23',
    numeroPiece: 'FACT-089',
    libelleOperation: 'Vente marchandises Client Beta',
    lignes: [
        { id: 'l5-1', compte: '411000', tiers: 'CLIENT_BETA', libelle: 'Client Beta', debit: 6000, credit: 0 },
        { id: 'l5-2', compte: '707000', tiers: '', libelle: 'Vente de marchandise', debit: 0, credit: 5000 },
        { id: 'l5-3', compte: '445710', tiers: '', libelle: 'TVA collectée', debit: 0, credit: 1000 },
    ],
  },
];

const ITEMS_PER_PAGE = 10;

export default function SaisieComptablePage() {
  const [ecritures, setEcritures] = useState<EcritureComptable[]>(initialEcritures);
  const [viewingEcriture, setViewingEcriture] = useState<EcritureComptable | null>(null);
  const [ecritureToDelete, setEcritureToDelete] = useState<EcritureComptable | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(ecritures.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEcritures = ecritures.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleDelete = () => {
    if (ecritureToDelete) {
        setEcritures(ecritures.filter(e => e.id !== ecritureToDelete.id));
        setEcritureToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Saisie Comptable (Grand Livre)</CardTitle>
          <CardDescription>
            Consultez et gérez les écritures comptables de l'entreprise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Date de saisie</TableHead>
                <TableHead>N° Saisie</TableHead>
                <TableHead>Journal</TableHead>
                <TableHead>Date de l'opération</TableHead>
                <TableHead>N° Pièce</TableHead>
                <TableHead className="w-[180px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentEcritures.map((ecriture, index) => (
                <TableRow key={ecriture.id} className="odd:bg-muted/50">
                  <TableCell className="text-muted-foreground text-center">{startIndex + index + 1}</TableCell>
                  <TableCell>{new Date(ecriture.dateSaisie).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="font-mono">{ecriture.numeroCompta}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ecriture.journal}</Badge>
                  </TableCell>
                  <TableCell>{new Date(ecriture.dateOperation).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{ecriture.numeroPiece}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewingEcriture(ecriture)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setEcritureToDelete(ecriture)}>
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
              Aucune écriture comptable enregistrée.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total de <span className="font-bold">{ecritures.length}</span> écritures.
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

      <Dialog open={!!viewingEcriture} onOpenChange={() => setViewingEcriture(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de l'écriture</DialogTitle>
            <DialogDescription>
              Consultation de l'écriture N°{viewingEcriture?.numeroCompta}.
            </DialogDescription>
          </DialogHeader>
          {viewingEcriture && (
            <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-1"><Label>Journal</Label><p className="font-semibold">{viewingEcriture.journal}</p></div>
                <div className="space-y-1"><Label>Date Opération</Label><p className="font-semibold">{viewingEcriture.dateOperation}</p></div>
                <div className="space-y-1"><Label>N° Pièce</Label><p className="font-semibold">{viewingEcriture.numeroPiece}</p></div>
                 <div className="space-y-1 col-span-full"><Label>Libellé Opération</Label><p className="font-semibold">{viewingEcriture.libelleOperation}</p></div>
              </div>
              <Separator />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Compte</TableHead>
                    <TableHead>Tiers</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead className="text-right">Débit</TableHead>
                    <TableHead className="text-right">Crédit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewingEcriture.lignes.map(ligne => (
                    <TableRow key={ligne.id}>
                      <TableCell>{ligne.compte}</TableCell>
                      <TableCell>{ligne.tiers || 'N/A'}</TableCell>
                      <TableCell>{ligne.libelle}</TableCell>
                      <TableCell className="text-right font-mono">{ligne.debit > 0 ? ligne.debit.toFixed(2) : ''}</TableCell>
                      <TableCell className="text-right font-mono">{ligne.credit > 0 ? ligne.credit.toFixed(2) : ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter className="pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => setViewingEcriture(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={!!ecritureToDelete} onOpenChange={() => setEcritureToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette écriture ?</AlertDialogTitle>
                <AlertDialogDescription>Cette action est irréversible et supprimera définitivement l'écriture comptable.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
