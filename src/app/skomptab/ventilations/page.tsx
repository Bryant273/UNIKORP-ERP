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
import { GitCompareArrows, Loader2, PlusCircle, Eye, Trash2, Percent, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// MOCK DATA

// History of past ventilations
type VentilationHistory = {
    id: number;
    date: string;
    description: string;
    status: 'Terminée' | 'Équilibrée';
    accountsCount: number;
    sectionsCount: number;
};
const MOCK_VENTILATION_HISTORY: VentilationHistory[] = [
    { id: 1, date: '2024-07-28', description: 'Ventilation mensuelle des charges de personnel', status: 'Terminée', accountsCount: 1, sectionsCount: 3 },
    { id: 2, date: '2024-07-25', description: 'Répartition des achats de fournitures', status: 'Terminée', accountsCount: 2, sectionsCount: 2 },
    { id: 3, date: '2024-06-30', description: 'Clôture analytique Q2', status: 'Terminée', accountsCount: 5, sectionsCount: 8 },
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

// Types for the modal state
type DistributionKey = {
    sectionCode: string;
    rate: number;
};
type AccountToVentilate = {
    accountNumber: string;
    keys: DistributionKey[];
};

// Main Component
export default function VentilationsPage() {
    const { toast } = useToast();
    const [history, setHistory] = useState(MOCK_VENTILATION_HISTORY);
    const [isVentilationModalOpen, setIsVentilationModalOpen] = useState(false);
    const [ventilationToDelete, setVentilationToDelete] = useState<VentilationHistory | null>(null);
    const [isVentilating, setIsVentilating] = useState(false);
    
    // State for the modal logic
    const [selectedAccountForDistribution, setSelectedAccountForDistribution] = useState<string | null>(null);
    const [accountsToVentilate, setAccountsToVentilate] = useState<AccountToVentilate[]>([]);

    const handleAccountToggle = (accountNumber: string) => {
        setAccountsToVentilate(prev => {
            const exists = prev.some(a => a.accountNumber === accountNumber);
            if (exists) {
                // If the selected account is the one being removed, deselect it
                if (selectedAccountForDistribution === accountNumber) {
                    setSelectedAccountForDistribution(null);
                }
                return prev.filter(a => a.accountNumber !== accountNumber);
            } else {
                // When adding a new account, select it automatically for configuration
                setSelectedAccountForDistribution(accountNumber);
                return [...prev, { accountNumber, keys: [] }];
            }
        });
    };
    
    const handleAddKey = (sectionCode: string) => {
        if (!selectedAccountForDistribution) return;
        setAccountsToVentilate(prev => prev.map(acc => {
            if (acc.accountNumber === selectedAccountForDistribution) {
                if (acc.keys.some(k => k.sectionCode === sectionCode)) return acc; // Avoid duplicates
                return { ...acc, keys: [...acc.keys, { sectionCode, rate: 0 }] };
            }
            return acc;
        }));
    };

    const handleRemoveKey = (sectionCode: string) => {
        if (!selectedAccountForDistribution) return;
        setAccountsToVentilate(prev => prev.map(acc => 
            acc.accountNumber === selectedAccountForDistribution 
            ? { ...acc, keys: acc.keys.filter(k => k.sectionCode !== sectionCode) }
            : acc
        ));
    };

    const handleRateChange = (sectionCode: string, rate: number) => {
        if (!selectedAccountForDistribution) return;
        setAccountsToVentilate(prev => prev.map(acc => 
            acc.accountNumber === selectedAccountForDistribution
            ? { ...acc, keys: acc.keys.map(k => k.sectionCode === sectionCode ? {...k, rate: isNaN(rate) ? 0 : rate } : k) }
            : acc
        ));
    };

    const activeDistribution = accountsToVentilate.find(a => a.accountNumber === selectedAccountForDistribution);
    const totalRate = useMemo(() => activeDistribution?.keys.reduce((sum, key) => sum + key.rate, 0) || 0, [activeDistribution]);
    
    const isVentilationReady = useMemo(() => {
        if (accountsToVentilate.length === 0) return false;
        return accountsToVentilate.every(acc => {
            const total = acc.keys.reduce((sum, key) => sum + key.rate, 0);
            return total === 100;
        });
    }, [accountsToVentilate]);

    const getAccountStatus = (accountNumber: string) => {
        const account = accountsToVentilate.find(a => a.accountNumber === accountNumber);
        if (!account) return 'unchecked';
        if (account.keys.length === 0) return 'pending';
        const total = account.keys.reduce((sum, key) => sum + key.rate, 0);
        return total === 100 ? 'complete' : 'pending';
    };

    const handleVentilation = () => {
        setIsVentilating(true);
        toast({ title: "Ventilation en cours...", description: `Traitement des répartitions...` });
        
        setTimeout(() => {
            const newHistoryEntry: VentilationHistory = {
                id: Date.now(),
                date: format(new Date(), 'yyyy-MM-dd'),
                description: `Ventilation manuelle de ${accountsToVentilate.length} compte(s)`,
                status: 'Terminée',
                accountsCount: accountsToVentilate.length,
                sectionsCount: [...new Set(accountsToVentilate.flatMap(a => a.keys.map(k => k.sectionCode)))].length,
            };
            setHistory(prev => [newHistoryEntry, ...prev]);
            setIsVentilating(false);
            setIsVentilationModalOpen(false);
            // Reset state for next time
            setAccountsToVentilate([]);
            setSelectedAccountForDistribution(null);
            toast({ title: "Ventilation réussie !", description: "Les écritures ont été ventilées selon les clés définies.", className: 'bg-green-100 border-green-300 text-green-800'});
        }, 2500);
    };

    const resetModal = () => {
        setIsVentilationModalOpen(false);
        setAccountsToVentilate([]);
        setSelectedAccountForDistribution(null);
    }
    
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
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Comptes ventilés</TableHead>
                                <TableHead className="text-center">Sections utilisées</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell className="text-center"><Badge variant="secondary">{item.accountsCount}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge variant="secondary">{item.sectionsCount}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge>{item.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" disabled><Eye className="h-4 w-4" /></Button>
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
                <DialogContent className="max-w-6xl h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>Nouvelle Ventilation Analytique</DialogTitle>
                        <DialogDescription>
                            Sélectionnez les comptes, puis définissez les clés de répartition pour chaque section analytique.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-6 py-4 flex-1 overflow-y-auto">
                        {/* Left Panel: Source Accounts & Sections */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <Label className="font-semibold mb-2 block text-base">1. Comptes généraux à ventiler</Label>
                                <ScrollArea className="h-48 rounded-md border p-4">
                                    <div className="space-y-2">
                                        {MOCK_COMPTES_GENERAUX.map(compte => {
                                            const status = getAccountStatus(compte.numero);
                                            return (
                                                <div key={compte.numero} className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id={`compte-${compte.numero}`}
                                                        checked={status !== 'unchecked'}
                                                        onCheckedChange={() => handleAccountToggle(compte.numero)}
                                                    />
                                                    <Label
                                                        htmlFor={`compte-${compte.numero}`}
                                                        className={cn("flex-1 cursor-pointer p-2 rounded-md transition-colors", selectedAccountForDistribution === compte.numero && "bg-accent text-accent-foreground")}
                                                        onClick={() => { if(status !== 'unchecked') setSelectedAccountForDistribution(compte.numero) }}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="font-mono text-xs p-1 bg-muted rounded-sm w-16 text-center">{compte.numero}</span>
                                                                <span className="ml-2">{compte.intitule}</span>
                                                            </div>
                                                            {status === 'complete' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                                            {status === 'pending' && <XCircle className="h-4 w-4 text-red-500" />}
                                                        </div>
                                                    </Label>
                                                </div>
                                            )
                                        })}
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
                                                    <span className="font-mono text-xs p-1 bg-muted rounded-sm w-24 text-center">{section.code}</span>
                                                    <span className="ml-2">{section.name}</span>
                                                </div>
                                                <Button type="button" size="sm" variant="outline" onClick={() => handleAddKey(section.code)} disabled={!selectedAccountForDistribution || activeDistribution?.keys.some(k => k.sectionCode === section.code)}>
                                                    Ajouter
                                                </Button>
                                            </div>
                                        ))}
                                     </div>
                                </ScrollArea>
                            </div>
                        </div>
                        {/* Right Panel: Distribution Keys */}
                        <div>
                             <Label className="font-semibold mb-2 block text-base">3. Clés de Répartition</Label>
                             <Card className="h-[calc(100%-2rem)]">
                                {selectedAccountForDistribution ? (
                                    <div className="flex flex-col h-full">
                                        <CardHeader>
                                            <CardTitle className="text-lg">Compte: {selectedAccountForDistribution}</CardTitle>
                                            <CardDescription>Définissez les pourcentages de répartition. Le total doit être 100%.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 overflow-y-auto">
                                            <Table>
                                                <TableHeader><TableRow><TableHead>Section</TableHead><TableHead className="w-[100px]">Taux (%)</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
                                                <TableBody>
                                                    {activeDistribution?.keys.map(key => {
                                                        const sectionInfo = MOCK_ANALYTIC_SECTIONS.find(s => s.code === key.sectionCode);
                                                        return (
                                                            <TableRow key={key.sectionCode}>
                                                                <TableCell>{sectionInfo?.name || key.sectionCode}</TableCell>
                                                                <TableCell><Input type="number" value={key.rate} onChange={(e) => handleRateChange(key.sectionCode, parseInt(e.target.value))} className="text-center" /></TableCell>
                                                                <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveKey(key.sectionCode)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
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
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                                        <p>Sélectionnez un compte à gauche<br/>pour définir sa répartition.</p>
                                    </div>
                                )}
                             </Card>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetModal}>Annuler</Button>
                        <Button onClick={handleVentilation} disabled={isVentilating || !isVentilationReady}>
                            {isVentilating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GitCompareArrows className="mr-2 h-4 w-4"/>}
                            {isVentilating ? 'Ventilation en cours...' : 'Lancer la ventilation'}
                        </Button>
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
                        <AlertDialogAction onClick={() => { setHistory(h => h.filter(item => item.id !== ventilationToDelete!.id)); setVentilationToDelete(null); }}>Confirmer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
