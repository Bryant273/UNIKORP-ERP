
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// MOCK DATA & TYPES
const kpiData = [
  { title: "Heures Supplémentaires (Mois)", value: "72h" },
  { title: "Taux de Rotation par Équipe", value: "2.5%" },
  { title: "Couverture des Shifts", value: "98%" },
];

const teamHoursData = [
  { equipe: 'Équipe A', heures: 185 },
  { equipe: 'Équipe B', heures: 172 },
  { equipe: 'Équipe C', heures: 191 },
];
const teamHoursConfig = {
    heures: { label: "Heures Travaillées", color: "hsl(var(--primary))" }
} satisfies ChartConfig;

const shiftDistributionData = [
    { equipe: 'Équipe A', matin: 40, aprem: 40, nuit: 20, repos: 10 },
    { equipe: 'Équipe B', matin: 40, aprem: 20, nuit: 40, repos: 10 },
    { equipe: 'Équipe C', matin: 20, aprem: 40, nuit: 40, repos: 10 },
];


export default function AlternanceEquipesPage() {
    const { toast } = useToast();
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const handleExport = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Analyse de l'Alternance des Équipes - ${selectedYear}`, 105, 20, { align: 'center' });
        
        let startY = 30;
        doc.setFontSize(14);
        doc.text('Répartition des Heures par Équipe', 14, startY);
        autoTable(doc, {
            head: [['#', 'Équipe', 'Heures Travaillées']],
            body: teamHoursData.map((d, i) => [i + 1, d.equipe, d.heures]),
            startY: startY + 5,
            theme: 'striped'
        });
        
        startY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text('Répartition des Shifts', 14, startY);
        autoTable(doc, {
            head: [['#', 'Équipe', 'Matin', 'Après-midi', 'Nuit', 'Repos']],
            body: shiftDistributionData.map((d, i) => [i + 1, d.equipe, d.matin, d.aprem, d.nuit, d.repos]),
            startY: startY + 5,
            theme: 'striped'
        });

        doc.save(`analyse_alternance_${selectedYear}.pdf`);
        toast({ title: 'Exportation PDF lancée.' });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Analyse de l'Alternance des Équipes</CardTitle>
                        <CardDescription>Visualisez les données clés sur les cycles de travail et la charge par équipe.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                         <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024">2024</SelectItem>
                                <SelectItem value="2023">2023</SelectItem>
                                <SelectItem value="2022">2022</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Exporter l'analyse</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    {kpiData.map(kpi => (
                        <Card key={kpi.title}>
                            <CardHeader className="p-4 flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">{kpi.title}</CardTitle></CardHeader>
                            <CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpi.value}</div></CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Heures Travaillées par Équipe</CardTitle>
                            <CardDescription>Comparaison mensuelle du volume horaire.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={teamHoursConfig} className="h-[250px] w-full">
                                <BarChart data={teamHoursData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="equipe" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis unit="h" />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="heures" fill="var(--color-heures)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition des Shifts</CardTitle>
                            <CardDescription>Visualisation de l'équilibre des plannings.</CardDescription>
                        </CardHeader>
                         <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Équipe</TableHead>
                                        <TableHead className="text-center">Matin (h)</TableHead>
                                        <TableHead className="text-center">Après-midi (h)</TableHead>
                                        <TableHead className="text-center">Nuit (h)</TableHead>
                                        <TableHead className="text-center">Repos (h)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shiftDistributionData.map((d, index) => (
                                        <TableRow key={d.equipe} className="odd:bg-muted/50">
                                            <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{d.equipe}</TableCell>
                                            <TableCell className="text-center">{d.matin}</TableCell>
                                            <TableCell className="text-center">{d.aprem}</TableCell>
                                            <TableCell className="text-center">{d.nuit}</TableCell>
                                            <TableCell className="text-center">{d.repos}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
