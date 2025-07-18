
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Download, FileWarning } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const MOCK_DATA_CLIENTS = [
    { id: 1, nom: 'Client Alpha', total: 150000, echeances: { '0-30': 50000, '31-60': 75000, '61-90': 25000, '90+': 0 } },
    { id: 2, nom: 'Client Beta', total: 80000, echeances: { '0-30': 80000, '31-60': 0, '61-90': 0, '90+': 0 } },
    { id: 3, nom: 'Client Gamma', total: 250000, echeances: { '0-30': 0, '31-60': 0, '61-90': 100000, '90+': 150000 } },
];
const MOCK_DATA_FOURNISSEURS = [
    { id: 1, nom: 'Fournisseur Omega', total: 95000, echeances: { '0-30': 95000, '31-60': 0, '61-90': 0, '90+': 0 } },
    { id: 2, nom: 'Fournisseur Epsilon', total: 320000, echeances: { '0-30': 120000, '31-60': 200000, '61-90': 0, '90+': 0 } },
];

const calculateTotals = (data: typeof MOCK_DATA_CLIENTS) => data.reduce((acc, row) => {
    acc.total += row.total;
    acc.echeances['0-30'] += row.echeances['0-30'];
    acc.echeances['31-60'] += row.echeances['31-60'];
    acc.echeances['61-90'] += row.echeances['61-90'];
    acc.echeances['90+'] += row.echeances['90+'];
    return acc;
}, { total: 0, echeances: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 } });

export default function BalanceAgeePage() {
    const clientTotals = calculateTotals(MOCK_DATA_CLIENTS);
    const fournisseurTotals = calculateTotals(MOCK_DATA_FOURNISSEURS);

    const handleExportPDF = (type: 'clients' | 'fournisseurs') => {
        const doc = new jsPDF();
        const data = type === 'clients' ? MOCK_DATA_CLIENTS : MOCK_DATA_FOURNISSEURS;
        const totals = type === 'clients' ? clientTotals : fournisseurTotals;
        
        doc.setFontSize(18);
        doc.text(`Balance Âgée - ${type === 'clients' ? 'Clients' : 'Fournisseurs'}`, 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Date d'édition : ${format(new Date(), 'dd/MM/yyyy')}`, 105, 26, { align: 'center' });
        
        const tableData = data.map(item => [
            item.nom,
            item.total.toLocaleString('fr-FR'),
            item.echeances['0-30'].toLocaleString('fr-FR'),
            item.echeances['31-60'].toLocaleString('fr-FR'),
            item.echeances['61-90'].toLocaleString('fr-FR'),
            item.echeances['90+'].toLocaleString('fr-FR'),
        ]);
        
        const tableFooter = [[
            'TOTAL',
            totals.total.toLocaleString('fr-FR'),
            totals.echeances['0-30'].toLocaleString('fr-FR'),
            totals.echeances['31-60'].toLocaleString('fr-FR'),
            totals.echeances['61-90'].toLocaleString('fr-FR'),
            totals.echeances['90+'].toLocaleString('fr-FR'),
        ]];

        autoTable(doc, {
            head: [['Tiers', 'Total Dû', '0-30 jours', '31-60 jours', '61-90 jours', '90+ jours']],
            body: tableData,
            foot: tableFooter,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: '#1e3a8a' },
            footStyles: { fillColor: '#e2e8f0', textColor: '#1e293b', fontStyle: 'bold' },
        });

        doc.save(`balance_agee_${type}.pdf`);
    };

    const renderTable = (data: typeof MOCK_DATA_CLIENTS, totals: any, type: 'clients' | 'fournisseurs') => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle>Balance Âgée {type === 'clients' ? 'Clients' : 'Fournisseurs'}</CardTitle>
                 <Button variant="outline" onClick={() => handleExportPDF(type)}><Download className="mr-2 h-4 w-4"/>Exporter</Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tiers</TableHead>
                            <TableHead className="text-right">Total Dû</TableHead>
                            <TableHead className="text-right">0-30 jours</TableHead>
                            <TableHead className="text-right">31-60 jours</TableHead>
                            <TableHead className="text-right">61-90 jours</TableHead>
                            <TableHead className="text-right">90+ jours</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(row => (
                            <TableRow key={row.id}>
                                <TableCell className="font-medium">{row.nom}</TableCell>
                                <TableCell className="text-right font-bold">{row.total.toLocaleString('fr-FR')} FCFA</TableCell>
                                <TableCell className="text-right">{row.echeances['0-30'].toLocaleString('fr-FR')} FCFA</TableCell>
                                <TableCell className="text-right">{row.echeances['31-60'].toLocaleString('fr-FR')} FCFA</TableCell>
                                <TableCell className="text-right">{row.echeances['61-90'].toLocaleString('fr-FR')} FCFA</TableCell>
                                <TableCell className="text-right text-red-600 font-bold">{row.echeances['90+'].toLocaleString('fr-FR')} FCFA</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                         <TableRow>
                            <TableCell className="font-bold">TOTAL</TableCell>
                            <TableCell className="text-right font-bold">{totals.total.toLocaleString('fr-FR')} FCFA</TableCell>
                            <TableCell className="text-right font-bold">{totals.echeances['0-30'].toLocaleString('fr-FR')} FCFA</TableCell>
                            <TableCell className="text-right font-bold">{totals.echeances['31-60'].toLocaleString('fr-FR')} FCFA</TableCell>
                            <TableCell className="text-right font-bold">{totals.echeances['61-90'].toLocaleString('fr-FR')} FCFA</TableCell>
                            <TableCell className="text-right font-bold text-red-600">{totals.echeances['90+'].toLocaleString('fr-FR')} FCFA</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </CardContent>
        </Card>
    );

    return (
        <Tabs defaultValue="clients" className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Balance Âgée</CardTitle>
                <CardDescription>Analyse des créances clients et des dettes fournisseurs par ancienneté.</CardDescription>
                <TabsList className="grid w-full grid-cols-2 mt-4">
                    <TabsTrigger value="clients">Clients</TabsTrigger>
                    <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
                </TabsList>
            </CardHeader>
            <TabsContent value="clients" className="mt-0">
                {renderTable(MOCK_DATA_CLIENTS, clientTotals, 'clients')}
            </TabsContent>
            <TabsContent value="fournisseurs" className="mt-0">
                {renderTable(MOCK_DATA_FOURNISSEURS, fournisseurTotals, 'fournisseurs')}
            </TabsContent>
        </Tabs>
    );
}
