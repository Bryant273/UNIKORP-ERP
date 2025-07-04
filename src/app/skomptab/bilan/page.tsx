'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';

type BilanType = 'comptable' | 'fonctionnel' | 'financier';

type BilanItem = {
    libelle: string;
    montant: number;
    isSubItem?: boolean;
};

type BilanSection = {
    titre: string;
    items: BilanItem[];
    total: number;
};

type BilanData = {
    actif: BilanSection[];
    passif: BilanSection[];
    totalActif: number;
    totalPassif: number;
};

// --- MOCK DATA ---
const MOCK_BILAN_COMPTABLE_2025: BilanData = {
    actif: [
        {
            titre: 'ACTIF IMMOBILISÉ',
            items: [
                { libelle: 'Immobilisations incorporelles', montant: 75000, isSubItem: true },
                { libelle: 'Immobilisations corporelles', montant: 320000, isSubItem: true },
                { libelle: 'Immobilisations financières', montant: 25000, isSubItem: true },
            ],
            total: 420000,
        },
        {
            titre: 'ACTIF CIRCULANT',
            items: [
                { libelle: 'Stocks et en-cours', montant: 85000, isSubItem: true },
                { libelle: 'Créances clients et comptes rattachés', montant: 150000, isSubItem: true },
                { libelle: 'Disponibilités', montant: 95000, isSubItem: true },
            ],
            total: 330000,
        }
    ],
    passif: [
        {
            titre: 'CAPITAUX PROPRES',
            items: [
                { libelle: 'Capital social', montant: 200000, isSubItem: true },
                { libelle: 'Réserves', montant: 150000, isSubItem: true },
                { libelle: 'Résultat de l\'exercice', montant: 80000, isSubItem: true },
            ],
            total: 430000,
        },
        {
            titre: 'DETTES',
            items: [
                { libelle: 'Dettes financières', montant: 200000, isSubItem: true },
                { libelle: 'Dettes fournisseurs', montant: 110000, isSubItem: true },
                { libelle: 'Dettes fiscales et sociales', montant: 10000, isSubItem: true },
            ],
            total: 320000,
        }
    ],
    totalActif: 750000,
    totalPassif: 750000,
};

const getBilanData = (year: string, type: BilanType): BilanData | null => {
    if (type === 'comptable') {
        // In a real app, this would fetch and compute data for the given year.
        // For now, we return the same mock data regardless of the year.
        return MOCK_BILAN_COMPTABLE_2025;
    }
    // Return null for other types to show they are not implemented yet
    return null;
};

export default function BilanPage() {
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false);
    
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedType, setSelectedType] = useState<BilanType>('comptable');

    const [reportData, setReportData] = useState<BilanData | null>(null);
    const [printDateTime, setPrintDateTime] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (isDisplayModalOpen) {
            setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
        }
    }, [isDisplayModalOpen]);

    const handleGenerate = () => {
        const data = getBilanData(selectedYear, selectedType);
        if (!data) {
            toast({
                title: "Fonctionnalité non disponible",
                description: `La génération du bilan de type "${selectedType}" n'est pas encore implémentée.`,
                variant: "destructive",
            });
            return;
        }
        setReportData(data);
        setIsSelectionModalOpen(false);
        setIsDisplayModalOpen(true);
    };

    const handleExportPDF = () => {
        if (!reportData) return;
        const doc = new jsPDF();
        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SKOMPTAB";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const reportTitle = `Bilan comptable - Exercice ${selectedYear}`;

        const headStyles = { fillColor: '#f1f5f9', textColor: '#1e293b', fontStyle: 'bold', halign: 'center' as const };
        const totalHeadStyles = { fillColor: '#e2e8f0', textColor: '#1e293b', fontStyle: 'bold' };

        // Actif Table
        const actifBody = reportData.actif.flatMap(section => [
            [{ content: section.titre, colSpan: 2, styles: { fontStyle: 'bold' } }],
            ...section.items.map(item => [item.libelle, item.montant.toLocaleString('fr-FR')])
        ]);
        autoTable(doc, {
            head: [['Actif', 'Montant (Net)']],
            body: actifBody,
            foot: [[{content: 'TOTAL ACTIF', styles: totalHeadStyles }, { content: reportData.totalActif.toLocaleString('fr-FR'), styles: totalHeadStyles }]],
            theme: 'grid',
            headStyles: headStyles,
            footStyles: { halign: 'right' },
            bodyStyles: { cellPadding: {left: 4} },
            columnStyles: { 0: { cellWidth: 70 }, 1: { halign: 'right', cellWidth: 25 } },
            startY: 50,
        });

        // Passif Table
        const passifBody = reportData.passif.flatMap(section => [
            [{ content: section.titre, colSpan: 2, styles: { fontStyle: 'bold' } } ],
            ...section.items.map(item => [item.libelle, item.montant.toLocaleString('fr-FR')])
        ]);
        autoTable(doc, {
            head: [['Passif', 'Montant (Net)']],
            body: passifBody,
            foot: [[{ content: 'TOTAL PASSIF', styles: totalHeadStyles }, { content: reportData.totalPassif.toLocaleString('fr-FR'), styles: totalHeadStyles }]],
            theme: 'grid',
            headStyles: headStyles,
            footStyles: { halign: 'right' },
            bodyStyles: { cellPadding: {left: 4} },
            columnStyles: { 0: { cellWidth: 70 }, 1: { halign: 'right', cellWidth: 25 } },
            startY: 50,
            margin: { left: 110 }
        });

        // Add Header
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, 20, 15);
        doc.setDrawColor(220);
        doc.line(20, 18, 190, 18);
        doc.addImage(logoDataUri, 'PNG', 20, 22, 12, 12);
        
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, 35, 28);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`État : ${reportTitle}`, 190, 25, { align: 'right' });
        doc.text(`Imprimé le : ${printDateTime}`, 190, 30, { align: 'right' });
        doc.text(`Par : ${userName}`, 190, 35, { align: 'right' });

        doc.save(`bilan_${selectedType}_${selectedYear}.pdf`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Bilan</CardTitle>
                    <CardDescription>Générez et consultez les différents types de bilans financiers.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Button size="lg" onClick={() => setIsSelectionModalOpen(true)}>
                        Générer un Bilan
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={isSelectionModalOpen} onOpenChange={setIsSelectionModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Paramètres du Bilan</DialogTitle>
                        <DialogDescription>Choisissez l'exercice et le type de bilan à générer.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="year-select">Exercice fiscal (année)</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger id="year-select"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2023">2023</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type-select">Type de bilan</Label>
                            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as BilanType)}>
                                <SelectTrigger id="type-select"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="comptable">Bilan comptable</SelectItem>
                                    <SelectItem value="fonctionnel">Bilan fonctionnel</SelectItem>
                                    <SelectItem value="financier">Bilan financier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSelectionModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleGenerate}>Générer le Bilan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDisplayModalOpen} onOpenChange={setIsDisplayModalOpen}>
                <DialogContent className="max-w-7xl">
                    <DialogHeader>
                        <DialogTitle>Bilan {selectedType} - Exercice {selectedYear}</DialogTitle>
                        <DialogDescription>
                            Aperçu du bilan. Vous pouvez l'exporter en PDF.
                        </DialogDescription>
                    </DialogHeader>
                    {reportData ? (
                         <div className="max-h-[70vh] overflow-y-auto p-4 border rounded-md bg-muted/30">
                             <div className="grid grid-cols-2 gap-8">
                                {/* Actif */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-center border-b pb-2">ACTIF</h3>
                                    {reportData.actif.map(section => (
                                        <div key={section.titre}>
                                            <div className="flex justify-between font-semibold bg-secondary p-2 rounded-t-md">
                                                <span>{section.titre}</span>
                                                <span>{section.total.toLocaleString('fr-FR')}</span>
                                            </div>
                                            <ul className="space-y-1 p-2 border border-t-0 rounded-b-md">
                                                {section.items.map(item => (
                                                    <li key={item.libelle} className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{item.libelle}</span>
                                                        <span>{item.montant.toLocaleString('fr-FR')}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                     <div className="flex justify-between font-bold text-lg p-2 bg-primary/10 rounded-md">
                                        <span>TOTAL ACTIF</span>
                                        <span>{reportData.totalActif.toLocaleString('fr-FR')}</span>
                                    </div>
                                </div>
                                {/* Passif */}
                                <div className="space-y-4">
                                     <h3 className="text-xl font-bold text-center border-b pb-2">PASSIF</h3>
                                     {reportData.passif.map(section => (
                                        <div key={section.titre}>
                                             <div className="flex justify-between font-semibold bg-secondary p-2 rounded-t-md">
                                                <span>{section.titre}</span>
                                                <span>{section.total.toLocaleString('fr-FR')}</span>
                                            </div>
                                            <ul className="space-y-1 p-2 border border-t-0 rounded-b-md">
                                                {section.items.map(item => (
                                                    <li key={item.libelle} className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{item.libelle}</span>
                                                        <span>{item.montant.toLocaleString('fr-FR')}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-bold text-lg p-2 bg-primary/10 rounded-md">
                                        <span>TOTAL PASSIF</span>
                                        <span>{reportData.totalPassif.toLocaleString('fr-FR')}</span>
                                    </div>
                                </div>
                             </div>
                         </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">Erreur lors de la génération du rapport.</div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDisplayModalOpen(false)}>Fermer</Button>
                        <Button onClick={handleExportPDF} disabled={!reportData}><Download className="mr-2 h-4 w-4"/>Exporter en PDF</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
