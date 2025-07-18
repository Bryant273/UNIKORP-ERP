
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

type Mouvement = {
    date: string;
    type: 'Entrée' | 'Sortie' | 'Inventaire';
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

const MOCK_STOCK_CARDS: StockCard[] = [
    { id: 'p-1', reference: 'SRV-DELL-R740', name: 'Serveur Dell PowerEdge R740', stock: 15, emplacement: 'A1-B3-C2', mouvements: [
        { date: '2024-07-28', type: 'Entrée', quantite: 5, document: 'BR-BC-2024-001-1'},
        { date: '2024-07-30', type: 'Sortie', quantite: 2, document: 'BL-CMD-0801'},
    ]},
    { id: 'p-2', reference: 'SW-MS-WIN22', name: 'Licence Windows Server 2022', stock: 50, emplacement: 'ELEC-R1-S2', mouvements: [] },
    { id: 'p-3', reference: 'NW-CIS-C9200', name: 'Switch Cisco Catalyst 9200', stock: 25, emplacement: 'A2-C1-D5', mouvements: [] },
    { id: 'p-4', reference: 'PC-LEN-T14', name: 'PC Portable Lenovo ThinkPad T14', stock: 40, emplacement: 'B1-A4-E8', mouvements: [] },
];

export default function FichesDeStocksPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingCard, setViewingCard] = useState<StockCard | null>(null);

    const filteredCards = MOCK_STOCK_CARDS.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        card.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Nom du Produit</TableHead>
                                <TableHead className="text-center">Stock Actuel</TableHead>
                                <TableHead className="text-center">Emplacement</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCards.map(card => (
                                <TableRow key={card.id} className="cursor-pointer hover:bg-muted" onClick={() => setViewingCard(card)}>
                                    <TableCell className="font-mono">{card.reference}</TableCell>
                                    <TableCell className="font-medium">{card.name}</TableCell>
                                    <TableCell className="text-center">{card.stock}</TableCell>
                                    <TableCell className="text-center">{card.emplacement}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Emplacement</p><p className="text-2xl font-bold">{viewingCard?.emplacement}</p></div>
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Mouvements</p><p className="text-2xl font-bold">{viewingCard?.mouvements.length}</p></div>
                    </div>
                     <Separator />
                     <h4 className="font-semibold pt-4">Historique des Mouvements</h4>
                     <div className="max-h-64 overflow-y-auto border rounded-md">
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Document</TableHead><TableHead className="text-right">Quantité</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {viewingCard?.mouvements.map(m => (
                                    <TableRow key={m.document}>
                                        <TableCell>{m.date}</TableCell>
                                        <TableCell>{m.type}</TableCell>
                                        <TableCell>{m.document}</TableCell>
                                        <TableCell className={`text-right ${m.type === 'Entrée' ? 'text-green-600' : 'text-red-600'}`}>{m.type === 'Entrée' ? '+' : '-'}{m.quantite}</TableCell>
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
