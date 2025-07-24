
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
import { invoicesAtom, transporteursAtom, produitsAtom, mouvementsAtom, type InvoiceData, type PreparationStatus, type ExpeditedItem, type Expedition } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type InvoiceWithPreparation = InvoiceData & { preparedItems: ExpeditedItem[] };
const ITEMS_PER_PAGE = 10;

export default function ExpeditionPage() {
    const [invoices, setInvoices] = useAtom(invoicesAtom);
    const [, setProduits] = useAtom(produitsAtom);
    const [, setMouvements] = useAtom(mouvementsAtom);
    const { toast } = useToast();
    const [isShipModalOpen, setIsShipModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [shippingInvoice, setShippingInvoice] = useState<InvoiceWithPreparation | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<InvoiceData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const invoicesWithStatus = invoices.filter(inv => inv.preparationStatus !== 'En attente');
    
    const totalPages = Math.ceil(invoicesWithStatus.length / ITEMS_PER_PAGE);
    const paginatedInvoices = invoicesWithStatus.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
        }
    };

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
                numeroBonLivraison: `BL-${inv.invoiceNumber.split('-').pop()}-${existingExpeditions.length + 1}`,
                ...expedition
            };
            
            // Update stock and movements
            setProduits(prevProduits => {
                const updatedProduits = [...prevProduits];
                const newMouvements = [];

                for(const item of newExpedition.items) {
                    const preparedItem = inv.preparedItems.find(p => p.ligneCommandeId === item.ligneCommandeId);
                    if (preparedItem) {
                        const product = prevProduits.find(p => p.name === preparedItem.description);
                        if(product) {
                            const productIndex = updatedProduits.findIndex(p => p.id === product.id);
                            if (productIndex > -1) {
                                updatedProduits[productIndex] = { ...product, stock: product.stock - item.quantiteLivree };
                                newMouvements.push({
                                    id: `mvt-${Date.now()}-${product.id}`,
                                    date: new Date().toISOString(),
                                    produitId: product.id,
                                    type: 'Sortie' as const,
                                    quantite: item.quantiteLivree,
                                    document: newExpedition.numeroBonLivraison,
                                    entrepotSourceId: product.entrepotId,
                                });
                            }
                        }
                    }
                }
                setMouvements(prevMouvements => [...prevMouvements, ...newMouvements]);
                return updatedProduits;
            });


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
                            {paginatedInvoices.map(inv => (
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
                                            { (inv.preparationStatus === 'Prête' || inv.preparationStatus === 'Partiellement expédiée') &&
                                                <Button size="sm" variant="outline" onClick={() => handleOpenShippingModal(inv)}>
                                                    <Truck className="mr-2 h-4 w-4" /> Planifier
                                                </Button>
                                            }
                                             {inv.expeditions && inv.expeditions.length > 0 && 
                                                <Button size="icon" variant="ghost" onClick={() => { setViewingInvoice(inv); setIsViewModalOpen(true); }}><Eye className="h-4 w-4" /></Button>
                                             }
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {invoices.filter(inv => inv.preparationStatus !== 'En attente').length === 0 && (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                            <p className="text-muted-foreground">Aucune commande n'est prête pour l'expédition.</p>
                        </div>
                    )}
                </CardContent>
                {totalPages > 1 && (
                     <CardFooter className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                            Total de {invoicesWithStatus.length} commandes. Page {currentPage} sur {totalPages}.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Suivant
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            <ShippingModal 
                isOpen={isShipModalOpen}
                onClose={() => setIsShipModalOpen(false)}
                invoice={shippingInvoice}
                onSave={handleSaveExpedition}
            />

            <ViewExpeditionsModal
                isOpen={isViewModalOpen}
                onClose={() => setViewingInvoice(null)}
                invoice={viewingInvoice}
            />
        </>
    );
}

function ShippingModal({ isOpen, onClose, invoice, onSave }: { isOpen: boolean, onClose: () => void, invoice: InvoiceWithPreparation | null, onSave: (invoiceId: string, expedition: Omit<Expedition, 'id' | 'numeroBonLivraison'>) => void }) {
    const [transporteurs] = useAtom(transporteursAtom);
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
            
            setLignesLivraison(remainingToShip.map(item => ({
                ligneCommandeId: item.ligneCommandeId,
                description: item.description,
                quantiteLivree: item.quantiteLivree
            })));

            setTransporteur('');
            setDateLivraison(format(new Date(), 'yyyy-MM-dd'));
        }
    }, [invoice]);

    const handleQuantityChange = (ligneId: string, newQuantityStr: string) => {
        const newQuantity = parseInt(newQuantityStr) || 0;
        setLignesLivraison(prev => prev.map(ligne => {
            if (ligne.ligneCommandeId === ligneId) {
                 const originalPreparedItem = invoice?.preparedItems.find(i => i.ligneCommandeId === ligneId);
                 if (originalPreparedItem) {
                     const alreadyExpeditedQty = invoice.expeditions?.flatMap(e => e.items).filter(i => i.ligneCommandeId === ligneId).reduce((sum, i) => sum + i.quantiteLivree, 0) || 0;
                     const maxQty = originalPreparedItem.quantiteAPreparer - alreadyExpeditedQty;
                     return { ...ligne, quantiteLivree: Math.max(0, Math.min(newQuantity, maxQty)) };
                 }
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
                            <Select onValueChange={setTransporteur} value={transporteur}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un transporteur..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {transporteurs.map(t => (
                                        <SelectItem key={t.id} value={t.intitule}>{t.intitule}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                {lignesLivraison.map(ligne => {
                                    const originalPreparedItem = invoice?.preparedItems.find(i => i.ligneCommandeId === ligne.ligneCommandeId);
                                     const alreadyExpeditedQty = invoice.expeditions?.flatMap(e => e.items).filter(i => i.ligneCommandeId === ligne.ligneCommandeId).reduce((sum, i) => sum + i.quantiteLivree, 0) || 0;
                                     const maxQty = (originalPreparedItem?.quantiteAPreparer || 0) - alreadyExpeditedQty;
                                    return(
                                    <TableRow key={ligne.ligneCommandeId}>
                                        <TableCell>{ligne.description}</TableCell>
                                        <TableCell className="text-center">{maxQty}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="text-center"
                                                value={ligne.quantiteLivree}
                                                onChange={(e) => handleQuantityChange(ligne.ligneCommandeId, e.target.value)}
                                                max={maxQty}
                                                min="0"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )})}
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

function ViewExpeditionsModal({ isOpen, onClose, invoice }: { isOpen: boolean, onClose: () => void, invoice: InvoiceData | null }) {
    if (!invoice) return null;

    const handleDownloadPDF = (expedition: Expedition) => {
        const doc = new jsPDF();
        
        const companyName = "UNIKORP S.A.";
        const companyAddress = "Cocody Angré, Abidjan";
        const companyReg = "CI-ABJ-01-XXXX";
        const printDate = format(new Date(), "dd/MM/yyyy 'à' HH:mm:ss");

        autoTable(doc, {
             didDrawPage: (data) => {
                doc.setFontSize(22);
                doc.setFont('helvetica', 'bold');
                doc.text("BON DE LIVRAISON", 105, 20, { align: 'center' });
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(companyName, 20, 40);
                doc.text(companyAddress, 20, 45);
                doc.text(companyReg, 20, 50);

                doc.setFontSize(12);
                doc.text(`Client:`, 130, 40);
                doc.setFont('helvetica', 'bold');
                doc.text(invoice.clientName, 130, 45);

                doc.text(`N° Commande Client: ${invoice.invoiceNumber}`, 20, 60);
                doc.text(`N° Bon de Livraison: ${expedition.numeroBonLivraison}`, 20, 66);
                doc.text(`Date de livraison prévue: ${format(new Date(expedition.dateLivraisonPrevue), 'dd/MM/yyyy')}`, 130, 60);
                doc.text(`Transporteur: ${expedition.transporteur}`, 130, 66);
             },
             margin: { top: 75 },
        });

        // Section 1: Commande
        autoTable(doc, {
            head: [['1. Récapitulatif Commande']],
            body: [['Description', 'Quantité Commandée']],
            startY: 75,
            theme: 'striped',
            headStyles: { fillColor: '#1e3a8a' },
            didParseCell: (data) => { if(data.row.index === 0 && data.section === 'body') data.cell.styles.fontStyle = 'bold'; }
        });
        autoTable(doc, {
            body: invoice.lineItems.map(l => [l.description, l.quantity]),
            startY: (doc as any).lastAutoTable.finalY,
            theme: 'grid',
        });

        // Section 2: Cette Livraison
        autoTable(doc, {
            head: [['2. Détail de cette Livraison']],
            body: [['Description', 'Quantité Livrée']],
            startY: (doc as any).lastAutoTable.finalY + 10,
            theme: 'striped',
            headStyles: { fillColor: '#166534' },
            didParseCell: (data) => { if(data.row.index === 0 && data.section === 'body') data.cell.styles.fontStyle = 'bold'; }
        });
        autoTable(doc, {
            body: expedition.items.map(item => [item.description, item.quantiteLivree]),
            startY: (doc as any).lastAutoTable.finalY,
            theme: 'grid'
        });

        // Section 3: Solde à livrer
        const allExpeditedItems = (invoice.expeditions || [])
            .filter(e => new Date(e.dateExpedition) <= new Date(expedition.dateExpedition))
            .flatMap(e => e.items)
            .reduce((acc, item) => {
                acc.set(item.ligneCommandeId, (acc.get(item.ligneCommandeId) || 0) + item.quantiteLivree);
                return acc;
            }, new Map<string, number>());
        
        const balanceItems = invoice.lineItems.map(cmdLine => ({
            description: cmdLine.description,
            solde: cmdLine.quantity - (allExpeditedItems.get(cmdLine.id) || 0)
        })).filter(b => b.solde > 0);
        
        if (balanceItems.length > 0) {
            autoTable(doc, {
                head: [['3. Solde à livrer après cette expédition']],
                body: [['Description', 'Quantité Restante']],
                startY: (doc as any).lastAutoTable.finalY + 10,
                theme: 'striped',
                headStyles: { fillColor: '#f59e0b' },
                didParseCell: (data) => { if(data.row.index === 0 && data.section === 'body') data.cell.styles.fontStyle = 'bold'; }
            });
            autoTable(doc, {
                body: balanceItems.map(l => [l.description, l.solde]),
                startY: (doc as any).lastAutoTable.finalY,
                theme: 'grid'
            });
        }
        
        // Footer
        let footerY = doc.internal.pageSize.getHeight() - 40;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Cachet & Signature du Client", 105, footerY, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(75, footerY - 5, 135, footerY - 5);

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Document imprimé le ${format(new Date(), "dd/MM/yyyy 'à' HH:mm:ss")} via UNIKORP ®`, 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });


        doc.save(`BL_${expedition.numeroBonLivraison}.pdf`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>Historique des Expéditions pour Commande {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription>
                       Consultez tous les bons de livraison émis pour cette commande.
                    </DialogDescription>
                </DialogHeader>
                 <ScrollArea className="max-h-[60vh] my-4 pr-6">
                    <div className="space-y-4">
                        {(invoice.expeditions || []).map(expedition => (
                            <Card key={expedition.id}>
                                <CardHeader className="flex flex-row items-center justify-between p-4">
                                    <div>
                                        <CardTitle className="text-lg">{expedition.numeroBonLivraison}</CardTitle>
                                        <CardDescription>Expédié le {format(new Date(expedition.dateExpedition), 'dd/MM/yyyy', { locale: fr })} via {expedition.transporteur}</CardDescription>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleDownloadPDF(expedition)}>
                                        <Download className="mr-2 h-4 w-4" /> Imprimer ce bon
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                     <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
