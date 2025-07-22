
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, PlusCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAtom } from 'jotai';
import { invoicesAtom, type InvoiceData } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type RetourStatus = 'En attente' | 'Reçu' | 'Traité';

type ReturnedItem = {
    description: string;
    quantiteRetournee: number;
}

type RetourItem = {
    id: string;
    retourNumero: string;
    expeditionId: string;
    blNumero: string;
    client: string;
    dateDemande: string;
    statut: RetourStatus;
    articles: ReturnedItem[];
};

const MOCK_RETOURS: RetourItem[] = [];
const ITEMS_PER_PAGE = 10;

export default function GestionRetoursPage() {
    const [retours, setRetours] = useState(MOCK_RETOURS);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingRetour, setViewingRetour] = useState<RetourItem | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(retours.length / ITEMS_PER_PAGE);
    const paginatedRetours = retours.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
        }
    };


    const getStatusBadge = (status: RetourStatus) => {
        switch (status) {
            case 'En attente': return <Badge variant="outline">En attente</Badge>;
            case 'Reçu': return <Badge className="bg-blue-100 text-blue-800">Reçu</Badge>;
            case 'Traité': return <Badge className="bg-green-100 text-green-800">Traité</Badge>;
        }
    };

    const handleSaveRetour = (newRetour: Omit<RetourItem, 'id' | 'retourNumero'>) => {
        const fullRetour: RetourItem = {
            id: `ret-${Date.now()}`,
            retourNumero: `RTN-${new Date().getFullYear()}-${String(retours.length + 1).padStart(3, '0')}`,
            ...newRetour
        }
        setRetours(prev => [...prev, fullRetour]);
        setIsCreateModalOpen(false);
    };

    return (
        <>
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Gestion des Retours</CardTitle>
                        <CardDescription>Gérez les retours de produits des clients.</CardDescription>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Enregistrer un retour</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Retour</TableHead>
                            <TableHead>N° BL Associé</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead className="text-center">Date Demande</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedRetours.map(retour => (
                            <TableRow key={retour.id} className="odd:bg-muted/50">
                                <TableCell>{retour.retourNumero}</TableCell>
                                <TableCell>{retour.blNumero}</TableCell>
                                <TableCell>{retour.client}</TableCell>
                                <TableCell className="text-center">{format(new Date(retour.dateDemande), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(retour.statut)}</TableCell>
                                <TableCell className="text-center">
                                    <Button size="icon" variant="ghost" onClick={() => { setViewingRetour(retour); setIsViewModalOpen(true);}}><Eye className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {retours.length === 0 && (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">Aucun retour enregistré pour le moment.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            {totalPages > 1 && (
                <CardFooter className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        Total de {retours.length} retours. Page {currentPage} sur {totalPages}.
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
        
        <CreateRetourModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            onSave={handleSaveRetour}
        />
        
        <ViewRetourModal 
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            retour={viewingRetour}
        />
        </>
    );
}

function CreateRetourModal({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (data: Omit<RetourItem, 'id' | 'retourNumero'>) => void; }) {
    const [invoices] = useAtom(invoicesAtom);
    const { toast } = useToast();
    const [selectedExpeditionId, setSelectedExpeditionId] = useState<string | undefined>();
    const [returnedItems, setReturnedItems] = useState<ReturnedItem[]>([]);
    
    const deliveredExpeditions = useMemo(() => {
        return invoices
            .filter(inv => inv.preparationStatus === 'Livrée')
            .flatMap(inv => (inv.expeditions || []).map(exp => ({ ...exp, clientName: inv.clientName })));
    }, [invoices]);

    const selectedExpedition = useMemo(() => {
        return deliveredExpeditions.find(exp => exp.id === selectedExpeditionId);
    }, [deliveredExpeditions, selectedExpeditionId]);
    
    React.useEffect(() => {
        if (selectedExpedition) {
            setReturnedItems(selectedExpedition.items.map(item => ({
                description: item.description,
                quantiteRetournee: 0,
            })));
        } else {
            setReturnedItems([]);
        }
    }, [selectedExpedition]);
    
    const handleQuantityChange = (description: string, quantity: number) => {
        const maxQty = selectedExpedition?.items.find(i => i.description === description)?.quantiteLivree || 0;
        const newQty = Math.max(0, Math.min(quantity, maxQty));
        setReturnedItems(items => items.map(item => item.description === description ? {...item, quantiteRetournee: newQty} : item));
    }
    
    const handleSubmit = () => {
        if (!selectedExpedition) {
            toast({ title: "Veuillez sélectionner une expédition.", variant: "destructive" });
            return;
        }
        const itemsToReturn = returnedItems.filter(i => i.quantiteRetournee > 0);
        if (itemsToReturn.length === 0) {
            toast({ title: "Veuillez saisir des quantités.", variant: "destructive" });
            return;
        }
        
        onSave({
            expeditionId: selectedExpedition.id,
            blNumero: selectedExpedition.numeroBonLivraison,
            client: selectedExpedition.clientName,
            dateDemande: new Date().toISOString().split('T')[0],
            statut: 'En attente',
            articles: itemsToReturn
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>Enregistrer un Retour Produit</DialogTitle><DialogDescription>Sélectionnez l'expédition concernée et saisissez les quantités retournées.</DialogDescription></DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label>Expédition concernée (BL)</Label>
                        <Select onValueChange={setSelectedExpeditionId}>
                            <SelectTrigger><SelectValue placeholder="Sélectionnez une livraison..."/></SelectTrigger>
                            <SelectContent>
                                {deliveredExpeditions.map(exp => (
                                    <SelectItem key={exp.id} value={exp.id}>
                                        {exp.numeroBonLivraison} - {exp.clientName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedExpedition && (
                        <div className="space-y-2">
                             <Label>Articles Retournés</Label>
                            <Table>
                                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-center">Qté Livrée</TableHead><TableHead className="w-40 text-center">Qté Retournée</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {returnedItems.map(item => (
                                        <TableRow key={item.description}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell className="text-center">{selectedExpedition.items.find(i=>i.description === item.description)?.quantiteLivree}</TableCell>
                                            <TableCell><Input type="number" value={item.quantiteRetournee} onChange={e => handleQuantityChange(item.description, parseInt(e.target.value) || 0)} className="text-center"/></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
                <DialogFooter><Button variant="outline" onClick={onClose}>Annuler</Button><Button onClick={handleSubmit} disabled={!selectedExpedition}>Enregistrer le retour</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ViewRetourModal({ isOpen, onClose, retour }: { isOpen: boolean; onClose: () => void; retour: RetourItem | null }) {
    if (!retour) return null;
    
    const handleDownload = () => {
         const doc = new jsPDF();
         doc.setFontSize(18);
         doc.text("Bon de Retour", 105, 20, { align: 'center' });
         doc.setFontSize(10);
         doc.text(`N° Retour: ${retour.retourNumero}`, 15, 30);
         doc.text(`Client: ${retour.client}`, 15, 36);
         doc.text(`BL d'origine: ${retour.blNumero}`, 15, 42);
         autoTable(doc, {
            head: [['Description', 'Quantité Retournée']],
            body: retour.articles.map(item => [item.description, item.quantiteRetournee]),
            startY: 50
         });
         doc.save(`Bon_Retour_${retour.retourNumero}.pdf`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Détail du Retour: {retour.retourNumero}</DialogTitle>
                    <DialogDescription>
                        Client: {retour.client} | Date: {format(new Date(retour.dateDemande), 'dd/MM/yyyy')} | Statut: <Badge>{retour.statut}</Badge>
                    </DialogDescription>
                </DialogHeader>
                 <Table>
                    <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Quantité Retournée</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {retour.articles.map((item, i) => (
                            <TableRow key={i}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">{item.quantiteRetournee}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4"/>Imprimer le Bon de Retour</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
