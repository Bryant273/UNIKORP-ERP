'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, BarChart2, PieChart, LineChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function ReportingAnalytiquePage() {
    const predefinedReports = MOCK_REPORTS.filter(r => r.type === 'predefined');
    const customReports = MOCK_REPORTS.filter(r => r.type === 'custom');

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
                <Button className="w-full">Consulter le rapport</Button>
            </CardContent>
        </Card>
    );

  return (
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
  );
}
