
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, HandCoins, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const kpiData = [
  { title: "Dépenses Marketing (Année)", value: "15,2M FCFA", Icon: DollarSign },
  { title: "Revenu Généré (Année)", value: "83,6M FCFA", Icon: HandCoins },
  { title: "ROI Annuel Moyen", value: "450%", Icon: TrendingUp },
];

const roiByCampaignData = [
    { id: 'camp-1', name: "Lancement Produit Alpha (Q3)", budget: 5000000, revenu: 27500000, roi: 450 },
    { id: 'camp-2', name: "Campagne Notoriété (S1)", budget: 3000000, revenu: 12000000, roi: 300 },
    { id: 'camp-3', name: "Webinaire Tech (Juin)", budget: 1200000, revenu: 9600000, roi: 700 },
    { id: 'camp-4', name: "Promotion Printemps", budget: 2500000, revenu: 11250000, roi: 350 },
    { id: 'camp-5', name: "Lead Gen Livre Blanc SEO", budget: 800000, revenu: 4000000, roi: 400 },
];

const roiEvolutionData = [
  { month: 'Jan', roi: 380 },
  { month: 'Fev', roi: 410 },
  { month: 'Mar', roi: 400 },
  { month: 'Avr', roi: 425 },
  { month: 'Mai', roi: 460 },
  { month: 'Juin', roi: 450 },
];
const chartConfig = {
  roi: { label: "ROI (%)", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export default function RoiMarketingPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Analyse du ROI Marketing</CardTitle>
                <CardDescription>Évaluez la rentabilité de vos investissements marketing.</CardDescription>
            </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
            {kpiData.map(kpi => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>ROI par Campagne</CardTitle>
                    <CardDescription>Détail des performances financières de chaque campagne.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Campagne</TableHead>
                            <TableHead className="text-right">Budget</TableHead>
                            <TableHead className="text-right">Revenu Généré</TableHead>
                            <TableHead className="text-right">ROI</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {roiByCampaignData.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell className="text-right">{c.budget.toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell className="text-right">{c.revenu.toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell className="text-right font-bold text-green-600">{c.roi}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Évolution du ROI Mensuel</CardTitle>
                    <CardDescription>Suivi de la rentabilité marketing au fil du temps.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <LineChart data={roiEvolutionData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis unit="%" />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="roi" stroke="var(--color-roi)" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
