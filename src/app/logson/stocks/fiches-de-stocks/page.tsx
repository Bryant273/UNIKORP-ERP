
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Download, ArrowLeft, FileText, BarChart2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAtom } from 'jotai';
import { produitsAtom, mouvementsAtom, entrepotsAtom, type Produit, type Mouvement, type Entrepot } from '@/lib/store';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type StockCardLine = {
    date: string;
    libelle: string;
    entreeQte: number;
    entreePu: number;
    entreeMontant: number;
    sortieQte: number;
    sortiePu: number;
    sortieMontant: number;
    stockQte: number;
    stockPu: number;
    stockMontant: number;
};

const calculateStockCard = (produit: Produit, mouvements: Mouvement[], period: DateRange): StockCardLine[] => {
    const cardLines: StockCardLine[] = [];
    let stockQte = 0;
    let stockMontant = 0;

    const relevantMouvements = mouvements
        .filter(m => m.produitId === produit.id && new Date(m.date) >= period.from! && new Date(m.date) <= period.to!)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const mvt of relevantMouvements) {
        let entreeQte = 0, entreePu = 0, entreeMontant = 0;
        let sortieQte = 0, sortiePu = 0, sortieMontant = 0;

        const currentStockPu = stockQte > 0 ? stockMontant / stockQte : produit.unitPrice;

        if (mvt.type === 'Entrée') {
            entreeQte = mvt.quantite;
            entreePu = produit.unitPrice; // Simplified, should be purchase price
            entreeMontant = entreeQte * entreePu;
            stockQte += entreeQte;
            stockMontant += entreeMontant;
        } else if (mvt.type === 'Sortie') {
            sortieQte = mvt.quantite;
            sortiePu = currentStockPu;
            sortieMontant = sortieQte * sortiePu;
            stockQte -= sortieQte;
            stockMontant -= sortieMontant;
        }
        
        cardLines.push({
            date: mvt.date,
            libelle: mvt.document,
            entreeQte, entreePu, entreeMontant,
            sortieQte, sortiePu, sortieMontant,
            stockQte,
            stockPu: stockQte > 0 ? stockMontant / stockQte : 0,
            stockMontant,
        });
    }

    return cardLines;
};

const formatAmount = (amount?: number | null) => {
    if (amount === null || amount === undefined || amount === 0) return '';
    return amount.toLocaleString('fr-FR');
}

export default function FicheDeStockPage() {
    const [modalStep, setModalStep] = useState<'closed' | 'selection' | 'display'>('closed');
    const [produits] = useAtom(produitsAtom);
    const [mouvements] = useAtom(mouvementsAtom);
    const [entrepots] = useAtom(entrepotsAtom);

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [period, setPeriod] = useState<DateRange | undefined>({ from: new Date(2024, 0, 1), to: new Date(2024, 12, 31) });
    const [valorisationMethod, setValorisationMethod] = useState<'CUMP' | 'FIFO' | 'LIFO'>('CUMP');

    const [reportData, setReportData] = useState<StockCardLine[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Produit | null>(null);
    const { toast } = useToast();
    const [printDateTime, setPrintDateTime] = useState('');

    const handleCloseModal = () => {
        setModalStep('closed');
    };
    
    useEffect(() => {
        if (modalStep === 'display') {
            setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
        }
    }, [modalStep]);

    const handleGenerate = () => {
        if (!selectedProductId || !period?.from || !period?.to) {
            toast({ title: "Paramètres manquants", description: "Veuillez sélectionner un produit et une période.", variant: "destructive" });
            return;
        }
        const produit = produits.find(p => p.id.toString() === selectedProductId);
        if (!produit) return;

        const data = calculateStockCard(produit, mouvements, period);
        setSelectedProduct(produit);
        setReportData(data);
        setModalStep('display');
    };

    const handleExportPDF = () => {
        if (!selectedProduct) return;
        const doc = new jsPDF({ orientation: 'landscape' });
        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "LOGSON";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const periodString = period?.from ? (period.to ? `${format(period.from, 'dd LLL yy', { locale: fr })} au ${format(period.to, 'dd LLL yy', { locale: fr })}` : format(period.from, 'dd LLL yy', { locale: fr })) : 'N/A';
        
        const tableBody = reportData.map(d => [
            format(new Date(d.date), 'dd/MM/yy'), d.libelle,
            formatAmount(d.entreeQte), formatAmount(d.entreePu), formatAmount(d.entreeMontant),
            formatAmount(d.sortieQte), formatAmount(d.sortiePu), formatAmount(d.sortieMontant),
            formatAmount(d.stockQte), formatAmount(d.stockPu), formatAmount(d.stockMontant),
        ]);

        autoTable(doc, {
            head: [[
                { content: 'Mouvements', colSpan: 2 },
                { content: 'Entrées', colSpan: 3 },
                { content: 'Sorties', colSpan: 3 },
                { content: 'Stock Final', colSpan: 3 },
            ], ['Date', 'Libellé', 'Qté', 'P.U.', 'Montant', 'Qté', 'P.U.', 'Montant', 'Qté', 'P.U.', 'Montant']],
            body: tableBody,
            startY: 50,
            theme: 'grid',
            headStyles: { halign: 'center', fillColor: [226, 232, 240] },
            didDrawPage: (data) => {
                 doc.setFontSize(9); doc.setTextColor(150);
                 doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
                 doc.setDrawColor(220); doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
                 doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
                 doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
                 doc.text(companyName, data.settings.margin.left + 15, 28);
                 doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
                 const rightX = doc.internal.pageSize.width - data.settings.margin.right;
                 doc.text(`État : Fiche de Stock - ${selectedProduct.name}`, rightX, 25, { align: 'right' });
                 doc.text(`Période : ${periodString}`, rightX, 30, { align: 'right' });
                 doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
                 doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
                 const pageCountTotal = (doc as any).internal.getNumberOfPages();
                 doc.setFontSize(8); doc.setTextColor(150);
                 doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left!, doc.internal.pageSize.height - 10);
            },
            margin: { top: 50 },
        });

        doc.save(`fiche_stock_${selectedProduct.reference}.pdf`);
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Fiches de Valorisation des Stocks</CardTitle>
                    <CardDescription>Générez des fiches de stock détaillées par produit et par période.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Button size="lg" onClick={() => setModalStep('selection')}>
                       <FileText className="mr-2 h-4 w-4"/> Consulter une fiche de stock
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={modalStep !== 'closed'} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className={modalStep === 'display' ? "max-w-7xl" : "sm:max-w-md"}>
                    {modalStep === 'selection' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Paramètres de la Fiche de Stock</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Produit</Label>
                                    <Select onValueChange={setSelectedProductId}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionnez un produit..."/></SelectTrigger>
                                        <SelectContent>{produits.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.reference} - {p.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label>Période</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {period?.from ? (period.to ? `${format(period.from, 'dd/MM/yy')} - ${format(period.to, 'dd/MM/yy')}` : format(period.from, 'dd/MM/yyyy')) : 'Sélectionnez'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="range" selected={period} onSelect={setPeriod} locale={fr} /></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Méthode de valorisation</Label>
                                    <Select value={valorisationMethod} onValueChange={(v) => setValorisationMethod(v as any)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CUMP">CUMP (Coût Unitaire Moyen Pondéré)</SelectItem>
                                            <SelectItem value="FIFO" disabled>FIFO (Premier Entré, Premier Sorti)</SelectItem>
                                            <SelectItem value="LIFO" disabled>LIFO (Dernier Entré, Premier Sorti)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleCloseModal}>Annuler</Button>
                                <Button onClick={handleGenerate}>Générer la fiche</Button>
                            </DialogFooter>
                        </>
                    )}

                    {modalStep === 'display' && selectedProduct && (
                        <>
                             <DialogHeader>
                                <DialogTitle>Fiche de Stock : {selectedProduct.name}</DialogTitle>
                                <DialogDescription>Méthode de valorisation : {valorisationMethod}</DialogDescription>
                             </DialogHeader>
                             <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead rowSpan={2} className="align-bottom">Date</TableHead>
                                            <TableHead rowSpan={2} className="align-bottom">Libellé</TableHead>
                                            <TableHead colSpan={3} className="text-center border-b">Entrées</TableHead>
                                            <TableHead colSpan={3} className="text-center border-b">Sorties</TableHead>
                                            <TableHead colSpan={3} className="text-center border-b">Stock Final</TableHead>
                                        </TableRow>
                                        <TableRow>
                                            <TableHead className="text-center">Qté</TableHead><TableHead className="text-center">P.U.</TableHead><TableHead className="text-center">Montant</TableHead>
                                            <TableHead className="text-center">Qté</TableHead><TableHead className="text-center">P.U.</TableHead><TableHead className="text-center">Montant</TableHead>
                                            <TableHead className="text-center">Qté</TableHead><TableHead className="text-center">P.U.</TableHead><TableHead className="text-center">Montant</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((d,i) => (
                                            <TableRow key={i}>
                                                <TableCell>{format(new Date(d.date), 'dd/MM/yy')}</TableCell><TableCell>{d.libelle}</TableCell>
                                                <TableCell className="text-right">{formatAmount(d.entreeQte)}</TableCell><TableCell className="text-right">{formatAmount(d.entreePu)}</TableCell><TableCell className="text-right font-bold">{formatAmount(d.entreeMontant)}</TableCell>
                                                <TableCell className="text-right">{formatAmount(d.sortieQte)}</TableCell><TableCell className="text-right">{formatAmount(d.sortiePu)}</TableCell><TableCell className="text-right font-bold">{formatAmount(d.sortieMontant)}</TableCell>
                                                <TableCell className="text-right">{formatAmount(d.stockQte)}</TableCell><TableCell className="text-right">{formatAmount(d.stockPu)}</TableCell><TableCell className="text-right font-bold">{formatAmount(d.stockMontant)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div>
                                    <h4 className="font-semibold mb-2">Répartition du stock au {period?.to ? format(period.to, 'dd/MM/yyyy') : ''}</h4>
                                     <Table className="w-1/2">
                                        <TableHeader><TableRow><TableHead>Entrepôt</TableHead><TableHead className="text-right">Quantité</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            <TableRow><TableCell>{entrepots.find(e => e.id === selectedProduct.entrepotId)?.nom || 'N/A'}</TableCell><TableCell className="text-right font-bold">{selectedProduct.stock}</TableCell></TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                             </div>
                             <DialogFooter>
                                <Button variant="ghost" onClick={() => setModalStep('selection')}><ArrowLeft className="mr-2 h-4 w-4"/> Précédent</Button>
                                <div className="flex-grow" />
                                <Button variant="outline" onClick={handleCloseModal}>Fermer</Button>
                                <Button onClick={handleExportPDF}><Download className="mr-2 h-4 w-4"/>Exporter en PDF</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
