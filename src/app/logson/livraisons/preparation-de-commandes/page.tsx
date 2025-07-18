
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Truck, PackageCheck, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type OrderStatus = 'En attente' | 'En préparation' | 'Prête';
type OrderLine = {
    produit: string;
    quantite: number;
    emplacement: string;
};
type OrderToPrepare = {
    id: string;
    numero: string;
    client: string;
    date: string;
    lignes: OrderLine[];
    status: OrderStatus;
};

const MOCK_ORDERS: OrderToPrepare[] = [
    { id: 'cmd-01', numero: 'CMD-0801', client: 'Innovate Inc.', date: '2024-07-30', lignes: [{ produit: 'Produit Alpha', quantite: 5, emplacement: 'A1-B3-C2' }, { produit: 'Produit Beta', quantite: 10, emplacement: 'A2-C1-D5' }], status: 'En attente' },
    { id: 'cmd-02', numero: 'CMD-0802', client: 'TechCorp', date: '2024-07-30', lignes: [{ produit: 'Produit Gamma', quantite: 2, emplacement: 'B3-A1-E7' }], status: 'En préparation' },
    { id: 'cmd-03', numero: 'CMD-0803', client: 'Global Solutions', date: '2024-07-29', lignes: [{ produit: 'Produit Delta', quantite: 8, emplacement: 'C1-D2-F1' }], status: 'Prête' },
];

export default function PreparationCommandesPage() {
    const [orders, setOrders] = useState(MOCK_ORDERS);

    const getStatusBadge = (status: OrderStatus) => {
        switch (status) {
            case 'En attente': return <Badge variant="outline">En attente</Badge>;
            case 'En préparation': return <Badge className="bg-yellow-100 text-yellow-800">En préparation</Badge>;
            case 'Prête': return <Badge className="bg-green-100 text-green-800">Prête</Badge>;
        }
    };

    const handleAction = (orderId: string, newStatus: OrderStatus) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Préparation de Commandes</CardTitle>
                <CardDescription>Gérez la préparation des commandes clients pour l'expédition.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Commande</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>{order.numero}</TableCell>
                                <TableCell>{order.client}</TableCell>
                                <TableCell>{format(new Date(order.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => {}}><Eye className="mr-2 h-4 w-4"/> Bon de Prélèvement</Button>
                                        {order.status === 'En attente' && <Button size="sm" onClick={() => handleAction(order.id, 'En préparation')}><PackageCheck className="mr-2 h-4 w-4"/> Démarrer</Button>}
                                        {order.status === 'En préparation' && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(order.id, 'Prête')}><CheckCircle className="mr-2 h-4 w-4"/> Finaliser</Button>}
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
