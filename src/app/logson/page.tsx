
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Tooltip } from "recharts";
import { TrendingUp, Percent, DollarSign, Truck, Package, PackageCheck } from "lucide-react";

const kpiData = [
  { title: "Taux de rotation des stocks", value: "6.2", Icon: TrendingUp, change: "+0.5 vs M-1" },
  { title: "Taux de livraison à temps", value: "97.8%", Icon: Percent, change: "+1.2% vs M-1" },
  { title: "Coût par commande", value: "15.20 €", Icon: DollarSign, change: "-2% vs M-1" },
  { title: "Précision de l'inventaire", value: "99.5%", Icon: PackageCheck, change: "+0.1% vs M-1" },
];

const stockLevelData = [
  { month: "Jan", value: 1250 },
  { month: "Fev", value: 1380 },
  { month: "Mar", value: 1320 },
  { month: "Avr", value: 1450 },
  { month: "Mai", value: 1400 },
  { month: "Juin", value: 1510 },
];
const stockLevelConfig = {
  value: { label: "Unités", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const carrierPerformanceData = [
  { name: "Chronopost", deliv_rate: 98.5, cost: 8.50 },
  { name: "Colissimo", deliv_rate: 97.2, cost: 7.20 },
  { name: "DHL", deliv_rate: 99.1, cost: 12.80 },
  { name: "FedEx", deliv_rate: 98.8, cost: 11.50 },
];
const carrierPerformanceConfig = {
    deliv_rate: { label: "Taux de livraison à temps (%)", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const recentOrdersData = [
  { id: "CMD-0789", client: "Innovate Inc.", status: "Expédiée", transporteur: "DHL" },
  { id: "CMD-0790", client: "TechCorp", status: "En préparation", transporteur: "Chronopost" },
  { id: "CMD-0791", client: "Global Solutions", status: "En attente", transporteur: "Colissimo" },
  { id: "CMD-0792", client: "Innovate Inc.", status: "Livrée", transporteur: "DHL" },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Expédiée": return <Badge variant="default">Expédiée</Badge>;
        case "En préparation": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{status}</Badge>;
        case "En attente": return <Badge variant="outline">{status}</Badge>;
        case "Livrée": return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
        default: return <Badge>{status}</Badge>;
    }
}

export default function LogsonPage() {
  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map(kpi => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-green-500">{kpi.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>Niveau des stocks (Unités)</CardTitle>
                    <CardDescription>Évolution mensuelle du stock total.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={stockLevelConfig} className="h-[250px] w-full">
                        <LineChart data={stockLevelData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false}/>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Performance des Transporteurs</CardTitle>
                    <CardDescription>Taux de livraison à temps par transporteur.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={carrierPerformanceConfig} className="h-[250px] w-full">
                        <BarChart data={carrierPerformanceData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis unit="%" domain={[95, 100]}/>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="deliv_rate" fill="var(--color-deliv_rate)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Commandes Récentes</CardTitle>
                <CardDescription>Aperçu des dernières commandes en cours de traitement.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>N° Commande</TableHead><TableHead>Client</TableHead><TableHead>Transporteur</TableHead><TableHead className="text-center">Statut</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {recentOrdersData.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                                <TableCell>{order.client}</TableCell>
                                <TableCell>{order.transporteur}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
