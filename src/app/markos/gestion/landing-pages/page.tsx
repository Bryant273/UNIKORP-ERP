
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, BarChart, Eye, Pencil, Trash2, Archive, TargetIcon } from 'lucide-react';
import { format } from 'date-fns';

// --- TYPES & MOCK DATA ---
type PageStatus = 'Publiée' | 'Brouillon' | 'Archivée';
type LandingPage = {
  id: string;
  title: string;
  status: PageStatus;
  visitors: number;
  conversionRate: number;
  lastModified: string;
};

const MOCK_PAGES: LandingPage[] = [
  { id: 'lp-1', title: 'Lancement Produit Alpha', status: 'Publiée', visitors: 12580, conversionRate: 5.2, lastModified: '2024-07-15' },
  { id: 'lp-2', title: 'Inscription Webinaire Tech', status: 'Publiée', visitors: 8750, conversionRate: 12.8, lastModified: '2024-07-20' },
  { id: 'lp-3', title: 'Téléchargement Livre Blanc SEO', status: 'Brouillon', visitors: 0, conversionRate: 0, lastModified: '2024-07-25' },
  { id: 'lp-4', title: 'Offre Spéciale Été', status: 'Archivée', visitors: 25420, conversionRate: 8.1, lastModified: '2023-08-30' },
  { id: 'lp-5', title: 'Demande de Démo Unikorp', status: 'Publiée', visitors: 6321, conversionRate: 9.5, lastModified: '2024-06-10' },
];

const ITEMS_PER_PAGE = 10;

export default function LandingPagesPage() {
    const { toast } = useToast();
    const [pages, setPages] = useState(MOCK_PAGES);
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = Math.ceil(pages.length / ITEMS_PER_PAGE);
    const currentPages = pages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getStatusBadge = (status: PageStatus) => {
        switch (status) {
            case 'Publiée': return <Badge className="bg-green-100 text-green-800">Publiée</Badge>;
            case 'Brouillon': return <Badge variant="outline">Brouillon</Badge>;
            case 'Archivée': return <Badge variant="secondary">Archivée</Badge>;
        }
    };
    
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl flex items-center gap-2"><TargetIcon /> Landing Pages</CardTitle>
                        <CardDescription>Créez et gérez vos pages de destination pour optimiser les conversions.</CardDescription>
                    </div>
                    <Button onClick={() => toast({ title: 'Fonctionnalité à venir'})}><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Page</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Titre de la Page</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-right">Visiteurs</TableHead>
                            <TableHead className="text-right">Taux de Conv.</TableHead>
                            <TableHead className="text-center">Dernière Modif.</TableHead>
                            <TableHead className="text-center w-[200px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentPages.map(page => (
                            <TableRow key={page.id}>
                                <TableCell className="font-medium">{page.title}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(page.status)}</TableCell>
                                <TableCell className="text-right">{page.visitors.toLocaleString('fr-FR')}</TableCell>
                                <TableCell className="text-right">{page.conversionRate.toFixed(1)}%</TableCell>
                                <TableCell className="text-center">{format(new Date(page.lastModified), 'dd/MM/yyyy')}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-1">
                                        <Button variant="ghost" size="icon" title="Aperçu"><Eye className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" title="Modifier"><Pencil className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" title="Statistiques"><BarChart className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" title="Archiver"><Archive className="h-4 w-4"/></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter className="flex items-center justify-between pt-6">
                <div className="text-sm text-muted-foreground">
                    Total de {pages.length} pages. Page {currentPage} sur {totalPages}.
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Suivant
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
