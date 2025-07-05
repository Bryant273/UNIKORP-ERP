
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, FileText, BarChart2, PieChart as PieChartIcon, LineChart, Eye, Pencil, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type Report = {
    id: string;
    title: string;
    description: string;
    type: 'predefined' | 'custom';
    icon: React.ElementType;
}

const INITIAL_REPORTS: Report[] = [
    { id: 'rep1', title: "Compte de Résultat par Projet", description: "Analyse de la rentabilité de chaque projet.", type: 'predefined', icon: BarChart2 },
    { id: 'rep2', title: "Balance Analytique par Département", description: "Consultez le solde de chaque section analytique de type département.", type: 'predefined', icon: FileText },
    { id: 'rep3', title: "Répartition des Charges", description: "Visualisez la distribution des charges sur les centres de coûts.", type: 'predefined', icon: PieChartIcon },
    { id: 'rep4', title: "Marge par Ligne de Produit", description: "Suivez l'évolution mensuelle de la marge pour chaque produit.", type: 'predefined', icon: LineChart },
    { id: 'rep5', title: "Rapport Personnalisé - Ventes Régionales", description: "Analyse trimestrielle des ventes par région.", type: 'custom', icon: BarChart2 },
];

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
};


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
    const [reports, setReports] = useState(INITIAL_REPORTS);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const { toast } = useToast();

    const predefinedReports = reports.filter(r => r.type === 'predefined');
    const customReports = reports.filter(r => r.type === 'custom');

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
        setIsReportModalOpen(true);
    };

    const handleDeleteReport = () => {
        if (!reportToDelete) return;
        setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
        setReportToDelete(null);
        toast({
            title: "Rapport supprimé",
            description: `Le rapport "${reportToDelete.title}" a été supprimé.`,
        });
    }

    const renderTable = (data: Report[]) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Titre du Rapport</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[150px] text-center">Type</TableHead>
                    <TableHead className="w-[150px] text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map(report => (
                    <TableRow key={report.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                           <report.icon className="h-4 w-4 text-primary" />
                           {report.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{report.description}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={report.type === 'predefined' ? 'secondary' : 'default'}>
                                {report.type === 'predefined' ? 'Prédéfini' : 'Personnalisé'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleViewReport(report)}><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" disabled={report.type === 'predefined'}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={report.type === 'predefined'} onClick={() => setReportToDelete(report)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2"><PieChartIcon/> Reporting Analytique</CardTitle>
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
                {predefinedReports.length > 0 ? renderTable(predefinedReports) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Aucun rapport prédéfini disponible.</p>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="custom">
                 {customReports.length > 0 ? renderTable(customReports) : (
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

    <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le rapport ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le rapport "{reportToDelete?.title}" sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteReport} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
