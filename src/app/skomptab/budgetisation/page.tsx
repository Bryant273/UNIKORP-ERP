
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Upload, Pencil, Trash2, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type BudgetLine = {
    id: number;
    sectionCode: string;
    sectionLibelle: string;
    budget: number;
    realise: number;
};

const MOCK_BUDGET_DATA: BudgetLine[] = [
    { id: 1, sectionCode: 'D-FIN', sectionLibelle: 'Finance & Comptabilité', budget: 50000, realise: 45000 },
    { id: 2, sectionCode: 'D-RH', sectionLibelle: 'Ressources Humaines', budget: 75000, realise: 80000 },
    { id: 3, sectionCode: 'D-IT-INFRA', sectionLibelle: 'Infrastructure IT', budget: 120000, realise: 115000 },
    { id: 4, sectionCode: 'P2024-01-DEV', sectionLibelle: 'Développement ERP', budget: 250000, realise: 180000 },
];

const defaultFormData: Omit<BudgetLine, 'id' | 'realise'> = {
    sectionCode: '',
    sectionLibelle: '',
    budget: 0,
};

export default function BudgetisationPage() {
    const [budgetLines, setBudgetLines] = useState<BudgetLine[]>(MOCK_BUDGET_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLine, setEditingLine] = useState<BudgetLine | null>(null);
    const [formData, setFormData] = useState(defaultFormData);
    const [lineToDelete, setLineToDelete] = useState<BudgetLine | null>(null);
    const { toast } = useToast();

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' XOF';

    const handleOpenModal = (line: BudgetLine | null) => {
        if (line) {
            setEditingLine(line);
            setFormData({
                sectionCode: line.sectionCode,
                sectionLibelle: line.sectionLibelle,
                budget: line.budget,
            });
        } else {
            setEditingLine(null);
            setFormData(defaultFormData);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLine(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: id === 'budget' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLine) {
            setBudgetLines(budgetLines.map(line => 
                line.id === editingLine.id ? { ...editingLine, ...formData } : line
            ));
            toast({ title: "Ligne budgétaire modifiée" });
        } else {
            const newLine: BudgetLine = {
                id: Date.now(),
                ...formData,
                realise: 0, // A new line has no realized amount yet
            };
            setBudgetLines([...budgetLines, newLine]);
            toast({ title: "Nouvelle ligne budgétaire ajoutée" });
        }
        handleCloseModal();
    };

    const handleDelete = () => {
        if (lineToDelete) {
            setBudgetLines(budgetLines.filter(line => line.id !== lineToDelete.id));
            setLineToDelete(null);
            toast({ title: "Ligne budgétaire supprimée" });
        }
    };
    
    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Target /> Budgétisation & Suivi</CardTitle>
                            <CardDescription>
                                Élaborez vos budgets, suivez les réalisations et analysez les écarts.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Importer un budget</Button>
                            <Button onClick={() => handleOpenModal(null)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Saisir une ligne
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[250px]"><SelectValue placeholder="Filtrer par plan..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les plans analytiques</SelectItem>
                                    <SelectItem value="proj">Analyse par Projet</SelectItem>
                                    <SelectItem value="dept">Analyse par Département</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="v1">
                                <SelectTrigger className="w-[250px]"><SelectValue placeholder="Filtrer par version..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="v1">Version Budgétaire Initiale</SelectItem>
                                    <SelectItem value="v2">Révisé 1 - Juillet 2024</SelectItem>
                                    <SelectItem value="v3">Atterrissage Prévisionnel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Section Analytique</TableHead>
                                <TableHead className="text-right">Budget Alloué</TableHead>
                                <TableHead className="text-right">Montant Réalisé</TableHead>
                                <TableHead className="text-right">Écart</TableHead>
                                <TableHead className="w-[250px]">Taux de Consommation</TableHead>
                                <TableHead className="text-center w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {budgetLines.map(line => {
                                const ecart = line.realise - line.budget;
                                const consommation = (line.realise / line.budget) * 100;
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
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(line)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setLineToDelete(line)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingLine ? 'Modifier la ligne budgétaire' : 'Nouvelle ligne budgétaire'}</DialogTitle>
                            <DialogDescription>Remplissez les informations ci-dessous.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="sectionCode">Code Section Analytique</Label>
                                <Input id="sectionCode" value={formData.sectionCode} onChange={handleInputChange} placeholder="Ex: D-FIN" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sectionLibelle">Libellé de la section</Label>
                                <Input id="sectionLibelle" value={formData.sectionLibelle} onChange={handleInputChange} placeholder="Ex: Finance & Comptabilité" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget Alloué (XOF)</Label>
                                <Input id="budget" type="number" value={formData.budget} onChange={handleInputChange} required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={handleCloseModal}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!lineToDelete} onOpenChange={() => setLineToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. La ligne budgétaire sera définitivement supprimée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
