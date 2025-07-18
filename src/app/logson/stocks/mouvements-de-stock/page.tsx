
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type MouvementType = 'Entrée' | 'Sortie' | 'Transfert';
type Mouvement = {
    id: string;
    date: string;
    produit: string;
    reference: string;
    type: MouvementType;
    quantite: number;
    document: string;
    entrepot: string;
};

const MOCK_MOUVEMENTS: Mouvement[] = [
    { id: 'mvt-1', date: '2024-07-31 10:00', produit: 'Serveur Dell PowerEdge R740', reference: 'SRV-DELL-R740', type: 'Sortie', quantite: 2, document: 'BL-CMD-0801', entrepot: 'Entrepôt Principal - Abidjan' },
    { id: 'mvt-2', date: '2024-07-30 14:15', produit: 'Licence Windows Server 2022', reference: 'SW-MS-WIN22', type: 'Entrée', quantite: 10, document: 'BR-BC-2024-002', entrepot: 'Entrepôt Principal - Abidjan' },
    { id: 'mvt-3', date: '2024-07-29 09:30', produit: 'Switch Cisco Catalyst 9200', reference: 'NW-CIS-C9200', type: 'Transfert', quantite: 5, document: 'BT-ABJ-BKE-01', entrepot: 'Entrepôt Principal -> Bouaké' },
    { id: 'mvt-4', date: '2024-07-28 11:00', produit: 'PC Portable Lenovo ThinkPad T14', reference: 'PC-LEN-T14', type: 'Sortie', quantite: 8, document: 'BL-CMD-0798', entrepot: 'Entrepôt Principal - Abidjan' },
];

export default function MouvementsDeStockPage() {
    const [mouvements, setMouvements] = useState(MOCK_MOUVEMENTS);
    
    const getTypeBadge = (type: MouvementType) => {
        switch (type) {
            case 'Entrée': return <Badge className="bg-green-100 text-green-800"><ArrowUp className="mr-1 h-3 w-3"/>Entrée</Badge>;
            case 'Sortie': return <Badge className="bg-red-100 text-red-800"><ArrowDown className="mr-1 h-3 w-3"/>Sortie</Badge>;
            case 'Transfert': return <Badge className="bg-blue-100 text-blue-800"><Repeat className="mr-1 h-3 w-3"/>Transfert</Badge>;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Mouvements de Stock</CardTitle>
                <CardDescription>Consultez l'historique de tous les mouvements de stock.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date & Heure</TableHead>
                            <TableHead>Produit</TableHead>
                            <TableHead>Document</TableHead>
                            <TableHead className="text-center">Type</TableHead>
                            <TableHead className="text-center">Quantité</TableHead>
                            <TableHead>Entrepôt</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mouvements.map(mvt => (
                            <TableRow key={mvt.id}>
                                <TableCell>{format(new Date(mvt.date), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                                <TableCell className="font-medium">{mvt.produit}</TableCell>
                                <TableCell>{mvt.document}</TableCell>
                                <TableCell className="text-center">{getTypeBadge(mvt.type)}</TableCell>
                                <TableCell className="text-center">{mvt.quantite}</TableCell>
                                <TableCell>{mvt.entrepot}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
