
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Download, CheckCircle, Eye, ArrowLeft, BookDown, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAtom } from 'jotai';
import { produitsAtom, type Produit } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';

type InventoryStatus = 'Terminé' | 'En cours';
type InventoryRecord = {
    id: number;
    date: string;
    description: string;
    type: 'Journalier' | 'Mensuel' | 'Annuel';
    status: InventoryStatus;
    ecartTotal: number;
    createdBy: string;
};

type PhysicalCount = {
    produitId: number;
    quantitePhysique: number;
};

const MOCK_INVENTORY_HISTORY: InventoryRecord[] = [
    { id: 1, date: '2024-07-29', description: 'Inventaire journalier - Dépôt Principal', type: 'Journalier', status: 'Terminé', ecartTotal: -3, createdBy: 'Admin' },
    { id: 2, date: '2024-06-30', description: 'Inventaire mensuel - Juin 2024', type: 'Mensuel', status: 'Terminé', ecartTotal: -12, createdBy: 'Admin' },
];

type MonthlyReportData = {
    month: string;
    items: {
        produitId: number;
        produitName: string;
        stockInitial: number;
        totalEntrees: number;
        totalSorties: number;
        stockFinal: number;
        ecart: number;
    }[];
};

export default function InventairePage() {
    const [view, setView] = useState<'list' | 'reconciliation'>('list');
    const [history, setHistory] = useState(MOCK_INVENTORY_HISTORY);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [monthlyReportData, setMonthlyReportData] = useState<MonthlyReportData | null>(null);

    const groupedHistory = useMemo(() => {
        return history.reduce((acc, item) => {
            const monthKey = format(new Date(item.date), 'MMMM yyyy', { locale: fr });
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(item);
            return acc;
        }, {} as Record<string, InventoryRecord[]>);
    }, [history]);

    const handleOpenMonthlyReport = (monthKey: string) => {
        // In a real app, this data would be fetched or calculated
        setMonthlyReportData({
            month: monthKey,
            items: [
                { produitId: 1, produitName: 'Serveur Dell PowerEdge R740', stockInitial: 20, totalEntrees: 5, totalSorties: 10, stockFinal: 15, ecart: 0 },
                { produitId: 2, produitName: 'Licence Windows Server 2022', stockInitial: 60, totalEntrees: 10, totalSorties: 20, stockFinal: 50, ecart: 0 },
                { produitId: 3, produitName: 'Switch Cisco Catalyst 9200', stockInitial: 30, totalEntrees: 0, totalSorties: 5, stockFinal: 25, ecart: 0 },
            ]
        });
        setIsReportModalOpen(true);
    };

    if (view === 'reconciliation') {
        return <ReconciliationView onBack={() => setView('list')} />;
    }

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Inventaire</CardTitle>
                            <CardDescription>Planifiez et suivez vos inventaires de stock.</CardDescription>
                        </div>
                        <Button onClick={() => setView('reconciliation')}><PlusCircle className="mr-2 h-4 w-4" /> Lancer un inventaire</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" defaultValue={Object.keys(groupedHistory).length > 0 ? [Object.keys(groupedHistory)[0]] : []}>
                        {Object.entries(groupedHistory).map(([month, records]) => (
                            <AccordionItem value={month} key={month}>
                                <div className="flex items-center justify-between">
                                    <AccordionTrigger className="text-lg capitalize flex-1">{month}</AccordionTrigger>
                                    <Button variant="outline" size="sm" className="mx-4" onClick={() => handleOpenMonthlyReport(month)}>
                                        <BookDown className="mr-2 h-4 w-4"/> Fiche Mensuelle
                                    </Button>
                                </div>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-center">Écart Total</TableHead>
                                                <TableHead className="text-center">Statut</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {records.map(inv => (
                                                <TableRow key={inv.id}>
                                                    <TableCell>{format(new Date(inv.date), 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell>{inv.description}</TableCell>
                                                    <TableCell className={`text-center font-bold ${inv.ecartTotal > 0 ? 'text-green-600' : inv.ecartTotal < 0 ? 'text-red-600' : ''}`}>{inv.ecartTotal > 0 ? '+' : ''}{inv.ecartTotal}</TableCell>
                                                    <TableCell className="text-center"><Badge>{inv.status}</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
            <MonthlyReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} data={monthlyReportData} />
        </>
    );
}

function ReconciliationView({ onBack }: { onBack: () => void }) {
    const [produits] = useAtom(produitsAtom);
    const [physicalCounts, setPhysicalCounts] = useState<PhysicalCount[]>([]);
    
    const handleCountChange = (produitId: number, quantite: string) => {
        const qty = parseInt(quantite) || 0;
        setPhysicalCounts(prev => {
            const existing = prev.find(p => p.produitId === produitId);
            if (existing) {
                return prev.map(p => p.produitId === produitId ? { ...p, quantitePhysique: qty } : p);
            }
            return [...prev, { produitId, quantitePhysique: qty }];
        });
    };
    
    const getPhysicalCount = (produitId: number) => {
        return physicalCounts.find(p => p.produitId === produitId)?.quantitePhysique;
    }

    return (
         <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/> Retour</Button>
                <h2 className="text-2xl font-bold">Comptage d'Inventaire</h2>
                <div />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventaire Physique vs Théorique</CardTitle>
                    <CardDescription>Saisissez les quantités physiques pour chaque produit. Les écarts seront calculés automatiquement.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produit</TableHead>
                                    <TableHead className="text-center">Stock Théorique</TableHead>
                                    <TableHead className="w-[180px] text-center">Stock Physique</TableHead>
                                    <TableHead className="text-center">Écart</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {produits.map(p => {
                                    const physicalQty = getPhysicalCount(p.id);
                                    const ecart = physicalQty !== undefined ? physicalQty - p.stock : undefined;
                                    return (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell className="text-center">{p.stock}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    className="text-center" 
                                                    value={physicalQty ?? ''} 
                                                    onChange={(e) => handleCountChange(p.id, e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className={`text-center font-bold ${ecart === undefined ? '' : ecart > 0 ? 'text-green-600' : ecart < 0 ? 'text-red-600' : ''}`}>
                                                {ecart !== undefined ? (ecart > 0 ? `+${ecart}` : ecart) : ''}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onBack}>Annuler</Button>
                <Button onClick={onBack}>Valider et enregistrer l'inventaire</Button>
            </div>
        </div>
    );
}

function MonthlyReportModal({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: MonthlyReportData | null }) {
    const { toast } = useToast();
    if (!data) return null;
    
    const [searchTerm, setSearchTerm] = useState('');
    const filteredItems = data.items.filter(item => item.produitName.toLowerCase().includes(searchTerm.toLowerCase()));

    const handlePrint = () => {
        const doc = new jsPDF();
        const companyName = "UNIKORP S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "LOGSON";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const printDateTime = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        const periodString = data.month;
        
        autoTable(doc, {
            head: [['Produit', 'Stock Initial', 'Entrées', 'Sorties', 'Stock Final', 'Écart']],
            body: data.items.map(i => [i.produitName, i.stockInitial, i.totalEntrees, i.totalSorties, i.stockFinal, i.ecart]),
            startY: 50,
            theme: 'striped',
            headStyles: { fillColor: '#1e3a8a' },
            didDrawPage: (data) => {
                doc.setFontSize(9); doc.setTextColor(150);
                doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
                doc.setDrawColor(220); doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
                doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
                doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
                doc.text(companyName, data.settings.margin.left + 15, 28);
                doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
                const rightX = doc.internal.pageSize.width - data.settings.margin.right;
                doc.text(`État : Fiche Mensuelle des Stocks`, rightX, 25, { align: 'right' });
                doc.text(`Période : ${periodString}`, rightX, 30, { align: 'right' });
                doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
                doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
                const pageCountTotal = (doc as any).internal.getNumberOfPages();
                doc.setFontSize(8); doc.setTextColor(150);
                doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left!, doc.internal.pageSize.height - 10);
            },
            margin: { top: 50 },
        });

        doc.save(`fiche_stock_${data.month}.pdf`);
        toast({ title: 'Exportation PDF réussie.' });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Fiche Mensuelle des Stocks - {data.month}</DialogTitle>
                    <DialogDescription>Consultez l'évolution des stocks pour chaque produit sur la période.</DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher un produit..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex-1 overflow-y-auto pr-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produit</TableHead>
                                <TableHead className="text-center">Stock Initial</TableHead>
                                <TableHead className="text-center">Entrées</TableHead>
                                <TableHead className="text-center">Sorties</TableHead>
                                <TableHead className="text-center">Stock Final</TableHead>
                                <TableHead className="text-center">Écart</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map(item => (
                                <TableRow key={item.produitId}>
                                    <TableCell>{item.produitName}</TableCell>
                                    <TableCell className="text-center">{item.stockInitial}</TableCell>
                                    <TableCell className="text-center text-green-600">+{item.totalEntrees}</TableCell>
                                    <TableCell className="text-center text-red-600">-{item.totalSorties}</TableCell>
                                    <TableCell className="text-center font-bold">{item.stockFinal}</TableCell>
                                    <TableCell className={`text-center font-bold ${item.ecart !== 0 ? 'text-red-600' : ''}`}>{item.ecart}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4" /> Imprimer la fiche mensuelle</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

