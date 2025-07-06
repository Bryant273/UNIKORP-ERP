
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"
import { type ChartConfig } from "@/components/ui/chart"

const kpiData = [
  { title: "Chiffre d'affaires", value: `${(128500000).toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA`, change: "+12.8% vs Q3", target: "Objectif: 130 000 000 FCFA" },
  { title: "Résultat net", value: `${(43200000).toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA`, change: "+8.5% vs Q3", target: "Objectif: 40 000 000 FCFA" },
  { title: "Trésorerie", value: `${(76800000).toLocaleString('fr-FR', {maximumFractionDigits: 0})} FCFA`, change: "+3.2% vs Q3", target: "Objectif: 85 000 000 FCFA" },
];

const barChartData = [
  { name: 'Jan', revenus: 40000000, depenses: 24000000 },
  { name: 'Fev', revenus: 30000000, depenses: 13980000 },
  { name: 'Mar', revenus: 20000000, depenses: 38000000 },
  { name: 'Avr', revenus: 27800000, depenses: 39080000 },
  { name: 'Mai', revenus: 18900000, depenses: 48000000 },
  { name: 'Juin', revenus: 23900000, depenses: 38000000 },
];

const lineChartData = [
    { name: 'Jan', entrees: 40000000, sorties: 24000000, net: 16000000 },
    { name: 'Fev', entrees: 30000000, sorties: 13980000, net: 16020000 },
    { name: 'Mar', entrees: 20000000, sorties: 28000000, net: -8000000 },
    { name: 'Avr', entrees: 27800000, sorties: 39080000, net: -11280000 },
    { name: 'Mai', entrees: 18900000, sorties: 48000000, net: -29100000 },
    { name: 'Juin', entrees: 23900000, sorties: 38000000, net: -14100000 },
]

const chartConfig = {
  revenus: { label: 'Revenus', color: 'hsl(var(--primary))' },
  depenses: { label: 'Dépenses', color: 'hsl(var(--destructive))' },
  entrees: { label: 'Entrées', color: 'hsl(var(--chart-2))' },
  sorties: { label: 'Sorties', color: 'hsl(var(--chart-1))' },
  net: { label: 'Net', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;


export default function SkomptabPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord financier</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la performance financière et comptable.</p>
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <span className={`text-xs ${kpi.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{kpi.change}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.target}</p>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenus vs Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={barChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('fr-FR', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${(value as number).toLocaleString('fr-FR')} FCFA`} />} />
                <Bar dataKey="revenus" fill="var(--color-revenus)" radius={4} />
                <Bar dataKey="depenses" fill="var(--color-depenses)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Flux de trésorerie</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={lineChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('fr-FR', { notation: 'compact', compactDisplay: 'short' }).format(value as number)}/>
                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${(value as number).toLocaleString('fr-FR')} FCFA`} />} />
                <Line type="monotone" dataKey="entrees" stroke="var(--color-entrees)" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="sorties" stroke="var(--color-sorties)" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="net" stroke="var(--color-net)" strokeWidth={2} dot={false}/>
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
