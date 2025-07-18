
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlusCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Report = {
    id: string;
    titre: string;
    description: string;
    dateCreation: string;
    creePar: string;
};

const MOCK_REPORTS: Report[] = [
    { id: 'rep-1', titre: 'Analyse des Coûts de Transport - T2 2024', description: 'Rapport détaillé sur les dépenses de transport par transporteur et par destination.', dateCreation: '2024-07-05', creePar: 'Admin' },
    { id: 'rep-2', titre: 'Rapport de Rotation des Stocks - Juin 2024', description: 'Analyse mensuelle de la vitesse de rotation des stocks par catégorie de produit.', dateCreation: '2024-07-02', creePar: 'Automatique' },
    { id: 'rep-3', titre: 'Performance des Fournisseurs - S1 2024', description: 'Comparaison des délais de livraison et de la qualité des fournisseurs.', dateCreation: '2024-07-01', creePar: 'Admin' },
    { id: 'rep-4', titre: 'Analyse des Retours Clients - Juin 2024', description: 'Identification des motifs de retour et des produits les plus concernés.', dateCreation: '2024-07-01', creePar: 'Automatique' },
];

export default function RapportsAnalysesPage() {
    const [reports, setReports] = useState(MOCK_REPORTS);
    
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Rapports et Analyses</CardTitle>
                        <CardDescription>Générez et consultez des rapports personnalisés sur votre activité logistique.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Nouveau Rapport</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Titre du Rapport</TableHead>
                            <TableHead>Date de Création</TableHead>
                            <TableHead>Créé par</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map(report => (
                            <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.titre}</TableCell>
                                <TableCell>{format(new Date(report.dateCreation), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                <TableCell>{report.creePar}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
