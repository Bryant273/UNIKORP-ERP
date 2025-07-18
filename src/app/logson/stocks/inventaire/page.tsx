
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Download, CheckCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type InventaireStatus = 'Planifié' | 'En cours' | 'Terminé';
type Inventaire = {
    id: string;
    nom: string;
    date: string;
    entrepot: string;
    statut: InventaireStatus;
    articlesComptes: number;
    ecart: number;
};

const MOCK_INVENTAIRES: Inventaire[] = [
    { id: 'inv-1', nom: 'Inventaire Mensuel - Juillet 2024', date: '2024-07-31', entrepot: 'Entrepôt Principal - Abidjan', statut: 'En cours', articlesComptes: 52, ecart: 0 },
    { id: 'inv-2', nom: 'Inventaire Trimestriel Q2 2024', date: '2024-06-30', entrepot: 'Tous les entrepôts', statut: 'Terminé', articlesComptes: 1250, ecart: 12 },
    { id: 'inv-3', nom: 'Inventaire Annuel 2023', date: '2023-12-31', entrepot: 'Tous les entrepôts', statut: 'Terminé', articlesComptes: 1180, ecart: -5 },
];

export default function InventairePage() {
    const [inventaires, setInventaires] = useState(MOCK_INVENTAIRES);
    
    const getStatusBadge = (status: InventaireStatus) => {
        switch (status) {
            case 'Planifié': return <Badge variant="outline">Planifié</Badge>;
            case 'En cours': return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
            case 'Terminé': return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
        }
    };
    
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Inventaire</CardTitle>
                        <CardDescription>Planifiez et suivez vos inventaires de stock.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Planifier un inventaire</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom de l'inventaire</TableHead>
                            <TableHead>Entrepôt</TableHead>
                            <TableHead className="text-center">Date</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center">Écart Total</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventaires.map(inv => (
                            <TableRow key={inv.id}>
                                <TableCell className="font-medium">{inv.nom}</TableCell>
                                <TableCell>{inv.entrepot}</TableCell>
                                <TableCell className="text-center">{format(new Date(inv.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(inv.statut)}</TableCell>
                                <TableCell className={`text-center font-bold ${inv.ecart > 0 ? 'text-green-600' : inv.ecart < 0 ? 'text-red-600' : ''}`}>
                                    {inv.ecart > 0 ? '+' : ''}{inv.ecart}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button size="sm" variant="outline"><Eye className="mr-2 h-4 w-4" /> Consulter</Button>
                                        {inv.statut === 'En cours' && <Button size="sm"><CheckCircle className="mr-2 h-4 w-4" /> Finaliser</Button>}
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
