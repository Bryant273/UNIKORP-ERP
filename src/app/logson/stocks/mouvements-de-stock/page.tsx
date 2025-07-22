
'use client';

import React, { useState, useMemo } from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown, Repeat, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { produitsAtom, entrepotsAtom, mouvementsAtom, type Mouvement, type MouvementType } from '@/lib/store';

const ITEMS_PER_PAGE = 10;

export default function MouvementsDeStockPage() {
    const [mouvements, setMouvements] = useAtom(mouvementsAtom);
    const [produits, setProduits] = useAtom(produitsAtom);
    const [entrepots] = useAtom(entrepotsAtom);
    const { toast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = Math.ceil(mouvements.length / ITEMS_PER_PAGE);
    const paginatedMouvements = useMemo(() => {
        return [...mouvements]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [mouvements, currentPage]);


    const handleSaveMouvement = (newMouvementData: Omit<Mouvement, 'id' | 'date'>) => {
        const newMouvement: Mouvement = {
            id: `mvt-${Date.now()}`,
            date: new Date().toISOString(),
            ...newMouvementData
        };

        // Update stock
        setProduits(prevProduits => prevProduits.map(p => {
            if (p.id === newMouvement.produitId) {
                let newStock = p.stock;
                if (newMouvement.type === 'Entrée') newStock += newMouvement.quantite;
                if (newMouvement.type === 'Sortie') newStock -= newMouvement.quantite;
                // For a transfer, the global stock doesn't change, only location.
                return { ...p, stock: newStock };
            }
            return p;
        }));
        
        setMouvements(prev => [newMouvement, ...prev]);
        toast({ title: 'Mouvement enregistré', description: `Le stock du produit a été mis à jour.` });
        setIsModalOpen(false);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getTypeBadge = (type: MouvementType) => {
        switch (type) {
            case 'Entrée': return <Badge className="bg-green-100 text-green-800"><ArrowUp className="mr-1 h-3 w-3"/>Entrée</Badge>;
            case 'Sortie': return <Badge className="bg-red-100 text-red-800"><ArrowDown className="mr-1 h-3 w-3"/>Sortie</Badge>;
            case 'Transfert': return <Badge className="bg-blue-100 text-blue-800"><Repeat className="mr-1 h-3 w-3"/>Transfert</Badge>;
        }
    };

    const getEntrepotDescription = (mvt: Mouvement) => {
        if (mvt.type === 'Transfert') {
            const source = entrepots.find(e => e.id === mvt.entrepotSourceId)?.nom || 'N/A';
            const dest = entrepots.find(e => e.id === mvt.entrepotDestId)?.nom || 'N/A';
            return `${source} → ${dest}`;
        }
        if (mvt.type === 'Entrée') {
            return entrepots.find(e => e.id === mvt.entrepotDestId)?.nom || 'N/A';
        }
        if (mvt.type === 'Sortie') {
             return entrepots.find(e => e.id === mvt.entrepotSourceId)?.nom || 'N/A';
        }
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Mouvements de Stock</CardTitle>
                            <CardDescription>Consultez et enregistrez les entrées, sorties et transferts de stock.</CardDescription>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}>
                           <PlusCircle className="mr-2 h-4 w-4"/> Enregistrer un mouvement
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Heure</TableHead>
                                <TableHead>Produit</TableHead>
                                <TableHead>Document</TableHead>
                                <TableHead className="text-center">Type</TableHead>
                                <TableHead className="text-center">Quantité</TableHead>
                                <TableHead>Entrepôt(s)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedMouvements.map(mvt => (
                                <TableRow key={mvt.id} className="odd:bg-muted/50">
                                    <TableCell>{format(new Date(mvt.date), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                                    <TableCell className="font-medium">{produits.find(p => p.id === mvt.produitId)?.name}</TableCell>
                                    <TableCell>{mvt.document}</TableCell>
                                    <TableCell className="text-center">{getTypeBadge(mvt.type)}</TableCell>
                                    <TableCell className="text-center">{mvt.quantite}</TableCell>
                                    <TableCell>{getEntrepotDescription(mvt)}</TableCell>
                                </TableRow>
                            ))}
                            {mouvements.length === 0 && (
                               <TableRow><TableCell colSpan={6} className="h-24 text-center">Aucun mouvement de stock enregistré.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 {mouvements.length > 0 &&
                    <CardFooter className="flex items-center justify-between pt-6">
                      <div className="text-sm text-muted-foreground">
                        Total de {mouvements.length} mouvements. Page {currentPage} sur {totalPages}.
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
                 }
            </Card>

            <MouvementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveMouvement} />
        </>
    );
}

function MouvementModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: Omit<Mouvement, 'id' | 'date'>) => void }) {
    const [produits] = useAtom(produitsAtom);
    const [entrepots] = useAtom(entrepotsAtom);
    const { toast } = useToast();
    
    const [type, setType] = useState<MouvementType>('Sortie');
    const [produitId, setProduitId] = useState<string | undefined>();
    const [quantite, setQuantite] = useState<number>(1);
    const [document, setDocument] = useState('');
    const [entrepotSourceId, setEntrepotSourceId] = useState<string | undefined>();
    const [entrepotDestId, setEntrepotDestId] = useState<string | undefined>();

    const selectedProduit = useMemo(() => produits.find(p => p.id === Number(produitId)), [produits, produitId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!produitId || !type) {
             toast({ title: 'Champs manquants', description: 'Veuillez sélectionner un produit et un type.', variant: 'destructive'});
             return;
        }
        
        if (type === 'Sortie' || type === 'Transfert') {
            if (!entrepotSourceId) {
                toast({ title: 'Champs manquants', description: 'Veuillez sélectionner un entrepôt source.', variant: 'destructive'});
                return;
            }
            if (quantite > (selectedProduit?.stock || 0)) {
                toast({ title: 'Stock insuffisant', description: `Le stock pour ${selectedProduit?.name} est de ${selectedProduit?.stock}.`, variant: 'destructive'});
                return;
            }
        }
        
        if (type === 'Entrée' || type === 'Transfert') {
            if (!entrepotDestId) {
                toast({ title: 'Champs manquants', description: 'Veuillez sélectionner un entrepôt de destination.', variant: 'destructive'});
                return;
            }
        }
        
        onSave({ 
            produitId: Number(produitId), 
            type, 
            quantite, 
            document, 
            entrepotSourceId: type !== 'Entrée' ? Number(entrepotSourceId) : undefined, 
            entrepotDestId: type !== 'Sortie' ? Number(entrepotDestId) : undefined,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Enregistrer un Mouvement de Stock</DialogTitle>
                        <DialogDescription>Saisissez les détails du mouvement.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Produit</Label>
                            <Select onValueChange={setProduitId}>
                                <SelectTrigger><SelectValue placeholder="Sélectionnez un produit..."/></SelectTrigger>
                                <SelectContent>
                                    {produits.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Stock: {p.stock})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type de mouvement</Label>
                                <Select value={type} onValueChange={(v: MouvementType) => setType(v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Entrée">Entrée</SelectItem>
                                        <SelectItem value="Sortie">Sortie</SelectItem>
                                        <SelectItem value="Transfert">Transfert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Quantité</Label>
                                <Input type="number" value={quantite} onChange={e => setQuantite(Number(e.target.value))} min="1" />
                            </div>
                        </div>

                        {type === 'Transfert' && (
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>De l'entrepôt (Source)</Label><Select onValueChange={setEntrepotSourceId}><SelectTrigger><SelectValue placeholder="Sélectionnez..."/></SelectTrigger><SelectContent>{entrepots.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.nom}</SelectItem>)}</SelectContent></Select></div>
                                <div className="space-y-2"><Label>Vers l'entrepôt (Dest.)</Label><Select onValueChange={setEntrepotDestId}><SelectTrigger><SelectValue placeholder="Sélectionnez..."/></SelectTrigger><SelectContent>{entrepots.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.nom}</SelectItem>)}</SelectContent></Select></div>
                            </div>
                        )}
                        {type === 'Entrée' && <div className="space-y-2"><Label>Entrepôt de destination</Label><Select onValueChange={setEntrepotDestId}><SelectTrigger><SelectValue placeholder="Sélectionnez..."/></SelectTrigger><SelectContent>{entrepots.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.nom}</SelectItem>)}</SelectContent></Select></div>}
                        {type === 'Sortie' && <div className="space-y-2"><Label>Entrepôt source</Label><Select onValueChange={setEntrepotSourceId}><SelectTrigger><SelectValue placeholder="Sélectionnez..."/></SelectTrigger><SelectContent>{entrepots.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.nom}</SelectItem>)}</SelectContent></Select></div>}
                        
                         <div className="space-y-2">
                            <Label>N° Document de référence</Label>
                            <Input value={document} onChange={e => setDocument(e.target.value)} placeholder="Ex: BR-001, BL-002, BT-003..." />
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" type="button" onClick={onClose}>Annuler</Button><Button type="submit">Enregistrer</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
