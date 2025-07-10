
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Pie, PieChart as RechartsPieChart } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, TrendingUp, Star } from 'lucide-react';

const demographicData = [
  { age: '20-30', count: 45 },
  { age: '31-40', count: 38 },
  { age: '41-50', count: 22 },
  { age: '51+', count: 7 },
];
const demographicConfig = { count: { label: "Effectif", color: "hsl(var(--primary))" } } satisfies ChartConfig;

const hiringData = [
  { month: 'Jan', recrutements: 5, departs: 2 },
  { month: 'Fev', recrutements: 3, departs: 3 },
  { month: 'Mar', recrutements: 6, departs: 1 },
  { month: 'Avr', recrutements: 4, departs: 2 },
  { month: 'Mai', recrutements: 2, departs: 2 },
  { month: 'Juin', recrutements: 4, departs: 2 },
];
const hiringConfig = {
  recrutements: { label: "Recrutements", color: "hsl(var(--chart-2))" },
  departs: { label: "Départs", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const skillsData = [
  { name: 'Technique', value: 45, fill: 'hsl(var(--chart-1))' },
  { name: 'Comportementale', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'Langue', value: 15, fill: 'hsl(var(--chart-3))' },
  { name: 'Management', value: 15, fill: 'hsl(var(--chart-4))' },
];
const skillsConfig = {
  value: { label: "Compétences" },
  Technique: { label: "Technique", color: "hsl(var(--chart-1))" },
  Comportementale: { label: "Comportementale", color: "hsl(var(--chart-2))" },
  Langue: { label: "Langue", color: "hsl(var(--chart-3))" },
  Management: { label: "Management", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const interviewData = [
    { status: 'Terminé', count: 48 },
    { status: 'À faire', count: 12 },
    { status: 'En retard', count: 5 },
]
const interviewConfig = { count: { label: "Entretiens", color: "hsl(var(--primary))" } } satisfies ChartConfig;

export default function RapportsAnalysesPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Rapports et Analyses RH</CardTitle>
        <CardDescription>Explorez des visualisations détaillées de vos données de ressources humaines.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="demographics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demographics"><Users className="mr-2 h-4 w-4"/>Démographie</TabsTrigger>
            <TabsTrigger value="hiring"><TrendingUp className="mr-2 h-4 w-4"/>Recrutements & Départs</TabsTrigger>
            <TabsTrigger value="skills"><Star className="mr-2 h-4 w-4"/>Compétences</TabsTrigger>
            <TabsTrigger value="interviews"><Briefcase className="mr-2 h-4 w-4"/>Entretiens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="demographics" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Pyramide des Âges</CardTitle></CardHeader>
                <CardContent>
                    <ChartContainer config={demographicConfig} className="h-[300px] w-full">
                        <BarChart data={demographicData}><CartesianGrid vertical={false} /><XAxis dataKey="age" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="count" fill="var(--color-count)" radius={4} /></BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hiring" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Analyse des Recrutements et Départs</CardTitle></CardHeader>
                <CardContent>
                    <ChartContainer config={hiringConfig} className="h-[300px] w-full">
                        <BarChart data={hiringData}><CartesianGrid vertical={false} /><XAxis dataKey="month" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Legend /><Bar dataKey="recrutements" fill="var(--color-recrutements)" radius={4} /><Bar dataKey="departs" fill="var(--color-departs)" radius={4} /></BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="mt-4">
            <Card>
                <CardHeader><CardTitle>Cartographie des Compétences</CardTitle></CardHeader>
                <CardContent className="flex justify-center">
                    <ChartContainer config={skillsConfig} className="h-[300px] w-full">
                        <RechartsPieChart><ChartTooltip content={<ChartTooltipContent hideLabel />} /><Pie data={skillsData} dataKey="value" nameKey="name" innerRadius={60}><Legend/></Pie></RechartsPieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interviews" className="mt-4">
             <Card>
                <CardHeader><CardTitle>Suivi des Entretiens Professionnels</CardTitle></CardHeader>
                <CardContent>
                    <ChartContainer config={interviewConfig} className="h-[300px] w-full">
                        <BarChart data={interviewData}><CartesianGrid vertical={false} /><XAxis dataKey="status" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="count" fill="var(--color-count)" radius={4} /></BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}
