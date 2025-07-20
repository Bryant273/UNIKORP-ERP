
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Package, Clock, CheckCircle, PackageCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAtom } from 'jotai';
import { invoicesAtom, type PreparationStatus } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

type DeliveryStatus = 'En transit' | 'Au dépôt' | 'En livraison' | 'Livrée';

export default function SuiviLivraisonsPage() {
    const [invoices, setInvoices] = useAtom(invoicesAtom);
    const { toast } = useToast();

    // We consider 'En transit' or 'Livrée' for this page
    const deliveries = invoices.filter(inv => inv.preparationStatus === 'En transit' || inv.preparationStatus === 'Livrée');

    const handleMarkAsDelivered = (invoiceId: string) => {
        setInvoices(invoices.map(inv => 
            inv.id === invoiceId ? { ...inv, preparationStatus: 'Livrée' } : inv
        ));
        toast({ title: 'Livraison Terminée', description: 'La commande a été marquée comme livrée.', className: 'bg-green-100 text-green-800' });
    };

    const getStatusBadge = (status: PreparationStatus) => {
        switch (status) {
            case 'En transit': return <Badge variant="default"><Truck className="mr-2 h-4 w-4" />En transit</Badge>;
            case 'Livrée': return <Badge className="bg-green-100 text-green-800"><PackageCheck className="mr-2 h-4 w-4" />Livrée</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Suivi des Livraisons</CardTitle>
                <CardDescription>Suivez l'état de vos livraisons en temps réel et consultez l'historique.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Commande</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Transporteur (Simulé)</TableHead>
                            <TableHead>Dernier BL</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deliveries.map(inv => (
                            <TableRow key={inv.id}>
                                <TableCell>{inv.invoiceNumber}</TableCell>
                                <TableCell>{inv.clientName}</TableCell>
                                <TableCell>{inv.expeditions?.[inv.expeditions.length - 1]?.transporteur || 'N/A'}</TableCell>
                                <TableCell className="font-mono text-xs">{inv.expeditions?.[inv.expeditions.length - 1]?.numeroBonLivraison}</TableCell>
                                <TableCell className="text-center">
                                    {getStatusBadge(inv.preparationStatus as PreparationStatus)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleMarkAsDelivered(inv.id)}
                                        disabled={inv.preparationStatus === 'Livrée'}
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Marquer comme livrée
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {deliveries.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                        <p className="text-muted-foreground">Aucune livraison en cours de suivi.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
