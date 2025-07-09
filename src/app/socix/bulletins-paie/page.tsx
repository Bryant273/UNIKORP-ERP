
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Eye, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type PayslipStatus = 'Généré' | 'Envoyé' | 'Consulté';
type Payslip = {
    id: string;
    employeeId: string;
    employeeName: string;
    periode: string; // YYYY-MM
    salaireBrut: number;
    cotisationsSalariales: number;
    netImposable: number;
    netAPayer: number;
    status: PayslipStatus;
};

const initialPayslips: Payslip[] = [
    { id: 'bp-1', employeeId: 'emp-001', employeeName: 'Jean Dupont', periode: '2024-06', salaireBrut: 350000, cotisationsSalariales: 77000, netImposable: 273000, netAPayer: 265000, status: 'Consulté' },
    { id: 'bp-2', employeeId: 'emp-002', employeeName: 'Sophie Martin', periode: '2024-06', salaireBrut: 320000, cotisationsSalariales: 70400, netImposable: 249600, netAPayer: 242000, status: 'Envoyé' },
    { id: 'bp-3', employeeId: 'emp-004', employeeName: 'Lucas Petit', periode: '2024-06', salaireBrut: 180000, cotisationsSalariales: 39600, netImposable: 140400, netAPayer: 138000, status: 'Envoyé' },
    { id: 'bp-4', employeeId: 'emp-005', employeeName: 'Camille Leroy', periode: '2024-06', salaireBrut: 300000, cotisationsSalariales: 66000, netImposable: 234000, netAPayer: 228000, status: 'Consulté' },
    { id: 'bp-5', employeeId: 'emp-001', employeeName: 'Jean Dupont', periode: '2024-05', salaireBrut: 350000, cotisationsSalariales: 77000, netImposable: 273000, netAPayer: 265000, status: 'Consulté' },
];

const ITEMS_PER_PAGE = 10;

export default function BulletinsPaiePage() {
    const { toast } = useToast();
    const [payslips] = useState(initialPayslips);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
    const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const periods = useMemo(() => [...new Set(payslips.map(p => p.periode))].sort((a, b) => b.localeCompare(a)), [payslips]);

    const filteredPayslips = useMemo(() => {
        return payslips.filter(p => {
            const searchMatch = p.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
            const periodMatch = selectedPeriod === 'all' || p.periode === selectedPeriod;
            return searchMatch && periodMatch;
        });
    }, [payslips, searchTerm, selectedPeriod]);

    const totalPages = Math.ceil(filteredPayslips.length / ITEMS_PER_PAGE);
    const currentPayslips = filteredPayslips.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Mail /> Bulletins de Paie</CardTitle>
                            <CardDescription>Consultez et archivez les bulletins de paie de vos employés.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher un employé..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les périodes</SelectItem>
                                {periods.map(p => <SelectItem key={p} value={p}>{format(new Date(p), 'MMMM yyyy', {locale: fr})}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Employé</TableHead>
                            <TableHead className="text-center">Période</TableHead>
                            <TableHead className="text-right">Net à Payer</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-center w-[150px]">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {currentPayslips.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.employeeName}</TableCell>
                                    <TableCell className="text-center capitalize">{format(new Date(p.periode), 'MMMM yyyy', {locale: fr})}</TableCell>
                                    <TableCell className="text-right font-bold">{p.netAPayer.toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell className="text-center"><Badge variant={p.status === 'Consulté' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setViewingPayslip(p)}><Eye className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => toast({title: "Fonctionnalité à venir"})}><Download className="h-4 w-4"/></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="flex items-center justify-between pt-6">
                    <div className="text-sm text-muted-foreground">
                        Total de {filteredPayslips.length} bulletins. Page {currentPage} sur {totalPages}.
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Précédent</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Suivant</Button>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <PayslipViewModal payslip={viewingPayslip} isOpen={!!viewingPayslip} onClose={() => setViewingPayslip(null)} />
        </>
    );
}

function PayslipViewModal({ payslip, isOpen, onClose }: { payslip: Payslip | null; isOpen: boolean; onClose: () => void }) {
    const { toast } = useToast();
    if (!payslip) return null;
    
    // Simulating detailed lines for the preview
    const simulatedLines = {
        gains: [
            { code: 'SB', libelle: 'Salaire de base', montant: payslip.salaireBrut },
        ],
        cotisations: [
            { code: 'C01', libelle: 'Cotisation CNPS', partSalariale: payslip.cotisationsSalariales, partPatronale: payslip.salaireBrut * 0.185 },
        ],
        retenues: [
            { code: 'IGR', libelle: 'Impôt sur le revenu (IGR)', montant: payslip.netImposable - payslip.netAPayer }
        ],
        totalBrut: payslip.salaireBrut,
        totalRetenues: payslip.cotisationsSalariales + (payslip.netImposable - payslip.netAPayer),
    };

    const handlePrint = () => {
        const doc = new jsPDF();
        
        doc.addFont('Helvetica', 'Helvetica', 'normal');
        doc.addFont('Helvetica', 'Helvetica', 'bold');
        
        const primaryColor = '#4F46E5'; 
        const mutedColor = '#6B7280';
        const textColor = '#1F2937';

        // Header
        doc.setFontSize(18);
        doc.setTextColor(primaryColor);
        doc.setFont('Helvetica', 'bold');
        doc.text('BULLETIN DE PAIE', 205, 20, { align: 'right' });
        doc.setFontSize(10);
        doc.setTextColor(mutedColor);
        const periodeDate = new Date(payslip.periode);
        doc.text(`Période du 01 au ${new Date(periodeDate.getFullYear(), periodeDate.getMonth() + 1, 0).getDate()} ${format(periodeDate, 'MMMM yyyy', {locale: fr})}`, 205, 26, { align: 'right' });

        doc.setFontSize(12);
        doc.setTextColor(textColor);
        doc.setFont('Helvetica', 'bold');
        doc.text('UNIKORP', 15, 20);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.text("Abidjan, Côte d'Ivoire", 15, 26);
        
        // Employee Info
        let startY = 40;
        doc.setFontSize(8).setTextColor(mutedColor);
        doc.text("SALARIÉ", 15, startY);
        doc.text("MATRICULE", 150, startY);
        doc.setFontSize(11).setTextColor(textColor).setFont('Helvetica', 'bold');
        doc.text(payslip.employeeName, 15, startY + 5);
        doc.text(payslip.employeeId, 150, startY + 5);
        doc.setFontSize(9).setFont('Helvetica', 'normal').setTextColor(mutedColor);
        doc.text('Adresse fictive, Abidjan', 15, startY + 10);
        
        // Table
        autoTable(doc, {
            startY: startY + 20,
            head: [['Description', 'Part Salariale', 'Part Patronale', 'Montant']],
            body: [
                ...simulatedLines.gains.map(g => [{ content: g.libelle, styles: { fontStyle: 'bold' } }, '', '', g.montant.toLocaleString('fr-FR')]),
                [{ content: "Total Brut", colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }, { content: simulatedLines.totalBrut.toLocaleString('fr-FR'), styles: { fontStyle: 'bold' } }],
                [{ content: "COTISATIONS", colSpan: 4, styles: { fillColor: '#F3F4F6', fontStyle: 'bold' } }],
                ...simulatedLines.cotisations.map(c => [c.libelle, c.partSalariale.toLocaleString('fr-FR'), c.partPatronale.toLocaleString('fr-FR'), '']),
                [{ content: "RETENUES", colSpan: 4, styles: { fillColor: '#F3F4F6', fontStyle: 'bold' } }],
                ...simulatedLines.retenues.map(r => [r.libelle, r.montant.toLocaleString('fr-FR'), '', '']),
            ],
            theme: 'grid',
            headStyles: { fillColor: '#312E81', textColor: '#FFFFFF', fontStyle: 'bold' },
            footStyles: { fillColor: '#E0E7FF', textColor: '#312E81', fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' },
            }
        });

        // Footer Totals
        let finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text("Net imposable :", 15, finalY);
        doc.text(`${payslip.netImposable.toLocaleString('fr-FR')} FCFA`, 80, finalY, { align: 'right' });
        doc.setFontSize(14).setFont('Helvetica', 'bold').setTextColor(primaryColor);
        doc.text("NET À PAYER :", 120, finalY);
        doc.text(`${payslip.netAPayer.toLocaleString('fr-FR')} FCFA`, 205, finalY, { align: 'right' });

        doc.save(`bulletin_${payslip.employeeName.replace(/\s+/g, '_')}_${payslip.periode}.pdf`);
        toast({ title: 'Téléchargement lancé' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                 <DialogHeader className="p-6 border-b">
                    <DialogTitle>Bulletin de Paie - {payslip.employeeName}</DialogTitle>
                    <DialogDescription>Période: {format(new Date(payslip.periode), 'MMMM yyyy', {locale: fr})}</DialogDescription>
                </DialogHeader>
                <div className="flex-1 bg-muted/50 p-6 overflow-y-auto">
                    <div className="p-8 bg-white rounded-lg shadow-lg font-sans text-sm text-gray-800 max-w-4xl mx-auto">
                        {/* Header */}
                        <header className="flex justify-between items-start pb-4 border-b">
                            <div>
                                <Logo className="h-12 w-12 text-primary"/>
                                <h3 className="font-bold text-lg mt-2">UNIKORP</h3>
                                <p className="text-xs text-gray-500">Abidjan, Côte d'Ivoire</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-primary">BULLETIN DE PAIE</h2>
                                <p className="text-sm text-gray-600">Période du 01 au {new Date(payslip.periode.split('-')[0], new Date(payslip.periode).getMonth() + 1, 0).getDate()} {format(new Date(payslip.periode), 'MMMM yyyy', {locale: fr})}</p>
                            </div>
                        </header>
                        
                        {/* Employee Info */}
                        <section className="grid grid-cols-2 gap-4 py-4 border-b">
                            <div>
                                <p className="text-xs text-gray-500">SALARIÉ</p>
                                <p className="font-semibold">{payslip.employeeName}</p>
                                <p className="text-xs text-gray-600">Adresse fictive, Abidjan</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">MATRICULE</p>
                                <p className="font-semibold">{payslip.employeeId}</p>
                            </div>
                        </section>
                        
                        {/* Body */}
                        <main className="py-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/80">
                                        <TableHead className="w-2/5 font-bold">Description</TableHead>
                                        <TableHead className="text-right font-bold">Part Salariale</TableHead>
                                        <TableHead className="text-right font-bold">Part Patronale</TableHead>
                                        <TableHead className="text-right font-bold">Montant</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="bg-secondary/50">
                                        <TableCell colSpan={4} className="font-bold">GAINS</TableCell>
                                    </TableRow>
                                    {simulatedLines.gains.map(line => (
                                        <TableRow key={line.code}>
                                            <TableCell className="font-medium">{line.libelle}</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell className="text-right">{line.montant.toLocaleString('fr-FR')}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-muted/30 font-bold">
                                        <TableCell colSpan={3} className="text-right">Total Brut</TableCell>
                                        <TableCell className="text-right">{simulatedLines.totalBrut.toLocaleString('fr-FR')}</TableCell>
                                    </TableRow>

                                    <TableRow className="bg-secondary/50">
                                        <TableCell colSpan={4} className="font-bold">COTISATIONS & RETENUES</TableCell>
                                    </TableRow>
                                    {simulatedLines.cotisations.map(line => (
                                         <TableRow key={line.code}>
                                            <TableCell className="pl-6">{line.libelle}</TableCell>
                                            <TableCell className="text-right text-red-600">-{line.partSalariale.toLocaleString('fr-FR')}</TableCell>
                                            <TableCell className="text-right text-red-600">-{line.partPatronale.toLocaleString('fr-FR')}</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    ))}
                                    {simulatedLines.retenues.map(line => (
                                         <TableRow key={line.code}>
                                            <TableCell className="pl-6">{line.libelle}</TableCell>
                                            <TableCell className="text-right text-red-600">-{line.montant.toLocaleString('fr-FR')}</TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </main>

                        {/* Footer */}
                        <footer className="flex justify-end pt-4 border-t">
                            <div className="w-1/2 max-w-sm space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Retenues Salariales</span>
                                    <span className="font-semibold text-red-600">-{simulatedLines.totalRetenues.toLocaleString('fr-FR')}</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between font-bold text-base">
                                    <span>Net à Payer avant impôt</span>
                                    <span>{payslip.netImposable.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                                <div className="flex justify-between font-bold text-2xl text-primary p-2 bg-primary/10 rounded-md">
                                    <span>NET À PAYER</span>
                                    <span>{payslip.netAPayer.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
                 <DialogFooter className="p-6 border-t">
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4"/>Imprimer le bulletin</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
