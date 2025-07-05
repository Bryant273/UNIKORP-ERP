
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Sigma, Target, Printer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- DATA TYPES & MOCK DATA ---

type BudgetLineItem = {
  id: string;
  element: string;
  quantite: number;
  pu: number;
};

type Budget = {
  id: number;
  year: string;
  month: string;
  sectionCode: string;
  sectionLibelle: string;
  budgetLines: BudgetLineItem[];
  realiseLines: BudgetLineItem[];
};

const MOCK_ANALYTIC_SECTIONS = [
    { code: 'D-FIN', libelle: 'Finance & Comptabilité' },
    { code: 'D-RH', libelle: 'Ressources Humaines' },
    { code: 'D-IT-INFRA', libelle: 'Infrastructure IT' },
    { code: 'D-IT-DEV', libelle: 'Développement Applicatif' },
    { code: 'P2024-01-DEV', libelle: 'Développement ERP' },
    { code: 'P2024-02-MRKT', libelle: 'Campagne Marketing Q3' },
];

const initialBudgets: Budget[] = [
    {
        id: 1,
        year: '2024',
        month: 'Juillet',
        sectionCode: 'P2024-01-DEV',
        sectionLibelle: 'Développement ERP',
        budgetLines: [
            { id: 'b1', element: 'Salaires Développeurs', quantite: 3, pu: 1500000 },
            { id: 'b2', element: 'Licences Logiciels', quantite: 1, pu: 500000 },
        ],
        realiseLines: [
            { id: 'r1', element: 'Salaires Développeurs', quantite: 3, pu: 1500000 },
            { id: 'r2', element: 'Achat licence JetBrains', quantite: 1, pu: 450000 },
        ]
    },
    {
        id: 2,
        year: '2024',
        month: 'Juillet',
        sectionCode: 'P2024-02-MRKT',
        sectionLibelle: 'Campagne Marketing Q3',
        budgetLines: [
            { id: 'b3', element: 'Publicité Google Ads', quantite: 1, pu: 1000000 },
            { id: 'b4', element: 'Création contenu', quantite: 10, pu: 50000 },
        ],
        realiseLines: [
            { id: 'r3', element: 'Dépenses Google Ads', quantite: 1, pu: 1200000 },
        ]
    }
];

const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' XOF';
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const YEARS = ['2023', '2024', '2025'];

// --- MAIN COMPONENT ---
export default function BudgetisationPage() {
    const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isRealiseModalOpen, setIsRealiseModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
    const { toast } = useToast();

    const handleOpenBudgetModal = (budget: Budget | null) => {
        setEditingBudget(budget);
        setIsBudgetModalOpen(true);
    };

    const handleOpenRealiseModal = (budget: Budget) => {
        setEditingBudget(budget);
        setIsRealiseModalOpen(true);
    };

    const handleSaveBudget = (newOrUpdatedBudget: Partial<Budget>) => {
        if (editingBudget) { // Editing existing budget
            setBudgets(budgets.map(b => b.id === editingBudget.id ? { ...b, ...newOrUpdatedBudget } : b));
            toast({ title: 'Budget prévisionnel mis à jour.' });
        } else { // Creating new budget
            const newId = Math.max(0, ...budgets.map(b => b.id)) + 1;
            const fullBudget: Budget = {
              id: newId,
              realiseLines: [],
              ...newOrUpdatedBudget,
            } as Budget;
            setBudgets(prev => [...prev, fullBudget]);
            toast({ title: 'Nouveau budget créé avec succès.' });
        }
        setIsBudgetModalOpen(false);
        setEditingBudget(null);
    };
    
    const handleSaveRealise = (realiseLines: BudgetLineItem[]) => {
        if (editingBudget) {
            setBudgets(budgets.map(b => b.id === editingBudget.id ? { ...b, realiseLines } : b));
            toast({ title: 'Montants réalisés enregistrés.' });
        }
        setIsRealiseModalOpen(false);
        setEditingBudget(null);
    };

    const handleDeleteBudget = () => {
        if (budgetToDelete) {
            setBudgets(budgets.filter(b => b.id !== budgetToDelete.id));
            setBudgetToDelete(null);
            toast({ title: 'Fiche de budget supprimée.' });
        }
    };
    
    const handlePrintReport = (budget: Budget) => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Rapport de Suivi Budgétaire', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Période: ${budget.month} ${budget.year}`, 15, 30);
        doc.text(`Section Analytique: ${budget.sectionLibelle}`, 15, 36);

        // Budget table
        autoTable(doc, {
            head: [['Budget Prévisionnel', 'Qté', 'P.U.', 'Montant']],
            body: budget.budgetLines.map(l => [l.element, l.quantite, formatCurrency(l.pu), formatCurrency(l.quantite * l.pu)]),
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: '#1e3a8a' },
        });

        const totalBudget = budget.budgetLines.reduce((acc, line) => acc + line.quantite * line.pu, 0);
        autoTable(doc, {
            body: [[{ content: 'Total Budget', colSpan: 3, styles: { halign: 'right' } }, { content: formatCurrency(totalBudget), styles: { halign: 'right' } }]],
            startY: (doc as any).lastAutoTable.finalY,
            theme: 'grid',
        });
        
        // Actuals table
        autoTable(doc, {
            head: [['Réalisations', 'Qté', 'P.U.', 'Montant']],
            body: budget.realiseLines.map(l => [l.element, l.quantite, formatCurrency(l.pu), formatCurrency(l.quantite * l.pu)]),
            startY: (doc as any).lastAutoTable.finalY + 10,
            theme: 'striped',
            headStyles: { fillColor: '#166534' },
        });
        
        const totalRealise = budget.realiseLines.reduce((acc, line) => acc + line.quantite * line.pu, 0);
         autoTable(doc, {
            body: [[{ content: 'Total Réalisé', colSpan: 3, styles: { halign: 'right' } }, { content: formatCurrency(totalRealise), styles: { halign: 'right' } }]],
            startY: (doc as any).lastAutoTable.finalY,
            theme: 'grid',
        });
        
        const ecart = totalRealise - totalBudget;
        autoTable(doc, {
            body: [[{ content: 'Écart (Réalisé - Budget)', colSpan: 3, styles: { halign: 'right' } }, { content: formatCurrency(ecart), styles: { halign: 'right', textColor: ecart > 0 ? '#dc2626' : '#16a34a' } }]],
            startY: (doc as any).lastAutoTable.finalY,
            theme: 'grid',
        });

        doc.save(`rapport_budget_${budget.sectionCode}_${budget.year}-${budget.month}.pdf`);
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Target /> Budgétisation & Suivi</CardTitle>
                            <CardDescription>Élaborez vos budgets, suivez les réalisations et analysez les écarts.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => handleOpenBudgetModal(null)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Créer une fiche de budget
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Période</TableHead>
                                <TableHead>Section Analytique</TableHead>
                                <TableHead className="text-right">Budget Total</TableHead>
                                <TableHead className="text-right">Réalisé Total</TableHead>
                                <TableHead className="text-right">Écart</TableHead>
                                <TableHead className="w-[250px]">Taux de Consommation</TableHead>
                                <TableHead className="text-center w-[180px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budgets.map(budget => {
                                const totalBudget = budget.budgetLines.reduce((acc, line) => acc + line.quantite * line.pu, 0);
                                const totalRealise = budget.realiseLines.reduce((acc, line) => acc + line.quantite * line.pu, 0);
                                const ecart = totalRealise - totalBudget;
                                const consommation = totalBudget > 0 ? (totalRealise / totalBudget) * 100 : 0;
                                return (
                                    <TableRow key={budget.id}>
                                        <TableCell className="font-medium">{budget.month} {budget.year}</TableCell>
                                        <TableCell>{budget.sectionLibelle}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(totalBudget)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(totalRealise)}</TableCell>
                                        <TableCell className={cn("text-right font-mono", ecart > 0 ? 'text-red-500' : 'text-green-500')}>{formatCurrency(ecart)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={consommation} className={consommation > 100 ? '[&>div]:bg-red-500' : ''}/>
                                                <span className="text-xs font-mono">{consommation.toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenBudgetModal(budget)} title="Modifier le budget"><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenRealiseModal(budget)} title="Saisir les réalisés"><Sigma className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handlePrintReport(budget)} title="Imprimer le rapport"><Printer className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => setBudgetToDelete(budget)} title="Supprimer"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <BudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onSave={handleSaveBudget}
                existingBudget={editingBudget}
            />
            
            <RealiseModal
                isOpen={isRealiseModalOpen}
                onClose={() => setIsRealiseModalOpen(false)}
                onSave={handleSaveRealise}
                existingBudget={editingBudget}
            />

            <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette fiche de budget ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. Toutes les données prévisionnelles et réalisées pour cette fiche seront supprimées.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBudget} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

// --- MODAL COMPONENTS ---

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Budget>) => void;
    existingBudget: Budget | null;
}

function BudgetModal({ isOpen, onClose, onSave, existingBudget }: BudgetModalProps) {
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [sectionCode, setSectionCode] = useState('');
    const [budgetLines, setBudgetLines] = useState<BudgetLineItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            setYear(existingBudget?.year || new Date().getFullYear().toString());
            setMonth(existingBudget?.month || MONTHS[new Date().getMonth()]);
            setSectionCode(existingBudget?.sectionCode || '');
            setBudgetLines(existingBudget ? JSON.parse(JSON.stringify(existingBudget.budgetLines)) : [{ id: `b-${Date.now()}`, element: '', quantite: 1, pu: 0 }]);
        }
    }, [existingBudget, isOpen]);

    const handleAddLine = () => setBudgetLines(prev => [...prev, { id: `b-${Date.now()}`, element: '', quantite: 1, pu: 0 }]);
    const handleRemoveLine = (id: string) => setBudgetLines(prev => prev.filter(l => l.id !== id));
    
    const handleLineChange = (id: string, field: keyof Omit<BudgetLineItem, 'id'>, value: string) => {
        setBudgetLines(prev => prev.map(line => 
            line.id === id ? { ...line, [field]: (field === 'element' ? value : parseFloat(value) || 0) } : line
        ));
    };

    const totalBudget = useMemo(() => budgetLines.reduce((acc, line) => acc + line.quantite * line.pu, 0), [budgetLines]);

    const handleSave = () => {
        const sectionInfo = MOCK_ANALYTIC_SECTIONS.find(s => s.code === sectionCode);
        if (!sectionInfo) return;
        onSave({ year, month, sectionCode, sectionLibelle: sectionInfo.libelle, budgetLines });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{existingBudget ? 'Modifier le Budget Prévisionnel' : 'Créer un nouveau budget'}</DialogTitle>
                    <DialogDescription>Sélectionnez une période et une section, puis détaillez le budget prévisionnel.</DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-3 gap-4 py-4">
                    <div className="space-y-1.5"><Label>Année</Label><Select value={year} onValueChange={setYear} disabled={!!existingBudget}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1.5"><Label>Mois</Label><Select value={month} onValueChange={setMonth} disabled={!!existingBudget}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1.5"><Label>Section Analytique</Label><Select value={sectionCode} onValueChange={setSectionCode} disabled={!!existingBudget}><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger><SelectContent>{MOCK_ANALYTIC_SECTIONS.map(s => <SelectItem key={s.code} value={s.code}>{s.libelle}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="flex-1 overflow-y-auto pr-4 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Target className="h-5 w-5"/>Détail du Prévisionnel</h3>
                    <Table>
                        <TableHeader><TableRow><TableHead>Élément</TableHead><TableHead className="w-24 text-center">Qté</TableHead><TableHead className="w-32 text-center">P.U.</TableHead><TableHead className="w-32 text-center">Montant</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {budgetLines.map(line => (
                                <TableRow key={line.id}><TableCell><Input value={line.element} onChange={e => handleLineChange(line.id, 'element', e.target.value)} className="h-8"/></TableCell><TableCell><Input type="number" value={line.quantite} onChange={e => handleLineChange(line.id, 'quantite', e.target.value)} className="h-8 text-center"/></TableCell><TableCell><Input type="number" value={line.pu} onChange={e => handleLineChange(line.id, 'pu', e.target.value)} className="h-8 text-center"/></TableCell><TableCell className="text-right font-mono pr-4">{formatCurrency(line.quantite * line.pu)}</TableCell><TableCell><Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRemoveLine(line.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="font-bold bg-secondary"><TableCell colSpan={3} className="text-right">Total Prévisionnel</TableCell><TableCell className="text-right font-mono">{formatCurrency(totalBudget)}</TableCell><TableCell></TableCell></TableRow>
                        </TableFooter>
                    </Table>
                </div>
                <div className="flex-shrink-0 pt-4"><Button type="button" size="sm" variant="outline" onClick={handleAddLine}><PlusCircle className="mr-2 h-4 w-4"/> Ajouter une ligne</Button></div>
                <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSave} disabled={!sectionCode}>Enregistrer le budget</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface RealiseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (lines: BudgetLineItem[]) => void;
    existingBudget: Budget | null;
}

function RealiseModal({ isOpen, onClose, onSave, existingBudget }: RealiseModalProps) {
    const [realiseLines, setRealiseLines] = useState<BudgetLineItem[]>([]);

    useEffect(() => {
        if (isOpen && existingBudget) {
            setRealiseLines(JSON.parse(JSON.stringify(existingBudget.realiseLines)));
        } else if (isOpen) {
             setRealiseLines([{ id: `r-${Date.now()}`, element: '', quantite: 1, pu: 0 }]);
        }
    }, [existingBudget, isOpen]);
    
    const handleAddLine = () => setRealiseLines(prev => [...prev, { id: `r-${Date.now()}`, element: '', quantite: 1, pu: 0 }]);
    const handleRemoveLine = (id: string) => setRealiseLines(prev => prev.filter(l => l.id !== id));
    
    const handleLineChange = (id: string, field: keyof Omit<BudgetLineItem, 'id'>, value: string) => {
        setRealiseLines(prev => prev.map(line => 
            line.id === id ? { ...line, [field]: (field === 'element' ? value : parseFloat(value) || 0) } : line
        ));
    };

    const totalRealise = useMemo(() => realiseLines.reduce((acc, line) => acc + line.quantite * line.pu, 0), [realiseLines]);
    
    if (!existingBudget) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Saisir les Réalisations</DialogTitle>
                    <DialogDescription>Pour le budget: {existingBudget.sectionLibelle} - {existingBudget.month} {existingBudget.year}</DialogDescription>
                </DialogHeader>
                 <div className="flex-1 overflow-y-auto pr-4 pt-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Sigma className="h-5 w-5"/>Détail des Réalisations</h3>
                    <Table>
                        <TableHeader><TableRow><TableHead>Élément</TableHead><TableHead className="w-24 text-center">Qté</TableHead><TableHead className="w-32 text-center">P.U.</TableHead><TableHead className="w-32 text-center">Montant</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
                        <TableBody>
                            {realiseLines.map(line => (
                                <TableRow key={line.id}><TableCell><Input value={line.element} onChange={e => handleLineChange(line.id, 'element', e.target.value)} className="h-8"/></TableCell><TableCell><Input type="number" value={line.quantite} onChange={e => handleLineChange(line.id, 'quantite', e.target.value)} className="h-8 text-center"/></TableCell><TableCell><Input type="number" value={line.pu} onChange={e => handleLineChange(line.id, 'pu', e.target.value)} className="h-8 text-center"/></TableCell><TableCell className="text-right font-mono pr-4">{formatCurrency(line.quantite * line.pu)}</TableCell><TableCell><Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRemoveLine(line.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow className="font-bold bg-secondary"><TableCell colSpan={3} className="text-right">Total Réalisé</TableCell><TableCell className="text-right font-mono">{formatCurrency(totalRealise)}</TableCell><TableCell></TableCell></TableRow>
                        </TableFooter>
                    </Table>
                </div>
                <div className="flex-shrink-0 pt-4"><Button type="button" size="sm" variant="outline" onClick={handleAddLine}><PlusCircle className="mr-2 h-4 w-4"/> Ajouter une ligne</Button></div>
                <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={() => onSave(realiseLines)}>Enregistrer les réalisations</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

