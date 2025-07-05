'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2, Download } from 'lucide-react';
import FiscalPageLayout from '@/components/fiscal-layout';

type AutreImpot = {
    id: string;
    nom: string;
    base: string;
    montant: number;
    echeance: string;
    statut: 'À payer' | 'Payé';
};

const autresImpots: AutreImpot[] = [
    { id: 'cfe', nom: 'Cotisation Foncière des Entreprises (CFE)', base: 'Valeur locative', montant: 2500, echeance: '15/12/2024', statut: 'À payer' },
    { id: 'cvae', nom: 'Cotisation sur la Valeur Ajoutée (CVAE)', base: 'Valeur ajoutée', montant: 4800, echeance: '15/09/2024', statut: 'À payer' },
    { id: 'tascom', nom: 'Taxe sur les surfaces commerciales (TASCOM)', base: 'Surface de vente', montant: 1200, echeance: '15/06/2024', statut: 'Payé' },
    { id: 'tvts', nom: 'Taxe sur les Véhicules de Société (TVS)', base: 'Parc automobile', montant: 1850, echeance: '30/11/2024', statut: 'À payer' },
];

function AutresImpotsMainContent() {
  return (
    <Card className="w-full">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Autres Impôts et Taxes</CardTitle>
                    <CardDescription>Suivi des impôts et taxes divers.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une taxe
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Impôt / Taxe</TableHead>
                        <TableHead className="text-right">Montant Dû</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                        <TableHead className="text-center w-[150px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {autresImpots.map((impot) => {
                        const isPaid = impot.statut === 'Payé';
                        return (
                        <TableRow key={impot.id}>
                            <TableCell className="font-medium">{impot.nom}</TableCell>
                            <TableCell className="text-right font-mono">{impot.montant.toLocaleString('fr-FR')} €</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={isPaid ? 'secondary' : 'destructive'}>{impot.statut}</Badge>
                            </TableCell>
                             <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" disabled={isPaid}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isPaid}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}

export default function AutresImpotsPage() {
    return (
        <FiscalPageLayout>
            <AutresImpotsMainContent />
        </FiscalPageLayout>
    )
}
