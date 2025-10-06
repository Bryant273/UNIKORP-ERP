
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Legend, Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { Target, Mail, MessageSquare, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const kpiData = [
  { title: "Taux de Conv. Global (Mois)", value: "4.2%", Icon: Target },
  { title: "Meilleur Canal", value: "Emailing", Icon: Mail },
  { title: "Meilleure Landing Page", value: "LP Webinaire Tech", Icon: Newspaper },
];

const conversionByChannelData = [
  { name: 'Emailing', value: 8.5, fill: 'hsl(var(--chart-1))' },
  { name: 'SMS', value: 6.2, fill: 'hsl(var(--chart-2))' },
  { name: 'Organique', value: 3.1, fill: 'hsl(var(--chart-3))' },
  { name: 'Payant', value: 2.5, fill: 'hsl(var(--chart-4))' },
];
const conversionByChannelConfig = {
  value: { label: "Taux de Conv. (%)" },
  Emailing: { label: "Emailing", color: "hsl(var(--chart-1))" },
  SMS: { label: "SMS", color: "hsl(var(--chart-2))" },
  Organique: { label: "Organique", color: "hsl(var(--chart-3))" },
  Payant: { label: "Payant", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const conversionByLPData = [
    { name: 'LP Webinaire Tech', conversionRate: 12.8 },
    { name: 'LP Demande de Démo', conversionRate: 9.5 },
    { name: 'LP Lancement Alpha', conversionRate: 5.2 },
    { name: 'LP Livre Blanc SEO', conversionRate: 3.8 },
];
const conversionByLPConfig = {
    conversionRate: { label: "Taux de Conv. (%)", color: "hsl(var(--primary))" }
} satisfies ChartConfig;

const detailedConversionData = [
    { source: 'Campagne Email "Promo Été"', traffic: 5280, conversions: 449, rate: '8.5%' },
    { source: 'Campagne SMS "Rappel"', traffic: 3500, conversions: 217, rate: '6.2%' },
    { source: 'Google Ads "ERP Cloud"', traffic: 8900, conversions: 222, rate: '2.5%' },
    { source: 'Recherche Organique "solution erp"', traffic: 12500, conversions: 387, rate: '3.1%' },
];

export default function TauxDeConversionPage() {
  return (
    <div className="space-y-6">
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
                    <CardTitle>Taux de Conversion par Canal</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={conversionByChannelConfig} className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <RechartsPieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="value" />} />
                                <Pie data={conversionByChannelData} dataKey="value" nameKey="name" innerRadius={60}><Legend /></Pie>
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Taux de Conversion par Landing Page</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={conversionByLPConfig} className="h-[300px] w-full">
                        <BarChart data={conversionByLPData} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <CartesianGrid horizontal={false} />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={120} />
                            <XAxis type="number" unit="%" hide/>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="conversionRate" fill="var(--color-conversionRate)" radius={4}>
                                <LabelList dataKey="conversionRate" position="right" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `${value}%`} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader><CardTitle>Détail des Conversions</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Source de trafic / Campagne</TableHead><TableHead className="text-right">Visiteurs</TableHead><TableHead className="text-right">Conversions</TableHead><TableHead className="text-right">Taux de Conversion</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {detailedConversionData.map((d, index) => (
                            <TableRow key={d.source} className="odd:bg-muted/50">
                                <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                <TableCell className="font-medium">{d.source}</TableCell>
                                <TableCell className="text-right">{d.traffic.toLocaleString('fr-FR')}</TableCell>
                                <TableCell className="text-right">{d.conversions.toLocaleString('fr-FR')}</TableCell>
                                <TableCell className="text-right"><Badge>{d.rate}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
