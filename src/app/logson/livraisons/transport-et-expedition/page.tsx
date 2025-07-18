
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Truck, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ExpeditionStatus = 'Planifiée' | 'Expédiée' | 'En transit';
type Expedition = {
    id: string;
    expeditionNumero: string;
    commandeNumero: string;
    client: string;
    transporteur: 'DHL' | 'Chronopost' | 'Colissimo';
    dateExpedition: string;
    statut: ExpeditionStatus;
    nombreColis: number;
};

const MOCK_EXPEDITIONS: Expedition[] = [
    { id: 'exp-1', expeditionNumero: 'EXP-2024-112', commandeNumero: 'CMD-0803', client: 'Global Solutions', transporteur: 'Colissimo', dateExpedition: '2024-07-31', statut: 'Planifiée', nombreColis: 1 },
    { id: 'exp-2', expeditionNumero: 'EXP-2024-111', commandeNumero: 'CMD-0801', client: 'Innovate Inc.', transporteur: 'DHL', dateExpedition: '2024-07-30', statut: 'Expédiée', nombreColis: 2 },
    { id: 'exp-3', expeditionNumero: 'EXP-2024-110', commandeNumero: 'CMD-0795', client: 'TechCorp', transporteur: 'Chronopost', dateExpedition: '2024-07-29', statut: 'En transit', nombreColis: 1 },
];

export default function TransportExpeditionPage() {
    const [expeditions, setExpeditions] = useState(MOCK_EXPEDITIONS);
    
    const getStatusBadge = (status: ExpeditionStatus) => {
        switch (status) {
            case 'Planifiée': return <Badge variant="outline">Planifiée</Badge>;
            case 'Expédiée': return <Badge className="bg-blue-100 text-blue-800">Expédiée</Badge>;
            case 'En transit': return <Badge variant="default">En transit</Badge>;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Transport et Expédition</CardTitle>
                        <CardDescription>Gérez les expéditions de vos commandes prêtes.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Planifier une expédition</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Expédition</TableHead>
                            <TableHead>N° Commande</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Transporteur</TableHead>
                            <TableHead>Date Prévue</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expeditions.map(exp => (
                            <TableRow key={exp.id}>
                                <TableCell>{exp.expeditionNumero}</TableCell>
                                <TableCell>{exp.commandeNumero}</TableCell>
                                <TableCell>{exp.client}</TableCell>
                                <TableCell><Badge variant="secondary">{exp.transporteur}</Badge></TableCell>
                                <TableCell>{format(new Date(exp.dateExpedition), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(exp.statut)}</TableCell>
                                <TableCell className="text-center">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Imprimer l'étiquette d'expédition</p></TooltipContent>
                                        </Tooltip>
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
