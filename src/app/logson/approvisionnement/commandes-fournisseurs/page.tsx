
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Eye, Pencil, Trash2, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAtom } from 'jotai';
import { fournisseursAtom, produitsAtom } from '@/lib/store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';

type Produit = {
  id: number;
  reference: string;
  name: string;
  stock: number;
  unitPrice: number;
};

type LigneCommande = {
  id: string;
  produitId: number | null;
  description: string;
  quantite: number;
  prixUnitaire: number;
};

type CommandeStatus = 'Brouillon' | 'Validée' | 'Partiellement Reçue' | 'Reçue';
type Commande = {
  id: number;
  numero: string;
  date: string;
  fournisseurId: number;
  lignes: LigneCommande[];
  status: CommandeStatus;
};

const initialCommandes: Commande[] = [
    { id: 1, numero: 'BC-2024-001', date: '2024-07-28', fournisseurId: 2, status: 'Reçue', lignes: [ { id: 'l1', produitId: 1, description: 'Serveur Dell R740', quantite: 2, prixUnitaire: 2500000 }] },
    { id: 2, numero: 'BC-2024-002', date: '2024-07-30', fournisseurId: 4, status: 'Brouillon', lignes: [ { id: 'l2', produitId: 3, description: 'Licence Windows Server', quantite: 10, prixUnitaire: 150000 }] },
];

const ITEMS_PER_PAGE = 10;

function CommandesFournisseursPage() {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [commandes, setCommandes] = useState(initialCommandes);
    const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
    
    const [fournisseurs] = useAtom(fournisseursAtom);
    const [produits] = useAtom(produitsAtom);
    const { toast } = useToast();

    const handleCreateNew = () => {
        setEditingCommande(null);
        setView('form');
    };

    const handleEdit = (commande: Commande) => {
        setEditingCommande(commande);
        setView('form');
    };
    
    const handleSave = (newCommandeData: Omit<Commande, 'id' | 'numero' | 'date'>) => {
        if (editingCommande) {
            setCommandes(prev => prev.map(c => c.id === editingCommande.id ? { ...c, ...newCommandeData } : c));
            toast({ title: "Commande modifiée avec succès" });
        } else {
            const newCommande: Commande = {
                id: Date.now(),
                numero: `BC-${new Date().getFullYear()}-${String(commandes.length + 1).padStart(3, '0')}`,
                date: new Date().toISOString().split('T')[0],
                ...newCommandeData
            };
            setCommandes(prev => [...prev, newCommande]);
            toast({ title: "Commande créée avec succès" });
        }
        setView('list');
    };

    const handleDelete = (id: number) => {
        setCommandes(c => c.filter(cmd => cmd.id !== id));
        toast({ title: "Commande supprimée"});
    };

    if (view === 'form') {
        return <CommandeForm commande={editingCommande} onBack={() => setView('list')} onSave={handleSave} />;
    }

    return <CommandeList commandes={commandes} onCreateNew={handleCreateNew} onEdit={handleEdit} onDelete={handleDelete} />;
}

function CommandeList({ commandes, onCreateNew, onEdit, onDelete }: { commandes: Commande[], onCreateNew: () => void, onEdit: (cmd: Commande) => void, onDelete: (id: number) => void }) {
    const [fournisseurs] = useAtom(fournisseursAtom);
    const [commandeToDelete, setCommandeToDelete] = useState<Commande | null>(null);
    const getFournisseurName = (id: number) => fournisseurs.find(f => f.id === id)?.intitule || 'Inconnu';
    const calculateTotal = (lignes: LigneCommande[]) => lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);

    const getStatusBadge = (status: CommandeStatus) => {
        switch (status) {
            case 'Brouillon': return <Badge variant="outline">Brouillon</Badge>;
            case 'Validée': return <Badge>Validée</Badge>;
            case 'Partiellement Reçue': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Partiellement Reçue</Badge>;
            case 'Reçue': return <Badge className="bg-green-100 text-green-800">Reçue</Badge>;
        }
    };
    
    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Commandes Fournisseurs</CardTitle>
                            <CardDescription>Gérez vos commandes d'approvisionnement.</CardDescription>
                        </div>
                        <Button onClick={onCreateNew}><PlusCircle className="mr-2 h-4 w-4"/>Créer une commande</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>N° Commande</TableHead><TableHead>Date</TableHead><TableHead>Fournisseur</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {commandes.map(cmd => (
                                <TableRow key={cmd.id}>
                                    <TableCell>{cmd.numero}</TableCell>
                                    <TableCell>{format(new Date(cmd.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{getFournisseurName(cmd.fournisseurId)}</TableCell>
                                    <TableCell>{calculateTotal(cmd.lignes).toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell>{getStatusBadge(cmd.status)}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => onEdit(cmd)}><Pencil className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => setCommandeToDelete(cmd)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <AlertDialog open={!!commandeToDelete} onOpenChange={() => setCommandeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => {onDelete(commandeToDelete!.id); setCommandeToDelete(null);}} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function CommandeForm({ commande, onBack, onSave }: { commande: Commande | null, onBack: () => void, onSave: (data: Omit<Commande, 'id' | 'numero' | 'date'>) => void }) {
    const [fournisseurs] = useAtom(fournisseursAtom);
    const [produits] = useAtom(produitsAtom);
    const [fournisseurId, setFournisseurId] = useState<number | undefined>(commande?.fournisseurId);
    const [lignes, setLignes] = useState<LigneCommande[]>(commande?.lignes || [{ id: `l-${Date.now()}`, produitId: null, description: '', quantite: 1, prixUnitaire: 0 }]);
    const [status, setStatus] = useState<CommandeStatus>(commande?.status || 'Brouillon');
    
    const handleAddLine = () => setLignes(prev => [...prev, { id: `l-${Date.now()}`, produitId: null, description: '', quantite: 1, prixUnitaire: 0 }]);
    const handleRemoveLine = (id: string) => setLignes(prev => prev.filter(l => l.id !== id));
    
    const handleLineChange = (id: string, field: keyof LigneCommande, value: any) => {
        setLignes(prev => prev.map(l => {
            if (l.id === id) {
                const updatedLine = { ...l, [field]: value };
                if (field === 'produitId') {
                    const produit = produits.find(p => p.id === value);
                    if (produit) {
                        updatedLine.description = produit.name;
                        updatedLine.prixUnitaire = produit.unitPrice;
                    }
                }
                return updatedLine;
            }
            return l;
        }));
    };
    
    const total = useMemo(() => lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0), [lignes]);

    const handleSubmit = () => {
        if (!fournisseurId) return;
        onSave({ fournisseurId, lignes, status });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/> Retour</Button>
                <h2 className="text-2xl font-bold">{commande ? `Modifier Commande ${commande.numero}` : 'Nouvelle Commande'}</h2>
                <div />
            </div>

            <Card>
                <CardHeader><CardTitle>Informations Générales</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2"><Label>Fournisseur</Label><Select value={fournisseurId?.toString()} onValueChange={v => setFournisseurId(Number(v))}><SelectTrigger><SelectValue placeholder="Sélectionnez..."/></SelectTrigger><SelectContent>{fournisseurs.map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.intitule}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Date</Label><Input type="date" value={commande ? commande.date : format(new Date(), 'yyyy-MM-dd')} disabled/></div>
                    <div className="space-y-2"><Label>Statut</Label><Select value={status} onValueChange={(v: CommandeStatus) => setStatus(v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Brouillon">Brouillon</SelectItem><SelectItem value="Validée">Validée</SelectItem></SelectContent></Select></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Lignes de la Commande</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-2/5">Produit/Description</TableHead><TableHead>Quantité</TableHead><TableHead>Prix Unitaire</TableHead><TableHead>Total</TableHead><TableHead/></TableRow></TableHeader>
                        <TableBody>
                            {lignes.map(l => (
                                <TableRow key={l.id}>
                                    <TableCell>
                                        <Select onValueChange={(v) => handleLineChange(l.id, 'produitId', Number(v))}>
                                            <SelectTrigger><SelectValue placeholder="Sélectionner ou décrire"/></SelectTrigger>
                                            <SelectContent>{produits.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Stock: {p.stock})</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Input value={l.description} onChange={e => handleLineChange(l.id, 'description', e.target.value)} className="mt-1" />
                                    </TableCell>
                                    <TableCell><Input type="number" value={l.quantite} onChange={e => handleLineChange(l.id, 'quantite', Number(e.target.value))}/></TableCell>
                                    <TableCell><Input type="number" value={l.prixUnitaire} onChange={e => handleLineChange(l.id, 'prixUnitaire', Number(e.target.value))}/></TableCell>
                                    <TableCell>{(l.quantite * l.prixUnitaire).toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveLine(l.id)}><Trash2 className="h-4 w-4"/></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter><TableRow><TableCell colSpan={3} className="text-right font-bold">Total</TableCell><TableCell className="font-bold">{total.toLocaleString('fr-FR')} FCFA</TableCell><TableCell/></TableRow></TableFooter>
                    </Table>
                    <Button variant="outline" size="sm" onClick={handleAddLine} className="mt-4"><PlusCircle className="mr-2 h-4 w-4"/>Ajouter une ligne</Button>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onBack}>Annuler</Button>
                <Button onClick={handleSubmit}>Enregistrer la commande</Button>
            </div>
        </div>
    );
}

export default CommandesFournisseursPage;
