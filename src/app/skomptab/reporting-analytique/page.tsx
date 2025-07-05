
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import type { ChartConfig } from '@/components/ui/chart';

// --- MOCK DATA FOR REPORTS ---

// Data for Rep1: Compte de Résultat par Projet (Bar Chart)
const projetResultatData = [
  { projet: 'Projet Alpha', produits: 450000, charges: 320000, marge: 130000 },
  { projet: 'Projet Beta', produits: 680000, charges: 510000, marge: 170000 },
  { projet: 'Maintenance', produits: 250000, charges: 180000, marge: 70000 },
  { projet: 'R&D', produits: 50000, charges: 150000, marge: -100000 },
];
const projetResultatChartConfig = {
  produits: { label: "Produits", color: "hsl(var(--chart-2))" },
  charges: { label: "Charges", color: "hsl(var(--chart-1))" },
  marge: { label: "Marge", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

// Data for Rep2: Balance Analytique par Département (Table)
const balanceAnalytiqueData = [
  { section: 'Direction Générale', debit: 150000, credit: 0 },
  { section: 'Production Atelier 1', debit: 450000, credit: 1200000 },
  { section: 'Production Atelier 2', debit: 380000, credit: 950000 },
  { section: 'Commercial France', debit: 220000, credit: 0 },
  { section: 'Commercial Export', debit: 180000, credit: 0 },
];

// Data for Rep3: Répartition des Charges (Pie Chart)
const pieChartData = [
  { name: 'Achats - Production', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Salaires - Production', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Salaires - Direction', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'Achats - Commercial', value: 200, fill: 'hsl(var(--chart-4))' },
  { name: 'Fournitures - Direction', value: 278, fill: 'hsl(var(--chart-5))' },
];
const pieChartConfig = {
  charges: { label: "Charges" },
  "Achats - Production": { label: "Achats - Production", color: "hsl(var(--chart-1))" },
  "Salaires - Production": { label: "Salaires - Production", color: "hsl(var(--chart-2))" },
  "Salaires - Direction": { label: "Salaires - Direction", color: "hsl(var(--chart-3))" },
  "Achats - Commercial": { label: "Achats - Commercial", color: "hsl(var(--chart-4))" },
  "Fournitures - Direction": { label: "Fournitures - Direction", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

// Data for Rep4: Marge par Ligne de Produit (Line Chart)
const margeProduitData = [
  { mois: 'Jan', produitA: 25.5, produitB: 35.2 },
  { mois: 'Fév', produitA: 26.1, produitB: 34.8 },
  { mois: 'Mar', produitA: 27.3, produitB: 36.1 },
  { mois: 'Avr', produitA: 26.8, produitB: 37.5 },
  { mois: 'Mai', produitA: 28.2, produitB: 38.0 },
  { mois: 'Juin', produitA: 29.0, produitB: 37.2 },
];
const margeProduitChartConfig = {
  produitA: { label: "Produit A", color: "hsl(var(--chart-1))" },
  produitB: { label: "Produit B", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export default function ReportingAnalytiquePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Compte de Résultat par Projet</CardTitle>
                    <CardDescription>Analyse de la rentabilité de chaque projet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={projetResultatChartConfig} className="mx-auto aspect-video h-[350px]">
                        <BarChart data={projetResultatData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="projet" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="produits" fill="var(--color-produits)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="charges" fill="var(--color-charges)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Balance Analytique par Département</CardTitle>
                    <CardDescription>Consultez le solde de chaque section analytique de type département.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Section / Département</TableHead>
                                <TableHead className="text-right">Débit</TableHead>
                                <TableHead className="text-right">Crédit</TableHead>
                                <TableHead className="text-right">Solde</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {balanceAnalytiqueData.map(item => {
                                const solde = item.credit - item.debit;
                                return (
                                    <TableRow key={item.section}>
                                        <TableCell className="font-medium">{item.section}</TableCell>
                                        <TableCell className="text-right font-mono">{item.debit.toLocaleString('fr-FR')} FCFA</TableCell>
                                        <TableCell className="text-right font-mono">{item.credit.toLocaleString('fr-FR')} FCFA</TableCell>
                                        <TableCell className={cn("text-right font-mono font-bold", solde >= 0 ? "text-green-600" : "text-red-600")}>{solde.toLocaleString('fr-FR')} FCFA</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Répartition des Charges</CardTitle>
                    <CardDescription>Visualisez la distribution des charges sur les centres de coûts.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[350px]">
                        <RechartsPieChart>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                             <Legend content={({ payload }) => (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-4">
                                  {payload?.map((entry, index) => (
                                    <div key={`item-${index}`} className="flex items-center gap-1.5 text-xs">
                                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: entry.color}} />
                                      {entry.value}
                                    </div>
                                  ))}
                                </div>
                              )} />
                        </RechartsPieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Évolution de la Marge par Produit (%)</CardTitle>
                    <CardDescription>Suivez l'évolution mensuelle de la marge pour chaque produit.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={margeProduitChartConfig} className="mx-auto aspect-video h-[350px]">
                        <LineChart data={margeProduitData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="mois" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis unit="%" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line type="monotone" dataKey="produitA" stroke="var(--color-produitA)" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="produitB" stroke="var(--color-produitB)" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
