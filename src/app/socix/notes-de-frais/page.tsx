
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Receipt, MoreHorizontal, Check, X, Clock, FileUp, Loader2, Link } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type ExpenseStatus = 'Soumise' | 'Approuvée' | 'Refusée' | 'Remboursée';
type Expense = {
    id: string;
    employeeName: string;
    submissionDate: string;
    description: string;
    amount: number;
    status: ExpenseStatus;
    receiptUrl?: string;
};

const initialExpenses: Expense[] = [
    { id: 'exp-1', employeeName: 'Sophie Martin', submissionDate: '2024-07-22', description: 'Déjeuner client - Projet Alpha', amount: 350, status: 'Soumise', receiptUrl: 'https://placehold.co/800x1131.png' },
    { id: 'exp-2', employeeName: 'Jean Dupont', submissionDate: '2024-07-20', description: 'Déplacement Lyon (train)', amount: 125, status: 'Approuvée' },
    { id: 'exp-3', employeeName: 'Camille Leroy', submissionDate: '2024-07-18', description: 'Achat fournitures de bureau', amount: 55.80, status: 'Remboursée' },
    { id: 'exp-4', employeeName: 'Lucas Petit', submissionDate: '2024-07-15', description: 'Logiciel de design', amount: 80, status: 'Refusée' },
];

const ITEMS_PER_PAGE = 10;

export default function NotesDeFraisPage() {
    const { toast } = useToast();
    const [expenses, setExpenses] = useState(initialExpenses);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
    const currentExpenses = expenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleAction = (id: string, status: ExpenseStatus) => {
        setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, status } : exp));
        toast({ title: 'Statut mis à jour', description: `La note de frais a été marquée comme "${status}".` });
    };

    const handleSubmit = (formData: Omit<Expense, 'id' | 'status'>) => {
        const newExpense: Expense = {
            id: `exp-${Date.now()}`,
            status: 'Soumise',
            ...formData,
        };
        setExpenses(prev => [newExpense, ...prev]);
        setIsModalOpen(false);
    };

    const getStatusBadge = (status: ExpenseStatus) => {
        switch (status) {
            case 'Soumise': return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3"/>Soumise</Badge>;
            case 'Approuvée': return <Badge className="bg-blue-100 text-blue-800"><Check className="mr-1 h-3 w-3"/>Approuvée</Badge>;
            case 'Refusée': return <Badge variant="destructive"><X className="mr-1 h-3 w-3"/>Refusée</Badge>;
            case 'Remboursée': return <Badge className="bg-green-100 text-green-800"><Check className="mr-1 h-3 w-3"/>Remboursée</Badge>;
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Receipt /> Gestion des Notes de Frais</CardTitle>
                            <CardDescription>Suivez et validez les notes de frais soumises par les employés.</CardDescription>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Soumettre une note</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Employé</TableHead><TableHead>Date Soumission</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Montant</TableHead><TableHead className="text-center">Statut</TableHead><TableHead className="text-center w-[100px]">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {currentExpenses.map(exp => (
                                <TableRow key={exp.id}>
                                    <TableCell className="font-medium">{exp.employeeName}</TableCell>
                                    <TableCell>{format(new Date(exp.submissionDate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{exp.description}</TableCell>
                                    <TableCell className="text-right font-bold">{exp.amount.toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(exp.status)}</TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleAction(exp.id, 'Approuvée')}><Check className="mr-2 h-4 w-4"/>Approuver</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction(exp.id, 'Refusée')} className="text-destructive"><X className="mr-2 h-4 w-4"/>Refuser</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleAction(exp.id, 'Remboursée')}><Receipt className="mr-2 h-4 w-4"/>Marquer comme remboursée</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="flex items-center justify-between pt-6">
                    <div className="text-sm text-muted-foreground">
                        Total de {expenses.length} notes de frais. Page {currentPage} sur {totalPages}.
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Précédent</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Suivant</Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
            <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSubmit} />
        </>
    );
}

function ExpenseModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ employeeName: '', description: '', amount: 0, submissionDate: format(new Date(), 'yyyy-MM-dd') });
    const [receipt, setReceipt] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            setReceipt(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTimeout(() => {
                    setReceiptPreview(reader.result as string);
                    setIsUploading(false);
                }, 1000);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, receiptUrl: receiptPreview });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: id === 'amount' ? parseFloat(value) : value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader><DialogTitle>Soumettre une Note de Frais</DialogTitle><DialogDescription>Remplissez les informations et joignez votre justificatif.</DialogDescription></DialogHeader>
                    <div className="py-4 grid md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-2"><Label htmlFor="employeeName">Employé</Label><Select name="employeeName" onValueChange={v => setFormData(f => ({...f, employeeName: v}))}><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger><SelectContent><SelectItem value="Jean Dupont">Jean Dupont</SelectItem><SelectItem value="Sophie Martin">Sophie Martin</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="submissionDate">Date de la dépense</Label><Input type="date" id="submissionDate" value={formData.submissionDate} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label htmlFor="amount">Montant (FCFA)</Label><Input type="number" id="amount" value={formData.amount || ''} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={handleChange} /></div>
                        </div>
                        <div className="space-y-2">
                            <Label>Justificatif</Label>
                            <div className="h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4">
                                {receiptPreview ? (
                                    <Image src={receiptPreview} alt="Aperçu" width={200} height={280} className="max-h-full object-contain"/>
                                ) : isUploading ? (
                                    <div className="text-center space-y-2"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary"/><p>Chargement...</p></div>
                                ) : (
                                    <div className="text-center space-y-2"><FileUp className="h-8 w-8 mx-auto text-muted-foreground"/><p className="text-sm text-muted-foreground">Glissez-déposez ou cliquez</p><Input type="file" className="sr-only" id="receipt-upload" onChange={handleFileChange} /><Label htmlFor="receipt-upload" className="text-primary underline cursor-pointer">pour charger</Label></div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Annuler</Button><Button type="submit">Soumettre</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

