
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Package, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type DeliveryStatus = 'En transit' | 'Au dépôt' | 'En livraison' | 'Livrée';
type Delivery = {
    id: string;
    trackingNumber: string;
    commandeNumero: string;
    transporteur: string;
    client: string;
    destination: string;
    statut: DeliveryStatus;
    derniereMiseAJour: string;
};

const MOCK_DELIVERIES: Delivery[] = [
    { id: 'del-1', trackingNumber: 'TRK123456789', commandeNumero: 'CMD-0801', transporteur: 'DHL', client: 'Innovate Inc.', destination: 'Abidjan, Zone 4', statut: 'En transit', derniereMiseAJour: '2024-07-31 14:30' },
    { id: 'del-2', trackingNumber: 'TRK987654321', commandeNumero: 'CMD-0802', transporteur: 'Chronopost', client: 'TechCorp', destination: 'Yamoussoukro', statut: 'En livraison', derniereMiseAJour: '2024-07-31 09:15' },
    { id: 'del-3', trackingNumber: 'TRK555444333', commandeNumero: 'CMD-0792', transporteur: 'DHL', client: 'Innovate Inc.', destination: 'Abidjan, Zone 4', statut: 'Livrée', derniereMiseAJour: '2024-07-30 16:00' },
    { id: 'del-4', trackingNumber: 'TRK112233445', commandeNumero: 'CMD-0803', transporteur: 'Colissimo', client: 'Global Solutions', destination: 'Bouaké', statut: 'Au dépôt', derniereMiseAJour: '2024-07-31 08:00' },
];

export default function SuiviLivraisonsPage() {
    const [deliveries, setDeliveries] = useState(MOCK_DELIVERIES);

    const getStatusIcon = (status: DeliveryStatus) => {
        switch (status) {
            case 'En transit': return <Truck className="h-4 w-4 text-blue-500" />;
            case 'Au dépôt': return <Package className="h-4 w-4 text-orange-500" />;
            case 'En livraison': return <MapPin className="h-4 w-4 text-yellow-500" />;
            case 'Livrée': return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Suivi des Livraisons</CardTitle>
                <CardDescription>Suivez l'état de vos livraisons en temps réel.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Suivi</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead>Dernière Mise à Jour</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deliveries.map(d => (
                            <TableRow key={d.id}>
                                <TableCell className="font-mono">{d.trackingNumber}</TableCell>
                                <TableCell>{d.client}</TableCell>
                                <TableCell>{d.destination}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="flex items-center gap-2 justify-center">
                                        {getStatusIcon(d.statut)}
                                        {d.statut}
                                    </Badge>
                                </TableCell>
                                <TableCell>{d.derniereMiseAJour}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
