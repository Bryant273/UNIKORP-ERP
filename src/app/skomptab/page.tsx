import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"
import { type ChartConfig } from "@/components/ui/chart"

const kpiData = [
  { title: "Chiffre d'affaires", value: "128,5 M", change: "+12.8% vs Q3", target: "Objectif: 130 M", progress: 98.8 },
  { title: "Résultat net", value: "43,2 M", change: "+8.5% vs Q3", target: "Objectif: 40 M", progress: 108 },
  { title: "Trésorerie", value: "76,8 M", change: "+3.2% vs Q3", target: "Objectif: 85 M", progress: 90.4 },
  { title: "Délai de paiement", value: "28 jours", change: "-4 jours vs Q3", target: "Objectif: 30 jours", progress: 93.3 },
];

const barChartData = [
  { name: 'Jan', revenus: 4000, depenses: 2400 },
  { name: 'Fev', revenus: 3000, depenses: 1398 },
  { name: 'Mar', revenus: 2000, depenses: 9800 },
  { name: 'Avr', revenus: 2780, depenses: 3908 },
  { name: 'Mai', revenus: 1890, depenses: 4800 },
  { name: 'Juin', revenus: 2390, depenses: 3800 },
];

const lineChartData = [
    { name: 'Jan', entrees: 4000, sorties: 2400, net: 1600 },
    { name: 'Fev', entrees: 3000, sorties: 1398, net: 1602 },
    { name: 'Mar', entrees: 2000, sorties: 2800, net: -800 },
    { name: 'Avr', entrees: 2780, sorties: 3908, net: -1128 },
    { name: 'Mai', entrees: 1890, sorties: 4800, net: -2910 },
    { name: 'Juin', entrees: 2390, sorties: 3800, net: -1410 },
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord financier</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la performance financière et comptable.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exporter</Button>
          <Button variant="outline"><CalendarIcon className="mr-2 h-4 w-4" /> Ce mois</Button>
          <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Actualiser</Button>
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
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
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
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
