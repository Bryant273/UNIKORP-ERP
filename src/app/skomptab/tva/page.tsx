
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { TrendingUp, TrendingDown, Scale, FilePlus, CheckCircle, Eye, Pencil, Download, Loader2, Upload } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
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

const kpiData = [
    { title: "TVA Collectée (Mois)", value: "18 500 €", Icon: TrendingUp, color: "text-blue-500" },
    { title: "TVA Déductible (Mois)", value: "12 200 €", Icon: TrendingDown, color: "text-orange-500" },
    { title: "TVA à décaisser (Mois)", value: "6 300 €", Icon: Scale, color: "text-destructive" },
];

const barChartData = [
  { month: "Jan", collectee: 4500, deductible: 3200 },
  { month: "Fev", collectee: 5200, deductible: 3800 },
  { month: "Mar", collectee: 6100, deductible: 4100 },
  { month: "Avr", collectee: 5800, deductible: 4500 },
  { month: "Mai", collectee: 6500, deductible: 4800 },
  { month: "Juin", collectee: 7200, deductible: 5100 },
];
const chartConfig = {
  collectee: { label: "TVA Collectée", color: "hsl(var(--chart-2))" },
  deductible: { label: "TVA Déductible", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

type Declaration = {
    id: string;
    periode: string;
    montant: number;
    statut: 'Brouillon' | 'Validée' | 'Payée';
    echeance: string;
};

const initialDeclarations: Declaration[] = [
    { id: 'tva_jul24', periode: 'Juillet 2024', montant: 6300, statut: 'Brouillon', echeance: '20/08/2024' },
    { id: 'tva_jun24', periode: 'Juin 2024', montant: 4850, statut: 'Payée', echeance: '20/07/2024' },
    { id: 'tva_mai24', periode: 'Mai 2024', montant: 1700, statut: 'Payée', echeance: '20/06/2024' },
    { id: 'tva_avr24', periode: 'Avril 2024', montant: 1300, statut: 'Payée', echeance: '20/05/2024' },
];

const initialFormData = {
    ncc: '1234567A',
    raisonSociale: 'Votre Société S.A.',
    periode: new Date().toISOString().substring(0, 7), // YYYY-MM
    regimeFiscal: 'Réel Normal',
    caHtNormal: 0,
    caHtReduit: 0,
    caExonere: 0,
    exportations: 0,
    tvaCollectee18: 0,
    tvaCollecteeReduit: 0,
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

function TVAMainContent() {
    const [declarations, setDeclarations] = useState(initialDeclarations);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveDeclaration = (montant: number, periode: string) => {
        const newDeclaration: Declaration = {
            id: `tva_${Date.now()}`,
            periode,
            montant,
            statut: 'Validée',
            echeance: 'À déterminer'
        };
        setDeclarations(prev => [newDeclaration, ...prev]);
    }

    return (
        <>
            <div className="flex flex-1 flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion de la TVA</h1>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <FilePlus className="mr-2 h-4 w-4"/>
                        Nouvelle déclaration de TVA
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Évolution de la TVA</CardTitle>
                            <CardDescription>Évolution mensuelle de la TVA collectée et déductible sur le S1 2024.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart data={barChartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis unit="€" />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Bar dataKey="collectee" fill="var(--color-collectee)" radius={4} />
                                    <Bar dataKey="deductible" fill="var(--color-deductible)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
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
                                    {declarations.map((d, index) => {
                                        const isPaid = d.statut === 'Payée';
                                        return (
                                        <TableRow key={d.id}>
                                            <TableCell className="font-medium capitalize">{d.periode}</TableCell>
                                            <TableCell className="text-right font-mono">{d.montant.toLocaleString('fr-FR')} €</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={d.statut === 'Payée' ? 'secondary' : d.statut === 'Brouillon' ? 'outline' : 'default'} className={d.statut === 'Payée' ? 'bg-green-100 text-green-800' : ''}>
                                                    {d.statut === 'Payée' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                    {d.statut}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-1">
                                                    <Button variant="ghost" size="icon" disabled={isPaid}><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" disabled={isPaid}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )})}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <TvaDeclarationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveDeclaration} />
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

function TvaDeclarationModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (montant: number, periode: string) => void }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState(initialFormData);
    const [isImporting, setIsImporting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormData);
        }
    }, [isOpen]);

    useEffect(() => {
        const caNormal = formData.caHtNormal || 0;
        const caReduit = formData.caHtReduit || 0;
        
        // Assuming 18% for normal rate and 10% for reduced rate
        const tvaCollectee18 = caNormal * 0.18;
        const tvaCollecteeReduit = caReduit * 0.10;

        setFormData(prev => ({
            ...prev,
            tvaCollectee18: parseFloat(tvaCollectee18.toFixed(2)),
            tvaCollecteeReduit: parseFloat(tvaCollecteeReduit.toFixed(2)),
        }));
    }, [formData.caHtNormal, formData.caHtReduit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setFormData(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
    }

    const { totalTvaCollectee, totalTvaDeductible, tvaNetteDue, creditAReporter } = useMemo(() => {
        const totalTvaCollectee = formData.tvaCollectee18 + formData.tvaCollecteeReduit + formData.tvaLasem;
        const totalTvaDeductible = formData.tvaDeductibleAchats + formData.tvaDeductibleServices + formData.tvaDeductibleImmo + formData.tvaDeductibleImport;
        const tvaDue = totalTvaCollectee - totalTvaDeductible - formData.creditTvaAnterieur;
        return {
            totalTvaCollectee,
            totalTvaDeductible,
            tvaNetteDue: tvaDue > 0 ? tvaDue : 0,
            creditAReporter: tvaDue < 0 ? -tvaDue : 0,
        };
    }, [formData]);

    const isFormValid = useMemo(() => {
        return formData.ncc && formData.raisonSociale && formData.tvaCollectee18 >= 0 && formData.tvaDeductibleAchats >= 0 && formData.tvaDeductibleServices >= 0 && formData.dateDeclaration;
    }, [formData]);
    
    const handleSubmit = () => {
        if (!isFormValid) {
            toast({ title: 'Champs manquants', description: 'Veuillez remplir tous les champs obligatoires (*).', variant: 'destructive' });
            return;
        }
        const periodeDate = parseISO(`${formData.periode}-01`);
        const periode = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(periodeDate);
        onSave(tvaNetteDue, periode);
        toast({ title: 'Déclaration Validée', description: `La déclaration de TVA pour ${periode} a été enregistrée.` });
        onClose();
    };

    const handleSimulatedImport = () => {
        setIsImporting(true);
        toast({ title: "Importation simulée...", description: "Analyse du fichier d'annexe EDI en cours." });
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                tvaDeductibleAchats: 8500,
                tvaDeductibleServices: 3200,
                tvaDeductibleImmo: 500,
                tvaDeductibleImport: 0
            }));
            setIsImporting(false);
            toast({ title: "Importation réussie", description: "La TVA déductible a été mise à jour.", className: 'bg-green-100 text-green-800' });
        }, 2500);
    };
    
    const handlePrint = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Déclaration de TVA", 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Période: ${formData.periode}`, 15, 30);
        doc.text(`Raison Sociale: ${formData.raisonSociale}`, 15, 36);
        doc.text(`NCC: ${formData.ncc}`, 15, 42);

        autoTable(doc, {
            startY: 50,
            head: [['Description', 'Montant (€)']],
            body: [
                ['Total TVA Collectée', totalTvaCollectee.toLocaleString('fr-FR')],
                ['Total TVA Déductible', totalTvaDeductible.toLocaleString('fr-FR')],
                ['Crédit de TVA antérieur', formData.creditTvaAnterieur.toLocaleString('fr-FR')],
                [{ content: 'TVA Nette Due', styles: { fontStyle: 'bold' } }, { content: tvaNetteDue.toLocaleString('fr-FR'), styles: { fontStyle: 'bold' } }],
                ['Crédit à reporter', creditAReporter.toLocaleString('fr-FR')],
            ],
            theme: 'striped',
        });
        
        doc.save(`declaration_tva_${formData.periode}.pdf`);
    };

    const Field = ({ label, id, isRequired, ...props }: any) => (
        <div className="space-y-2">
            <Label htmlFor={id}>
                {label}
                {isRequired && <span className="text-destructive"> *</span>}
            </Label>
            <Input id={id} onChange={handleChange} {...props} />
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Nouvelle Déclaration de TVA</DialogTitle>
                    <DialogDescription>Remplissez les informations ci-dessous pour générer la déclaration de TVA.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-4">
                    <Tabs defaultValue="identification">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="identification">Identification & CA</TabsTrigger>
                            <TabsTrigger value="collectee">TVA Collectée</TabsTrigger>
                            <TabsTrigger value="deductible">TVA Déductible</TabsTrigger>
                            <TabsTrigger value="liquidation">Liquidation</TabsTrigger>
                        </TabsList>
                        <TabsContent value="identification" className="mt-4">
                            <Card><CardHeader><CardTitle>Informations Générales</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Field label="NCC" id="ncc" value={formData.ncc} isRequired />
                                        <Field label="Raison Sociale" id="raisonSociale" value={formData.raisonSociale} isRequired />
                                        <div className="space-y-2"><Label htmlFor="periode">Période (mois/année)</Label><Input id="periode" type="month" value={formData.periode} onChange={handleChange} /></div>
                                    </div>
                                    <Field label="Régime fiscal" id="regimeFiscal" value={formData.regimeFiscal} />
                                    <Separator />
                                    <CardTitle>Chiffres d'Affaires HT</CardTitle>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Field label="CA Taux Normal (18%)" id="caHtNormal" type="number" value={formData.caHtNormal} />
                                        <Field label="CA Taux Réduit (10%)" id="caHtReduit" type="number" value={formData.caHtReduit} />
                                        <Field label="CA Exonéré" id="caExonere" type="number" value={formData.caExonere} />
                                        <Field label="Exportations" id="exportations" type="number" value={formData.exportations} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="collectee" className="mt-4">
                             <Card><CardHeader><CardTitle>Détail de la TVA Collectée</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Field label="TVA sur CA à 18%" id="tvaCollectee18" type="number" value={formData.tvaCollectee18} isRequired disabled />
                                        <Field label="TVA sur CA à taux réduit" id="tvaCollecteeReduit" type="number" value={formData.tvaCollecteeReduit} disabled />
                                        <Field label="TVA sur livraisons à soi-même" id="tvaLasem" type="number" value={formData.tvaLasem} />
                                    </div>
                                </CardContent>
                             </Card>
                        </TabsContent>
                        <TabsContent value="deductible" className="mt-4">
                             <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Détail de la TVA Déductible</CardTitle> <Button variant="outline" onClick={handleSimulatedImport} disabled={isImporting}>{isImporting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}<span className="ml-2">Importer Annexe EDI</span></Button></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Field label="TVA sur achats" id="tvaDeductibleAchats" type="number" value={formData.tvaDeductibleAchats} isRequired/>
                                        <Field label="TVA sur services" id="tvaDeductibleServices" type="number" value={formData.tvaDeductibleServices} isRequired/>
                                        <Field label="TVA sur immobilisations" id="tvaDeductibleImmo" type="number" value={formData.tvaDeductibleImmo}/>
                                        <Field label="TVA sur importations" id="tvaDeductibleImport" type="number" value={formData.tvaDeductibleImport}/>
                                    </div>
                                </CardContent>
                             </Card>
                        </TabsContent>
                        <TabsContent value="liquidation" className="mt-4">
                             <Card><CardHeader><CardTitle>Liquidation et Validation</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2"><Label>Total TVA Collectée</Label><Input value={totalTvaCollectee.toLocaleString('fr-FR')} disabled className="font-bold"/></div>
                                        <div className="space-y-2"><Label>Total TVA Déductible</Label><Input value={totalTvaDeductible.toLocaleString('fr-FR')} disabled className="font-bold"/></div>
                                        <Field label="Crédit de TVA antérieur" id="creditTvaAnterieur" type="number" value={formData.creditTvaAnterieur}/>
                                    </div>
                                    <Separator />
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>TVA Nette Due</Label><Input value={`${tvaNetteDue.toLocaleString('fr-FR')} €`} disabled className="font-bold text-lg text-destructive"/></div>
                                        <div className="space-y-2"><Label>Crédit à Reporter</Label><Input value={`${creditAReporter.toLocaleString('fr-FR')} €`} disabled className="font-bold text-lg text-green-600"/></div>
                                    </div>
                                    <Separator />
                                    <CardTitle className="pt-4">Finalisation</CardTitle>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Field label="Date de déclaration" id="dateDeclaration" type="date" value={formData.dateDeclaration} isRequired/>
                                        <Field label="Pénalités (si applicable)" id="penalites" type="number" value={formData.penalites} />
                                        <Field label="Intérêts de retard (si applicable)" id="interetsRetard" type="number" value={formData.interetsRetard} />
                                    </div>
                                     <div className="space-y-2"><Label htmlFor="observations">Observations</Label><Textarea id="observations" value={formData.observations} onChange={handleChange} /></div>
                                </CardContent>
                             </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <DialogFooter className="pt-4 border-t gap-2">
                    <Button variant="secondary" onClick={handlePrint} disabled={!isFormValid}>Imprimer la Fiche</Button>
                    <div className="flex-grow" />
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={!isFormValid}>Valider la déclaration</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
