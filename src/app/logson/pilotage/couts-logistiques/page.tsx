
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Wallet, Truck, Archive, Package, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const costData = [
    { type: 'Transport', cost: 1250000, color: 'hsl(var(--chart-1))' },
    { type: 'Stockage', cost: 850000, color: 'hsl(var(--chart-2))' },
    { type: 'Manutention', cost: 450000, color: 'hsl(var(--chart-3))' },
    { type: 'Administratif', cost: 250000, color: 'hsl(var(--chart-4))' },
];

const chartConfig = {
    cost: { label: "Coût (FCFA)" },
    Transport: { label: "Transport", color: 'hsl(var(--chart-1))' },
    Stockage: { label: "Stockage", color: 'hsl(var(--chart-2))' },
    Manutention: { label: "Manutention", color: 'hsl(var(--chart-3))' },
    Administratif: { label: "Administratif", color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

const totalCost = costData.reduce((s, d) => s + d.cost, 0);
const kpiData = [
  { title: 'Coût total (Mois)', value: `${totalCost.toLocaleString()} FCFA`, Icon: Wallet, evolution: [2500000, 2650000, 2700000, 2800000, 2750000, 2800000] },
  { title: 'Coût / Commande', value: '11,500 FCFA', Icon: Package, evolution: [12500, 12000, 11800, 11600, 11500, 11500] },
  { title: 'Coût Transport / CA', value: '4.2%', Icon: Truck, evolution: [4.5, 4.4, 4.3, 4.2, 4.2, 4.1] },
  { title: 'Coût Stockage / Vol.', value: '1,800 FCFA/m³', Icon: Archive, evolution: [1900, 1850, 1820, 1800, 1800, 1780] },
];

const kpiEvolutionMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];

export default function CoutsLogistiquesPage() {
    const [modalData, setModalData] = useState<{ title: string; data: any[] } | null>(null);

    const handleOpenModal = (kpi: typeof kpiData[0]) => {
        const chartData = kpi.evolution.map((value, index) => ({
            month: kpiEvolutionMonths[index],
            value
        }));
        setModalData({ title: kpi.title, data: chartData });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Coûts Logistiques</CardTitle>
                    <CardDescription>Analysez les coûts liés à votre chaîne logistique pour le mois en cours.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiData.map(kpi => (
                    <Card key={kpi.title} className="cursor-pointer hover:border-primary" onClick={() => handleOpenModal(kpi)}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            <kpi.Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{kpi.value}</div></CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Répartition des Coûts Logistiques</CardTitle>
                        <CardDescription>Analyse détaillée des différents postes de coûts.</CardDescription>
                    </div>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4"/>Télécharger le rapport</Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[350px]">
                        <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Pie data={costData} dataKey="cost" nameKey="type" innerRadius={60} />
                            <Legend />
                        </RechartsPieChart>
                    </ChartContainer>
                    <Table>
                        <TableHeader><TableRow><TableHead>Type de Coût</TableHead><TableHead className="text-right">Montant</TableHead><TableHead className="text-right">% du Total</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {costData.map(d => (
                                <TableRow key={d.type} className="odd:bg-muted/50">
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                        {d.type}
                                    </TableCell>
                                    <TableCell className="text-right">{d.cost.toLocaleString()} FCFA</TableCell>
                                    <TableCell className="text-right">{((d.cost / totalCost) * 100).toFixed(1)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <KpiDetailModal data={modalData} onClose={() => setModalData(null)} />
        </div>
    );
}

function KpiDetailModal({ data, onClose }: { data: { title: string; data: any[] } | null, onClose: () => void }) {
    if (!data) return null;
    const chartConfig = { value: { label: data.title } } satisfies ChartConfig;

    return (
        <Dialog open={!!data} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Évolution de : {data.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <LineChart data={data.data} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }}/>
                        </LineChart>
                    </ChartContainer>
                </div>
            </DialogContent>
        </Dialog>
    );
}
