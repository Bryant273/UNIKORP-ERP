
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sigma, Edit, Target } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type BudgetLine = {
    id: number;
    sectionCode: string;
    sectionLibelle: string;
    budget: number;
    realise: number;
};

const MOCK_BUDGET_SECTIONS: Omit<BudgetLine, 'budget' | 'realise'>[] = [
    { id: 1, sectionCode: 'D-FIN', sectionLibelle: 'Finance & Comptabilité' },
    { id: 2, sectionCode: 'D-RH', sectionLibelle: 'Ressources Humaines' },
    { id: 3, sectionCode: 'D-IT-INFRA', sectionLibelle: 'Infrastructure IT' },
    { id: 4, sectionCode: 'D-IT-DEV', sectionLibelle: 'Développement Applicatif' },
    { id: 5, sectionCode: 'P2024-01-DEV', sectionLibelle: 'Développement ERP' },
    { id: 6, sectionCode: 'P2024-02-MRKT', sectionLibelle: 'Campagne Marketing Q3' },
];

const initialBudgetLines: BudgetLine[] = [
    { id: 1, sectionCode: 'D-FIN', sectionLibelle: 'Finance & Comptabilité', budget: 50000, realise: 45000 },
    { id: 2, sectionCode: 'D-RH', sectionLibelle: 'Ressources Humaines', budget: 75000, realise: 80000 },
    { id: 3, sectionCode: 'D-IT-INFRA', sectionLibelle: 'Infrastructure IT', budget: 120000, realise: 115000 },
    { id: 4, sectionCode: 'D-IT-DEV', sectionLibelle: 'Développement Applicatif', budget: 150000, realise: 95000 },
    { id: 5, sectionCode: 'P2024-01-DEV', sectionLibelle: 'Développement ERP', budget: 250000, realise: 180000 },
    { id: 6, sectionCode: 'P2024-02-MRKT', sectionLibelle: 'Campagne Marketing Q3', budget: 40000, realise: 42500 },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' XOF';


export default function BudgetisationPage() {
    const [budgetLines, setBudgetLines] = useState<BudgetLine[]>(initialBudgetLines);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isRealiseModalOpen, setIsRealiseModalOpen] = useState(false);

    const handleSaveBudget = (newBudgets: Record<string, number>) => {
        setBudgetLines(prevLines =>
            prevLines.map(line => ({
                ...line,
                budget: newBudgets[line.sectionCode] ?? line.budget,
            }))
        );
        setIsBudgetModalOpen(false);
    };

    const handleSaveRealise = (newRealises: Record<string, number>) => {
        setBudgetLines(prevLines =>
            prevLines.map(line => ({
                ...line,
                realise: newRealises[line.sectionCode] ?? line.realise,
            }))
        );
        setIsRealiseModalOpen(false);
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
                            <Button variant="outline" onClick={() => setIsBudgetModalOpen(true)}>
                                <Edit className="mr-2 h-4 w-4"/> Établir un budget
                            </Button>
                            <Button onClick={() => setIsRealiseModalOpen(true)}>
                                <Sigma className="mr-2 h-4 w-4"/> Saisir les réalisés
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Section Analytique</TableHead>
                                <TableHead className="text-right">Budget Alloué</TableHead>
                                <TableHead className="text-right">Montant Réalisé</TableHead>
                                <TableHead className="text-right">Écart</TableHead>
                                <TableHead className="w-[250px]">Taux de Consommation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budgetLines.map(line => {
                                const ecart = line.realise - line.budget;
                                const consommation = line.budget > 0 ? (line.realise / line.budget) * 100 : 0;
                                return (
                                    <TableRow key={line.id}>
                                        <TableCell>
                                            <div className="font-medium">{line.sectionLibelle}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{line.sectionCode}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(line.budget)}</TableCell>
                                        <TableCell className="text-right font-mono">{formatCurrency(line.realise)}</TableCell>
                                        <TableCell className={`text-right font-mono ${ecart > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(ecart)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={consommation} className={consommation > 100 ? '[&>div]:bg-red-500' : ''}/>
                                                <span className="text-xs font-mono">{consommation.toFixed(1)}%</span>
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
                initialData={budgetLines}
                onSave={handleSaveBudget}
            />

            <RealiseModal
                isOpen={isRealiseModalOpen}
                onClose={() => setIsRealiseModalOpen(false)}
                initialData={budgetLines}
                onSave={handleSaveRealise}
            />
        </>
    )
}

// --- Modals Components ---

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: BudgetLine[];
    onSave: (data: Record<string, number>) => void;
}

function BudgetModal({ isOpen, onClose, initialData, onSave }: ModalProps) {
    const { toast } = useToast();
    const [budgets, setBudgets] = useState<Record<string, number>>({});

    useEffect(() => {
        if (isOpen) {
            const initialBudgets = initialData.reduce((acc, line) => {
                acc[line.sectionCode] = line.budget;
                return acc;
            }, {} as Record<string, number>);
            setBudgets(initialBudgets);
        }
    }, [isOpen, initialData]);
    
    const handleInputChange = (sectionCode: string, value: string) => {
        setBudgets(prev => ({ ...prev, [sectionCode]: parseFloat(value) || 0 }));
    };

    const handleSave = () => {
        onSave(budgets);
        toast({ title: 'Budget mis à jour avec succès.' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Établir le budget</DialogTitle>
                    <DialogDescription>Saisissez les montants budgétés pour chaque section analytique.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow>
                                    <TableHead>Section Analytique</TableHead>
                                    <TableHead className="text-right w-[200px]">Montant Budgété (XOF)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_BUDGET_SECTIONS.map(section => (
                                    <TableRow key={section.id}>
                                        <TableCell>
                                            <div className="font-medium">{section.sectionLibelle}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{section.sectionCode}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Input 
                                                type="number" 
                                                value={budgets[section.sectionCode] || ''}
                                                onChange={(e) => handleInputChange(section.sectionCode, e.target.value)}
                                                className="text-right"
                                                placeholder="0"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer le budget</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function RealiseModal({ isOpen, onClose, initialData, onSave }: ModalProps) {
    const { toast } = useToast();
    const [realises, setRealises] = useState<Record<string, number>>({});

     useEffect(() => {
        if (isOpen) {
            const initialRealises = initialData.reduce((acc, line) => {
                acc[line.sectionCode] = line.realise;
                return acc;
            }, {} as Record<string, number>);
            setRealises(initialRealises);
        }
    }, [isOpen, initialData]);

    const handleInputChange = (sectionCode: string, value: string) => {
        setRealises(prev => ({ ...prev, [sectionCode]: parseFloat(value) || 0 }));
    };

    const handleSave = () => {
        onSave(realises);
        toast({ title: 'Montants réalisés mis à jour.' });
    };

     return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Saisir les montants réalisés</DialogTitle>
                    <DialogDescription>Enregistrez les montants réellement dépensés ou gagnés pour chaque section.</DialogDescription>
                </DialogHeader>
                 <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow>
                                    <TableHead>Section Analytique</TableHead>
                                    <TableHead className="text-right w-[200px]">Montant Réalisé (XOF)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_BUDGET_SECTIONS.map(section => (
                                    <TableRow key={section.id}>
                                        <TableCell>
                                            <div className="font-medium">{section.sectionLibelle}</div>
                                            <div className="text-xs text-muted-foreground font-mono">{section.sectionCode}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Input 
                                                type="number" 
                                                value={realises[section.sectionCode] || ''}
                                                onChange={(e) => handleInputChange(section.sectionCode, e.target.value)}
                                                className="text-right"
                                                placeholder="0"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
                <DialogFooter className="pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer les réalisés</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
