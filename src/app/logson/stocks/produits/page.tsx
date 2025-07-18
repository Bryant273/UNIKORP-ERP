
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useAtom } from 'jotai';
import { produitsAtom } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

type Produit = {
  id: number;
  reference: string;
  name: string;
  stock: number;
  unitPrice: number;
};

const defaultFormData: Omit<Produit, 'id'> = {
  reference: '',
  name: '',
  stock: 0,
  unitPrice: 0,
};

export default function ProduitsPage() {
    const [produits, setProduits] = useAtom(produitsAtom);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
    const [formData, setFormData] = useState<Omit<Produit, 'id'>>(defaultFormData);
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: id === 'stock' || id === 'unitPrice' ? parseFloat(value) || 0 : value }));
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
                                <TableHead className="text-center">Stock Actuel</TableHead>
                                <TableHead className="text-right">Prix Unitaire</TableHead>
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
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
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
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
