'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Upload, FileSignature, Target } from 'lucide-react';

type BudgetLine = {
    id: number;
    sectionCode: string;
    sectionLibelle: string;
    budget: number;
    realise: number;
};

const MOCK_BUDGET_DATA: BudgetLine[] = [
    { id: 1, sectionCode: 'D-FIN', sectionLibelle: 'Finance & Comptabilité', budget: 50000, realise: 45000 },
    { id: 2, sectionCode: 'D-RH', sectionLibelle: 'Ressources Humaines', budget: 75000, realise: 80000 },
    { id: 3, sectionCode: 'D-IT-INFRA', sectionLibelle: 'Infrastructure IT', budget: 120000, realise: 115000 },
    { id: 4, sectionCode: 'P2024-01-DEV', sectionLibelle: 'Développement ERP', budget: 250000, realise: 180000 },
];

export default function BudgetisationPage() {

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' XOF';
    
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl flex items-center gap-2"><Target /> Budgétisation & Suivi</CardTitle>
                        <CardDescription>
                            Élaborez vos budgets, suivez les réalisations et analysez les écarts.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Importer un budget</Button>
                        <Button><PlusCircle className="mr-2 h-4 w-4"/> Saisir un budget</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-4">
                        <Select defaultValue="all">
                            <SelectTrigger className="w-[250px]"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les plans analytiques</SelectItem>
                                <SelectItem value="proj">Analyse par Projet</SelectItem>
                                <SelectItem value="dept">Analyse par Département</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select defaultValue="v1">
                            <SelectTrigger className="w-[250px]"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="v1">Version Budgétaire Initiale</SelectItem>
                                <SelectItem value="v2">Révisé 1 - Juillet 2024</SelectItem>
                                <SelectItem value="v3">Atterrissage Prévisionnel</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Section Analytique</TableHead>
                            <TableHead className="text-right">Budget Alloué</TableHead>
                            <TableHead className="text-right">Montant Réalisé</TableHead>
                            <TableHead className="text-right">Écart</TableHead>
                            <TableHead className="w-[250px]">Taux de Consommation</TableHead>
                            <TableHead className="text-center w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_BUDGET_DATA.map(line => {
                            const ecart = line.realise - line.budget;
                            const consommation = (line.realise / line.budget) * 100;
                            return (
                                <TableRow key={line.id}>
                                    <TableCell>
                                        <div className="font-medium">{line.sectionLibelle}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{line.sectionCode}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(line.budget)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(line.realise)}</TableCell>
                                    <TableCell className={`text-right font-mono ${ecart > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(ecart)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={consommation} className={consommation > 100 ? '[&>div]:bg-red-500' : ''}/>
                                            <span className="text-xs font-mono">{consommation.toFixed(1)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="sm"><FileSignature className="h-4 w-4"/> Saisir</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
