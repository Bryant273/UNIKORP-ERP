
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlusCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell, Line, LineChart, CartesianGrid, LabelList } from "recharts";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- DATA & TYPES ---
type ReportType = 'couts' | 'fournisseurs' | 'rotation' | 'retours' | 'kpi' | 'performance_transporteur';
type Report = {
    id: string;
    titre: string;
    description: string;
    dateCreation: string;
    creePar: string;
    type: ReportType;
};

const MOCK_REPORTS: Report[] = [
    { id: 'rep-1', titre: 'Analyse des Coûts de Transport - T2 2024', description: 'Rapport détaillé sur les dépenses de transport par transporteur et par destination.', dateCreation: '2024-07-05', creePar: 'Admin', type: 'couts' },
    { id: 'rep-2', titre: 'Rapport de Rotation des Stocks - Juin 2024', description: 'Analyse mensuelle de la vitesse de rotation des stocks par catégorie de produit.', dateCreation: '2024-07-02', creePar: 'Automatique', type: 'rotation' },
    { id: 'rep-3', titre: 'Performance des Fournisseurs - S1 2024', description: 'Comparaison des délais de livraison et de la qualité des fournisseurs.', dateCreation: '2024-07-01', creePar: 'Admin', type: 'fournisseurs' },
    { id: 'rep-4', titre: 'Analyse des Retours Clients - Juin 2024', description: 'Identification des motifs de retour et des produits les plus concernés.', dateCreation: '2024-07-01', creePar: 'Automatique', type: 'retours' },
];

const reportTypes: { value: ReportType, label: string }[] = [
    { value: 'couts', label: "Analyse des Coûts Logistiques" },
    { value: 'fournisseurs', label: "Performance Fournisseurs" },
    { value: 'kpi', label: "Synthèse des KPI Logistiques" },
    { value: 'performance_transporteur', label: "Performance Transporteurs" },
];

// --- MOCK DATA FOR CHARTS ---
const costData = [
    { type: 'Transport', cost: 1250000, color: 'hsl(var(--chart-1))' },
    { type: 'Stockage', cost: 850000, color: 'hsl(var(--chart-2))' },
    { type: 'Manutention', cost: 450000, color: 'hsl(var(--chart-3))' },
    { type: 'Administratif', cost: 250000, color: 'hsl(var(--chart-4))' },
];
const costChartConfig = costData.reduce((acc, cur) => { (acc as any)[cur.type] = { label: cur.type, color: cur.color }; return acc; }, {} as ChartConfig);

const carrierPerformanceData = [
  { name: "Chronopost", deliv_rate: 98.5, cost: 8.50 }, { name: "Colissimo", deliv_rate: 97.2, cost: 7.20 },
  { name: "DHL", deliv_rate: 99.1, cost: 12.80 }, { name: "FedEx", deliv_rate: 98.8, cost: 11.50 },
];
const carrierPerformanceConfig = { deliv_rate: { label: "Taux livraison (%)", color: "hsl(var(--chart-2))" } } satisfies ChartConfig;

const supplierData = [
    { name: "Fournisseur A", onTimeRate: 98, qualityScore: 95 },
    { name: "Fournisseur B", onTimeRate: 92, qualityScore: 98 },
    { name: "Fournisseur C", onTimeRate: 99, qualityScore: 89 },
];
const supplierPerformanceConfig = { onTimeRate: { label: "Livraison à temps (%)", color: "hsl(var(--chart-4))" }, qualityScore: { label: "Score Qualité (/100)", color: "hsl(var(--chart-5))" } } satisfies ChartConfig;

// --- DYNAMIC PREVIEW COMPONENT ---
const ReportPreview = ({ type }: { type: ReportType }) => {
    switch (type) {
        case 'couts':
            return <ChartContainer config={costChartConfig} className="mx-auto aspect-square h-[300px]"><RechartsPieChart><ChartTooltip content={<ChartTooltipContent nameKey="cost" />} /><Pie data={costData} dataKey="cost" nameKey="type" innerRadius={60}><Legend /></Pie></RechartsPieChart></ChartContainer>;
        case 'performance_transporteur':
            return <ChartContainer config={carrierPerformanceConfig} className="h-[300px] w-full"><RechartsBarChart data={carrierPerformanceData} layout="vertical"><CartesianGrid horizontal={false} /><YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} /><XAxis type="number" unit="%" hide/><Tooltip content={<ChartTooltipContent />} /><Bar dataKey="deliv_rate" fill="var(--color-deliv_rate)" radius={4}><LabelList dataKey="deliv_rate" position="right" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `${value}%`} /></Bar></RechartsBarChart></ChartContainer>;
        case 'fournisseurs':
             return <ChartContainer config={supplierPerformanceConfig} className="h-[300px] w-full"><RechartsBarChart data={supplierData}><CartesianGrid vertical={false} /><XAxis dataKey="name" /><YAxis /><Legend /><Tooltip content={<ChartTooltipContent />} /><Bar dataKey="onTimeRate" fill="var(--color-onTimeRate)" radius={4} /><Bar dataKey="qualityScore" fill="var(--color-qualityScore)" radius={4} /></RechartsBarChart></ChartContainer>;
        default:
            return <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50"><p>Aperçu non disponible pour ce type de rapport.</p></div>;
    }
};

export default function RapportsAnalysesPage() {
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [viewingReport, setViewingReport] = useState<Report | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newReportData, setNewReportData] = useState({ title: '', description: '', type: reportTypes[0].value as ReportType });
    
    const handleSaveNewReport = (e: React.FormEvent) => {
        e.preventDefault();
        const newReport: Report = {
            id: `rep-${Date.now()}`,
            titre: newReportData.title,
            description: newReportData.description,
            type: newReportData.type,
            creePar: 'Admin',
            dateCreation: new Date().toISOString().split('T')[0],
        };
        setReports(prev => [newReport, ...prev]);
        setIsCreateModalOpen(false);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Rapports et Analyses</CardTitle>
                        <CardDescription>Générez et consultez des rapports personnalisés sur votre activité logistique.</CardDescription>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Nouveau Rapport</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Titre du Rapport</TableHead>
                            <TableHead>Date de Création</TableHead>
                            <TableHead>Créé par</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map(report => (
                            <TableRow key={report.id} className="odd:bg-muted/50">
                                <TableCell className="font-medium">{report.titre}</TableCell>
                                <TableCell>{format(new Date(report.dateCreation), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell>{report.creePar}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => setViewingReport(report)}><Eye className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <form onSubmit={handleSaveNewReport}>
                        <DialogHeader>
                            <DialogTitle>Nouveau Rapport Personnalisé</DialogTitle>
                            <DialogDescription>Configurez les informations de base de votre rapport.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre du rapport</Label>
                                <Input id="title" value={newReportData.title} onChange={e => setNewReportData(d => ({ ...d, title: e.target.value }))} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type de rapport</Label>
                                <Select value={newReportData.type} onValueChange={(v: ReportType) => setNewReportData(d => ({ ...d, type: v }))}>
                                    <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                                    <SelectContent>{reportTypes.map(rt => <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optionnel)</Label>
                                <Textarea id="description" value={newReportData.description} onChange={e => setNewReportData(d => ({ ...d, description: e.target.value }))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                            <Button type="submit">Générer (simulation)</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Aperçu du Rapport : {viewingReport?.titre}</DialogTitle>
                        <DialogDescription>Généré le {viewingReport && format(new Date(viewingReport.dateCreation), 'dd/MM/yyyy')} par {viewingReport?.creePar}.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 bg-muted flex justify-center items-center rounded-md min-h-[350px]">
                       {viewingReport && <ReportPreview type={viewingReport.type} />}
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingReport(null)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
