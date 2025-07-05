
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import type { ChartConfig } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';


// --- DATA & CONFIGS ---

const projetResultatData = [
  { projet: 'Projet Alpha', produits: 450000, charges: 320000, marge: 130000 },
  { projet: 'Projet Beta', produits: 680000, charges: 510000, marge: 170000 },
  { projet: 'Maintenance', produits: 250000, charges: 180000, marge: 70000 },
  { projet: 'R&D', produits: 50000, charges: 150000, marge: -100000 },
];
const projetResultatChartConfig = {
  produits: { label: "Produits", color: "hsl(var(--chart-2))" },
  charges: { label: "Charges", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const balanceAnalytiqueData = [
  { section: 'Direction Générale', debit: 150000, credit: 0 },
  { section: 'Production Atelier 1', debit: 450000, credit: 1200000 },
  { section: 'Production Atelier 2', debit: 380000, credit: 950000 },
  { section: 'Commercial France', debit: 220000, credit: 0 },
  { section: 'Commercial Export', debit: 180000, credit: 0 },
];

const pieChartData = [
  { name: 'Achats - Production', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Salaires - Production', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Salaires - Direction', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'Achats - Commercial', value: 200, fill: 'hsl(var(--chart-4))' },
  { name: 'Fournitures - Direction', value: 278, fill: 'hsl(var(--chart-5))' },
];
const pieChartConfig = {
  charges: { label: "Charges" },
  "Achats - Production": { label: "Achats - Production", color: "hsl(var(--chart-1))" },
  "Salaires - Production": { label: "Salaires - Production", color: "hsl(var(--chart-2))" },
  "Salaires - Direction": { label: "Salaires - Direction", color: "hsl(var(--chart-3))" },
  "Achats - Commercial": { label: "Achats - Commercial", color: "hsl(var(--chart-4))" },
  "Fournitures - Direction": { label: "Fournitures - Direction", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const margeProduitData = [
  { mois: 'Jan', produitA: 25.5, produitB: 35.2 },
  { mois: 'Fév', produitA: 26.1, produitB: 34.8 },
  { mois: 'Mar', produitA: 27.3, produitB: 36.1 },
  { mois: 'Avr', produitA: 26.8, produitB: 37.5 },
  { mois: 'Mai', produitA: 28.2, produitB: 38.0 },
  { mois: 'Juin', produitA: 29.0, produitB: 37.2 },
];
const margeProduitChartConfig = {
  produitA: { label: "Produit A (%)", color: "hsl(var(--chart-1))" },
  produitB: { label: "Produit B (%)", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

type GeneratedReport = {
  id: string;
  title: string;
  description: string;
  type: 'resultatProjet' | 'balanceDepartement' | 'repartitionCharges' | 'margeProduit';
};

type MonthlyReportGroup = {
  month: string;
  reports: GeneratedReport[];
};

const MOCK_GENERATED_REPORTS: MonthlyReportGroup[] = [
    {
        month: "Juillet 2024",
        reports: [
            { id: 'jul24-res', title: 'Compte de Résultat par Projet', description: 'Analyse de la rentabilité de chaque projet.', type: 'resultatProjet' },
            { id: 'jul24-bal', title: 'Balance Analytique par Département', description: 'Consultez le solde de chaque section analytique.', type: 'balanceDepartement' },
            { id: 'jul24-rep', title: 'Répartition des Charges', description: 'Visualisez la distribution des charges.', type: 'repartitionCharges' },
        ]
    },
    {
        month: "Juin 2024",
        reports: [
            { id: 'jun24-res', title: 'Compte de Résultat par Projet', description: 'Analyse de la rentabilité de chaque projet.', type: 'resultatProjet' },
            { id: 'jun24-bal', title: 'Balance Analytique par Département', description: 'Consultez le solde de chaque section analytique.', type: 'balanceDepartement' },
            { id: 'jun24-rep', title: 'Répartition des Charges', description: 'Visualisez la distribution des charges.', type: 'repartitionCharges' },
            { id: 'jun24-mar', title: 'Évolution de la Marge par Produit (%)', description: 'Suivez l\'évolution mensuelle de la marge.', type: 'margeProduit' },
        ]
    },
    {
        month: "Mai 2024",
        reports: [
            { id: 'may24-res', title: 'Compte de Résultat par Projet', description: 'Analyse de la rentabilité de chaque projet.', type: 'resultatProjet' },
            { id: 'may24-rep', title: 'Répartition des Charges', description: 'Visualisez la distribution des charges.', type: 'repartitionCharges' },
        ]
    }
];

export default function ReportingAnalytiquePage() {
    const [viewingReport, setViewingReport] = useState<GeneratedReport | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const handleViewReport = (report: GeneratedReport) => {
        setViewingReport(report);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setViewingReport(null);
    };
    
    const handleDownloadPDF = (report: GeneratedReport, period: string) => {
        const doc = new jsPDF();
        const printDateTime = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        const companyName = "Votre Société S.A.";
        
        doc.setFontSize(18);
        doc.text(report.title, 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Période : ${period}`, 105, 26, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Édité le ${printDateTime} par UNIKORP pour ${companyName}`, 105, 32, { align: 'center' });

        let head: string[][] = [];
        let body: any[][] = [];

        switch(report.type) {
            case 'resultatProjet':
                head = [['Projet', 'Produits', 'Charges', 'Marge']];
                body = projetResultatData.map(d => [d.projet, d.produits.toLocaleString(), d.charges.toLocaleString(), d.marge.toLocaleString()]);
                break;
            case 'balanceDepartement':
                head = [['Section / Département', 'Débit', 'Crédit', 'Solde']];
                body = balanceAnalytiqueData.map(d => {
                    const solde = d.credit - d.debit;
                    return [d.section, d.debit.toLocaleString(), d.credit.toLocaleString(), solde.toLocaleString()];
                });
                break;
            case 'repartitionCharges':
                head = [['Centre de Coût', 'Valeur']];
                body = pieChartData.map(d => [d.name, d.value.toLocaleString()]);
                break;
            case 'margeProduit':
                head = [['Mois', 'Marge Produit A (%)', 'Marge Produit B (%)']];
                body = margeProduitData.map(d => [d.mois, d.produitA, d.produitB]);
                break;
        }

        autoTable(doc, {
            head: head,
            body: body,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: '#1C2039' }
        });

        doc.save(`rapport_${report.id}.pdf`);
        toast({ title: 'Téléchargement lancé', description: `Le rapport ${report.title} est en cours de téléchargement.` });
    };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Reporting Analytique</CardTitle>
                    <CardDescription>Consultez les rapports analytiques générés automatiquement chaque mois.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" defaultValue={[MOCK_GENERATED_REPORTS[0].month]} className="w-full">
                {MOCK_GENERATED_REPORTS.map((group) => (
                    <AccordionItem value={group.month} key={group.month}>
                        <AccordionTrigger className="text-lg font-semibold">{group.month}</AccordionTrigger>
                        <AccordionContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Titre du Rapport</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[150px] text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {group.reports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">{report.title}</TableCell>
                                            <TableCell className="text-muted-foreground">{report.description}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleViewReport(report)}><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(report, group.month)}><Download className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl h-[90vh]">
            <DialogHeader>
                <DialogTitle>Aperçu du Rapport : {viewingReport?.title}</DialogTitle>
                <DialogDescription>{viewingReport?.description}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-4">
                {viewingReport?.type === 'resultatProjet' && (
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Données du Compte de Résultat par Projet</CardTitle></CardHeader>
                        <CardContent>
                            <ChartContainer config={projetResultatChartConfig} className="mx-auto aspect-video h-[300px]">
                                <BarChart data={projetResultatData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="projet" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis />
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Bar dataKey="produits" fill="var(--color-produits)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="charges" fill="var(--color-charges)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                            <Table className="mt-4"><TableHeader><TableRow><TableHead>Projet</TableHead><TableHead className="text-right">Produits</TableHead><TableHead className="text-right">Charges</TableHead><TableHead className="text-right">Marge</TableHead></TableRow></TableHeader><TableBody>{projetResultatData.map(d => <TableRow key={d.projet}><TableCell>{d.projet}</TableCell><TableCell className="text-right">{d.produits.toLocaleString()}</TableCell><TableCell className="text-right">{d.charges.toLocaleString()}</TableCell><TableCell className="text-right font-bold">{d.marge.toLocaleString()}</TableCell></TableRow>)}</TableBody></Table>
                        </CardContent>
                    </Card>
                )}
                 {viewingReport?.type === 'balanceDepartement' && (
                     <Card className="mt-4">
                        <CardHeader><CardTitle>Données de la Balance Analytique</CardTitle></CardHeader>
                        <CardContent>
                            <Table><TableHeader><TableRow><TableHead>Section / Département</TableHead><TableHead className="text-right">Débit</TableHead><TableHead className="text-right">Crédit</TableHead><TableHead className="text-right">Solde</TableHead></TableRow></TableHeader><TableBody>{balanceAnalytiqueData.map(item => { const solde = item.credit - item.debit; return (<TableRow key={item.section}><TableCell className="font-medium">{item.section}</TableCell><TableCell className="text-right font-mono">{item.debit.toLocaleString('fr-FR')} FCFA</TableCell><TableCell className="text-right font-mono">{item.credit.toLocaleString('fr-FR')} FCFA</TableCell><TableCell className={cn("text-right font-mono font-bold", solde >= 0 ? "text-green-600" : "text-red-600")}>{solde.toLocaleString('fr-FR')} FCFA</TableCell></TableRow>);})}</TableBody></Table>
                        </CardContent>
                    </Card>
                )}
                 {viewingReport?.type === 'repartitionCharges' && (
                     <Card className="mt-4">
                        <CardHeader><CardTitle>Données de Répartition des Charges</CardTitle></CardHeader>
                        <CardContent className="flex justify-center items-center gap-8">
                             <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[300px]">
                                <RechartsPieChart><ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /><Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}><Legend /></Pie></RechartsPieChart>
                             </ChartContainer>
                             <Table className="w-1/2"><TableHeader><TableRow><TableHead>Centre de Coût</TableHead><TableHead className="text-right">Valeur</TableHead></TableRow></TableHeader><TableBody>{pieChartData.map(d => <TableRow key={d.name}><TableCell className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.fill}}/>{d.name}</TableCell><TableCell className="text-right">{d.value.toLocaleString()}</TableCell></TableRow>)}</TableBody></Table>
                        </CardContent>
                    </Card>
                )}
                 {viewingReport?.type === 'margeProduit' && (
                    <Card className="mt-4">
                        <CardHeader><CardTitle>Données d'Évolution de la Marge</CardTitle></CardHeader>
                        <CardContent>
                            <ChartContainer config={margeProduitChartConfig} className="mx-auto aspect-video h-[300px]">
                                <LineChart data={margeProduitData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="mois" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis unit="%" />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="produitA" stroke="var(--color-produitA)" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="produitB" stroke="var(--color-produitB)" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ChartContainer>
                             <Table className="mt-4"><TableHeader><TableRow><TableHead>Mois</TableHead><TableHead className="text-right">Marge Produit A (%)</TableHead><TableHead className="text-right">Marge Produit B (%)</TableHead></TableRow></TableHeader><TableBody>{margeProduitData.map(d => <TableRow key={d.mois}><TableCell>{d.mois}</TableCell><TableCell className="text-right">{d.produitA}</TableCell><TableCell className="text-right">{d.produitB}</TableCell></TableRow>)}</TableBody></Table>
                        </CardContent>
                    </Card>
                 )}
            </div>
            <DialogFooter className="pt-4 border-t">
                 <Button variant="outline" onClick={handleCloseModal}>Fermer</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
