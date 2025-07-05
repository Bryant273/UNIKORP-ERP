
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { TrendingUp, TrendingDown, Scale, FilePlus, CheckCircle, Eye, Download, Upload, Loader2, Pencil, Trash2 } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import FiscalPageLayout from '@/components/fiscal-layout';

// --- DATA & CONFIGS ---

const kpiData = [
    { title: "TVA Collectée (Mois)", value: "18 500 €", Icon: TrendingUp, color: "text-blue-500" },
    { title: "TVA Déductible (Mois)", value: "12 200 €", Icon: TrendingDown, color: "text-orange-500" },
    { title: "TVA à décaisser (Mois)", value: "6 300 €", Icon: Scale, color: "text-destructive" },
];

const barChartDataS1 = [
  { month: "Jan", collectee: 4500, deductible: 3200 },
  { month: "Fev", collectee: 5200, deductible: 3800 },
  { month: "Mar", collectee: 6100, deductible: 4100 },
  { month: "Avr", collectee: 5800, deductible: 4500 },
  { month: "Mai", collectee: 6500, deductible: 4800 },
  { month: "Juin", collectee: 7200, deductible: 5100 },
].map(d => ({ ...d, tvaAPayer: d.collectee - d.deductible }));

const barChartDataS2 = [
  { month: "Juil", collectee: 18500, deductible: 12200 },
  { month: "Août", collectee: 19200, deductible: 13500 },
  { month: "Sep", collectee: 21000, deductible: 14000 },
  { month: "Oct", collectee: 22500, deductible: 15100 },
  { month: "Nov", collectee: 24000, deductible: 16800 },
  { month: "Déc", collectee: 28000, deductible: 18500 },
].map(d => ({ ...d, tvaAPayer: d.collectee - d.deductible }));


const chartConfig = {
  collectee: { label: "TVA Collectée", color: "hsl(var(--chart-2))" },
  deductible: { label: "TVA Déductible", color: "hsl(var(--chart-1))" },
  tvaAPayer: { label: "TVA à Payer", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

type DeclarationStatus = 'Brouillon' | 'Validée' | 'Payée';
type Declaration = {
    id: string;
    periode: string;
    montant: number;
    statut: DeclarationStatus;
    echeance: string;
    data: any;
};

const initialDeclarations: Declaration[] = [
    { id: 'tva_jul24', periode: 'Juillet 2024', montant: 6300, statut: 'Brouillon', echeance: '20/08/2024', data: {} },
    { id: 'tva_jun24', periode: 'Juin 2024', montant: 4850, statut: 'Payée', echeance: '20/07/2024', data: {} },
    { id: 'tva_mai24', periode: 'Mai 2024', montant: 1700, statut: 'Payée', echeance: '20/06/2024', data: {} },
    { id: 'tva_avr24', periode: 'Avril 2024', montant: 1300, statut: 'Payée', echeance: '20/05/2024', data: {} },
];

const defaultFormData = {
    ncc: '1234567A',
    raisonSociale: 'Votre Société S.A.',
    periode: new Date().toISOString().substring(0, 7), // YYYY-MM
    regimeFiscal: 'Réel Normal',
    caHtNormal: 0,
    caHtReduit: 0,
    caExonere: 0,
    exportations: 0,
    tvaLasem: 0,
    tvaDeductibleAchats: 0,
    tvaDeductibleServices: 0,
    tvaDeductibleImmo: 0,
    tvaDeductibleImport: 0,
    creditTvaAnterieur: 0,
    dateDeclaration: new Date().toISOString().split('T')[0],
    observations: '',
    penalites: 0,
    interetsRetard: 0,
};

const ITEMS_PER_PAGE = 10;

function TVAMainContent() {
    const [declarations, setDeclarations] = useState(initialDeclarations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingDeclaration, setViewingDeclaration] = useState<Declaration | null>(null);
    const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
    const [declarationToDelete, setDeclarationToDelete] = useState<Declaration | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    const totalPages = Math.ceil(declarations.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentDeclarations = declarations.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const openModal = (declaration: Declaration | null = null) => {
        setEditingDeclaration(declaration);
        setIsModalOpen(true);
    };

    const handleSaveDeclaration = (montant: number, periode: string, data: any, id: string | null) => {
        if (id) {
            setDeclarations(prev => prev.map(d => d.id === id ? {...d, montant, periode, data, statut: 'Validée'} : d));
            toast({ title: 'Déclaration modifiée', description: `La déclaration de TVA pour ${periode} a été mise à jour.` });
        } else {
            const newDeclaration: Declaration = {
                id: `tva_${Date.now()}`,
                periode,
                montant,
                statut: 'Validée',
                echeance: 'À déterminer',
                data
            };
            setDeclarations(prev => [newDeclaration, ...prev]);
            toast({ title: 'Déclaration Validée', description: `La déclaration de TVA pour ${periode} a été enregistrée.` });
        }
        setIsModalOpen(false);
    }
    
    const handleViewDeclaration = (declaration: Declaration) => {
        setViewingDeclaration(declaration);
        setIsViewModalOpen(true);
    };
    
    const handleMarkAsPaid = (id: string) => {
        setDeclarations(prev => prev.map(d => d.id === id ? { ...d, statut: 'Payée' } : d));
        toast({ title: 'Statut mis à jour', description: 'La déclaration a été marquée comme payée.' });
    };

    const handleDelete = () => {
        if (!declarationToDelete) return;
        setDeclarations(prev => prev.filter(d => d.id !== declarationToDelete.id));
        setDeclarationToDelete(null);
        toast({ title: 'Déclaration supprimée' });
    };
    
    const handlePrintDeclaration = (declaration: Declaration) => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Déclaration de TVA (Modèle DGI)", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        const printDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        doc.text(`Imprimé via UNIKORP ® le ${printDate}`, 105, 28, { align: 'center' });
        
        const data = declaration.data || {};
        const raisonSociale = data.raisonSociale || "Non spécifié";
        const ncc = data.ncc || "Non spécifié";

        doc.setLineWidth(0.5);
        doc.rect(14, 35, 182, 20);
        doc.text(`RAISON SOCIALE: ${raisonSociale}`, 20, 42);
        doc.text(`N° COMPTE CONTRIBUABLE: ${ncc}`, 20, 50);
        doc.text(`PÉRIODE: ${declaration.periode}`, 130, 42);

        let finalY = 60;
        const addSection = (title: string, entries: {label: string, value: string | number}[]) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 14, finalY);
            finalY += 5;
            autoTable(doc, {
                startY: finalY,
                body: entries.map(e => [e.label, typeof e.value === 'number' ? e.value.toLocaleString('fr-FR') + ' €' : e.value]),
                theme: 'grid',
                styles: { fontSize: 9 },
                columnStyles: { 0: { cellWidth: 100 }, 1: { halign: 'right' } }
            });
            finalY = (doc as any).lastAutoTable.finalY + 10;
        }

        const { totalTvaCollectee, totalTvaDeductible, tvaNetteDue, creditAReporter } = calculateTotals(data);
        
        addSection("I. CHIFFRE D'AFFAIRES HORS TAXE", [
            { label: 'Taux Normal (18%)', value: data.caHtNormal || 0 },
            { label: 'Taux Réduit (10%)', value: data.caHtReduit || 0 },
            { label: 'Exonéré', value: data.caExonere || 0 },
            { label: 'Exportations', value: data.exportations || 0 },
        ]);
        addSection("II. TVA COLLECTÉE", [
            { label: 'TVA sur CA à 18%', value: data.tvaCollectee18 || 0 },
            { label: 'TVA sur CA à taux réduit', value: data.tvaCollecteeReduit || 0 },
            { label: 'TVA sur livraisons à soi-même', value: data.tvaLasem || 0 },
            { label: 'TOTAL TVA COLLECTÉE', value: totalTvaCollectee },
        ]);
        addSection("III. TVA DÉDUCTIBLE", [
            { label: 'Sur Achats', value: data.tvaDeductibleAchats || 0 },
            { label: 'Sur Services', value: data.tvaDeductibleServices || 0 },
            { label: 'Sur Immobilisations', value: data.tvaDeductibleImmo || 0 },
            { label: 'TOTAL TVA DÉDUCTIBLE', value: totalTvaDeductible },
        ]);
         addSection("IV. LIQUIDATION", [
            { label: 'Crédit de TVA antérieur', value: data.creditTvaAnterieur || 0 },
            { label: 'TVA Nette Due', value: tvaNetteDue },
            { label: 'Crédit à Reporter', value: creditAReporter },
        ]);

        doc.save(`declaration_tva_${declaration.periode.replace(/\s/g, '_')}.pdf`);
    };

    const getStatusBadge = (statut: DeclarationStatus, id: string) => {
        switch (statut) {
            case 'Brouillon':
            case 'Validée':
                return (
                    <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(id)}>
                        Marquer comme payée
                    </Button>
                );
            case 'Payée':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Payée
                    </Badge>
                );
            default:
                return <Badge>{statut}</Badge>;
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion de la TVA</h1>
                    <Button onClick={() => openModal()}>
                        <FilePlus className="mr-2 h-4 w-4"/>
                        Nouvelle déclaration
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {kpiData.map(kpi => (
                        <Card key={kpi.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                <kpi.Icon className={`h-5 w-5 ${kpi.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Évolution de la TVA</CardTitle>
                            <CardDescription>Évolution mensuelle sur les deux semestres.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="s2">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="s1">Semestre 1</TabsTrigger>
                                    <TabsTrigger value="s2">Semestre 2</TabsTrigger>
                                </TabsList>
                                <TabsContent value="s1">
                                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                        <BarChart data={barChartDataS1}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                            <YAxis unit="€" />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                            <Bar dataKey="collectee" fill="var(--color-collectee)" radius={4} />
                                            <Bar dataKey="deductible" fill="var(--color-deductible)" radius={4} />
                                            <Bar dataKey="tvaAPayer" fill="var(--color-tvaAPayer)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                </TabsContent>
                                <TabsContent value="s2">
                                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                        <BarChart data={barChartDataS2}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                            <YAxis unit="€" />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                            <Bar dataKey="collectee" fill="var(--color-collectee)" radius={4} />
                                            <Bar dataKey="deductible" fill="var(--color-deductible)" radius={4} />
                                            <Bar dataKey="tvaAPayer" fill="var(--color-tvaAPayer)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle>Historique des déclarations</CardTitle>
                            <CardDescription>Suivi des dernières déclarations de TVA.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Période</TableHead>
                                        <TableHead className="text-right">Montant Dû</TableHead>
                                        <TableHead className="text-center">Statut</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentDeclarations.map((d) => {
                                        const isPaid = d.statut === 'Payée';
                                        return (
                                        <TableRow key={d.id}>
                                            <TableCell className="font-medium capitalize">{d.periode}</TableCell>
                                            <TableCell className="text-right font-mono">{d.montant.toLocaleString('fr-FR')} €</TableCell>
                                            <TableCell className="text-center">{getStatusBadge(d.statut, d.id)}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleViewDeclaration(d)}><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => openModal(d)} disabled={isPaid}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handlePrintDeclaration(d)}><Download className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeclarationToDelete(d)} disabled={isPaid} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Total de {declarations.length} déclarations.
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Précédent
                                </Button>
                                <span className="text-sm">Page {currentPage} sur {totalPages}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Suivant
                                </Button>
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
            <TvaDeclarationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveDeclaration} declarationToEdit={editingDeclaration} />
            <ViewDeclarationModal declaration={viewingDeclaration} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
            <AlertDialog open={!!declarationToDelete} onOpenChange={() => setDeclarationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Supprimer cette déclaration ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export default function TvaPage() {
    return (
        <FiscalPageLayout>
            <TVAMainContent />
        </FiscalPageLayout>
    );
}

// --- UTILS & HELPERS ---
const calculateTotals = (data: any) => {
    const caNormal = data.caHtNormal || 0;
    const caReduit = data.caHtReduit || 0;
    const tvaCollectee18 = caNormal * 0.18;
    const tvaCollecteeReduit = caReduit * 0.10;
    
    const totalTvaCollectee = tvaCollectee18 + tvaCollecteeReduit + (data.tvaLasem || 0);
    const totalTvaDeductible = (data.tvaDeductibleAchats || 0) + (data.tvaDeductibleServices || 0) + (data.tvaDeductibleImmo || 0) + (data.tvaDeductibleImport || 0);
    const tvaDue = totalTvaCollectee - totalTvaDeductible - (data.creditTvaAnterieur || 0);
    
    return {
        tvaCollectee18,
        tvaCollecteeReduit,
        totalTvaCollectee,
        totalTvaDeductible,
        tvaNetteDue: tvaDue > 0 ? tvaDue : 0,
        creditAReporter: tvaDue < 0 ? -tvaDue : 0,
    };
};

// --- MODALS ---

function TvaDeclarationModal({ isOpen, onClose, onSave, declarationToEdit }: { isOpen: boolean, onClose: () => void, onSave: (montant: number, periode: string, data: any, id: string | null) => void, declarationToEdit: Declaration | null }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState(declarationToEdit ? declarationToEdit.data : defaultFormData);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(declarationToEdit ? { ...defaultFormData, ...declarationToEdit.data } : defaultFormData);
        }
    }, [isOpen, declarationToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) : value }));
    }

    const { tvaCollectee18, tvaCollecteeReduit, totalTvaCollectee, totalTvaDeductible, tvaNetteDue, creditAReporter } = useMemo(() => {
        return calculateTotals(formData);
    }, [formData]);

    const isFormValid = useMemo(() => formData.ncc && formData.raisonSociale && formData.dateDeclaration, [formData]);
    
    const handleSubmit = () => {
        if (!isFormValid) {
            toast({ title: 'Champs manquants', description: 'Veuillez remplir tous les champs obligatoires (*).', variant: 'destructive' });
            return;
        }
        const periodeDate = parseISO(`${formData.periode}-01`);
        const periode = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(periodeDate);
        onSave(tvaNetteDue, periode, formData, declarationToEdit ? declarationToEdit.id : null);
    };

    const handleSimulatedImport = () => {
        setIsImporting(true);
        toast({ title: "Importation simulée...", description: "Analyse du fichier d'annexe EDI en cours." });
        setTimeout(() => {
            setFormData(prev => ({...prev, tvaDeductibleAchats: 8500, tvaDeductibleServices: 3200, tvaDeductibleImmo: 500, tvaDeductibleImport: 0}));
            setIsImporting(false);
            toast({ title: "Importation réussie", description: "La TVA déductible a été mise à jour.", className: 'bg-green-100 text-green-800' });
        }, 2500);
    };

    const Field = ({ label, id, isRequired, ...props }: any) => (
        <div className="space-y-2"><Label htmlFor={id}>{label}{isRequired && <span className="text-destructive"> *</span>}</Label><Input id={id} onChange={handleChange} {...props} /></div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader><DialogTitle>{declarationToEdit ? 'Modifier la' : 'Nouvelle'} Déclaration de TVA</DialogTitle><DialogDescription>Remplissez les informations ci-dessous pour générer la déclaration de TVA.</DialogDescription></DialogHeader>
                <div className="flex-1 overflow-y-auto pr-4">
                    <Tabs defaultValue="identification">
                        <TabsList className="grid w-full grid-cols-4"><TabsTrigger value="identification">Identification & CA</TabsTrigger><TabsTrigger value="collectee">TVA Collectée</TabsTrigger><TabsTrigger value="deductible">TVA Déductible</TabsTrigger><TabsTrigger value="liquidation">Liquidation</TabsTrigger></TabsList>
                        <TabsContent value="identification" className="mt-4"><Card><CardHeader><CardTitle>Informations Générales</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-3 gap-4"><Field label="NCC" id="ncc" value={formData.ncc} isRequired /><Field label="Raison Sociale" id="raisonSociale" value={formData.raisonSociale} isRequired disabled/><div className="space-y-2"><Label htmlFor="periode">Période (mois/année)</Label><Input id="periode" type="month" value={formData.periode} onChange={handleChange} /></div></div><Field label="Régime fiscal" id="regimeFiscal" value={formData.regimeFiscal} /><Separator /><CardTitle>Chiffres d'Affaires HT</CardTitle><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"><Field label="CA Taux Normal (18%)" id="caHtNormal" type="number" value={formData.caHtNormal} /><Field label="CA Taux Réduit (10%)" id="caHtReduit" type="number" value={formData.caHtReduit} /><Field label="CA Exonéré" id="caExonere" type="number" value={formData.caExonere} /><Field label="Exportations" id="exportations" type="number" value={formData.exportations} /></div></CardContent></Card></TabsContent>
                        <TabsContent value="collectee" className="mt-4"><Card><CardHeader><CardTitle>Détail de la TVA Collectée</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-3 gap-4"><div className="space-y-2"><Label>TVA sur CA à 18%</Label><Input value={tvaCollectee18} disabled /></div><div className="space-y-2"><Label>TVA sur CA à taux réduit</Label><Input value={tvaCollecteeReduit} disabled /></div><Field label="TVA sur livraisons à soi-même" id="tvaLasem" type="number" value={formData.tvaLasem} /></div></CardContent></Card></TabsContent>
                        <TabsContent value="deductible" className="mt-4"><Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Détail de la TVA Déductible</CardTitle> <Button variant="outline" onClick={handleSimulatedImport} disabled={isImporting}>{isImporting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}<span className="ml-2">Importer Annexe EDI</span></Button></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"><Field label="TVA sur achats" id="tvaDeductibleAchats" type="number" value={formData.tvaDeductibleAchats} isRequired/><Field label="TVA sur services" id="tvaDeductibleServices" type="number" value={formData.tvaDeductibleServices} isRequired/><Field label="TVA sur immobilisations" id="tvaDeductibleImmo" type="number" value={formData.tvaDeductibleImmo}/><Field label="TVA sur importations" id="tvaDeductibleImport" type="number" value={formData.tvaDeductibleImport}/></div></CardContent></Card></TabsContent>
                        <TabsContent value="liquidation" className="mt-4"><Card><CardHeader><CardTitle>Liquidation et Validation</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-3 gap-4"><div className="space-y-2"><Label>Total TVA Collectée</Label><Input value={totalTvaCollectee.toLocaleString('fr-FR')} disabled className="font-bold"/></div><div className="space-y-2"><Label>Total TVA Déductible</Label><Input value={totalTvaDeductible.toLocaleString('fr-FR')} disabled className="font-bold"/></div><Field label="Crédit de TVA antérieur" id="creditTvaAnterieur" type="number" value={formData.creditTvaAnterieur}/></div><Separator /><div className="grid md:grid-cols-2 gap-4"><div className="space-y-2"><Label>TVA Nette Due</Label><Input value={`${tvaNetteDue.toLocaleString('fr-FR')} €`} disabled className="font-bold text-lg text-destructive"/></div><div className="space-y-2"><Label>Crédit à Reporter</Label><Input value={`${creditAReporter.toLocaleString('fr-FR')} €`} disabled className="font-bold text-lg text-green-600"/></div></div><Separator /><CardTitle className="pt-4">Finalisation</CardTitle><div className="grid md:grid-cols-3 gap-4"><Field label="Date de déclaration" id="dateDeclaration" type="date" value={formData.dateDeclaration} isRequired/><Field label="Pénalités (si applicable)" id="penalites" type="number" value={formData.penalites} /><Field label="Intérêts de retard (si applicable)" id="interetsRetard" type="number" value={formData.interetsRetard} /></div><div className="space-y-2"><Label htmlFor="observations">Observations</Label><Textarea id="observations" value={formData.observations} onChange={handleChange} /></div></CardContent></Card></TabsContent>
                    </Tabs>
                </div>
                <DialogFooter className="pt-4 border-t gap-2"><Button variant="outline" onClick={onClose}>Annuler</Button><Button onClick={handleSubmit} disabled={!isFormValid}>{declarationToEdit ? 'Modifier' : 'Valider'} la déclaration</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ViewDeclarationModal({ declaration, isOpen, onClose }: { declaration: Declaration | null; isOpen: boolean; onClose: () => void }) {
    if (!declaration) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Détail de la Déclaration de TVA</DialogTitle>
                    <DialogDescription>Période de {declaration.periode}.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                    <DeclarationFormView data={{...initialFormData, ...declaration.data}} />
                    <AnnexEdiView />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeclarationFormView({ data }: { data: any }) {
    const {tvaCollectee18, tvaCollecteeReduit, totalTvaCollectee, totalTvaDeductible, tvaNetteDue, creditAReporter} = calculateTotals(data);
    const Field = ({ label, value }: { label: string, value: string | number }) => (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold">{typeof value === 'number' ? value.toLocaleString('fr-FR') : value || '-'}</p>
        </div>
    );

    return (
        <Card>
            <CardContent className="p-4 space-y-4 border rounded-lg">
                <div className="p-2 bg-primary/10 rounded-md text-center font-bold text-primary">DECLARATION DE TAXE SUR LA VALEUR AJOUTEE</div>
                <div className="grid grid-cols-2 gap-4 border p-2 rounded">
                    <Field label="RAISON SOCIALE" value={data.raisonSociale} />
                    <Field label="N° COMPTE CONTRIBUABLE" value={data.ncc} />
                </div>
                <div className="grid grid-cols-3 gap-4 border p-2 rounded">
                    <Field label="PÉRIODE D'IMPOSITION" value={data.periode} />
                    <Field label="RÉGIME FISCAL" value={data.regimeFiscal} />
                    <Field label="DATE DE DÉCLARATION" value={data.dateDeclaration ? format(parseISO(data.dateDeclaration), 'dd/MM/yyyy') : '-'} />
                </div>
                <div className="space-y-2 border p-2 rounded">
                    <h3 className="font-semibold">CADRE I - CA HT</h3>
                    <div className="grid grid-cols-4 gap-2">
                        <Field label="Taux Normal" value={`${data.caHtNormal.toLocaleString('fr-FR')} €`} />
                        <Field label="Taux Réduit" value={`${data.caHtReduit.toLocaleString('fr-FR')} €`} />
                        <Field label="Exonéré" value={`${data.caExonere.toLocaleString('fr-FR')} €`} />
                        <Field label="Exportations" value={`${data.exportations.toLocaleString('fr-FR')} €`} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2 border p-2 rounded">
                        <h3 className="font-semibold">CADRE II - TVA COLLECTÉE</h3>
                         <Field label="TVA sur CA à 18%" value={`${tvaCollectee18.toLocaleString('fr-FR')} €`} />
                         <Field label="TVA sur CA à taux réduit" value={`${tvaCollecteeReduit.toLocaleString('fr-FR')} €`} />
                         <Field label="TVA sur LASM" value={`${data.tvaLasem.toLocaleString('fr-FR')} €`} />
                         <Separator className="my-1"/>
                         <div className="font-bold"><Field label="TOTAL TVA COLLECTÉE" value={`${totalTvaCollectee.toLocaleString('fr-FR')} €`} /></div>
                    </div>
                     <div className="space-y-2 border p-2 rounded">
                        <h3 className="font-semibold">CADRE III - TVA DÉDUCTIBLE</h3>
                         <Field label="Sur Achats" value={`${data.tvaDeductibleAchats.toLocaleString('fr-FR')} €`} />
                         <Field label="Sur Services" value={`${data.tvaDeductibleServices.toLocaleString('fr-FR')} €`} />
                         <Field label="Sur Immobilisations" value={`${data.tvaDeductibleImmo.toLocaleString('fr-FR')} €`} />
                         <Separator className="my-1"/>
                         <div className="font-bold"><Field label="TOTAL TVA DÉDUCTIBLE" value={`${totalTvaDeductible.toLocaleString('fr-FR')} €`} /></div>
                    </div>
                </div>
                <div className="space-y-2 border p-2 rounded bg-muted/50">
                    <h3 className="font-semibold">CADRE IV - LIQUIDATION</h3>
                    <Field label="Crédit de TVA antérieur" value={`${data.creditTvaAnterieur.toLocaleString('fr-FR')} €`} />
                    <Separator className="my-1" />
                    <div className="text-destructive font-bold"><Field label="TVA Nette Due" value={`${tvaNetteDue.toLocaleString('fr-FR')} €`} /></div>
                    <div className="text-green-600 font-bold"><Field label="Crédit à Reporter" value={`${creditAReporter.toLocaleString('fr-FR')} €`} /></div>
                </div>
            </CardContent>
        </Card>
    )
}

function AnnexEdiView() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Annexe EDI - TVA Déductible (Exemple)</CardTitle>
                <CardDescription>Format simplifié de l'annexe importée.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° Facture</TableHead>
                            <TableHead>Fournisseur</TableHead>
                            <TableHead className="text-right">Montant HT</TableHead>
                            <TableHead className="text-right">Montant TVA</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow><TableCell>F2024-A150</TableCell><TableCell>Fournisseur Alpha</TableCell><TableCell className="text-right">5 000 €</TableCell><TableCell className="text-right">900 €</TableCell></TableRow>
                        <TableRow><TableCell>F2024-B088</TableCell><TableCell>Fournisseur Beta</TableCell><TableCell className="text-right">8 500 €</TableCell><TableCell className="text-right">1 530 €</TableCell></TableRow>
                        <TableRow><TableCell>F2024-C212</TableCell><TableCell>Fournisseur Gamma</TableCell><TableCell className="text-right">2 500 €</TableCell><TableCell className="text-right">450 €</TableCell></TableRow>
                        <TableRow><TableCell>F2024-I034</TableCell><TableCell>Immo Service</TableCell><TableCell className="text-right">2 777.78 €</TableCell><TableCell className="text-right">500 €</TableCell></TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}