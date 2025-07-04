
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Calendar as CalendarIcon, Download, ArrowLeft } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

// --- DATA TYPES & MOCK DATA ---

const MOCK_ACCOUNT_BALANCES = {
    '701': 1250000,
    '601': -800000,
    '6031': 25000,
    '702': 450000,
    '705': 150000,
    '707': 75000,
    '73': -15000,
    '72': 50000,
    '71': 20000,
    '75': 5000,
    '781': 10000,
    '602': -120000,
    '6032': -8000,
    '604': -30000,
    '605': -25000,
    '6033': 3000,
    '61': -45000,
    '62': -60000,
    '63': -12000,
    '64': -110000,
    '65': -18000,
    '66': -250000,
    '791': 35000,
    '681': -95000,
    '77': 15000,
    '797': 5000,
    '787': 2000,
    '67': -22000,
    '697': -8000,
    '82': 40000,
    '84': 5000,
    '81': -30000,
    '83': -10000,
    '87': -12000,
    '89': -45000,
};

type ReportLine = {
    ref: string;
    label: string;
    value: number | null;
    isTitle?: boolean;
    isSubTotal?: boolean;
    isGrandTotal?: boolean;
    isEmphasized?: boolean;
    indent?: number;
};

const calculateIncomeStatement = (balances: Record<string, number>): ReportLine[] => {
    const get = (keys: (string | number)[]) => keys.reduce((sum, key) => sum + (balances[key.toString()] || 0), 0);
    
    const TA = get(['701']);
    const RA = get(['601']);
    const RB = get(['6031']);
    const XA = TA + RA + RB; // Marge commerciale
    
    const TB = get(['702', '703', '704']);
    const TC = get(['705', '706']);
    const TD = get(['707']);
    const XB = XA - RA - RB + TB + TC + TD; // Chiffre d'affaires
    
    const TE = get(['73']);
    const TF = get(['72']);
    const TG = get(['71']);
    const TH = get(['75']);
    const TI = get(['781']);
    
    const RC = get(['602']);
    const RD = get(['6032']);
    const RE = get(['604', '605', '608']);
    const RF = get(['6033']);
    const RG = get(['61']);
    const RH = get(['62', '63']);
    const RI = get(['64']);
    const RJ = get(['65']);
    
    const productionDeLExercice = XB + TE + TF;
    const consommationDeLExercice = RA + RB + RC + RD + RE + RF + RG + RH + RI + RJ;
    const valeurAjoutee = productionDeLExercice + consommationDeLExercice + TG + TH + TI;
    const XC = valeurAjoutee;

    const RK = get(['66']);
    const XD = XC + RK; // EBE

    const TJ = get(['791', '798', '799']);
    const RL = get(['681', '691']);
    const XE = XD + TJ + RL; // Résultat d'exploitation

    const TK = get(['77']);
    const TL = get(['797']);
    const TM = get(['787']);
    const RM = get(['67']);
    const RN = get(['697']);
    const XF = TK + TL + TM + RM + RN; // Résultat financier

    const XG = XE + XF; // Résultat des activités ordinaires
    
    const TN = get(['82']);
    const TO = get(['84', '86', '88']);
    const RO = get(['81']);
    const RP = get(['83', '85']);
    const XH = TN + TO + RO + RP; // Résultat hors activités ordinaires

    const RQ = get(['87']);
    const RS = get(['89']);
    const XI = XG + XH + RQ + RS; // Résultat net

    return [
        { ref: 'TA', label: 'Ventes de marchandises', value: TA, indent: 1 },
        { ref: 'RA', label: 'Achats de marchandises', value: RA, indent: 1 },
        { ref: 'RB', label: 'Variation de stocks de marchandises', value: RB, indent: 1 },
        { ref: 'XA', label: 'MARGE COMMERCIALE', value: XA, isSubTotal: true, indent: 0 },

        { ref: 'TB', label: 'Ventes de produits fabriqués', value: TB, indent: 1 },
        { ref: 'TC', label: 'Travaux, services vendus', value: TC, indent: 1 },
        { ref: 'TD', label: 'Produits accessoires', value: TD, indent: 1 },
        { ref: 'XB', label: "CHIFFRE D'AFFAIRES", value: XB, isSubTotal: true, isEmphasized: true, indent: 0 },
        
        { ref: '', label: '', value: null }, // Spacer
        
        { ref: 'TE', label: 'Production stockée (ou déstockage)', value: TE, indent: 1 },
        { ref: 'TF', label: 'Production immobilisée', value: TF, indent: 1 },
        { ref: 'TG', label: "Subventions d'exploitation", value: TG, indent: 1 },
        { ref: 'TH', label: 'Autres produits', value: TH, indent: 1 },
        { ref: 'TI', label: "Transferts de charges d'exploitation", value: TI, indent: 1 },
        
        { ref: 'RC', label: 'Achats de matières premières et fournitures liées', value: RC, indent: 1 },
        { ref: 'RD', label: 'Variation de stocks de matières premières et fournitures', value: RD, indent: 1 },
        { ref: 'RE', label: 'Autres achats', value: RE, indent: 1 },
        { ref: 'RF', label: "Variation de stocks d'autres approvisionnements", value: RF, indent: 1 },
        { ref: 'RG', label: 'Transports', value: RG, indent: 1 },
        { ref: 'RH', label: 'Services extérieurs', value: RH, indent: 1 },
        { ref: 'RI', label: 'Impôts et taxes', value: RI, indent: 1 },
        { ref: 'RJ', label: 'Autres charges', value: RJ, indent: 1 },
        { ref: 'XC', label: 'VALEUR AJOUTÉE', value: XC, isSubTotal: true, indent: 0 },

        { ref: 'RK', label: 'Charges de personnel', value: RK, indent: 1 },
        { ref: 'XD', label: "EXCEDENT BRUT D'EXPLOITATION", value: XD, isSubTotal: true, indent: 0 },
        
        { ref: 'TJ', label: "Reprises d'amortissements, de provisions et dépréciations", value: TJ, indent: 1 },
        { ref: 'RL', label: 'Dotations aux amortissements, aux provisions et dépréciations', value: RL, indent: 1 },
        { ref: 'XE', label: "RESULTAT D'EXPLOITATION", value: XE, isSubTotal: true, isEmphasized: true, indent: 0 },
        
        { ref: '', label: '', value: null }, // Spacer
        
        { ref: 'TK', label: 'Revenus financiers et assimilés', value: TK, indent: 1 },
        { ref: 'TL', label: 'Reprises de provisions et dépréciations financières', value: TL, indent: 1 },
        { ref: 'TM', label: 'Transferts de charges financières', value: TM, indent: 1 },
        { ref: 'RM', label: 'Frais financiers et charges assimilés', value: RM, indent: 1 },
        { ref: 'RN', label: 'Dotations aux provisions et aux dépréciations financières', value: RN, indent: 1 },
        { ref: 'XF', label: 'RESULTAT FINANCIER', value: XF, isSubTotal: true, indent: 0 },

        { ref: 'XG', label: 'RESULTAT DES ACTIVITES ORDINAIRES', value: XG, isSubTotal: true, isEmphasized: true, indent: 0 },
        
        { ref: '', label: '', value: null }, // Spacer

        { ref: 'TN', label: "Produits des cessions d'immobilisations", value: TN, indent: 1 },
        { ref: 'TO', label: 'Autres Produits HAO', value: TO, indent: 1 },
        { ref: 'RO', label: "Valeurs comptables des cessions d'immobilisations", value: RO, indent: 1 },
        { ref: 'RP', label: 'Autres Charges HAO', value: RP, indent: 1 },
        { ref: 'XH', label: 'RESULTAT HORS ACTIVITES ORDINAIRES', value: XH, isSubTotal: true, indent: 0 },

        { ref: 'RQ', label: 'Participation des travailleurs', value: RQ, indent: 1 },
        { ref: 'RS', label: 'Impôts sur le résultat', value: RS, indent: 1 },

        { ref: 'XI', label: 'RESULTAT NET', value: XI, isGrandTotal: true, indent: 0 },
    ];
};

const formatAmount = (amount: number) => {
    const formatted = amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
    return amount < 0 ? `(${formatted.replace('-', '')})` : formatted;
};

export default function CompteDeResultatPage() {
    const [modalStep, setModalStep] = useState<'closed' | 'selection' | 'display'>('closed');
    const [period, setPeriod] = useState<DateRange | undefined>({ from: new Date(2025, 0, 1), to: new Date(2025, 11, 31) });
    const [reportData, setReportData] = useState<ReportLine[]>([]);
    const [printDateTime, setPrintDateTime] = useState('');
    const { toast } = useToast();

    const handleCloseModal = () => {
        setModalStep('closed');
    };

    useEffect(() => {
        if (modalStep === 'display') {
            setPrintDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
        }
    }, [modalStep]);

    const handleGenerate = () => {
        if (!period?.from || !period?.to) {
            toast({ title: "Période invalide", description: "Veuillez sélectionner une date de début et de fin.", variant: "destructive" });
            return;
        }
        const data = calculateIncomeStatement(MOCK_ACCOUNT_BALANCES);
        setReportData(data);
        setModalStep('display');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SKOMPTAB";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const periodString = period?.from ? (period.to ? `${format(period.from, 'dd LLL yyyy', { locale: fr })} au ${format(period.to, 'dd LLL yyyy', { locale: fr })}` : format(period.from, 'dd LLL yyyy', { locale: fr })) : 'N/A';
        
        const tableBody = reportData.map(line => {
            if (line.value === null) return [{ content: '', colSpan: 3, styles: { minCellHeight: 5 } }];
            return [
                { content: line.ref, styles: { fontStyle: 'normal', cellWidth: 20 } },
                { content: line.label, styles: { fontStyle: (line.isSubTotal || line.isGrandTotal) ? 'bold' : 'normal', cellPadding: { left: 4 + (line.indent || 0) * 4 } } },
                { content: formatAmount(line.value), styles: { halign: 'right', fontStyle: (line.isSubTotal || line.isGrandTotal) ? 'bold' : 'normal' } }
            ];
        });

        autoTable(doc, {
            head: [['Ref.', 'Libellé', 'Valeur']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [226, 232, 240] },
            didDrawPage: (data) => {
                doc.setFontSize(9); doc.setTextColor(150);
                doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
                doc.setDrawColor(220); doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
                doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
                doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
                doc.text(companyName, data.settings.margin.left + 15, 28);
                doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
                const rightX = doc.internal.pageSize.width - data.settings.margin.right;
                doc.text(`État : Compte de Résultat`, rightX, 25, { align: 'right' });
                doc.text(`Période : ${periodString}`, rightX, 30, { align: 'right' });
                doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
                doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
                const pageCountTotal = (doc as any).internal.getNumberOfPages();
                doc.setFontSize(8); doc.setTextColor(150);
                doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left!, doc.internal.pageSize.height - 10);
            },
            margin: { top: 50 },
            willDrawCell: (data) => {
                const line = reportData[data.row.index];
                if (line?.isSubTotal || line?.isGrandTotal || line?.isEmphasized) {
                    doc.setFont(undefined, 'bold');
                }
                if (line?.isSubTotal && !line.isEmphasized) {
                    doc.setFillColor(241, 245, 249); // bg-slate-100
                }
                 if (line?.isEmphasized) {
                    doc.setFillColor(226, 232, 240); // bg-slate-200
                }
                 if (line?.isGrandTotal) {
                    doc.setFillColor(203, 213, 225); // bg-slate-300
                }
            }
        });

        doc.save(`compte_de_resultat_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Compte de Résultat</CardTitle>
                    <CardDescription>Générez et consultez le compte de résultat pour une période donnée.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <Button size="lg" onClick={() => setModalStep('selection')}>
                        Générer le Compte de Résultat
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={modalStep !== 'closed'} onOpenChange={(open) => !open && handleCloseModal()}>
                <DialogContent className={modalStep === 'display' ? "max-w-4xl" : "sm:max-w-md"}>
                    {modalStep === 'selection' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Paramètres du Compte de Résultat</DialogTitle>
                                <DialogDescription>Choisissez la période pour générer le rapport.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label>Période</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {period?.from ? (period.to ? `${format(period.from, 'dd LLL yyyy', { locale: fr })} - ${format(period.to, 'dd LLL yyyy', { locale: fr })}` : format(period.from, 'dd LLL yyyy', { locale: fr })) : 'Sélectionnez une période'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="range" selected={period} onSelect={setPeriod} numberOfMonths={2} locale={fr} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleCloseModal}>Annuler</Button>
                                <Button onClick={handleGenerate}>Suivant</Button>
                            </DialogFooter>
                        </>
                    )}

                    {modalStep === 'display' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Compte de Résultat</DialogTitle>
                                <DialogDescription>Période du {period?.from ? format(period.from, 'dd LLL yyyy', { locale: fr }) : ''} au {period?.to ? format(period.to, 'dd LLL yyyy', { locale: fr }) : ''}.</DialogDescription>
                            </DialogHeader>
                            <div className="max-h-[70vh] overflow-y-auto pr-4 border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Ref.</TableHead>
                                            <TableHead>Libellé</TableHead>
                                            <TableHead className="text-right">Valeur</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.map((line) => (
                                            <TableRow key={line.ref || Math.random()} className={cn(
                                                (line.isSubTotal || line.isGrandTotal) && "font-bold",
                                                line.isSubTotal && !line.isEmphasized && "bg-muted/50",
                                                line.isEmphasized && "bg-secondary",
                                                line.isGrandTotal && "border-y-2 border-primary/50 bg-primary/10"
                                            )}>
                                                {line.value === null ? (
                                                    <TableCell colSpan={3} className="h-4"></TableCell>
                                                ) : (
                                                    <>
                                                        <TableCell className="font-mono text-xs">{line.ref}</TableCell>
                                                        <TableCell style={{ paddingLeft: `${1 + (line.indent || 0) * 1.5}rem` }}>
                                                            {line.label}
                                                        </TableCell>
                                                        <TableCell className={cn("text-right font-mono", line.value < 0 && "text-red-600")}>
                                                            {formatAmount(line.value)}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setModalStep('selection')}><ArrowLeft className="mr-2 h-4 w-4" /> Précédent</Button>
                                <div className="flex-grow" />
                                <Button variant="outline" onClick={handleCloseModal}>Fermer</Button>
                                <Button onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" />Exporter en PDF</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
