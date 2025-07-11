
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Legend, Tooltip, XAxis, YAxis, CartesianGrid, LineChart, Line, ComposedChart } from "recharts";
import { Users, TrendingUp, TrendingDown, Wallet, UserCheck, UserX, Star, Award, Heart, Briefcase, Download } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Logo } from '@/components/logo';

const kpiData = [
  { title: "Effectif Total", value: "112", Icon: Users, change: "+2 ce mois-ci" },
  { title: "Taux de Satisfaction", value: "88%", Icon: Star, change: "+1.5% vs Q2", changeType: 'up' },
  { title: "Turnover (Annuel)", value: "5.8%", Icon: TrendingDown, change: "+1.2% vs N-1", changeType: 'up' },
  { title: "Coût RH / CA", value: "32%", Icon: Wallet, change: "-0.5% vs N-1", changeType: 'down' },
];

const departmentData = [
  { name: 'IT', value: 35, fill: 'hsl(var(--chart-1))' },
  { name: 'MARKOS', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'SKOMPTAB', value: 20, fill: 'hsl(var(--chart-3))' },
  { name: 'SOCIX', value: 15, fill: 'hsl(var(--chart-4))' },
  { name: 'LOGSON', value: 17, fill: 'hsl(var(--chart-5))' },
];
const departmentConfig = {
  value: { label: "Effectif" },
  IT: { label: "IT", color: "hsl(var(--chart-1))" },
  MARKOS: { label: "Marketing", color: "hsl(var(--chart-2))" },
  SKOMPTAB: { label: "Comptabilité", color: "hsl(var(--chart-3))" },
  SOCIX: { label: "RH", color: "hsl(var(--chart-4))" },
  LOGSON: { label: "Logistique", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

const ancienneteData = [
    { range: '0-2 ans', count: 45 },
    { range: '2-5 ans', count: 38 },
    { range: '5-10 ans', count: 22 },
    { range: '10+ ans', count: 7 },
];
const ancienneteConfig = {
  count: { label: "Employés", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const satisfactionData = [
    { mois: 'Jan', satisfaction: 82, performance: 7.8 },
    { mois: 'Fév', satisfaction: 84, performance: 8.0 },
    { mois: 'Mar', satisfaction: 85, performance: 8.1 },
    { mois: 'Avr', satisfaction: 86.5, performance: 8.2 },
    { mois: 'Mai', satisfaction: 87, performance: 8.2 },
    { mois: 'Juin', satisfaction: 88, performance: 8.2 },
];
const satisfactionConfig = {
    satisfaction: { label: "Satisfaction (%)", color: "hsl(var(--chart-2))" },
    performance: { label: "Performance (/10)", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;


export default function KpiSociauxPage() {
    const { toast } = useToast();
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const handleExport = () => {
        toast({ title: "Fonctionnalité à venir", description: "L'export des KPI sera bientôt disponible." });
    };

  return (
    <div className="flex w-full flex-col gap-6">
       <CardHeader className="px-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Indicateurs de Performance Sociaux (KPIs)</CardTitle>
            <div className="flex items-center gap-2">
                 <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Exporter</Button>
            </div>
          </div>
          <CardDescription>Visualisez les données clés relatives à vos ressources humaines pour l'année {selectedYear}.</CardDescription>
        </CardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium tracking-tight">{kpi.title}</div>
              <kpi.Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.changeType === 'down' ? 'text-green-500' : 'text-red-500'}`}>{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>Répartition par Département</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
                <ChartContainer config={departmentConfig} className="mx-auto aspect-square h-[300px]">
                    <RechartsPieChart><ChartTooltip content={<ChartTooltipContent hideLabel />} /><Pie data={departmentData} dataKey="value" nameKey="name" innerRadius={60}><Legend/></Pie></RechartsPieChart>
                </ChartContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Répartition par Ancienneté</CardTitle></CardHeader>
            <CardContent>
                <ChartContainer config={ancienneteConfig} className="h-[300px] w-full">
                    <BarChart data={ancienneteData} layout="vertical" margin={{ left: 10, right: 10 }}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="range" type="category" tickLine={false} axisLine={false} tickMargin={8} width={60} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
         <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Évolution Satisfaction vs. Performance</CardTitle></CardHeader>
            <CardContent>
                 <ChartContainer config={satisfactionConfig} className="h-[300px] w-full">
                    <ComposedChart data={satisfactionData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="mois" tickLine={false} axisLine={false} tickMargin={8}/>
                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-satisfaction)" unit="%" />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-performance)" domain={[0, 10]} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="satisfaction" yAxisId="left" fill="var(--color-satisfaction)" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="performance" yAxisId="right" stroke="var(--color-performance)" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
