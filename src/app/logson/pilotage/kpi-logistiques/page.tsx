
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Percent, DollarSign, Truck, PackageCheck, Archive, RefreshCw, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const kpiGridData = [
  { title: "Taux de rotation des stocks", value: "6.2", change: "+0.5 vs M-1", Icon: RefreshCw, evolution: [5.5, 5.8, 5.7, 6.0, 6.2, 6.2] },
  { title: "Taux de livraison à temps (OTD)", value: "97.8%", change: "+1.2% vs M-1", Icon: Clock, evolution: [95.2, 96.1, 96.5, 97.0, 97.5, 97.8] },
  { title: "Coût par commande", value: "9,940 FCFA", change: "-2% vs M-1", Icon: DollarSign, evolution: [10500, 10200, 10150, 10050, 9980, 9940] },
  { title: "Précision de l'inventaire", value: "99.5%", change: "+0.1% vs M-1", Icon: PackageCheck, evolution: [99.1, 99.2, 99.3, 99.4, 99.4, 99.5] },
  { title: "Coût de transport moyen", value: "5,250 FCFA", change: "+3% vs M-1", Icon: Truck, evolution: [5000, 5100, 5150, 5200, 5220, 5250] },
  { title: "Utilisation de l'entrepôt", value: "85%", change: "-5% vs M-1", Icon: Archive, evolution: [88, 87, 86, 86, 85, 85] },
  { title: "Commandes parfaites", value: "92.1%", change: "+2.5% vs M-1", Icon: Percent, evolution: [88.0, 89.5, 90.1, 91.2, 91.8, 92.1] },
  { title: "Délai de cycle commande-livraison", value: "2.5 jours", change: "-0.2j vs M-1", Icon: TrendingUp, evolution: [3.1, 2.9, 2.8, 2.7, 2.6, 2.5] },
];
const kpiEvolutionMonths = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];

export default function KpiLogistiquesPage() {
    const [modalData, setModalData] = useState<{ title: string; data: any[] } | null>(null);

    const handleOpenModal = (kpi: typeof kpiGridData[0]) => {
        const chartData = kpi.evolution.map((value, index) => ({
            month: kpiEvolutionMonths[index],
            value
        }));
        setModalData({ title: kpi.title, data: chartData });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Indicateurs Clés de Performance (KPI) Logistiques</CardTitle>
                    <CardDescription>Suivez vos principaux indicateurs de performance logistique en temps réel. Cliquez sur une carte pour voir l'évolution.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpiGridData.map(kpi => (
                            <Card key={kpi.title} className="cursor-pointer hover:border-primary" onClick={() => handleOpenModal(kpi)}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                    <kpi.Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
                                    <p className={`text-xs ${kpi.change.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>{kpi.change}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <KpiDetailModal data={modalData} onClose={() => setModalData(null)} />
        </>
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
