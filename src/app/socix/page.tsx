
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Legend, Tooltip, XAxis, YAxis, CartesianGrid, LineChart, Line, ComposedChart } from "recharts";
import { Users, TrendingUp, TrendingDown, Wallet, UserCheck, UserX, UserRound, GraduationCap } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";

const kpiData = [
  { title: "Effectif Total", value: "112", Icon: Users, change: "+2 ce mois-ci" },
  { title: "Taux d'Absentéisme", value: "3.1%", Icon: UserX, change: "-0.5% vs M-1", changeType: 'down' },
  { title: "Turnover (Annuel)", value: "5.8%", Icon: TrendingDown, change: "+1.2% vs N-1", changeType: 'up' },
  { title: "Masse Salariale (Mois)", value: "89M FCFA", Icon: Wallet, change: "+1.5% vs M-1", changeType: 'up' },
];

const agePyramidData = [
  { age: '20-25', hommes: 8, femmes: 12 },
  { age: '26-30', hommes: 15, femmes: 18 },
  { age: '31-35', hommes: 12, femmes: 10 },
  { age: '36-40', hommes: 9, femmes: 7 },
  { age: '41-50', hommes: 10, femmes: 5 },
  { age: '51+', hommes: 4, femmes: 2 },
];
const agePyramidConfig = {
    hommes: { label: "Hommes", color: "hsl(var(--chart-2))" },
    femmes: { label: "Femmes", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const genderData = [
  { name: 'Hommes', value: 58, fill: 'hsl(var(--chart-2))' },
  { name: 'Femmes', value: 54, fill: 'hsl(var(--chart-1))' },
];
const genderConfig = {
  value: { label: "Employés" },
  hommes: { label: "Hommes", color: "hsl(var(--chart-2))" },
  femmes: { label: "Femmes", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

const headcountData = [
  { month: 'Jan', effectif: 103 },
  { month: 'Fév', effectif: 103 },
  { month: 'Mar', effectif: 108 },
  { month: 'Avr', effectif: 110 },
  { month: 'Mai', effectif: 110 },
  { month: 'Juin', effectif: 112 },
];
const headcountConfig = {
    effectif: { label: "Effectif", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const upcomingEvents = [
  { type: "Fin de Période d'Essai", employee: "Alice Martin", date: "31/07/2024" },
  { type: "Entretien Annuel", employee: "Bruno Lemaire", date: "05/08/2024" },
  { type: "Fin de Contrat (CDD)", employee: "Carine Duval", date: "15/08/2024" },
  { type: "Formation Sécurité", employee: "Tous les employés", date: "20/08/2024" },
];

export default function SocixPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium tracking-tight">{kpi.title}</div>
              <kpi.Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.changeType === 'up' ? 'text-red-500' : 'text-green-500'}`}>{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="md:col-span-2">
                <CardHeader><CardTitle>Évolution des Effectifs</CardTitle></CardHeader>
                <CardContent>
                    <ChartContainer config={headcountConfig} className="h-[250px] w-full">
                        <LineChart data={headcountData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="effectif" stroke="var(--color-effectif)" strokeWidth={3} dot={{ r: 5 }} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Répartition par Genre</CardTitle></CardHeader>
                <CardContent className="flex justify-center">
                    <ChartContainer config={genderConfig} className="mx-auto aspect-square h-[250px]">
                        <RechartsPieChart><ChartTooltip content={<ChartTooltipContent hideLabel />} /><Pie data={genderData} dataKey="value" nameKey="name" innerRadius={60}><Legend/></Pie></RechartsPieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Pyramide des Âges</CardTitle></CardHeader>
                <CardContent>
                    <ChartContainer config={agePyramidConfig} className="h-[250px] w-full">
                        <BarChart data={agePyramidData} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <CartesianGrid horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="age" type="category" tickLine={false} axisLine={false} tickMargin={8} width={50} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="hommes" fill="var(--color-hommes)" radius={4} />
                            <Bar dataKey="femmes" fill="var(--color-femmes)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader><CardTitle>Échéances et Événements</CardTitle><CardDescription>Prochains événements RH importants.</CardDescription></CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {upcomingEvents.map(event => (
                            <li key={event.employee + event.date} className="flex items-center gap-4">
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-muted flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{event.type}</p>
                                    <p className="text-xs text-muted-foreground">{event.employee} - Échéance le {event.date}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
