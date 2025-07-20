
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlusCircle, Pencil, Trash2, Eye, Download } from 'lucide-react';
import { useAtom } from 'jotai';
import { produitsAtom, entrepotsAtom, type Produit } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const defaultFormData: Omit<Produit, 'id'> = {
  reference: '',
  name: '',
  stock: 0,
  unitPrice: 0,
  entrepotId: 0,
};

// Mock data for the product sheet view
const mockProductMouvements = [
    { date: '2024-07-28', type: 'Entrée', quantite: 10, document: 'BR-BC-2024-001-1'},
    { date: '2024-07-30', type: 'Sortie', quantite: 2, document: 'BL-CMD-0801'},
    { date: '2024-08-05', type: 'Sortie', quantite: 3, document: 'BL-CMD-0805'},
];

export default function ProduitsPage() {
    const [produits, setProduits] = useAtom(produitsAtom);
    const [entrepots] = useAtom(entrepotsAtom);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
    const [viewingProduit, setViewingProduit] = useState<Produit | null>(null);
    const [formData, setFormData] = useState<Omit<Produit, 'id'>>(defaultFormData);
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: id === 'stock' || id === 'unitPrice' ? parseFloat(value) || 0 : value }));
    };
    
    const handleSelectChange = (value: string) => {
        setFormData(prev => ({...prev, entrepotId: Number(value) }));
    };

    const handleOpenCreateModal = () => {
        setEditingProduit(null);
        setFormData(defaultFormData);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (produit: Produit) => {
        setEditingProduit(produit);
        setFormData(produit);
        setIsModalOpen(true);
    };

    const handleOpenViewModal = (produit: Produit) => {
        setViewingProduit(produit);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduit) {
            setProduits(prev => prev.map(p => p.id === editingProduit.id ? { ...editingProduit, ...formData } : p));
            toast({ title: 'Produit modifié avec succès' });
        } else {
            const newProduit: Produit = { id: Date.now(), ...formData };
            setProduits(prev => [...prev, newProduit]);
            toast({ title: 'Produit créé avec succès' });
        }
        setIsModalOpen(false);
    };

    const handleDownloadPDF = (produit: Produit) => {
        const doc = new jsPDF();
        const entrepot = entrepots.find(e => e.id === produit.entrepotId)?.nom || 'N/A';
        
        doc.setFontSize(18);
        doc.text(`Fiche Produit : ${produit.reference}`, 14, 22);
        doc.setFontSize(10);
        doc.text(`Édité le: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
        
        const details = [
            ['Nom du Produit', produit.name],
            ['Stock Actuel', produit.stock.toString()],
            ['Prix Unitaire', `${produit.unitPrice.toLocaleString('fr-FR')} FCFA`],
            ['Entrepôt', entrepot],
        ];
        
        autoTable(doc, {
            startY: 40,
            head: [['Caractéristique', 'Valeur']],
            body: details,
            theme: 'grid'
        });

        doc.setFontSize(12);
        doc.text("Derniers Mouvements de Stock", 14, (doc as any).lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Date', 'Type', 'Quantité', 'Document']],
            body: mockProductMouvements.map(m => [m.date, m.type, m.quantite, m.document]),
            theme: 'striped',
        });


        doc.save(`fiche_produit_${produit.reference}.pdf`);
        toast({ title: "Exportation PDF réussie" });
    }

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Produits</CardTitle>
                            <CardDescription>Gérez votre catalogue de produits et de marchandises.</CardDescription>
                        </div>
                        <Button onClick={handleOpenCreateModal}><PlusCircle className="mr-2 h-4 w-4" />Nouveau Produit</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead className="text-center">Stock</TableHead>
                                <TableHead className="text-right">Prix Unitaire</TableHead>
                                <TableHead>Entrepôt</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {produits.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-mono">{p.reference}</TableCell>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="text-center">{p.stock}</TableCell>
                                    <TableCell className="text-right">{p.unitPrice.toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell>{entrepots.find(e => e.id === p.entrepotId)?.nom || 'N/A'}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenViewModal(p)}><Eye className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenEditModal(p)}><Pencil className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingProduit ? 'Modifier le Produit' : 'Nouveau Produit'}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2"><Label htmlFor="reference">Référence</Label><Input id="reference" value={formData.reference} onChange={handleInputChange} required /></div>
                            <div className="space-y-2"><Label htmlFor="name">Nom</Label><Input id="name" value={formData.name} onChange={handleInputChange} required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="stock">Stock Initial</Label><Input id="stock" type="number" value={formData.stock} onChange={handleInputChange} required /></div>
                                <div className="space-y-2"><Label htmlFor="unitPrice">Prix Unitaire</Label><Input id="unitPrice" type="number" value={formData.unitPrice} onChange={handleInputChange} required /></div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="entrepotId">Entrepôt de stockage</Label>
                                <Select value={formData.entrepotId?.toString()} onValueChange={handleSelectChange}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionnez un entrepôt..."/></SelectTrigger>
                                    <SelectContent>
                                        {entrepots.map(e => (
                                            <SelectItem key={e.id} value={e.id.toString()}>{e.nom}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewingProduit} onOpenChange={() => setViewingProduit(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Fiche Produit</DialogTitle>
                    </DialogHeader>
                    {viewingProduit && (
                        <>
                        <div className="py-4 space-y-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-muted rounded-lg space-y-1">
                                    <p className="text-xs text-muted-foreground">Référence</p>
                                    <p className="font-bold font-mono">{viewingProduit.reference}</p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg space-y-1 col-span-2">
                                     <p className="text-xs text-muted-foreground">Nom du produit</p>
                                    <p className="font-bold">{viewingProduit.name}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                 <div className="p-3 bg-muted rounded-lg space-y-1">
                                    <p className="text-xs text-muted-foreground">Stock Actuel</p>
                                    <p className="font-bold text-2xl text-primary">{viewingProduit.stock}</p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg space-y-1">
                                    <p className="text-xs text-muted-foreground">Prix Unitaire</p>
                                    <p className="font-bold text-2xl">{viewingProduit.unitPrice.toLocaleString('fr-FR')} FCFA</p>
                                </div>
                                 <div className="p-3 bg-muted rounded-lg space-y-1">
                                    <p className="text-xs text-muted-foreground">Entrepôt</p>
                                    <p className="font-bold text-lg">{entrepots.find(e => e.id === viewingProduit.entrepotId)?.nom || 'N/A'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold mb-2">Derniers Mouvements (Exemple)</h4>
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Document</TableHead><TableHead className="text-right">Quantité</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {mockProductMouvements.map(m => (
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
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setViewingProduit(null)}>Fermer</Button>
                            <Button onClick={() => handleDownloadPDF(viewingProduit)}><Download className="mr-2 h-4 w-4"/>Imprimer la fiche</Button>
                        </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
