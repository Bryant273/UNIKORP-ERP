'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2 } from 'lucide-react';

type DeclarationSociale = {
    id: string;
    periode: string;
    type: 'DSN' | 'Retraite' | 'Prévoyance';
    masseSalariale: number;
    montantDu: number;
    statut: 'En attente' | 'Déposée' | 'Payée';
};

const initialDeclarations: DeclarationSociale[] = [
    { id: 'dsn1', periode: 'Juin 2024', type: 'DSN', masseSalariale: 85200, montantDu: 38500, statut: 'Payée' },
    { id: 'dsn2', periode: 'Juillet 2024', type: 'DSN', masseSalariale: 86100, montantDu: 38950, statut: 'Déposée' },
    { id: 'ret1', periode: 'T2 2024', type: 'Retraite', masseSalariale: 255000, montantDu: 45900, statut: 'Payée' },
    { id: 'prev1', periode: 'T2 2024', type: 'Prévoyance', masseSalariale: 255000, montantDu: 5100, statut: 'Payée' },
];

export default function DeclarationsSocialesPage() {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Suivi des Déclarations Sociales</CardTitle>
                        <CardDescription>Gérez et suivez l'état de toutes vos déclarations sociales.</CardDescription>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouvelle déclaration
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Période</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Masse salariale</TableHead>
                            <TableHead className="text-right">Montant dû</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialDeclarations.map(d => (
                            <TableRow key={d.id}>
                                <TableCell className="font-medium">{d.periode}</TableCell>
                                <TableCell>{d.type}</TableCell>
                                <TableCell className="text-right font-mono">{d.masseSalariale.toLocaleString('fr-FR')} €</TableCell>
                                <TableCell className="text-right font-mono">{d.montantDu.toLocaleString('fr-FR')} €</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline">{d.statut}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
