
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Truck, PackageCheck, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
                                    <TooltipProvider>
                                        <div className="flex justify-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="icon" variant="ghost" onClick={() => {}}><Eye className="h-4 w-4"/></Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>Voir le Bon de Prélèvement</p></TooltipContent>
                                            </Tooltip>
                                            {order.status === 'En attente' && 
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" onClick={() => handleAction(order.id, 'En préparation')}><PackageCheck className="h-4 w-4"/></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Démarrer la préparation</p></TooltipContent>
                                                </Tooltip>
                                            }
                                            {order.status === 'En préparation' && 
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => handleAction(order.id, 'Prête')}><CheckCircle className="h-4 w-4"/></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Finaliser la préparation</p></TooltipContent>
                                                </Tooltip>
                                            }
                                        </div>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
