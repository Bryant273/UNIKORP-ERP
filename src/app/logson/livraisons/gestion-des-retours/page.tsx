
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type RetourStatus = 'En attente' | 'Reçu' | 'Traité';
type RetourItem = {
    id: string;
    retourNumero: string;
    commandeNumero: string;
    client: string;
    dateDemande: string;
    statut: RetourStatus;
    articles: { nom: string, quantite: number }[];
};

const MOCK_RETOURS: RetourItem[] = [
    { id: 'ret-1', retourNumero: 'RTN-2024-051', commandeNumero: 'CMD-0789', client: 'Innovate Inc.', dateDemande: '2024-07-28', statut: 'En attente', articles: [{ nom: 'Produit Alpha', quantite: 1 }] },
    { id: 'ret-2', retourNumero: 'RTN-2024-052', commandeNumero: 'CMD-0775', client: 'TechCorp', dateDemande: '2024-07-25', statut: 'Reçu', articles: [{ nom: 'Produit Beta', quantite: 2 }, { nom: 'Produit Gamma', quantite: 1 }] },
    { id: 'ret-3', retourNumero: 'RTN-2024-050', commandeNumero: 'CMD-0760', client: 'Global Solutions', dateDemande: '2024-07-15', statut: 'Traité', articles: [{ nom: 'Produit Delta', quantite: 5 }] },
];

export default function GestionRetoursPage() {
    const [retours, setRetours] = useState(MOCK_RETOURS);

    const getStatusBadge = (status: RetourStatus) => {
        switch (status) {
            case 'En attente': return <Badge variant="outline">En attente</Badge>;
            case 'Reçu': return <Badge className="bg-blue-100 text-blue-800">Reçu</Badge>;
            case 'Traité': return <Badge className="bg-green-100 text-green-800">Traité</Badge>;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Gestion des Retours</CardTitle>
                        <CardDescription>Gérez les retours de produits des clients.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Enregistrer un retour</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Retour</TableHead>
                            <TableHead>N° Commande</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead className="text-center">Date Demande</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {retours.map(retour => (
                            <TableRow key={retour.id}>
                                <TableCell>{retour.retourNumero}</TableCell>
                                <TableCell>{retour.commandeNumero}</TableCell>
                                <TableCell>{retour.client}</TableCell>
                                <TableCell className="text-center">{format(new Date(retour.dateDemande), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(retour.statut)}</TableCell>
                                <TableCell className="text-center">
                                    <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
