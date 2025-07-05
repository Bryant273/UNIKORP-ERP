'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2, Download, CheckCircle } from 'lucide-react';
import FiscalPageLayout from '@/components/fiscal-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// --- TYPES ---
type DeclarationStatus = 'Brouillon' | 'À payer' | 'Payé';
type AutreImpot = {
    id: string;
    nom: string;
    description: string;
    montant: number;
    echeance: string;
    statut: DeclarationStatus;
};

// --- MOCK DATA ---
const initialAutresImpots: AutreImpot[] = [
    { id: 'imp-synth', nom: 'Impôt synthétique', description: 'Paiement libératoire', montant: 150000, echeance: 'Trimestriel', statut: 'À payer' },
    { id: 'taxe-forfait', nom: 'Taxe forfaitaire des petits commerçants', description: 'Artisans et petits commerces', montant: 50000, echeance: 'Annuel', statut: 'Payé' },
    { id: 'droit-enreg', nom: 'Droits d\'enregistrement', description: 'Actes de société', montant: 25000, echeance: 'Ponctuel', statut: 'Payé' },
    { id: 'droit-timbre', nom: 'Droits de timbre', description: 'Timbres fiscaux', montant: 10000, echeance: 'Continu', statut: 'À payer' },
    { id: 'droit-douane', nom: 'Droits de douane', description: 'Importation de marchandises', montant: 750000, echeance: 'Par opération', statut: 'Brouillon' },
];

const defaultFormData: Omit<AutreImpot, 'id' | 'statut'> = {
    nom: '',
    description: '',
    montant: 0,
    echeance: '',
};

function AutresImpotsMainContent() {
    const [impots, setImpots] = useState(initialAutresImpots);
    const [impotToDelete, setImpotToDelete] = useState<AutreImpot | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImpot, setEditingImpot] = useState<AutreImpot | null>(null);
    const [viewingImpot, setViewingImpot] = useState<AutreImpot | null>(null);
    const { toast } = useToast();
    
    const openCreateModal = () => {
        setEditingImpot(null);
        setIsModalOpen(true);
    };
    
    const openEditModal = (impot: AutreImpot) => {
        setEditingImpot(impot);
        setIsModalOpen(true);
    };

    const handleSave = (formData: Omit<AutreImpot, 'id' | 'statut'>) => {
        if (editingImpot) {
            setImpots(prev => prev.map(d => d.id === editingImpot.id ? { ...editingImpot, ...formData, statut: 'À payer' } : d));
            toast({ title: 'Taxe modifiée', description: 'La taxe a été mise à jour.' });
        } else {
            const newImpot: AutreImpot = {
                id: `tax_${Date.now()}`,
                ...formData,
                statut: 'Brouillon',
            };
            setImpots(prev => [newImpot, ...prev]);
            toast({ title: 'Taxe créée', description: 'La nouvelle taxe a été ajoutée en tant que brouillon.' });
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (impotToDelete) {
            setImpots(prev => prev.filter(d => d.id !== impotToDelete.id));
            toast({ title: 'Taxe supprimée' });
            setImpotToDelete(null);
        }
    };
    
    const handleMarkAsPaid = (id: string) => {
        setImpots(prev => prev.map(d => d.id === id ? { ...d, statut: 'Payé' } : d));
        toast({ title: 'Statut mis à jour', description: 'La taxe a été marquée comme payée.' });
    };

    const handlePrint = (impot: AutreImpot) => {
        const doc = new jsPDF();
        const printDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        
        doc.setFontSize(18);
        doc.text("Déclaration - Autres Impôts et Taxes", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Imprimé via UNIKORP ® le ${printDate}`, 105, 28, { align: 'center' });
        
        autoTable(doc, {
            startY: 40,
            head: [['Champ', 'Valeur']],
            body: [
                ['Impôt / Taxe', impot.nom],
                ['Description', impot.description],
                ['Échéance', impot.echeance],
                ['Montant Dû', `${impot.montant.toLocaleString('fr-FR')} €`],
                ['Statut', impot.statut],
            ],
            theme: 'grid'
        });

        doc.save(`declaration_${impot.nom.replace(/\s/g, '_')}.pdf`);
    };

    const getStatusBadge = (impot: AutreImpot) => {
        switch (impot.statut) {
            case 'Brouillon': return <Badge variant="outline">Brouillon</Badge>;
            case 'À payer': return <Button size="sm" variant="destructive" onClick={() => handleMarkAsPaid(impot.id)}>Marquer comme payée</Button>;
            case 'Payé': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Payé</Badge>;
        }
    };
    
  return (
    <>
    <Card className="w-full">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Autres Impôts et Taxes</CardTitle>
                    <CardDescription>Suivi des impôts, taxes et droits divers.</CardDescription>
                </div>
                <Button onClick={openCreateModal}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une taxe
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Impôt / Taxe</TableHead>
                        <TableHead className="text-right">Montant Dû</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                        <TableHead className="text-center w-[150px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {impots.map((impot) => {
                        const isPaid = impot.statut === 'Payé';
                        return (
                        <TableRow key={impot.id}>
                            <TableCell className="font-medium">{impot.nom}</TableCell>
                            <TableCell className="text-right font-mono">{impot.montant.toLocaleString('fr-FR')} €</TableCell>
                            <TableCell className="text-center">{getStatusBadge(impot)}</TableCell>
                             <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => setViewingImpot(impot)}><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" disabled={isPaid} onClick={() => openEditModal(impot)}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handlePrint(impot)}><Download className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isPaid} onClick={() => setImpotToDelete(impot)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
    
    <TaxModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        taxToEdit={editingImpot}
    />

    <ViewTaxModal 
        isOpen={!!viewingImpot}
        onClose={() => setViewingImpot(null)}
        tax={viewingImpot}
    />
    
    <AlertDialog open={!!impotToDelete} onOpenChange={() => setImpotToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Supprimer cette taxe ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

function TaxModal({ isOpen, onClose, onSave, taxToEdit }: { isOpen: boolean, onClose: () => void, onSave: (data: Omit<AutreImpot, 'id' | 'statut'>) => void, taxToEdit: AutreImpot | null }) {
    const [formData, setFormData] = useState(defaultFormData);
    const { toast } = useToast();

    React.useEffect(() => {
        if (isOpen) {
            if (taxToEdit) {
                setFormData({
                    nom: taxToEdit.nom,
                    description: taxToEdit.description,
                    montant: taxToEdit.montant,
                    echeance: taxToEdit.echeance,
                });
            } else {
                setFormData(defaultFormData);
            }
        }
    }, [isOpen, taxToEdit]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: id === 'montant' ? parseFloat(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nom || !formData.montant) {
            toast({ title: 'Champs requis', description: 'Veuillez remplir le nom et le montant.', variant: 'destructive'});
            return;
        }
        onSave(formData);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{taxToEdit ? 'Modifier la' : 'Créer une'} taxe</DialogTitle>
                        <DialogDescription>Renseignez les détails de l'impôt ou de la taxe.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom de l'impôt/taxe</Label>
                            <Input id="nom" value={formData.nom} onChange={handleChange} placeholder="Ex: Impôt synthétique" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" value={formData.description} onChange={handleChange} placeholder="Ex: Paiement libératoire" />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label htmlFor="montant">Montant Dû (€)</Label>
                               <Input id="montant" type="number" value={formData.montant || ''} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="echeance">Échéance</Label>
                                <Input id="echeance" value={formData.echeance} onChange={handleChange} placeholder="Ex: Annuel, 15/12/2024..." />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ViewTaxModal({ isOpen, onClose, tax }: { isOpen: boolean, onClose: () => void, tax: AutreImpot | null }) {
    if (!tax) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Détails de la Taxe</DialogTitle>
                    <DialogDescription>{tax.nom}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <p><strong>Description:</strong> {tax.description}</p>
                    <p><strong>Montant Dû:</strong> {tax.montant.toLocaleString('fr-FR')} €</p>
                    <p><strong>Échéance:</strong> {tax.echeance}</p>
                    <p><strong>Statut:</strong> {tax.statut}</p>
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function AutresImpotsPage() {
    return (
        <FiscalPageLayout>
            <AutresImpotsMainContent />
        </FiscalPageLayout>
    )
}
