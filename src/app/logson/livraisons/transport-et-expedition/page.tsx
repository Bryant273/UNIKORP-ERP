
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Truck, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAtom } from 'jotai';
import { invoicesAtom, type PreparationStatus } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function ExpeditionPage() {
    const [invoices, setInvoices] = useAtom(invoicesAtom);
    const { toast } = useToast();

    const readyForShipping = invoices.filter(inv => inv.preparationStatus === 'Prête' || inv.preparationStatus === 'En transit');

    const handlePlanShipping = (invoiceId: string) => {
        setInvoices(invoices.map(inv => 
            inv.id === invoiceId ? { ...inv, preparationStatus: 'En transit' } : inv
        ));
        toast({ title: 'Expédition Planifiée', description: 'La commande est maintenant en transit.' });
    };
    
    const getStatusBadge = (status: PreparationStatus) => {
        switch (status) {
            case 'Prête': return <Badge className="bg-green-100 text-green-800">Prête</Badge>;
            case 'En transit': return <Badge variant="default">En transit</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Expéditions</CardTitle>
                        <CardDescription>Gérez les expéditions de vos commandes prêtes.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Commande</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date Commande</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {readyForShipping.map(inv => (
                            <TableRow key={inv.id}>
                                <TableCell>{inv.invoiceNumber}</TableCell>
                                <TableCell>{inv.clientName}</TableCell>
                                <TableCell>{format(new Date(inv.invoiceDate), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(inv.preparationStatus)}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handlePlanShipping(inv.id)}
                                            disabled={inv.preparationStatus === 'En transit'}
                                        >
                                            <Truck className="mr-2 h-4 w-4" /> Planifier
                                        </Button>
                                         <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {readyForShipping.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                        <p className="text-muted-foreground">Aucune commande n'est prête pour l'expédition.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
