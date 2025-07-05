
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import type { ChartConfig } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


// --- DATA & CONFIGS ---

// Report 1 Data
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

// Report 2 Data
const balanceAnalytiqueData = [
  { section: 'Direction Générale', debit: 150000, credit: 0 },
  { section: 'Production Atelier 1', debit: 450000, credit: 1200000 },
  { section: 'Production Atelier 2', debit: 380000, credit: 950000 },
  { section: 'Commercial France', debit: 220000, credit: 0 },
  { section: 'Commercial Export', debit: 180000, credit: 0 },
];

// Report 3 Data
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

// Report 4 Data
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

// --- REPORTS LIST ---

type AnalyticReport = {
  id: string;
  title: string;
  description: string;
  type: 'prédéfini' | 'personnalisé';
};

const MOCK_REPORTS: AnalyticReport[] = [
  { id: 'resultatProjet', title: 'Compte de Résultat par Projet', description: 'Analyse de la rentabilité de chaque projet.', type: 'prédéfini' },
  { id: 'balanceDepartement', title: 'Balance Analytique par Département', description: 'Consultez le solde de chaque section analytique de type département.', type: 'prédéfini' },
  { id: 'repartitionCharges', title: 'Répartition des Charges', description: 'Visualisez la distribution des charges sur les centres de coûts.', type: 'prédéfini' },
  { id: 'margeProduit', title: 'Évolution de la Marge par Produit (%)', description: 'Suivez l\'évolution mensuelle de la marge pour chaque produit.', type: 'prédéfini' },
  { id: 'customRep1', title: 'Mon Rapport Personnalisé', description: 'Exemple de rapport créé par un utilisateur.', type: 'personnalisé' },
];

export default function ReportingAnalytiquePage() {
    const [viewingReport, setViewingReport] = useState<AnalyticReport | null>(null);
    const [reportToDelete, setReportToDelete] = useState<AnalyticReport | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewReport = (report: AnalyticReport) => {
        setViewingReport(report);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setViewingReport(null);
    };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Reporting Analytique</CardTitle>
                    <CardDescription>Consultez les rapports analytiques pour piloter votre activité.</CardDescription>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer un rapport
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre du Rapport</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[150px] text-center">Type</TableHead>
                <TableHead className="w-[150px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_REPORTS.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell className="text-muted-foreground">{report.description}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={report.type === 'prédéfini' ? 'secondary' : 'default'}>{report.type}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewReport(report)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" disabled={report.type === 'prédéfini'}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={report.type === 'prédéfini'} onClick={() => setReportToDelete(report)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl h-[90vh]">
            <DialogHeader>
                <DialogTitle>Aperçu du Rapport : {viewingReport?.title}</DialogTitle>
                <DialogDescription>{viewingReport?.description}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-4">
                {viewingReport?.id === 'resultatProjet' && (
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
                 {viewingReport?.id === 'balanceDepartement' && (
                     <Card className="mt-4">
                        <CardHeader><CardTitle>Données de la Balance Analytique</CardTitle></CardHeader>
                        <CardContent>
                            <Table><TableHeader><TableRow><TableHead>Section / Département</TableHead><TableHead className="text-right">Débit</TableHead><TableHead className="text-right">Crédit</TableHead><TableHead className="text-right">Solde</TableHead></TableRow></TableHeader><TableBody>{balanceAnalytiqueData.map(item => { const solde = item.credit - item.debit; return (<TableRow key={item.section}><TableCell className="font-medium">{item.section}</TableCell><TableCell className="text-right font-mono">{item.debit.toLocaleString('fr-FR')} FCFA</TableCell><TableCell className="text-right font-mono">{item.credit.toLocaleString('fr-FR')} FCFA</TableCell><TableCell className={cn("text-right font-mono font-bold", solde >= 0 ? "text-green-600" : "text-red-600")}>{solde.toLocaleString('fr-FR')} FCFA</TableCell></TableRow>);})}</TableBody></Table>
                        </CardContent>
                    </Card>
                )}
                 {viewingReport?.id === 'repartitionCharges' && (
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
                 {viewingReport?.id === 'margeProduit' && (
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
                 {viewingReport?.id.startsWith('custom') && (
                     <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Aperçu du rapport personnalisé à implémenter.</p>
                    </div>
                 )}
            </div>
            <DialogFooter className="pt-4 border-t">
                 <Button variant="outline" onClick={handleCloseModal}>Fermer</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Êtes-vous certain ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera le rapport personnalisé.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => setReportToDelete(null)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

