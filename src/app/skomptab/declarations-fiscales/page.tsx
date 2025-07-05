'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

type Declaration = {
    id: string;
    periode: string;
    type: 'TVA' | 'IS' | 'CVAE' | 'Liasse Fiscale';
    montant: number;
    echeance: string;
    statut: 'Brouillon' | 'Validée' | 'Télédéclarée' | 'Payée';
};

const initialDeclarations: Declaration[] = [
    { id: 'd1', periode: 'Juillet 2024', type: 'TVA', montant: 6300, echeance: '20/08/2024', statut: 'Brouillon' },
    { id: 'd2', periode: 'Juin 2024', type: 'TVA', montant: 4850, echeance: '20/07/2024', statut: 'Payée' },
    { id: 'd3', periode: 'T2 2024', type: 'IS', montant: 15200, echeance: '15/06/2024', statut: 'Payée' },
    { id: 'd4', periode: 'Année 2023', type: 'Liasse Fiscale', montant: 0, echeance: '03/05/2024', statut: 'Télédéclarée' },
];

export default function DeclarationsFiscalesPage() {
    const [declarations, setDeclarations] = useState(initialDeclarations);
    const [declarationToDelete, setDeclarationToDelete] = useState<Declaration | null>(null);
    const { toast } = useToast();

    const handleDelete = () => {
        if (declarationToDelete) {
            setDeclarations(prev => prev.filter(d => d.id !== declarationToDelete.id));
            toast({ title: 'Déclaration supprimée' });
            setDeclarationToDelete(null);
        }
    };

    const getStatusBadge = (statut: Declaration['statut']) => {
        switch (statut) {
            case 'Brouillon': return <Badge variant="outline">Brouillon</Badge>;
            case 'Validée': return <Badge>Validée</Badge>;
            case 'Télédéclarée': return <Badge className="bg-blue-100 text-blue-800">Télédéclarée</Badge>;
            case 'Payée': return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
        }
    }

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Suivi des Déclarations Fiscales</CardTitle>
                            <CardDescription>Gérez et suivez l'état de toutes vos déclarations fiscales.</CardDescription>
                        </div>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Créer une déclaration
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Période</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead className="text-center">Échéance</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {declarations.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.periode}</TableCell>
                                    <TableCell>{d.type}</TableCell>
                                    <TableCell className="text-right font-mono">{d.montant.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-center">{d.echeance}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(d.statut)}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeclarationToDelete(d)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!declarationToDelete} onOpenChange={() => setDeclarationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette déclaration ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. La déclaration sera supprimée de l'historique.</AlertDialogDescription>
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
