
"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell, Legend } from "recharts"
import { Calendar } from "@/components/ui/calendar"
import { DollarSign, Users, ShoppingCart, TrendingUp, TrendingDown, Target, BarChart2, Ship, UserCheck, PieChart as PieChartIcon, LineChart as LineChartIcon, FileText } from "lucide-react"
import { type ChartConfig } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"

const mainKpis = [
  { title: "Revenus (T3)", value: "€1.2M", change: "+15.2%", icon: DollarSign, changeType: "up" },
  { title: "Nouveaux Clients", value: "89", change: "+20.1%", icon: Users, changeType: "up" },
  { title: "Commandes en cours", value: "245", change: "-3.5%", icon: ShoppingCart, changeType: "down" },
  { title: "Effectif Total", value: "112", change: "+2 employés", icon: UserCheck, changeType: "up" },
];

const skomptabKpis = [
    { title: "Marge Nette", value: "28.4%", icon: Target },
    { title: "Factures en attente", value: "€12,450", icon: FileText }
];

const markosKpis = [
    { title: "Nouveaux Leads (Mois)", value: "316", icon: Users },
    { title: "Taux de Conversion", value: "4.8%", icon: TrendingUp }
];

const logsonKpis = [
    { title: "Expéditions (Mois)", value: "1,204", icon: Ship },
    { title: "Taux de retours", value: "1.2%", icon: TrendingDown }
];

const socixKpis = [
    { title: "Masse Salariale", value: "€89k", icon: DollarSign },
    { title: "Turnover", value: "2.1%", icon: TrendingDown }
];


const skomptabChartData = [
  { month: "Jan", revenus: 4000, depenses: 2400 }, { month: "Fev", revenus: 3000, depenses: 1398 },
  { month: "Mar", revenus: 2000, depenses: 9800 }, { month: "Avr", revenus: 2780, depenses: 3908 },
  { month: "Mai", revenus: 1890, depenses: 4800 }, { month: "Juin", revenus: 2390, depenses: 3800 },
];
const skomptabChartConfig = {
  revenus: { label: "Revenus", color: "hsl(var(--chart-2))" },
  depenses: { label: "Dépenses", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

const markosChartData = [
  { date: "01/06", leads: 22 }, { date: "07/06", leads: 45 }, { date: "14/06", leads: 52 },
  { date: "21/06", leads: 78 }, { date: "28/06", leads: 92 },
];
const markosChartConfig = {
  leads: { label: "Leads", color: "hsl(var(--primary))" },
} satisfies ChartConfig

const logsonChartData = [
  { status: "Expédié", count: 450, fill: "var(--color-shipped)" },
  { status: "En transit", count: 300, fill: "var(--color-in-transit)" },
  { status: "Livré", count: 780, fill: "var(--color-delivered)" },
  { status: "Retour", count: 30, fill: "var(--color-returned)" },
];
const logsonChartConfig = {
  count: { label: "Nombre" },
  shipped: { label: "Expédié", color: "hsl(var(--chart-3))" },
  "in-transit": { label: "En transit", color: "hsl(var(--chart-4))" },
  delivered: { label: "Livré", color: "hsl(var(--chart-2))" },
  returned: { label: "Retour", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const socixChartData = [
  { dept: "Ventes", effectif: 25 }, { dept: "Marketing", effectif: 15 },
  { dept: "Tech", effectif: 42 }, { dept: "Admin", effectif: 18 }, { dept: "Support", effectif: 12 },
];
const socixChartConfig = {
  effectif: { label: "Effectif", color: "hsl(var(--primary))" },
} satisfies ChartConfig

const fiscalDeadlines = [
    { date: "15/07/2024", label: "Déclaration de TVA (Juin)" },
    { date: "31/07/2024", label: "Paiement de l'acompte IS" },
    { date: "05/08/2024", label: "Déclaration Sociale Nominative (DSN)" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* KPIs Globaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainKpis.map(kpi => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${kpi.changeType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne Principale (Modules) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SKOMPTAB Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-primary"/>SKOMPTAB - Finance</CardTitle>
              <CardDescription>Vue financière et comptable.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                    {skomptabKpis.map(kpi => (
                        <div key={kpi.title} className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">{kpi.title}</p>
                            <p className="text-lg font-bold">{kpi.value}</p>
                        </div>
                    ))}
                </div>
                <ChartContainer config={skomptabChartConfig} className="h-[200px] w-full flex-1">
                    <BarChart data={skomptabChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenus" fill="var(--color-revenus)" radius={4} />
                        <Bar dataKey="depenses" fill="var(--color-depenses)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
          </Card>

          {/* MARKOS Card */}
           <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LineChartIcon className="h-5 w-5 text-green-500"/>MARKOS - Marketing</CardTitle>
              <CardDescription>Performance des campagnes et CRM.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                    {markosKpis.map(kpi => (
                         <div key={kpi.title} className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">{kpi.title}</p>
                            <p className="text-lg font-bold">{kpi.value}</p>
                        </div>
                    ))}
                </div>
                <ChartContainer config={markosChartConfig} className="h-[200px] w-full flex-1">
                    <LineChart data={markosChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12}/>
                        <YAxis tickLine={false} axisLine={false} fontSize={12}/>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
          </Card>

          {/* LOGSON Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-orange-500"/>LOGSON - Logistique</CardTitle>
              <CardDescription>Suivi des expéditions et des stocks.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                    {logsonKpis.map(kpi => (
                         <div key={kpi.title} className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">{kpi.title}</p>
                            <p className="text-lg font-bold">{kpi.value}</p>
                        </div>
                    ))}
                </div>
                <ChartContainer config={logsonChartConfig} className="h-[200px] w-full flex-1">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={logsonChartData} dataKey="count" nameKey="status" innerRadius={50} outerRadius={80} paddingAngle={5}>
                             {logsonChartData.map((entry) => (
                                <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend content={<ChartLegendContent nameKey="status"/>}/>
                    </PieChart>
                </ChartContainer>
            </CardContent>
          </Card>

          {/* SOCIX Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-purple-500"/>SOCIX - RH</CardTitle>
              <CardDescription>Gestion des ressources humaines.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                    {socixKpis.map(kpi => (
                         <div key={kpi.title} className="p-2 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground">{kpi.title}</p>
                            <p className="text-lg font-bold">{kpi.value}</p>
                        </div>
                    ))}
                </div>
                <ChartContainer config={socixChartConfig} className="h-[200px] w-full flex-1">
                     <BarChart data={socixChartData} layout="vertical">
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="dept" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} fontSize={12}/>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="effectif" fill="var(--color-effectif)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Latérale */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Échéances Fiscales</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border p-0"
              />
              <div className="mt-4 space-y-2">
                {fiscalDeadlines.map(deadline => (
                    <div key={deadline.label} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                        <p>{deadline.label}</p>
                        <Badge variant="outline">{deadline.date}</Badge>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
