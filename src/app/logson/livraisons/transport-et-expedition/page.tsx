
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Truck, Download, Eye, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAtom } from 'jotai';
import { invoicesAtom, type InvoiceData, type PreparationStatus, type ExpeditedItem, type Expedition } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';

type InvoiceWithPreparation = InvoiceData & { preparedItems: ExpeditedItem[] };

export default function ExpeditionPage() {
    const [invoices, setInvoices] = useAtom(invoicesAtom);
    const { toast } = useToast();
    const [isShipModalOpen, setIsShipModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [shippingInvoice, setShippingInvoice] = useState<InvoiceWithPreparation | null>(null);
    const [viewingExpedition, setViewingExpedition] = useState<{ invoice: InvoiceData, expedition: Expedition } | null>(null);

    const readyForShipping = invoices.filter(inv => inv.preparationStatus === 'Prête' || inv.preparationStatus === 'En transit' || inv.preparationStatus === 'Partiellement expédiée');

    const handleOpenShippingModal = (invoice: InvoiceData) => {
        setShippingInvoice(invoice as InvoiceWithPreparation);
        setIsShipModalOpen(true);
    };

    const handleSaveExpedition = (invoiceId: string, expedition: Omit<Expedition, 'id' | 'numeroBonLivraison'>) => {
        setInvoices(prevInvoices => prevInvoices.map(inv => {
            if (inv.id !== invoiceId) return inv;

            const existingExpeditions = inv.expeditions || [];
            const newExpedition: Expedition = {
                id: `exp-${Date.now()}`,
                numeroBonLivraison: `BL-${inv.invoiceNumber}-${existingExpeditions.length + 1}`,
                ...expedition
            };
            
            const allPreparedItems = new Map(inv.preparedItems.map(item => [item.ligneCommandeId, item.quantiteAPreparer]));
            const allExpeditedItems = [...existingExpeditions, newExpedition]
                .flatMap(exp => exp.items)
                .reduce((acc, item) => {
                    acc.set(item.ligneCommandeId, (acc.get(item.ligneCommandeId) || 0) + item.quantiteLivree);
                    return acc;
                }, new Map<string, number>());
            
            let allItemsShipped = true;
            for(const [ligneId, qtyPrepared] of allPreparedItems.entries()) {
                if ((allExpeditedItems.get(ligneId) || 0) < qtyPrepared) {
                    allItemsShipped = false;
                    break;
                }
            }

            const newStatus: PreparationStatus = allItemsShipped ? 'En transit' : 'Partiellement expédiée';

            return {
                ...inv,
                preparationStatus: newStatus,
                expeditions: [...existingExpeditions, newExpedition]
            };
        }));

        toast({ title: 'Expédition Planifiée', description: 'La commande est maintenant en transit.' });
        setIsShipModalOpen(false);
    };
    
    const getStatusBadge = (status: PreparationStatus) => {
        switch (status) {
            case 'Prête': return <Badge className="bg-green-100 text-green-800">Prête</Badge>;
            case 'En transit': return <Badge variant="default">En transit</Badge>;
            case 'Partiellement expédiée': return <Badge variant="secondary">Partiellement expédiée</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
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
                                <TableHead className="text-center">Dernier N° BL</TableHead>
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
                                    <TableCell className="text-center font-mono text-xs">
                                        {inv.expeditions && inv.expeditions[inv.expeditions.length - 1]?.numeroBonLivraison}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenShippingModal(inv)}>
                                                <Truck className="mr-2 h-4 w-4" /> Planifier
                                            </Button>
                                             <Button size="icon" variant="ghost" onClick={() => setViewingExpedition({ invoice: inv, expedition: inv.expeditions![inv.expeditions!.length - 1] })} disabled={!inv.expeditions || inv.expeditions.length === 0}><Eye className="h-4 w-4" /></Button>
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

            <ShippingModal 
                isOpen={isShipModalOpen}
                onClose={() => setIsShipModalOpen(false)}
                invoice={shippingInvoice}
                onSave={handleSaveExpedition}
            />

            <ViewExpeditionModal
                isOpen={!!viewingExpedition}
                onClose={() => setViewingExpedition(null)}
                data={viewingExpedition}
            />
        </>
    );
}

function ShippingModal({ isOpen, onClose, invoice, onSave }: { isOpen: boolean, onClose: () => void, invoice: InvoiceWithPreparation | null, onSave: (invoiceId: string, expedition: Omit<Expedition, 'id' | 'numeroBonLivraison'>) => void }) {
    const [transporteur, setTransporteur] = useState('');
    const [dateLivraison, setDateLivraison] = useState('');
    const [lignesLivraison, setLignesLivraison] = useState<ExpeditedItem[]>([]);

    React.useEffect(() => {
        if (invoice) {
            const alreadyExpedited = invoice.expeditions?.flatMap(exp => exp.items).reduce((acc, item) => {
                acc.set(item.ligneCommandeId, (acc.get(item.ligneCommandeId) || 0) + item.quantiteLivree);
                return acc;
            }, new Map<string, number>()) || new Map();
            
            const remainingToShip = (invoice.preparedItems || []).map(item => ({
                ...item,
                quantiteLivree: Math.max(0, item.quantiteAPreparer - (alreadyExpedited.get(item.ligneCommandeId) || 0)),
            })).filter(item => item.quantiteLivree > 0);
            
            setLignesLivraison(remainingToShip);
            setTransporteur('');
            setDateLivraison(format(new Date(), 'yyyy-MM-dd'));
        }
    }, [invoice]);

    const handleQuantityChange = (ligneId: string, newQuantityStr: string) => {
        const newQuantity = parseInt(newQuantityStr) || 0;
        setLignesLivraison(prev => prev.map(ligne => {
            if (ligne.ligneCommandeId === ligneId) {
                 const originalPreparedQty = invoice?.preparedItems.find(i => i.ligneCommandeId === ligneId)?.quantiteAPreparer || 0;
                 return { ...ligne, quantiteLivree: Math.max(0, Math.min(newQuantity, originalPreparedQty)) };
            }
            return ligne;
        }));
    };

    const handleSubmit = () => {
        if (!invoice || !transporteur || !dateLivraison) return;
        onSave(invoice.id, {
            dateExpedition: new Date().toISOString().split('T')[0],
            dateLivraisonPrevue: dateLivraison,
            transporteur,
            items: lignesLivraison.filter(l => l.quantiteLivree > 0)
        });
    };

    if (!invoice) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Planifier l'Expédition pour Commande {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>Saisissez les informations de livraison et confirmez les quantités à expédier.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="transporteur">Transporteur</Label>
                            <Input id="transporteur" value={transporteur} onChange={e => setTransporteur(e.target.value)} placeholder="Ex: DHL, Chronopost..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateLivraison">Date de livraison prévue</Label>
                            <Input id="dateLivraison" type="date" value={dateLivraison} onChange={e => setDateLivraison(e.target.value)} />
                        </div>
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto p-1">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-center">Prêt à expédier</TableHead>
                                    <TableHead className="w-[150px] text-center">Quantité à livrer</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lignesLivraison.map(ligne => (
                                    <TableRow key={ligne.ligneCommandeId}>
                                        <TableCell>{ligne.description}</TableCell>
                                        <TableCell className="text-center">{ligne.quantiteLivree}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="text-center"
                                                value={ligne.quantiteLivree}
                                                onChange={(e) => handleQuantityChange(ligne.ligneCommandeId, e.target.value)}
                                                max={ligne.quantiteLivree}
                                                min="0"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit}>Confirmer l'expédition</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ViewExpeditionModal({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: { invoice: InvoiceData, expedition: Expedition } | null }) {
    if (!data) return null;
    const { invoice, expedition } = data;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                 <DialogHeader>
                    <DialogTitle>Détail du Bon de Livraison: {expedition.numeroBonLivraison}</DialogTitle>
                    <DialogDescription>
                       Pour commande {invoice.invoiceNumber} - Expédié le {format(new Date(expedition.dateExpedition), 'dd/MM/yyyy', {locale: fr})}
                    </DialogDescription>
                </DialogHeader>
                 <div className="max-h-[60vh] overflow-y-auto p-1">
                    <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description Article</TableHead>
                            <TableHead className="text-right">Quantité Livrée</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expedition.items.map(item => (
                                <TableRow key={item.ligneCommandeId}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{item.quantiteLivree}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                     <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
