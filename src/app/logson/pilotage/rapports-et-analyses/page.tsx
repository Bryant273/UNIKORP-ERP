
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, PlusCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';

type ReportType = 'couts' | 'fournisseurs' | 'rotation' | 'retours';
type Report = {
    id: string;
    titre: string;
    description: string;
    dateCreation: string;
    creePar: string;
    type: ReportType;
};

const MOCK_REPORTS: Report[] = [
    { id: 'rep-1', titre: 'Analyse des Coûts de Transport - T2 2024', description: 'Rapport détaillé sur les dépenses de transport par transporteur et par destination.', dateCreation: '2024-07-05', creePar: 'Admin', type: 'couts' },
    { id: 'rep-2', titre: 'Rapport de Rotation des Stocks - Juin 2024', description: 'Analyse mensuelle de la vitesse de rotation des stocks par catégorie de produit.', dateCreation: '2024-07-02', creePar: 'Automatique', type: 'rotation' },
    { id: 'rep-3', titre: 'Performance des Fournisseurs - S1 2024', description: 'Comparaison des délais de livraison et de la qualité des fournisseurs.', dateCreation: '2024-07-01', creePar: 'Admin', type: 'fournisseurs' },
    { id: 'rep-4', titre: 'Analyse des Retours Clients - Juin 2024', description: 'Identification des motifs de retour et des produits les plus concernés.', dateCreation: '2024-07-01', creePar: 'Automatique', type: 'retours' },
];

const ReportPreview = ({ type }: { type: ReportType }) => {
    switch (type) {
        case 'couts':
            return <Image src="https://placehold.co/800x1131.png" data-ai-hint="costs report" alt="Aperçu Rapport Coûts" width={800} height={1131} />;
        case 'rotation':
            return <Image src="https://placehold.co/800x1131.png" data-ai-hint="stocks report" alt="Aperçu Rapport Rotation" width={800} height={1131} />;
        case 'fournisseurs':
            return <Image src="https://placehold.co/800x1131.png" data-ai-hint="supplier report" alt="Aperçu Rapport Fournisseurs" width={800} height={1131} />;
        case 'retours':
            return <Image src="https://placehold.co/800x1131.png" data-ai-hint="returns report" alt="Aperçu Rapport Retours" width={800} height={1131} />;
    }
};

export default function RapportsAnalysesPage() {
    const [reports] = useState(MOCK_REPORTS);
    const [viewingReport, setViewingReport] = useState<Report | null>(null);
    
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
                                        <Button size="icon" variant="ghost" onClick={() => setViewingReport(report)}><Eye className="h-4 w-4" /></Button>
                                        <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            
            <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Aperçu du Rapport : {viewingReport?.titre}</DialogTitle>
                        <DialogDescription>Généré le {viewingReport && format(new Date(viewingReport.dateCreation), 'dd/MM/yyyy')} par {viewingReport?.creePar}.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 bg-muted flex justify-center rounded-md">
                        <div className="border bg-background shadow-md max-w-full">
                           {viewingReport && <ReportPreview type={viewingReport.type} />}
                        </div>
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingReport(null)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
