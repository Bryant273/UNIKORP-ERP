
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart as RechartsPieChart, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, UserPlus, Percent } from "lucide-react";

const kpiData = [
  { title: "Nouveaux Leads (Mois)", value: "316", Icon: UserPlus, change: "+20.1% vs M-1" },
  { title: "Coût par Lead", value: `1 850 FCFA`, Icon: DollarSign, change: "-5% vs M-1", changeType: 'down' },
  { title: "Taux de Conversion", value: "4.2%", Icon: Percent, change: "+0.8% vs M-1" },
  { title: "ROI Marketing", value: "450%", Icon: TrendingUp, change: "+15% vs Q2" },
];

const leadsBySourceData = [
    { name: 'Organique', value: 400, fill: 'hsl(var(--chart-1))' },
    { name: 'Payant', value: 300, fill: 'hsl(var(--chart-2))' },
    { name: 'Réseaux Sociaux', value: 200, fill: 'hsl(var(--chart-3))' },
    { name: 'Emailing', value: 278, fill: 'hsl(var(--chart-4))' },
    { name: 'Référents', value: 189, fill: 'hsl(var(--chart-5))' },
];
const leadsBySourceConfig = {
  value: { label: "Leads" },
  Organique: { label: "Organique", color: "hsl(var(--chart-1))" },
  Payant: { label: "Publicité", color: "hsl(var(--chart-2))" },
  'Réseaux Sociaux': { label: "Réseaux Sociaux", color: "hsl(var(--chart-3))" },
  Emailing: { label: "Emailing", color: "hsl(var(--chart-4))" },
  Référents: { label: "Référents", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const conversionFunnelData = [
  { stage: 'Visiteurs', value: 15000 },
  { stage: 'Prospects', value: 316 },
  { stage: 'Qualifiés', value: 80 },
  { stage: 'Clients', value: 12 },
];
const conversionFunnelConfig = {
  value: { label: 'Nombre', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

export default function MarkosPage() {
  return (
    <div className="flex w-full flex-col gap-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.changeType === 'down' ? 'text-green-500' : 'text-red-500'}`}>{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Source des Leads</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
                <ChartContainer config={leadsBySourceConfig} className="mx-auto aspect-square h-[300px]">
                    <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={leadsBySourceData} dataKey="value" nameKey="name" innerRadius={60}>
                            <Legend />
                        </Pie>
                    </RechartsPieChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tunnel de Conversion</CardTitle>
             <CardDescription>De la visite à la conversion en client.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={conversionFunnelConfig} className="h-[300px] w-full">
              <ResponsiveContainer>
                  <BarChart data={conversionFunnelData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis dataKey="stage" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                    <XAxis type="number" hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                  </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
