
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
        const companyName = "UNIKORP";
        const companyAddress = "Abidjan, Côte d'Ivoire";

        // Header
        doc.setFontSize(18);
        doc.text("Bulletin de Paie", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Période du 01 au ${new Date(payslip.periode.split('-')[0], new Date(payslip.periode).getMonth() + 1, 0).getDate()} ${format(new Date(payslip.periode), 'MMMM yyyy', {locale: fr})}`, 105, 26, { align: 'center' });
        
        // Company & Employee Info
        let startY = 40;
        doc.setFontSize(10).setFont('helvetica', 'bold').text("Employeur", 14, startY);
        doc.setFont('helvetica', 'normal').text(`${companyName}\n${companyAddress}`, 14, startY + 5);
        doc.setFont('helvetica', 'bold').text("Salarié", 110, startY);
        doc.setFont('helvetica', 'normal').text(`${payslip.employeeName}\nMatricule: ${payslip.employeeId}`, 110, startY + 5);
        startY += 20;

        autoTable(doc, {
            startY: startY,
            head: [['Description', 'Base', 'Taux', 'Part Salariale', 'Part Patronale']],
            body: [
                ['Salaire de base', payslip.salaireBrut.toLocaleString(), '', '', ''],
                ['TOTAL BRUT', '', '', '', payslip.salaireBrut.toLocaleString()],
                ['Cotisations Sociales', payslip.salaireBrut.toLocaleString(), '22%', payslip.cotisationsSalariales.toLocaleString(), (payslip.salaireBrut*0.185).toLocaleString()],
                ['NET IMPOSABLE', '', '', '', payslip.netImposable.toLocaleString()],
                ['Impôt sur le revenu', payslip.netImposable.toLocaleString(), 'Variable', (payslip.netImposable * 0.05).toLocaleString(), ''], // Simplified
            ],
            foot: [
                ['NET A PAYER', '', '', '', payslip.netAPayer.toLocaleString()],
            ],
            theme: 'striped',
            headStyles: { fillColor: '#1C2039' },
            footStyles: { fillColor: '#e2e8f0', textColor: '#1e293b', fontStyle: 'bold' }
        });

        doc.save(`bulletin_paie_${payslip.employeeName.replace(' ','_')}_${payslip.periode}.pdf`);
        toast({ title: 'Téléchargement lancé' });
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
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Bulletin de Paie - {payslip.employeeName}</DialogTitle>
                    <DialogDescription>Période: {format(new Date(payslip.periode), 'MMMM yyyy', {locale: fr})}</DialogDescription>
                </DialogHeader>
                <div className="p-4 bg-muted/50 rounded-md">
                     <div className="p-6 bg-white rounded shadow-lg font-sans text-sm text-black">
                        {/* Header */}
                        <div className="flex justify-between items-start pb-4 border-b">
                            <div>
                                <Logo className="h-12 w-12 text-primary"/>
                                <h3 className="font-bold text-lg mt-2">UNIKORP</h3>
                                <p className="text-xs">Abidjan, Côte d'Ivoire</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold">BULLETIN DE PAIE</h2>
                                <p className="text-xs">Période du 01 au {new Date(payslip.periode.split('-')[0], new Date(payslip.periode).getMonth() + 1, 0).getDate()} {format(new Date(payslip.periode), 'MMMM yyyy', {locale: fr})}</p>
                            </div>
                        </div>
                        {/* Infos */}
                        <div className="grid grid-cols-2 gap-4 py-4 text-xs">
                            <div className="space-y-1">
                                <p><strong>Salarié:</strong> {payslip.employeeName}</p>
                                <p><strong>Matricule:</strong> {payslip.employeeId}</p>
                                <p><strong>Poste:</strong> Développeur</p>
                            </div>
                             <div className="space-y-1 text-right">
                                <p><strong>N° Affiliation CNPS:</strong> 123456</p>
                                <p><strong>Emploi:</strong> Cadre</p>
                            </div>
                        </div>
                        {/* Body */}
                        <Table className="text-xs">
                            <TableHeader>
                                <TableRow className="bg-muted/80">
                                    <TableHead className="font-bold">Libellé</TableHead>
                                    <TableHead className="text-center font-bold">Base</TableHead>
                                    <TableHead className="text-center font-bold">Taux</TableHead>
                                    <TableHead className="text-right font-bold">Part Salariale</TableHead>
                                    <TableHead className="text-right font-bold">Part Patronale</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow><TableCell>Salaire de base</TableCell><TableCell className="text-center">{payslip.salaireBrut.toLocaleString()}</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
                                <TableRow className="bg-muted/30 font-semibold"><TableCell>TOTAL BRUT</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell className="text-right">{payslip.salaireBrut.toLocaleString()}</TableCell></TableRow>
                                
                                <TableRow><TableCell className="pl-6">Cotisations Sociales</TableCell><TableCell className="text-center">{payslip.salaireBrut.toLocaleString()}</TableCell><TableCell className="text-center">22%</TableCell><TableCell className="text-right text-red-600">-{payslip.cotisationsSalariales.toLocaleString()}</TableCell><TableCell className="text-right text-red-600">-{(payslip.salaireBrut * 0.185).toLocaleString()}</TableCell></TableRow>
                                
                                <TableRow className="bg-muted/30 font-semibold"><TableCell>NET IMPOSABLE</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell><TableCell className="text-right">{payslip.netImposable.toLocaleString()}</TableCell></TableRow>
                                
                                 <TableRow><TableCell className="pl-6">Impôt sur le revenu (IGR)</TableCell><TableCell className="text-center">{payslip.netImposable.toLocaleString()}</TableCell><TableCell className="text-center">5%</TableCell><TableCell className="text-right text-red-600">-{(payslip.netImposable * 0.05).toLocaleString()}</TableCell><TableCell></TableCell></TableRow>

                            </TableBody>
                            <TableFooter>
                                <TableRow className="font-bold text-base bg-primary/10">
                                    <TableCell colSpan={4}>NET À PAYER</TableCell>
                                    <TableCell className="text-right">{payslip.netAPayer.toLocaleString()} FCFA</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                         <p className="text-xs text-muted-foreground mt-4 text-center">Payé par virement bancaire le {format(new Date(payslip.periode), 'dd/MM/yyyy')}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
