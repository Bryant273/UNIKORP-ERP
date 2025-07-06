
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { GitCompareArrows, Loader2, PlusCircle, Eye, Trash2, Percent, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// MOCK DATA

// History of past ventilations
type DistributionKey = {
    sectionCode: string;
    rate: number;
};
type VentilationHistory = {
    id: number;
    date: string;
    periode: string;
    description: string;
    status: 'Terminée';
    accounts: string[];
    keys: DistributionKey[];
};
const MOCK_VENTILATION_HISTORY: VentilationHistory[] = [
    { id: 1, date: '2024-07-28', periode: 'Juillet 2024', description: 'Ventilation mensuelle des charges de personnel', status: 'Terminée', accounts: ['641'], keys: [{sectionCode: 'DIR.GEN', rate: 40}, {sectionCode: 'PROD.A1', rate: 30}, {sectionCode: 'PROD.A2', rate: 30}] },
    { id: 2, date: '2024-07-25', periode: 'Juillet 2024', description: 'Répartition des achats de fournitures', status: 'Terminée', accounts: ['601', '606'], keys: [{sectionCode: 'COMM.FR', rate: 50}, {sectionCode: 'COMM.EXP', rate: 50}]},
    { id: 3, date: '2024-06-30', periode: 'Juin 2024', description: 'Clôture analytique Q2', status: 'Terminée', accounts: ['601','606','613','622','641'], keys: [{sectionCode: 'DIR.GEN', rate: 20}, {sectionCode: 'PROD.A1', rate: 40}, {sectionCode: 'PROD.A2', rate: 40}]},
];


// Data for the modal
const MOCK_COMPTES_GENERAUX = [
    { numero: '601', intitule: 'Achats stockés' },
    { numero: '606', intitule: 'Achats non stockés' },
    { numero: '613', intitule: 'Locations' },
    { numero: '622', intitule: 'Rémunérations et honoraires' },
    { numero: '641', intitule: 'Rémunérations du personnel' },
];
const MOCK_ANALYTIC_SECTIONS = [
    { code: 'DIR.GEN', name: 'Direction Générale' },
    { code: 'PROD.A1', name: 'Production Atelier 1' },
    { code: 'PROD.A2', name: 'Production Atelier 2' },
    { code: 'COMM.FR', name: 'Commercial France' },
    { code: 'COMM.EXP', name: 'Commercial Export' },
];


// Main Component
export default function VentilationsPage() {
    const { toast } = useToast();
    const [history, setHistory] = useState(MOCK_VENTILATION_HISTORY);
    const [isVentilationModalOpen, setIsVentilationModalOpen] = useState(false);
    const [ventilationToDelete, setVentilationToDelete] = useState<VentilationHistory | null>(null);
    const [isVentilating, setIsVentilating] = useState(false);
    
    // State for the modal logic
    const [editingVentilation, setEditingVentilation] = useState<VentilationHistory | null>(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [distributionKeys, setDistributionKeys] = useState<DistributionKey[]>([]);
    const [description, setDescription] = useState('');

    const loadVentilationForModal = (ventilation: VentilationHistory, viewMode: boolean) => {
        setIsViewMode(viewMode);
        setEditingVentilation(ventilation);
        setSelectedAccounts(ventilation.accounts);
        setDistributionKeys(ventilation.keys);
        setDescription(ventilation.description);
        setIsVentilationModalOpen(true);
    };

    const handleAccountToggle = (accountNumber: string) => {
        setSelectedAccounts(prev => 
            prev.includes(accountNumber) 
                ? prev.filter(a => a !== accountNumber)
                : [...prev, accountNumber]
        );
    };
    
    const handleAddKey = (sectionCode: string) => {
        setDistributionKeys(prev => {
            if (prev.some(k => k.sectionCode === sectionCode)) return prev;
            return [...prev, { sectionCode, rate: 0 }];
        });
    };

    const handleRemoveKey = (sectionCode: string) => {
        setDistributionKeys(prev => prev.filter(k => k.sectionCode !== sectionCode));
    };

    const handleRateChange = (sectionCode: string, rate: number) => {
        setDistributionKeys(prev => prev.map(key => 
            key.sectionCode === sectionCode ? { ...key, rate: isNaN(rate) ? 0 : rate } : key
        ));
    };

    const totalRate = useMemo(() => distributionKeys.reduce((sum, key) => sum + key.rate, 0) || 0, [distributionKeys]);
    
    const isVentilationReady = useMemo(() => {
        if (selectedAccounts.length === 0 || distributionKeys.length === 0) return false;
        return totalRate === 100;
    }, [selectedAccounts, distributionKeys, totalRate]);


    const handleVentilation = () => {
        setIsVentilating(true);
        toast({ title: "Ventilation en cours...", description: `Traitement des répartitions...` });
        
        setTimeout(() => {
            const finalDescription = description.trim() || `Ventilation de ${selectedAccounts.length} compte(s)`;

            const newHistoryEntry: VentilationHistory = {
                id: editingVentilation?.id || Date.now(),
                date: format(new Date(), 'yyyy-MM-dd'),
                periode: format(new Date(), 'MMMM yyyy', { locale: fr }),
                description: finalDescription,
                status: 'Terminée',
                accounts: selectedAccounts,
                keys: distributionKeys,
            };

            if (editingVentilation) {
                setHistory(prev => prev.map(h => h.id === editingVentilation.id ? newHistoryEntry : h));
                toast({ title: "Ventilation modifiée !", description: "Les modifications ont été enregistrées.", className: 'bg-green-100 border-green-300 text-green-800'});
            } else {
                setHistory(prev => [newHistoryEntry, ...prev]);
                toast({ title: "Ventilation réussie !", description: "Les écritures ont été ventilées selon les clés définies.", className: 'bg-green-100 border-green-300 text-green-800'});
            }

            setIsVentilating(false);
            resetModal();
        }, 2500);
    };

    const resetModal = () => {
        setIsVentilationModalOpen(false);
        setSelectedAccounts([]);
        setDistributionKeys([]);
        setDescription('');
        setEditingVentilation(null);
        setIsViewMode(false);
    }
    
    const handleDelete = () => {
        if (!ventilationToDelete) return;
        setHistory(h => h.filter(item => item.id !== ventilationToDelete!.id));
        setVentilationToDelete(null);
        toast({ title: "Ventilation supprimée", description: "L'entrée a été retirée de l'historique." });
    };

    const modalTitle = isViewMode ? "Détails de la Ventilation" : editingVentilation ? "Modifier la Ventilation" : "Nouvelle Ventilation Analytique";
    
    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><GitCompareArrows /> Ventilations Analytiques</CardTitle>
                            <CardDescription>Définissez des clés de répartition et ventilez les charges/produits vers les sections analytiques.</CardDescription>
                        </div>
                        <Button onClick={() => setIsVentilationModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Lancer une ventilation
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Période</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Comptes</TableHead>
                                <TableHead className="text-center">Sections</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="capitalize">{item.periode}</TableCell>
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell className="text-center"><Badge variant="secondary">{item.accounts.length}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge variant="secondary">{item.keys.length}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge>{item.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => loadVentilationForModal(item, true)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => loadVentilationForModal(item, false)}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setVentilationToDelete(item)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isVentilationModalOpen} onOpenChange={resetModal}>
                <DialogContent className="max-w-4xl h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>{modalTitle}</DialogTitle>
                        <DialogDescription>
                            Sélectionnez les comptes, définissez une clé de répartition unique, puis lancez la ventilation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-6 py-4 flex-1 overflow-y-auto">
                        <div className="flex flex-col gap-6">
                            <div>
                                <Label className="font-semibold mb-2 block text-base">1. Comptes généraux à ventiler</Label>
                                <ScrollArea className="h-48 rounded-md border p-4">
                                    <div className="space-y-2">
                                        {MOCK_COMPTES_GENERAUX.map(compte => (
                                            <div key={compte.numero} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`compte-${compte.numero}`}
                                                    checked={selectedAccounts.includes(compte.numero)}
                                                    onCheckedChange={() => handleAccountToggle(compte.numero)}
                                                    disabled={isViewMode}
                                                />
                                                <Label htmlFor={`compte-${compte.numero}`} className="flex-1 p-2 rounded-md transition-colors cursor-pointer">
                                                    <span className="text-xs p-1 bg-muted rounded-sm w-16 text-center">{compte.numero}</span>
                                                    <span className="ml-2">{compte.intitule}</span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                             <div>
                                <Label className="font-semibold mb-2 block text-base">2. Sections analytiques de destination</Label>
                                <ScrollArea className="h-48 rounded-md border p-4">
                                     <div className="space-y-2">
                                        {MOCK_ANALYTIC_SECTIONS.map(section => (
                                            <div key={section.code} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                                <div>
                                                    <span className="text-xs p-1 bg-muted rounded-sm w-24 text-center">{section.code}</span>
                                                    <span className="ml-2">{section.name}</span>
                                                </div>
                                                <Button type="button" size="sm" variant="outline" onClick={() => handleAddKey(section.code)} disabled={isViewMode || distributionKeys.some(k => k.sectionCode === section.code)}>
                                                    Ajouter
                                                </Button>
                                            </div>
                                        ))}
                                     </div>
                                </ScrollArea>
                            </div>
                        </div>
                        <div>
                             <Label className="font-semibold mb-2 block text-base">3. Clé de Répartition</Label>
                             <Card className="h-[calc(100%-2rem)]">
                                <div className="flex flex-col h-full">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Taux de répartition (%)</CardTitle>
                                        <CardDescription>Cette clé s'appliquera à tous les comptes sélectionnés. Le total doit faire 100%.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Section</TableHead><TableHead className="w-[100px]">Taux (%)</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {distributionKeys.map(key => {
                                                    const sectionInfo = MOCK_ANALYTIC_SECTIONS.find(s => s.code === key.sectionCode);
                                                    return (
                                                        <TableRow key={key.sectionCode}>
                                                            <TableCell>{sectionInfo?.name || key.sectionCode}</TableCell>
                                                            <TableCell><Input type="number" value={key.rate} onChange={(e) => handleRateChange(key.sectionCode, parseInt(e.target.value))} className="text-center" disabled={isViewMode} /></TableCell>
                                                            <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveKey(key.sectionCode)} disabled={isViewMode}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                    <CardFooter className={cn("p-4 border-t font-bold flex justify-between", totalRate === 100 ? 'text-green-600' : 'text-destructive')}>
                                        <span>Total</span>
                                        <span>{totalRate} %</span>
                                    </CardFooter>
                                </div>
                             </Card>
                        </div>
                    </div>
                     <div className='px-6'>
                        <Label htmlFor="description">Description (Optionnel)</Label>
                        <Input id="description" placeholder="Ex: Ventilation mensuelle des charges" value={description} onChange={e => setDescription(e.target.value)} disabled={isViewMode}/>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetModal}>
                          {isViewMode ? 'Fermer' : 'Annuler'}
                        </Button>
                        {!isViewMode &&
                          <Button onClick={handleVentilation} disabled={isVentilating || !isVentilationReady}>
                              {isVentilating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GitCompareArrows className="mr-2 h-4 w-4"/>}
                              {isVentilating ? 'Ventilation en cours...' : 'Lancer la ventilation'}
                          </Button>
                        }
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!ventilationToDelete} onOpenChange={() => setVentilationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette ventilation ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action ne peut pas être annulée. Cela supprimera l'entrée de l'historique mais n'annulera pas les écritures déjà ventilées.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Confirmer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
