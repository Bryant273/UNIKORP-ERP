"use client"
import Link from "next/link"
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
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from "recharts"
import { Calculator, Megaphone, Truck, Users, UsersRound, ArrowRight } from "lucide-react"
import { type ChartConfig } from "@/components/ui/chart"

const modules = [
  {
    name: "SKOMPTAB",
    description: "Comptabilité, Finance et Fiscalité",
    icon: Calculator,
    href: "/skomptab",
    color: "text-blue-500",
  },
  {
    name: "MARKOS",
    description: "Marketing, CRM",
    icon: Megaphone,
    href: "/markos",
    color: "text-green-500",
  },
  {
    name: "LOGSON",
    description: "Logistique et Contrôle de gestion",
    icon: Truck,
    href: "/logson",
    color: "text-orange-500",
  },
  {
    name: "SOCIX",
    description: "RH et Mix Social",
    icon: UsersRound,
    href: "/socix",
    color: "text-purple-500",
  },
]

const chartData = [
  { month: "Janvier", desktop: 186, mobile: 80 },
  { month: "Février", desktop: 305, mobile: 200 },
  { month: "Mars", desktop: 237, mobile: 120 },
  { month: "Avril", desktop: 73, mobile: 190 },
  { month: "Mai", desktop: 209, mobile: 130 },
  { month: "Juin", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--primary))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) => (
          <Link href={module.href} key={module.name}>
            <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {module.name}
                </CardTitle>
                <module.icon className={`h-5 w-5 ${module.color}`} />
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-xs text-muted-foreground">
                  {module.description}
                </p>
              </CardContent>
              <div className="p-6 pt-0">
                 <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventes par mois</CardTitle>
            <CardDescription>Analyse des ventes mensuelles</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="desktop"
                  fill="var(--color-desktop)"
                  radius={4}
                />
                 <Bar
                  dataKey="mobile"
                  fill="var(--color-mobile)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement Utilisateur</CardTitle>
            <CardDescription>Activité des utilisateurs sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                 <YAxis tickMargin={8} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="mobile"
                  type="monotone"
                  stroke="var(--color-mobile)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="desktop"
                  type="monotone"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
