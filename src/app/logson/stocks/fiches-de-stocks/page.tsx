
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAtom } from 'jotai';
import { produitsAtom, mouvementsAtom, entrepotsAtom } from '@/lib/store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Mouvement = {
    date: string;
    type: 'Entrée' | 'Sortie' | 'Transfert';
    quantite: number;
    document: string;
};

type StockCard = {
    id: string;
    reference: string;
    name: string;
    stock: number;
    emplacement: string;
    mouvements: Mouvement[];
};

export default function FichesDeStocksPage() {
    const [produits] = useAtom(produitsAtom);
    const [mouvements] = useAtom(mouvementsAtom);
    const [entrepots] = useAtom(entrepotsAtom);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingCard, setViewingCard] = useState<typeof produits[0] | null>(null);

    const filteredProducts = produits.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        card.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const mouvementsPourProduit = mouvements.filter(m => m.produitId === viewingCard?.id);

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Fiches de Stocks</CardTitle>
                    <CardDescription>Consultez les fiches détaillées de vos stocks, incluant l'historique des mouvements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un produit par nom ou référence..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Nom du Produit</TableHead>
                                    <TableHead className="text-center">Stock Actuel</TableHead>
                                    <TableHead className="text-center">Entrepôt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map(produit => (
                                    <TableRow key={produit.id} className="cursor-pointer hover:bg-muted" onClick={() => setViewingCard(produit)}>
                                        <TableCell className="font-mono">{produit.reference}</TableCell>
                                        <TableCell className="font-medium">{produit.name}</TableCell>
                                        <TableCell className="text-center">{produit.stock}</TableCell>
                                        <TableCell className="text-center">{entrepots.find(e => e.id === produit.entrepotId)?.nom || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!viewingCard} onOpenChange={() => setViewingCard(null)}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{viewingCard?.name}</DialogTitle>
                        <DialogDescription>Référence: {viewingCard?.reference}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-3 gap-4 py-4 text-center">
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Stock Actuel</p><p className="text-2xl font-bold">{viewingCard?.stock}</p></div>
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Entrepôt</p><p className="text-xl font-bold truncate">{entrepots.find(e => e.id === viewingCard?.entrepotId)?.nom}</p></div>
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Mouvements</p><p className="text-2xl font-bold">{mouvementsPourProduit.length}</p></div>
                    </div>
                     <Separator />
                     <h4 className="font-semibold pt-4">Historique des Mouvements</h4>
                     <div className="max-h-64 overflow-y-auto border rounded-md">
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Document</TableHead><TableHead className="text-right">Quantité</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {mouvementsPourProduit.map(m => (
                                    <TableRow key={m.id}>
                                        <TableCell>{format(new Date(m.date), 'dd/MM/yyyy', {locale: fr})}</TableCell>
                                        <TableCell>{m.type}</TableCell>
                                        <TableCell>{m.document}</TableCell>
                                        <TableCell className={`text-right font-semibold ${m.type === 'Entrée' ? 'text-green-600' : 'text-red-600'}`}>{m.type === 'Entrée' ? '+' : '-'}{m.quantite}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
