
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, PackageCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAtom } from 'jotai';
import { invoicesAtom, produitsAtom, type InvoiceData, type PreparationStatus, type LineItem } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

type LignePreparation = {
    ligneCommandeId: string;
    description: string;
    quantiteCommandee: number;
    quantiteEnStock: number;
    quantiteALivrer: number;
};

export default function PreparationCommandesPage() {
    const [invoices, setInvoices] = useAtom(invoicesAtom);
    const { toast } = useToast();
    
    const [viewingInvoice, setViewingInvoice] = useState<InvoiceData | null>(null);
    const [preparingInvoice, setPreparingInvoice] = useState<InvoiceData | null>(null);

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
        <>
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
                                    <div className="flex justify-center gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => setViewingInvoice(invoice)}><Eye className="h-4 w-4"/></Button>
                                        {invoice.preparationStatus === 'En attente' && 
                                            <Button size="icon" variant="ghost" onClick={() => setPreparingInvoice(invoice)}><PackageCheck className="h-4 w-4"/></Button>
                                        }
                                        {invoice.preparationStatus === 'En préparation' && 
                                            <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => handleAction(invoice.id, 'Prête')}><CheckCircle className="h-4 w-4"/></Button>
                                        }
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <PreparationDetailsModal
            isOpen={!!viewingInvoice}
            onClose={() => setViewingInvoice(null)}
            invoice={viewingInvoice}
        />
        
        <PreparationSaisieModal
            isOpen={!!preparingInvoice}
            onClose={() => setPreparingInvoice(null)}
            invoice={preparingInvoice}
            onSave={(invoiceId) => {
                handleAction(invoiceId, 'En préparation');
                setPreparingInvoice(null);
            }}
        />
        </>
    );
}

function PreparationDetailsModal({ isOpen, onClose, invoice }: { isOpen: boolean, onClose: () => void, invoice: InvoiceData | null }) {
    if (!invoice) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Bon de Prélèvement pour Commande {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>
                        Client: {invoice.clientName} - Préparez les articles ci-dessous.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1">
                    <Table>
                        <TableHeader><TableRow><TableHead>Description Article</TableHead><TableHead className="text-right">Quantité à Prélever</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {invoice.lineItems.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
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

function PreparationSaisieModal({ isOpen, onClose, invoice, onSave }: { isOpen: boolean, onClose: () => void, invoice: InvoiceData | null, onSave: (invoiceId: string) => void }) {
    const [produits] = useAtom(produitsAtom);
    const [lignesPreparation, setLignesPreparation] = useState<LignePreparation[]>([]);

    React.useEffect(() => {
        if (invoice) {
            setLignesPreparation(invoice.lineItems.map(item => {
                const produit = produits.find(p => p.name === item.description); // Assumption: description matches product name
                return {
                    ligneCommandeId: item.id,
                    description: item.description,
                    quantiteCommandee: item.quantity,
                    quantiteEnStock: produit?.stock || 0,
                    quantiteALivrer: 0
                }
            }));
        }
    }, [invoice, produits]);
    
    const handleQuantityChange = (ligneId: string, newQuantity: number) => {
        setLignesPreparation(prev => prev.map(ligne => {
            if (ligne.ligneCommandeId === ligneId) {
                const quantiteMax = Math.min(ligne.quantiteCommandee, ligne.quantiteEnStock);
                return { ...ligne, quantiteALivrer: Math.max(0, Math.min(newQuantity, quantiteMax)) };
            }
            return ligne;
        }));
    };

    if (!invoice) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Préparation de la Livraison - Commande {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>Vérifiez les stocks et saisissez les quantités à livrer.</DialogDescription>
                </DialogHeader>
                 <div className="max-h-[60vh] overflow-y-auto p-1">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Commandé</TableHead>
                                <TableHead className="text-center">En Stock</TableHead>
                                <TableHead className="w-[150px] text-center">À Livrer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lignesPreparation.map(ligne => (
                                <TableRow key={ligne.ligneCommandeId}>
                                    <TableCell>{ligne.description}</TableCell>
                                    <TableCell className="text-center">{ligne.quantiteCommandee}</TableCell>
                                    <TableCell className="text-center">{ligne.quantiteEnStock}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            className="text-center"
                                            value={ligne.quantiteALivrer}
                                            onChange={(e) => handleQuantityChange(ligne.ligneCommandeId, parseInt(e.target.value) || 0)}
                                            max={Math.min(ligne.quantiteCommandee, ligne.quantiteEnStock)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={() => onSave(invoice.id)}>Confirmer la Préparation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
