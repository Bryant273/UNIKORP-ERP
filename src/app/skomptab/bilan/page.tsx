'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

type BilanType = 'comptable' | 'fonctionnel' | 'financier';

type BilanLigne = {
    libelle: string;
    montant: number | null;
    isSubTitle?: boolean;
    isSubItem?: boolean;
};

type BilanSectionData = {
    titre: string;
    lignes: BilanLigne[];
    total: number;
};

type BilanData = {
    actif: BilanSectionData[];
    passif: BilanSectionData[];
    totalActif: number;
    totalPassif: number;
};

// --- MOCK DATA ---
const MOCK_BILAN_COMPTABLE_2025: BilanData = {
    actif: [
        {
            titre: 'ACTIF IMMOBILISÉ',
            lignes: [
                { libelle: 'Immobilisations incorporelles', montant: null, isSubTitle: true },
                { libelle: "Frais de recherche et développement", montant: 15000, isSubItem: true },
                { libelle: 'Concessions, brevets, licences', montant: 60000, isSubItem: true },
                { libelle: 'Immobilisations corporelles', montant: null, isSubTitle: true },
                { libelle: 'Terrains', montant: 100000, isSubItem: true },
                { libelle: 'Constructions', montant: 200000, isSubItem: true },
                { libelle: 'Immobilisations financières', montant: null, isSubTitle: true },
                { libelle: 'Participations', montant: 25000, isSubItem: true },
            ],
            total: 400000,
        },
        {
            titre: 'ACTIF CIRCULANT',
            lignes: [
                 { libelle: 'Stocks et en-cours', montant: 85000, isSubTitle: true },
                 { libelle: 'Créances', montant: null, isSubTitle: true },
                 { libelle: 'Créances clients et comptes rattachés', montant: 150000, isSubItem: true },
                 { libelle: 'Disponibilités', montant: 95000, isSubTitle: true },
            ],
            total: 330000,
        },
        {
            titre: 'COMPTE DE RÉGULARISATION',
            lignes: [
                { libelle: 'Charges à répartir', montant: 20000, isSubItem: true },
            ],
            total: 20000
        }
    ],
    passif: [
        {
            titre: 'CAPITAUX PROPRES',
            lignes: [
                { libelle: 'Capital social', montant: 200000, isSubItem: true },
                { libelle: 'Réserves', montant: 150000, isSubItem: true },
                { libelle: "Résultat de l'exercice", montant: 80000, isSubItem: true },
            ],
            total: 430000,
        },
        {
            titre: 'PROVISIONS POUR RISQUES ET CHARGES',
            lignes: [
                { libelle: 'Provisions pour risques', montant: 10000, isSubItem: true },
            ],
            total: 10000,
        },
        {
            titre: 'DETTES',
            lignes: [
                { libelle: 'Dettes financières', montant: 200000, isSubTitle: true },
                { libelle: 'Dettes fournisseurs', montant: 110000, isSubTitle: true },
            ],
            total: 310000,
        },
    ],
    totalActif: 750000,
    totalPassif: 750000,
};

const getBilanData = (year: string, type: BilanType): BilanData | null => {
    if (type === 'comptable') {
        return MOCK_BILAN_COMPTABLE_2025;
    }
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
        const headStyles = { fillColor: '#e2e8f0', textColor: '#1e293b', fontStyle: 'bold' as const };

        const generateColumnBody = (sections: BilanSectionData[]) => {
            const body: any[] = [];
            sections.forEach(section => {
                body.push([{ content: section.titre, styles: { fontStyle: 'bold', fillColor: '#f1f5f9' } }, { content: section.total.toLocaleString('fr-FR'), styles: { halign: 'right' as const, fontStyle: 'bold', fillColor: '#f1f5f9' } }]);
                section.lignes.forEach(ligne => {
                    if (ligne.isSubTitle) {
                        body.push([{ content: `  ${ligne.libelle}`, colSpan: 2, styles: { fontStyle: 'bold' as const } }]);
                    } else {
                        body.push([
                            `    ${ligne.libelle}`,
                            { content: ligne.montant?.toLocaleString('fr-FR'), styles: { halign: 'right' as const } }
                        ]);
                    }
                });
            });
            return body;
        };
        const actifBody = generateColumnBody(reportData.actif);
        const passifBody = generateColumnBody(reportData.passif);

        // Header
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

        // Actif Table
        autoTable(doc, {
            head: [['ACTIF', '']],
            body: actifBody,
            foot: [[{content: 'TOTAL ACTIF', styles: headStyles }, { content: reportData.totalActif.toLocaleString('fr-FR'), styles: {...headStyles, halign: 'right'} }]],
            theme: 'grid',
            headStyles: headStyles,
            tableWidth: 85,
            startY: 50,
            margin: { left: 15 }
        });

        // Passif Table
        autoTable(doc, {
            head: [['PASSIF', '']],
            body: passifBody,
            foot: [[{ content: 'TOTAL PASSIF', styles: headStyles }, { content: reportData.totalPassif.toLocaleString('fr-FR'), styles: {...headStyles, halign: 'right'} }]],
            theme: 'grid',
            headStyles: headStyles,
            tableWidth: 85,
            startY: 50,
            margin: { left: 110 }
        });

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
                         <div className="max-h-[70vh] overflow-y-auto p-4 border rounded-md bg-muted/20">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Actif Column */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-center border-b-2 pb-2 mb-4" style={{borderColor: 'hsl(var(--primary))'}}>ACTIF</h3>
                                    {reportData.actif.map((section, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between font-bold bg-secondary p-2 rounded-t-md text-secondary-foreground">
                                                <span>{section.titre}</span>
                                                <span>{section.total.toLocaleString('fr-FR')}</span>
                                            </div>
                                            <div className="border border-t-0 rounded-b-md p-2 space-y-1">
                                                {section.lignes.map((ligne, idx) => (
                                                    <div key={idx} className={cn("flex justify-between text-sm", ligne.isSubItem && "pl-4")}>
                                                        <span className={cn(ligne.isSubTitle && "font-semibold")}>{ligne.libelle}</span>
                                                        {ligne.montant !== null && <span className="font-mono">{ligne.montant.toLocaleString('fr-FR')}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-bold text-lg p-3 bg-primary/10 rounded-md mt-4">
                                        <span>TOTAL ACTIF</span>
                                        <span className="font-mono">{reportData.totalActif.toLocaleString('fr-FR')}</span>
                                    </div>
                                </div>
                                {/* Passif Column */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-center border-b-2 pb-2 mb-4" style={{borderColor: 'hsl(var(--primary))'}}>PASSIF</h3>
                                    {reportData.passif.map((section, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between font-bold bg-secondary p-2 rounded-t-md text-secondary-foreground">
                                                <span>{section.titre}</span>
                                                <span>{section.total.toLocaleString('fr-FR')}</span>
                                            </div>
                                            <div className="border border-t-0 rounded-b-md p-2 space-y-1">
                                                {section.lignes.map((ligne, idx) => (
                                                    <div key={idx} className={cn("flex justify-between text-sm", ligne.isSubItem && "pl-4")}>
                                                        <span className={cn(ligne.isSubTitle && "font-semibold")}>{ligne.libelle}</span>
                                                        {ligne.montant !== null && <span className="font-mono">{ligne.montant.toLocaleString('fr-FR')}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-bold text-lg p-3 bg-primary/10 rounded-md mt-4">
                                        <span>TOTAL PASSIF</span>
                                        <span className="font-mono">{reportData.totalPassif.toLocaleString('fr-FR')}</span>
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
