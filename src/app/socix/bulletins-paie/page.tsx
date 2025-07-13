
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Eye, Download, Search, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';

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

    const handleDownloadPDF = (payslip: Payslip) => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("BULLETIN DE PAIE", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Période de ${format(new Date(payslip.periode), 'MMMM yyyy', { locale: fr })}`, 105, 26, { align: 'center' });
        
        doc.text(`Employé: ${payslip.employeeName}`, 14, 40);
        doc.text(`Matricule: ${payslip.employeeId}`, 14, 46);

        autoTable(doc, {
            head: [['Libellé', 'Base', 'Taux', 'Gain', 'Retenue']],
            body: [
                ['Salaire de Base', payslip.salaireBrut.toLocaleString('fr-FR'), '-', payslip.salaireBrut.toLocaleString('fr-FR'), '-'],
                ['Cotisations Sociales', payslip.salaireBrut.toLocaleString('fr-FR'), '22%', '-', payslip.cotisationsSalariales.toLocaleString('fr-FR')],
                ['Impôt sur le Revenu', payslip.netImposable.toLocaleString('fr-FR'), '~4.5%', '-', (payslip.netImposable - payslip.netAPayer).toLocaleString('fr-FR')],
            ],
            startY: 55,
            theme: 'striped',
        });
        
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`NET À PAYER : ${payslip.netAPayer.toLocaleString('fr-FR')} FCFA`, 196, finalY, { align: 'right' });

        doc.save(`Bulletin_${payslip.employeeName.replace(' ', '_')}_${payslip.periode}.pdf`);
        toast({ title: 'PDF du bulletin généré.' });
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
                                {periods.map(p => <SelectItem key={p} value={p}>{format(new Date(`${p}-02`), 'MMMM yyyy', {locale: fr})}</SelectItem>)}
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
                                    <TableCell className="text-center capitalize">{format(new Date(`${p.periode}-02`), 'MMMM yyyy', {locale: fr})}</TableCell>
                                    <TableCell className="text-right font-bold">{p.netAPayer.toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell className="text-center"><Badge variant={p.status === 'Consulté' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setViewingPayslip(p)}><Eye className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(p)}><Download className="h-4 w-4"/></Button>
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
    if (!payslip) return null;

    const { toast } = useToast();
    const formatCurrencyFCFA = (value: number) => `${value.toLocaleString('fr-FR')} FCFA`;

    // Simulate detailed data based on the payslip prop
    const data = {
        exercice: new Date(payslip.periode).getFullYear().toString(),
        salarie: payslip.employeeName,
        periode: `Du 01/${format(new Date(payslip.periode), 'MM/yy')} au ${format(new Date(new Date(payslip.periode).getFullYear(), new Date(payslip.periode).getMonth() + 1, 0), 'dd/MM/yy')}`,
        historique: [
            { no: parseInt(payslip.id.split('-')[1]), du: `01/${format(new Date(payslip.periode), 'MM/yy')}`, au: format(new Date(new Date(payslip.periode).getFullYear(), new Date(payslip.periode).getMonth() + 1, 0), 'dd/MM/yy'), reglt: format(new Date(new Date(payslip.periode).getFullYear(), new Date(payslip.periode).getMonth() + 1, 0), 'dd/MM/yy'), brut: payslip.salaireBrut, net: payslip.netAPayer }
        ],
        cumuls: {
            heures: 169.33,
            jours: 22.00,
            brut: payslip.salaireBrut,
            salaireNet: payslip.netAPayer,
            netImposable: payslip.netImposable,
            chargesSalariales: payslip.cotisationsSalariales + (payslip.netImposable - payslip.netAPayer),
            chargesPatronales: payslip.salaireBrut * 0.185, // Simulated
            get coutEmployeur() { return this.brut + this.chargesPatronales; }
        }
    };
    
    const handleDownload = () => {
        // PDF generation logic here, for now just a toast
        toast({ title: 'PDF du bulletin généré.' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
                 <DialogHeader className="p-6 border-b">
                    <DialogTitle>Fiche Individuelle - {payslip.employeeName}</DialogTitle>
                    <DialogDescription>Période: {data.periode}</DialogDescription>
                </DialogHeader>
                <div className="flex-1 bg-muted/50 p-6 overflow-y-auto">
                    <div className="p-6 bg-white rounded-lg shadow-lg font-sans text-xs text-gray-800 max-w-4xl mx-auto">
                        <div className="flex justify-between items-start pb-2 mb-2 border-b">
                            <div>
                                <h3 className="font-bold text-sm">UNIKORP</h3>
                                <p className="text-muted-foreground text-xs">Abidjan, Côte d'Ivoire</p>
                            </div>
                            <div className="text-right">
                                <h4 className="font-bold text-base">FICHE INDIVIDUELLE</h4>
                                <p className="text-xs text-muted-foreground">Exercice : {data.exercice}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-2 text-xs">
                            <p><strong>Salarié :</strong> {data.salarie}</p>
                            <p><strong>Période :</strong> {data.periode}</p>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-4 mt-2">
                             <div className="col-span-3">
                                <Card>
                                    <CardHeader className="p-3 bg-muted/50 rounded-t-lg">
                                        <CardTitle className="text-sm">Historique des paies</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-center">N°</TableHead>
                                                    <TableHead className="text-center">Du</TableHead>
                                                    <TableHead className="text-center">Au</TableHead>
                                                    <TableHead className="text-right">Brut</TableHead>
                                                    <TableHead className="text-right">Net à payer</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.historique.map(h => (
                                                    <TableRow key={h.no}>
                                                        <TableCell className="text-center">{h.no}</TableCell>
                                                        <TableCell className="text-center">{h.du}</TableCell>
                                                        <TableCell className="text-center">{h.au}</TableCell>
                                                        <TableCell className="text-right">{formatCurrencyFCFA(h.brut)}</TableCell>
                                                        <TableCell className="text-right font-semibold">{formatCurrencyFCFA(h.net)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                                    <TableCell className="text-right font-bold">{formatCurrencyFCFA(data.cumuls.brut)}</TableCell>
                                                    <TableCell className="text-right font-bold">{formatCurrencyFCFA(data.cumuls.salaireNet)}</TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-span-2">
                                <Card>
                                     <CardHeader className="p-3 bg-muted/50 rounded-t-lg">
                                        <CardTitle className="text-sm">Cumuls Annuels</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-2 text-xs">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Heures travaillées</span><span className="font-semibold">{data.cumuls.heures.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Jours travaillés</span><span className="font-semibold">{data.cumuls.jours}</span></div>
                                        <Separator className="my-2"/>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Brut</span><span className="font-semibold">{formatCurrencyFCFA(data.cumuls.brut)}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Net imposable</span><span className="font-semibold">{formatCurrencyFCFA(data.cumuls.netImposable)}</span></div>
                                        <div className="flex justify-between font-bold text-primary"><span className="">Salaire net</span><span className="">{formatCurrencyFCFA(data.cumuls.salaireNet)}</span></div>
                                        <Separator className="my-2"/>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Charges salariales</span><span className="font-semibold">{formatCurrencyFCFA(data.cumuls.chargesSalariales)}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Charges patronales</span><span className="font-semibold">{formatCurrencyFCFA(data.cumuls.chargesPatronales)}</span></div>
                                          <Separator className="my-2" />
                                         <div className="flex justify-between text-base"><span className="font-bold">Coût employeur total</span><span className="font-bold">{formatCurrencyFCFA(data.cumuls.coutEmployeur)}</span></div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
                 <DialogFooter className="p-6 border-t">
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4"/>Télécharger la Fiche</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
