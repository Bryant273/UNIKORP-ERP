
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
import { invoicesAtom, produitsAtom, type InvoiceData, type PreparationStatus, type PreparedItem } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

type InvoiceWithPreparation = InvoiceData & { preparedItems?: PreparedItem[] };

export default function PreparationCommandesPage() {
    const [invoices, setInvoices] = useAtom(invoicesAtom);
    const { toast } = useToast();
    
    const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithPreparation | null>(null);
    const [preparingInvoice, setPreparingInvoice] = useState<InvoiceWithPreparation | null>(null);

    const getStatusBadge = (status: PreparationStatus) => {
        switch (status) {
            case 'En attente': return <Badge variant="outline">En attente</Badge>;
            case 'En préparation': return <Badge className="bg-yellow-100 text-yellow-800">En préparation</Badge>;
            case 'Prête': return <Badge className="bg-green-100 text-green-800">Prête pour expédition</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleMarkAsReady = (invoiceId: string) => {
        setInvoices(invoices.map(inv => 
            inv.id === invoiceId ? { ...inv, preparationStatus: 'Prête' } : inv
        ));
        toast({ title: 'Statut mis à jour', description: `La commande est maintenant "Prête pour expédition".`});
    };
    
    const handleSavePreparation = (invoiceId: string, preparedItems: PreparedItem[]) => {
        setInvoices(invoices.map(inv => 
            inv.id === invoiceId 
            ? { ...inv, preparationStatus: 'En préparation', preparedItems: preparedItems.filter(p => p.quantiteAPreparer > 0) } 
            : inv
        ));
        toast({ title: 'Préparation enregistrée', description: 'La commande est passée "En préparation".'});
        setPreparingInvoice(null);
    }

    return (
        <>
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Commandes Clients</CardTitle>
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
                                        <Button size="icon" variant="ghost" onClick={() => setViewingInvoice(invoice as InvoiceWithPreparation)} disabled={invoice.preparationStatus === 'En attente'}>
                                            <Eye className="h-4 w-4"/>
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => setPreparingInvoice(invoice as InvoiceWithPreparation)} disabled={invoice.preparationStatus !== 'En attente'}>
                                            <PackageCheck className="h-4 w-4"/>
                                        </Button>
                                        {invoice.preparationStatus === 'En préparation' && 
                                            <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => handleMarkAsReady(invoice.id)}>
                                                <CheckCircle className="h-4 w-4"/>
                                            </Button>
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
            onSave={handleSavePreparation}
        />
        </>
    );
}

function PreparationDetailsModal({ isOpen, onClose, invoice }: { isOpen: boolean, onClose: () => void, invoice: InvoiceWithPreparation | null }) {
    if (!invoice) return null;
    
    // Show prepared items if they exist, otherwise fallback to original line items
    const itemsToShow = invoice.preparedItems && invoice.preparedItems.length > 0
        ? invoice.preparedItems.map(item => ({...item, quantiteALivrer: item.quantiteAPreparer}))
        : invoice.lineItems.map(item => ({ ...item, quantiteALivrer: item.quantity, ligneCommandeId: item.id }));
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Bon de Prélèvement pour Commande {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>
                        Client: {invoice.clientName} - Prélevez les articles et quantités ci-dessous.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-1">
                    <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description Article</TableHead>
                            <TableHead className="text-right">Quantité à Prélever</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                            {itemsToShow.map(item => (
                                <TableRow key={item.ligneCommandeId || item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{item.quantiteALivrer || item.quantity}</TableCell>
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

function PreparationSaisieModal({ isOpen, onClose, invoice, onSave }: { isOpen: boolean, onClose: () => void, invoice: InvoiceData | null, onSave: (invoiceId: string, preparedItems: PreparedItem[]) => void }) {
    const [produits] = useAtom(produitsAtom);
    const [lignesPreparation, setLignesPreparation] = useState<PreparedItem[]>([]);

    React.useEffect(() => {
        if (invoice) {
            setLignesPreparation(invoice.lineItems.map(item => {
                const produit = produits.find(p => p.name === item.description);
                return {
                    ligneCommandeId: item.id,
                    description: item.description,
                    quantiteCommandee: item.quantity,
                    quantiteEnStock: produit?.stock || 0,
                    quantiteAPreparer: 0
                }
            }));
        }
    }, [invoice, produits]);
    
    const handleQuantityChange = (ligneId: string, newQuantityStr: string) => {
        const newQuantity = parseInt(newQuantityStr) || 0;
        setLignesPreparation(prev => prev.map(ligne => {
            if (ligne.ligneCommandeId === ligneId) {
                const quantiteMax = Math.min(ligne.quantiteCommandee, ligne.quantiteEnStock);
                return { ...ligne, quantiteAPreparer: Math.max(0, Math.min(newQuantity, quantiteMax)) };
            }
            return ligne;
        }));
    };

    if (!invoice) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
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
                                <TableHead className="w-[150px] text-center">À Préparer</TableHead>
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
                                            value={ligne.quantiteAPreparer}
                                            onChange={(e) => handleQuantityChange(ligne.ligneCommandeId, e.target.value)}
                                            max={Math.min(ligne.quantiteCommandee, ligne.quantiteEnStock)}
                                            min="0"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={() => onSave(invoice.id, lignesPreparation)}>Confirmer la Préparation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
