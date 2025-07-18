
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Percent, DollarSign, Truck, PackageCheck, Archive, RefreshCw, Clock } from "lucide-react";

const kpiGridData = [
  { title: "Taux de rotation des stocks", value: "6.2", change: "+0.5 vs M-1", Icon: RefreshCw },
  { title: "Taux de livraison à temps (OTD)", value: "97.8%", change: "+1.2% vs M-1", Icon: Clock },
  { title: "Coût par commande", value: "9,940 FCFA", change: "-2% vs M-1", Icon: DollarSign },
  { title: "Précision de l'inventaire", value: "99.5%", change: "+0.1% vs M-1", Icon: PackageCheck },
  { title: "Coût de transport moyen", value: "5,250 FCFA", change: "+3% vs M-1", Icon: Truck },
  { title: "Utilisation de l'entrepôt", value: "85%", change: "-5% vs M-1", Icon: Archive },
  { title: "Commandes parfaites", value: "92.1%", change: "+2.5% vs M-1", Icon: Percent },
  { title: "Délai de cycle commande-livraison", value: "2.5 jours", change: "-0.2j vs M-1", Icon: TrendingUp },
];

export default function KpiLogistiquesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Indicateurs Clés de Performance (KPI) Logistiques</CardTitle>
                <CardDescription>Suivez vos principaux indicateurs de performance logistique en temps réel.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiGridData.map(kpi => (
                        <Card key={kpi.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                <kpi.Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className={`text-xs ${kpi.change.startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>{kpi.change}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
