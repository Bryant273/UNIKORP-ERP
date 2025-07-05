'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2, Download } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import FiscalPageLayout from '@/components/fiscal-layout';

// New types based on user feedback
type DeclarationType = 'IS' | 'IMF' | 'ITS' | 'Patente' | 'BNC' | 'BIC' | 'BA' | 'TSE' | 'TPS';
type DeclarationStatus = 'Brouillon' | 'Validée' | 'Télédéclarée' | 'Payée';

type Declaration = {
    id: string;
    periode: string;
    type: DeclarationType;
    montant: number;
    echeance: string;
    statut: DeclarationStatus;
};

// New mock data, excluding TVA, including new tax types
const initialDeclarations: Declaration[] = [
    { id: 'd1', periode: 'Année 2023', type: 'BIC', montant: 4500000, echeance: '30/04/2024', statut: 'Payée' },
    { id: 'd2', periode: 'Juillet 2024', type: 'ITS', montant: 1250000, echeance: '15/08/2024', statut: 'Validée' },
    { id: 'd3', periode: 'T3 2024', type: 'IMF', montant: 750000, echeance: '15/10/2024', statut: 'Brouillon' },
    { id: 'd4', periode: 'Année 2024', type: 'Patente', montant: 350000, echeance: '15/01/2025', statut: 'Brouillon' },
    { id: 'd5', periode: 'Juin 2024', type: 'ITS', montant: 1230000, echeance: '15/07/2024', statut: 'Payée' },
    { id: 'd6', periode: 'Année 2023', type: 'TPS', montant: 850000, echeance: '20/01/2024', statut: 'Télédéclarée' },
];


function DeclarationsFiscalesMainContent() {
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
                            <CardDescription>Gérez et suivez l'état de toutes vos déclarations fiscales (hors TVA).</CardDescription>
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
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Période</TableHead>
                                <TableHead>Impôt</TableHead>
                                <TableHead className="text-right">Montant Dû</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {declarations.map((d, index) => {
                                const isFinalized = d.statut === 'Payée' || d.statut === 'Télédéclarée';
                                return (
                                <TableRow key={d.id}>
                                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{d.periode}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{d.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{d.montant.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(d.statut)}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" disabled={isFinalized}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" disabled={isFinalized}><Download className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeclarationToDelete(d)} disabled={isFinalized}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )})}
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

export default function DeclarationsFiscalesPage() {
    return (
        <FiscalPageLayout>
            <DeclarationsFiscalesMainContent />
        </FiscalPageLayout>
    )
}
