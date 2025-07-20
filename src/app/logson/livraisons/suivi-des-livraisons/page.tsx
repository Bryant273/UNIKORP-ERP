
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Package, Clock, CheckCircle, PackageCheck, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAtom } from 'jotai';
import { invoicesAtom, type InvoiceData, type PreparationStatus, type Expedition } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type DeliveryItem = {
    invoiceId: string;
    invoiceNumber: string;
    clientName: string;
    expedition: Expedition;
};

export default function SuiviLivraisonsPage() {
    const [invoices, setInvoices] = useAtom(invoicesAtom);
    const [viewingDelivery, setViewingDelivery] = useState<DeliveryItem | null>(null);
    const { toast } = useToast();

    // Flatten the expeditions from all invoices into a single list
    const allDeliveries = useMemo(() => {
        return invoices.flatMap(inv => 
            (inv.expeditions || []).map(exp => ({
                invoiceId: inv.id,
                invoiceNumber: inv.invoiceNumber,
                clientName: inv.clientName,
                expedition: exp,
                status: inv.preparationStatus // Get the overall status from the invoice
            }))
        ).filter(d => d.status === 'En transit' || d.status === 'Livrée');
    }, [invoices]);

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
        <>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Suivi des Livraisons</CardTitle>
                    <CardDescription>Suivez l'état de vos livraisons en temps réel et consultez l'historique.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>N° BL</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Transporteur</TableHead>
                                <TableHead>Date d'expédition</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allDeliveries.map(delivery => (
                                <TableRow key={delivery.expedition.id}>
                                    <TableCell className="font-mono">{delivery.expedition.numeroBonLivraison}</TableCell>
                                    <TableCell>{delivery.clientName}</TableCell>
                                    <TableCell>{delivery.expedition.transporteur}</TableCell>
                                    <TableCell>{format(new Date(delivery.expedition.dateExpedition), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(delivery.status as PreparationStatus)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button size="icon" variant="ghost" onClick={() => setViewingDelivery(delivery)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleMarkAsDelivered(delivery.invoiceId)}
                                                disabled={delivery.status === 'Livrée'}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" /> Marquer comme livrée
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {allDeliveries.length === 0 && (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                            <p className="text-muted-foreground">Aucune livraison en cours de suivi.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <DeliveryDetailsModal 
                isOpen={!!viewingDelivery}
                onClose={() => setViewingDelivery(null)}
                deliveryItem={viewingDelivery}
            />
        </>
    );
}

function DeliveryDetailsModal({ isOpen, onClose, deliveryItem }: { isOpen: boolean; onClose: () => void; deliveryItem: DeliveryItem | null }) {
    if (!deliveryItem) return null;

    const { expedition, clientName, invoiceNumber } = deliveryItem;

    const handleDownloadPDF = () => {
        // This is a placeholder function. In a real app, you would generate the specific PDF.
        alert(`Téléchargement du BL ${expedition.numeroBonLivraison}`);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Détails du Bon de Livraison: {expedition.numeroBonLivraison}</DialogTitle>
                    <DialogDescription>
                        Commande {invoiceNumber} pour le client {clientName}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p><strong>Transporteur:</strong> {expedition.transporteur}</p>
                    <p><strong>Date d'expédition:</strong> {format(new Date(expedition.dateExpedition), 'dd MMMM yyyy', { locale: fr })}</p>
                    <p><strong>Date de livraison prévue:</strong> {format(new Date(expedition.dateLivraisonPrevue), 'dd MMMM yyyy', { locale: fr })}</p>
                    <h4 className="font-semibold">Articles Inclus:</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Quantité Livrée</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expedition.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{item.quantiteLivree}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={handleDownloadPDF}><Download className="mr-2 h-4 w-4" /> Télécharger le BL</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

