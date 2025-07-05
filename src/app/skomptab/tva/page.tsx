'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { TrendingUp, TrendingDown, Scale, FilePlus, CheckCircle } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";

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

const declarations = [
    { id: 'tva_jun24', periode: 'Juin 2024', montant: '6 300 €', statut: 'Payée', echeance: '20/07/2024' },
    { id: 'tva_mai24', periode: 'Mai 2024', montant: '1 700 €', statut: 'Payée', echeance: '20/06/2024' },
    { id: 'tva_avr24', periode: 'Avril 2024', montant: '1 300 €', statut: 'Payée', echeance: '20/05/2024' },
    { id: 'tva_mar24', periode: 'Mars 2024', montant: '2 000 €', statut: 'Payée', echeance: '20/04/2024' },
];

export default function TvaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Gestion de la TVA</h1>
            <Button>
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
                                <TableHead className="text-right">Montant dû</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {declarations.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.periode}</TableCell>
                                    <TableCell className="text-right font-mono">{d.montant}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={d.statut === 'Payée' ? 'secondary' : 'default'} className="bg-green-100 text-green-800">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            {d.statut}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
