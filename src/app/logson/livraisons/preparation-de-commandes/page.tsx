
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
import { useAtom } from 'jotai';
import { invoicesAtom, type InvoiceData, type PreparationStatus } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function PreparationCommandesPage() {
    const [invoices, setInvoices] = useAtom(invoicesAtom);
    const { toast } = useToast();

    const getStatusBadge = (status: PreparationStatus) => {
        switch (status) {
            case 'En attente': return <Badge variant="outline">En attente</Badge>;
            case 'En préparation': return <Badge className="bg-yellow-100 text-yellow-800">En préparation</Badge>;
            case 'Prête': return <Badge className="bg-green-100 text-green-800">Prête pour expédition</Badge>;
        }
    };

    const handleAction = (invoiceId: string, newStatus: PreparationStatus) => {
        setInvoices(invoices.map(inv => 
            inv.id === invoiceId ? { ...inv, preparationStatus: newStatus } : inv
        ));
        toast({ title: 'Statut mis à jour', description: `La commande est maintenant "${newStatus}".`});
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Préparation des Commandes Clients</CardTitle>
                <CardDescription>Gérez la préparation des commandes facturées pour l'expédition.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Facture / Commande</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date Facture</TableHead>
                            <TableHead className="text-center">Statut Préparation</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map(invoice => (
                            <TableRow key={invoice.id}>
                                <TableCell>{invoice.invoiceNumber}</TableCell>
                                <TableCell>{invoice.clientName}</TableCell>
                                <TableCell>{format(new Date(invoice.invoiceDate), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(invoice.preparationStatus)}</TableCell>
                                <TableCell className="text-center">
                                    <TooltipProvider>
                                        <div className="flex justify-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="icon" variant="ghost" onClick={() => {}}><Eye className="h-4 w-4"/></Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>Voir le Bon de Prélèvement</p></TooltipContent>
                                            </Tooltip>
                                            {invoice.preparationStatus === 'En attente' && 
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" onClick={() => handleAction(invoice.id, 'En préparation')}><PackageCheck className="h-4 w-4"/></Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Démarrer la préparation</p></TooltipContent>
                                                </Tooltip>
                                            }
                                            {invoice.preparationStatus === 'En préparation' && 
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => handleAction(invoice.id, 'Prête')}><CheckCircle className="h-4 w-4"/></Button>
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
