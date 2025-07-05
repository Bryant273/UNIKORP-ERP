
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PlusCircle, FileText, BarChart2, PieChart, LineChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';


type Report = {
    id: string;
    title: string;
    description: string;
    type: 'predefined' | 'custom';
    icon: React.ElementType;
}

const MOCK_REPORTS: Report[] = [
    { id: 'rep1', title: "Compte de Résultat par Projet", description: "Analyse de la rentabilité de chaque projet.", type: 'predefined', icon: BarChart2 },
    { id: 'rep2', title: "Balance Analytique par Département", description: "Consultez le solde de chaque section analytique de type département.", type: 'predefined', icon: FileText },
    { id: 'rep3', title: "Répartition des Charges", description: "Visualisez la distribution des charges sur les centres de coûts.", type: 'predefined', icon: PieChart },
    { id: 'rep4', title: "Marge par Ligne de Produit", description: "Suivez l'évolution mensuelle de la marge pour chaque produit.", type: 'predefined', icon: LineChart },
    { id: 'rep5', title: "Rapport Personnalisé - Ventes Régionales", description: "Analyse trimestrielle des ventes par région.", type: 'custom', icon: BarChart2 },
]

// Mock data for the pie chart
const pieChartData = [
  { name: 'Achats - Production', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Salaires - Production', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Salaires - Direction', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'Achats - Commercial', value: 200, fill: 'hsl(var(--chart-4))' },
  { name: 'Fournitures - Direction', value: 278, fill: 'hsl(var(--chart-5))' },
];

const chartConfig = {
  charges: {
    label: "Charges",
  },
  "Achats - Production": {
    label: "Achats - Production",
    color: "hsl(var(--chart-1))",
  },
  "Salaires - Production": {
    label: "Salaires - Production",
    color: "hsl(var(--chart-2))",
  },
  "Salaires - Direction": {
    label: "Salaires - Direction",
    color: "hsl(var(--chart-3))",
  },
  "Achats - Commercial": {
    label: "Achats - Commercial",
    color: "hsl(var(--chart-4))",
  },
  "Fournitures - Direction": {
    label: "Fournitures - Direction",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig


function ReportPreview({ report }: { report: Report | null }) {
    if (!report) return null;

    if (report.id === 'rep3') {
        return (
            <div className="flex flex-col items-center gap-4 py-4">
                 <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[300px]">
                    <RechartsPieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </RechartsPieChart>
                </ChartContainer>
                <div className="flex flex-wrap gap-4 justify-center">
                    {pieChartData.map(item => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span>{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="text-center p-8 h-64 flex items-center justify-center">
            <p className="text-muted-foreground">La prévisualisation pour ce rapport n'est pas encore disponible.</p>
        </div>
    )
}

export default function ReportingAnalytiquePage() {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const predefinedReports = MOCK_REPORTS.filter(r => r.type === 'predefined');
    const customReports = MOCK_REPORTS.filter(r => r.type === 'custom');

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
        setIsReportModalOpen(true);
    };

    const ReportCard = ({ report }: { report: Report }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
                <report.icon className="h-8 w-8 text-primary"/>
                <div>
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Button className="w-full" onClick={() => handleViewReport(report)}>Consulter le rapport</Button>
            </CardContent>
        </Card>
    );

  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2"><PieChart/> Reporting Analytique</CardTitle>
            <CardDescription>
                Explorez vos données analytiques avec des rapports prédéfinis ou créez les vôtres.
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un rapport personnalisé
          </Button>
        </div>
      </CardHeader>
      <CardContent>
         <Tabs defaultValue="predefined">
            <TabsList className="mb-4">
                <TabsTrigger value="predefined">Rapports Prédéfinis</TabsTrigger>
                <TabsTrigger value="custom">Mes Rapports Personnalisés</TabsTrigger>
            </TabsList>
            <TabsContent value="predefined">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {predefinedReports.map(report => <ReportCard key={report.id} report={report} />)}
                </div>
            </TabsContent>
            <TabsContent value="custom">
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customReports.map(report => <ReportCard key={report.id} report={report} />)}
                 </div>
                 {customReports.length === 0 && (
                     <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Vous n'avez pas encore de rapport personnalisé.</p>
                     </div>
                 )}
            </TabsContent>
         </Tabs>
      </CardContent>
    </Card>

    <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>{selectedReport?.title}</DialogTitle>
                <DialogDescription>{selectedReport?.description}</DialogDescription>
            </DialogHeader>
            <ReportPreview report={selectedReport} />
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Fermer</Button>
                <Button>Exporter</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
