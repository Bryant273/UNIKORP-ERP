
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Sigma, Eye, Target } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';


// --- DATA TYPES ---

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

// --- MOCK DATA ---

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

    const handleOpenModal = (budget: Budget | null) => {
        setEditingBudget(budget);
        setIsModalOpen(true);
    };

    const handleSaveBudget = (newOrUpdatedBudget: Omit<Budget, 'id'>) => {
        if (editingBudget) {
            setBudgets(budgets.map(b => b.id === editingBudget.id ? { ...editingBudget, ...newOrUpdatedBudget } : b));
        } else {
            const newId = Math.max(0, ...budgets.map(b => b.id)) + 1;
            setBudgets(prev => [...prev, { id: newId, ...newOrUpdatedBudget }]);
        }
        setIsModalOpen(false);
        setEditingBudget(null);
    };

    const handleDeleteBudget = () => {
        if (budgetToDelete) {
            setBudgets(budgets.filter(b => b.id !== budgetToDelete.id));
            setBudgetToDelete(null);
        }
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
                            <Button onClick={() => handleOpenModal(null)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Créer un budget
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
                                <TableHead className="text-center w-[120px]">Actions</TableHead>
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
                                        <TableCell className={`text-right font-mono ${ecart > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(ecart)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={consommation} className={consommation > 100 ? '[&>div]:bg-red-500' : ''}/>
                                                <span className="text-xs font-mono">{consommation.toFixed(1)}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(budget)}><Eye className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => setBudgetToDelete(budget)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
                isOpen={isModalOpen}
                onClose={() => {setIsModalOpen(false); setEditingBudget(null);}}
                onSave={handleSaveBudget}
                existingBudget={editingBudget}
            />

            <AlertDialog open={!!budgetToDelete} onOpenChange={() => setBudgetToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce budget ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. Toutes les données prévisionnelles et réalisées pour cette fiche de budget seront supprimées.</AlertDialogDescription>
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
    onSave: (data: Omit<Budget, 'id'>) => void;
    existingBudget: Budget | null;
}

function BudgetModal({ isOpen, onClose, onSave, existingBudget }: BudgetModalProps) {
    const [year, setYear] = useState(existingBudget?.year || new Date().getFullYear().toString());
    const [month, setMonth] = useState(existingBudget?.month || MONTHS[new Date().getMonth()]);
    const [sectionCode, setSectionCode] = useState(existingBudget?.sectionCode || '');
    const [budgetLines, setBudgetLines] = useState<BudgetLineItem[]>([]);
    const [realiseLines, setRealiseLines] = useState<BudgetLineItem[]>([]);

    useEffect(() => {
        if (existingBudget) {
            setYear(existingBudget.year);
            setMonth(existingBudget.month);
            setSectionCode(existingBudget.sectionCode);
            setBudgetLines(JSON.parse(JSON.stringify(existingBudget.budgetLines)));
            setRealiseLines(JSON.parse(JSON.stringify(existingBudget.realiseLines)));
        } else {
            setYear(new Date().getFullYear().toString());
            setMonth(MONTHS[new Date().getMonth()]);
            setSectionCode('');
            setBudgetLines([{ id: `b-${Date.now()}`, element: '', quantite: 1, pu: 0 }]);
            setRealiseLines([]);
        }
    }, [existingBudget, isOpen]);

    const handleSave = () => {
        const sectionInfo = MOCK_ANALYTIC_SECTIONS.find(s => s.code === sectionCode);
        if (!sectionInfo) return; // Should not happen with select
        onSave({
            year,
            month,
            sectionCode,
            sectionLibelle: sectionInfo.libelle,
            budgetLines,
            realiseLines,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{existingBudget ? 'Détails du Budget' : 'Créer un nouveau budget'}</DialogTitle>
                    <DialogDescription>Sélectionnez une période et une section, puis détaillez le budget prévisionnel et les réalisations.</DialogDescription>
                </DialogHeader>
                <div className="grid md:grid-cols-3 gap-4 p-4 border-b">
                    <div className="space-y-1.5"><Label>Année</Label><Select value={year} onValueChange={setYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1.5"><Label>Mois</Label><Select value={month} onValueChange={setMonth}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1.5"><Label>Section Analytique</Label><Select value={sectionCode} onValueChange={setSectionCode}><SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger><SelectContent>{MOCK_ANALYTIC_SECTIONS.map(s => <SelectItem key={s.code} value={s.code}>{s.libelle}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="flex-1 grid md:grid-cols-2 gap-4 overflow-hidden p-4">
                    <BudgetDetailTable title="Budget Prévisionnel" icon={Target} lines={budgetLines} setLines={setBudgetLines} />
                    <BudgetDetailTable title="Réalisations" icon={Sigma} lines={realiseLines} setLines={setRealiseLines} />
                </div>
                <DialogFooter className="p-4 border-t">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSave} disabled={!sectionCode}>Enregistrer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface BudgetDetailTableProps {
    title: string;
    icon: React.ElementType;
    lines: BudgetLineItem[];
    setLines: React.Dispatch<React.SetStateAction<BudgetLineItem[]>>;
}

function BudgetDetailTable({ title, icon: Icon, lines, setLines }: BudgetDetailTableProps) {
    const handleAddLine = () => setLines(prev => [...prev, { id: `item-${Date.now()}`, element: '', quantite: 1, pu: 0 }]);
    const handleRemoveLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));
    
    const handleLineChange = (id: string, field: keyof Omit<BudgetLineItem, 'id'>, value: string) => {
        setLines(prev => prev.map(line => 
            line.id === id ? { ...line, [field]: (field === 'element' ? value : parseFloat(value) || 0) } : line
        ));
    };

    const total = useMemo(() => lines.reduce((acc, line) => acc + line.quantite * line.pu, 0), [lines]);

    return (
        <div className="flex flex-col border rounded-lg h-full">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="text-xl flex items-center gap-2"><Icon className="h-5 w-5" /> {title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-2">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead>Élément</TableHead>
                            <TableHead className="w-20 text-center">Qté</TableHead>
                            <TableHead className="w-28 text-center">P.U.</TableHead>
                            <TableHead className="w-28 text-center">Montant</TableHead>
                            <TableHead className="w-10"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lines.map(line => (
                            <TableRow key={line.id}>
                                <TableCell><Input value={line.element} onChange={e => handleLineChange(line.id, 'element', e.target.value)} className="h-8"/></TableCell>
                                <TableCell><Input type="number" value={line.quantite} onChange={e => handleLineChange(line.id, 'quantite', e.target.value)} className="h-8 text-center"/></TableCell>
                                <TableCell><Input type="number" value={line.pu} onChange={e => handleLineChange(line.id, 'pu', e.target.value)} className="h-8 text-center"/></TableCell>
                                <TableCell className="text-right font-mono pr-4">{formatCurrency(line.quantite * line.pu)}</TableCell>
                                <TableCell><Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleRemoveLine(line.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex-shrink-0 flex items-center justify-between border-t p-4">
                 <Button type="button" size="sm" variant="outline" onClick={handleAddLine}><PlusCircle className="mr-2 h-4 w-4"/> Ajouter</Button>
                <div className="flex items-center gap-4">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg font-mono">{formatCurrency(total)}</span>
                </div>
            </CardFooter>
        </div>
    );
}

    