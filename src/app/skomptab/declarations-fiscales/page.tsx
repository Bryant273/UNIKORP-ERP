'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2, Download, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import FiscalPageLayout from '@/components/fiscal-layout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Types
type DeclarationType = 'IS' | 'IMF' | 'ITS' | 'Patente' | 'BNC' | 'BIC' | 'BA' | 'TSE' | 'TPS';
type DeclarationStatus = 'Brouillon' | 'Validée' | 'Télédéclarée' | 'Payée';

type Declaration = {
    id: string;
    periode: string;
    type: DeclarationType;
    montant: number;
    echeance: string;
    statut: DeclarationStatus;
};

// Mock Data
const initialDeclarations: Declaration[] = [
    { id: 'd1', periode: 'Année 2023', type: 'BIC', montant: 4500000, echeance: '30/04/2024', statut: 'Payée' },
    { id: 'd2', periode: 'Juillet 2024', type: 'ITS', montant: 1250000, echeance: '15/08/2024', statut: 'Validée' },
    { id: 'd3', periode: 'T3 2024', type: 'IMF', montant: 750000, echeance: '15/10/2024', statut: 'Brouillon' },
    { id: 'd4', periode: 'Année 2024', type: 'Patente', montant: 350000, echeance: '15/01/2025', statut: 'Brouillon' },
    { id: 'd5', periode: 'Juin 2024', type: 'ITS', montant: 1230000, echeance: '15/07/2024', statut: 'Payée' },
    { id: 'd6', periode: 'Année 2023', type: 'TPS', montant: 850000, echeance: '20/01/2024', statut: 'Télédéclarée' },
];

const DeclarationTypeOptions: DeclarationType[] = ['IS', 'IMF', 'ITS', 'Patente', 'BNC', 'BIC', 'BA', 'TSE', 'TPS'];

const defaultFormData: Omit<Declaration, 'id' | 'statut' | 'echeance'> = {
    periode: '',
    type: 'BIC',
    montant: 0,
};

function DeclarationsFiscalesMainContent() {
    const [declarations, setDeclarations] = useState(initialDeclarations);
    const [declarationToDelete, setDeclarationToDelete] = useState<Declaration | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
    const [viewingDeclaration, setViewingDeclaration] = useState<Declaration | null>(null);
    const { toast } = useToast();

    const openCreateModal = () => {
        setEditingDeclaration(null);
        setIsModalOpen(true);
    };

    const openEditModal = (declaration: Declaration) => {
        setEditingDeclaration(declaration);
        setIsModalOpen(true);
    };

    const handleSaveDeclaration = (formData: Omit<Declaration, 'id' | 'statut' | 'echeance'>) => {
        if (editingDeclaration) {
            setDeclarations(prev => prev.map(d => d.id === editingDeclaration.id ? { ...editingDeclaration, ...formData, statut: 'Validée' } : d));
            toast({ title: 'Déclaration modifiée', description: `La déclaration a été mise à jour.` });
        } else {
            const newDeclaration: Declaration = {
                id: `d_${Date.now()}`,
                ...formData,
                statut: 'Brouillon',
                echeance: 'À définir',
            };
            setDeclarations(prev => [newDeclaration, ...prev]);
            toast({ title: 'Déclaration créée', description: 'La nouvelle déclaration a été ajoutée en tant que brouillon.' });
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (declarationToDelete) {
            setDeclarations(prev => prev.filter(d => d.id !== declarationToDelete.id));
            toast({ title: 'Déclaration supprimée' });
            setDeclarationToDelete(null);
        }
    };
    
    const handleMarkAsPaid = (id: string) => {
        setDeclarations(prev => prev.map(d => d.id === id ? { ...d, statut: 'Payée' } : d));
        toast({ title: 'Statut mis à jour', description: 'La déclaration a été marquée comme payée.' });
    };
    
    const handlePrintDeclaration = (declaration: Declaration) => {
        const doc = new jsPDF();
        const printDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        
        doc.setFontSize(18);
        doc.text("Déclaration Fiscale", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Imprimé via UNIKORP ® le ${printDate}`, 105, 28, { align: 'center' });
        
        autoTable(doc, {
            startY: 40,
            head: [['Champ', 'Valeur']],
            body: [
                ['Type d\'impôt', declaration.type],
                ['Période', declaration.periode],
                ['Échéance', declaration.echeance],
                ['Montant Dû', `${declaration.montant.toLocaleString('fr-FR')} €`],
                ['Statut', declaration.statut],
            ],
            theme: 'grid'
        });

        doc.save(`declaration_${declaration.type}_${declaration.periode.replace(/\s/g, '_')}.pdf`);
        toast({ title: "Téléchargement lancé" });
    };

    const getStatusBadge = (declaration: Declaration) => {
        switch (declaration.statut) {
            case 'Brouillon': return <Badge variant="outline">Brouillon</Badge>;
            case 'Validée': return <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(declaration.id)}>Marquer comme payée</Button>;
            case 'Télédéclarée': return <Button size="sm" variant="secondary" onClick={() => handleMarkAsPaid(declaration.id)}>Marquer comme payée</Button>;
            case 'Payée': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Payée</Badge>;
        }
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Suivi des Déclarations Fiscales</CardTitle>
                            <CardDescription>Gérez et suivez l'état de toutes vos déclarations fiscales (hors TVA).</CardDescription>
                        </div>
                        <Button onClick={openCreateModal}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Créer une déclaration
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Période</TableHead>
                                <TableHead>Impôt</TableHead>
                                <TableHead className="text-right">Montant Dû</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {declarations.map((d, index) => {
                                const isFinalized = d.statut === 'Payée' || d.statut === 'Télédéclarée';
                                return (
                                <TableRow key={d.id}>
                                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{d.periode}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{d.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{d.montant.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(d)}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setViewingDeclaration(d)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(d)} disabled={isFinalized}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handlePrintDeclaration(d)}><Download className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeclarationToDelete(d)} disabled={isFinalized}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <DeclarationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDeclaration}
                declarationToEdit={editingDeclaration}
            />

            <ViewDeclarationModal 
                isOpen={!!viewingDeclaration}
                onClose={() => setViewingDeclaration(null)}
                declaration={viewingDeclaration}
            />
            
            <AlertDialog open={!!declarationToDelete} onOpenChange={() => setDeclarationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Supprimer cette déclaration ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. La déclaration sera supprimée de l'historique.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function DeclarationModal({ isOpen, onClose, onSave, declarationToEdit }: { isOpen: boolean, onClose: () => void, onSave: (data: Omit<Declaration, 'id' | 'statut' | 'echeance'>) => void, declarationToEdit: Declaration | null }) {
    const [formData, setFormData] = useState(defaultFormData);
    const { toast } = useToast();

    React.useEffect(() => {
        if (isOpen) {
            if (declarationToEdit) {
                setFormData({
                    periode: declarationToEdit.periode,
                    type: declarationToEdit.type,
                    montant: declarationToEdit.montant
                });
            } else {
                setFormData(defaultFormData);
            }
        }
    }, [isOpen, declarationToEdit]);
    
    const handleChange = (id: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.periode || !formData.montant) {
            toast({ title: 'Champs requis', description: 'Veuillez remplir la période et le montant.', variant: 'destructive'});
            return;
        }
        onSave(formData);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{declarationToEdit ? 'Modifier la' : 'Créer une'} déclaration fiscale</DialogTitle>
                        <DialogDescription>Renseignez les détails de la déclaration fiscale.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Type d'impôt</Label>
                            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                                <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                                <SelectContent>{DeclarationTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="periode">Période</Label>
                            <Input id="periode" value={formData.periode} onChange={(e) => handleChange('periode', e.target.value)} placeholder="Ex: Année 2024, T3 2024..." />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="montant">Montant Dû (€)</Label>
                            <Input id="montant" type="number" value={formData.montant || ''} onChange={(e) => handleChange('montant', Number(e.target.value))} />
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

function ViewDeclarationModal({ isOpen, onClose, declaration }: { isOpen: boolean, onClose: () => void, declaration: Declaration | null }) {
    if (!declaration) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Détails de la Déclaration</DialogTitle>
                    <DialogDescription>Déclaration {declaration.type} pour la période {declaration.periode}.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <p><strong>Type:</strong> <Badge variant="secondary">{declaration.type}</Badge></p>
                    <p><strong>Période:</strong> {declaration.periode}</p>
                    <p><strong>Montant Dû:</strong> {declaration.montant.toLocaleString('fr-FR')} €</p>
                    <p><strong>Échéance:</strong> {declaration.echeance}</p>
                    <p><strong>Statut:</strong> {declaration.statut}</p>
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function DeclarationsFiscalesPage() {
    return (
        <FiscalPageLayout>
            <DeclarationsFiscalesMainContent />
        </FiscalPageLayout>
    )
}
