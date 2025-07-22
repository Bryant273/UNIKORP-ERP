
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Funnel, FunnelChart, LabelList, Tooltip, ResponsiveContainer } from "recharts";
import { UserPlus, MousePointerClick, Target, Handshake } from 'lucide-react';

const kpiData = [
    { title: "Leads Générés (Mois)", value: "1,254", Icon: UserPlus, change: "+15.2%" },
    { title: "MQLs (Marketing Qualified)", value: "316", Icon: MousePointerClick, change: "+20.1%" },
    { title: "SQLs (Sales Qualified)", value: "89", Icon: Handshake, change: "+8.5%" },
    { title: "Taux de Conversion (Lead > Client)", value: "4.2%", Icon: Target, change: "+0.8%" },
];

const funnelData = [
  { name: 'Leads', value: 1254, fill: 'hsl(var(--chart-1))' },
  { name: 'MQLs', value: 316, fill: 'hsl(var(--chart-2))' },
  { name: 'SQLs', value: 89, fill: 'hsl(var(--chart-3))' },
  { name: 'Clients', value: 52, fill: 'hsl(var(--chart-4))' },
];
const funnelChartConfig = funnelData.reduce((acc, cur) => {
    (acc as any)[cur.name] = { label: cur.name, color: cur.fill };
    return acc;
}, {} as any);

const channelPerformanceData = [
    { channel: "Recherche Organique", leads: 450, mql: 120, conversionRate: "26.7%" },
    { channel: "Publicité Payante", leads: 380, mql: 95, conversionRate: "25.0%" },
    { channel: "Réseaux Sociaux", leads: 250, mql: 60, conversionRate: "24.0%" },
    { channel: "Emailing", leads: 174, mql: 41, conversionRate: "23.6%" },
];

export default function PerformancesPage() {
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Performance par Canal</CardTitle>
                    <CardDescription>Analyse des leads et MQLs générés par chaque canal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Canal</TableHead><TableHead className="text-right">Leads</TableHead><TableHead className="text-right">MQLs</TableHead><TableHead className="text-right">Taux de Conv. (Lead > MQL)</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {channelPerformanceData.map(d => (
                                <TableRow key={d.channel} className="odd:bg-muted/50">
                                    <TableCell className="font-medium">{d.channel}</TableCell>
                                    <TableCell className="text-right">{d.leads}</TableCell>
                                    <TableCell className="text-right">{d.mql}</TableCell>
                                    <TableCell className="text-right"><Badge variant="outline">{d.conversionRate}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Entonnoir de Conversion</CardTitle>
                    <CardDescription>Visualisation du parcours de conversion.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={funnelChartConfig} className="mx-auto w-full h-80">
                        <ResponsiveContainer>
                            <FunnelChart>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                                    <LabelList position="right" fill="#fff" dataKey="name" />
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
