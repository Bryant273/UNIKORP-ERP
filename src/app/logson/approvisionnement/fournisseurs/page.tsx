
'use client';

import { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAtom } from 'jotai';
import { fournisseursAtom } from '@/lib/store';


const ITEMS_PER_PAGE = 10;

export default function FournisseursPage() {
  const [fournisseurs] = useAtom(fournisseursAtom);
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(fournisseurs.length / ITEMS_PER_PAGE);
  const paginatedFournisseurs = fournisseurs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
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
              <CardTitle className="text-2xl">Fournisseurs</CardTitle>
              <CardDescription>Base de données des fournisseurs.</CardDescription>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFournisseurs.map((fournisseur) => (
                  <TableRow key={fournisseur.id} className="odd:bg-muted/50">
                    <TableCell className="text-center">{fournisseur.numero}</TableCell>
                    <TableCell className="font-medium text-center">{fournisseur.intitule}</TableCell>
                    <TableCell className="text-center">{fournisseur.telephone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {fournisseurs.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                 <p className="text-muted-foreground">Aucun fournisseur dans la base de données.</p>
                </div>
              )}
        </CardContent>
         {fournisseurs.length > 0 &&
            <CardFooter className="flex items-center justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Total de {fournisseurs.length} fournisseurs. Page {currentPage} sur {totalPages}.
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
    </>
  );
}

