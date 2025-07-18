
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Legend, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Wallet, Truck, Archive, Package } from 'lucide-react';

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

const kpiData = [
  { title: 'Coût total (Mois)', value: `${costData.reduce((s, d) => s + d.cost, 0).toLocaleString()} FCFA`, Icon: Wallet },
  { title: 'Coût / Commande', value: '11,500 FCFA', Icon: Package },
  { title: 'Coût Transport / CA', value: '4.2%', Icon: Truck },
  { title: 'Coût Stockage / Vol.', value: '1,800 FCFA/m³', Icon: Archive },
];

export default function CoutsLogistiquesPage() {
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
                    <Card key={kpi.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            <kpi.Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{kpi.value}</div></CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Répartition des Coûts Logistiques</CardTitle>
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
                            {costData.map(d => {
                                const total = costData.reduce((s, item) => s + item.cost, 0);
                                return (
                                    <TableRow key={d.type}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                            {d.type}
                                        </TableCell>
                                        <TableCell className="text-right">{d.cost.toLocaleString()} FCFA</TableCell>
                                        <TableCell className="text-right">{((d.cost / total) * 100).toFixed(1)}%</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
