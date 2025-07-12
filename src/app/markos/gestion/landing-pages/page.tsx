
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, BarChart, Eye, Pencil, Trash2, Archive, TargetIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import Image from 'next/image';

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
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
    const [pageToDelete, setPageToDelete] = useState<LandingPage | null>(null);
    const [previewingPage, setPreviewingPage] = useState<LandingPage | null>(null);
    const [statsPage, setStatsPage] = useState<LandingPage | null>(null);

    const totalPages = Math.ceil(pages.length / ITEMS_PER_PAGE);
    const currentPages = pages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenEditModal = (page: LandingPage | null) => {
        setEditingPage(page);
        setIsEditModalOpen(true);
    };

    const handleSave = (title: string) => {
        if (editingPage) {
            setPages(pages.map(p => p.id === editingPage.id ? { ...p, title, lastModified: new Date().toISOString().split('T')[0] } : p));
            toast({ title: 'Page modifiée' });
        } else {
            const newPage: LandingPage = {
                id: `lp-${Date.now()}`,
                title,
                status: 'Brouillon',
                visitors: 0,
                conversionRate: 0,
                lastModified: new Date().toISOString().split('T')[0],
            };
            setPages([newPage, ...pages]);
            toast({ title: 'Page créée', description: 'La nouvelle page est maintenant en brouillon.' });
        }
        setIsEditModalOpen(false);
    };

    const handleArchive = (id: string) => {
        setPages(pages.map(p => p.id === id ? { ...p, status: 'Archivée' } : p));
        toast({ title: 'Page archivée' });
    };

    const handleDelete = () => {
        if (!pageToDelete) return;
        setPages(pages.filter(p => p.id !== pageToDelete.id));
        setPageToDelete(null);
        toast({ title: 'Page supprimée' });
    };

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
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><TargetIcon /> Landing Pages</CardTitle>
                            <CardDescription>Créez et gérez vos pages de destination pour optimiser les conversions.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenEditModal(null)}><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Page</Button>
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
                                            <Button variant="ghost" size="icon" title="Aperçu" onClick={() => setPreviewingPage(page)}><Eye className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" title="Statistiques" onClick={() => setStatsPage(page)}><BarChart className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" title="Modifier" onClick={() => handleOpenEditModal(page)}><Pencil className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" title="Archiver" onClick={() => handleArchive(page.id)}><Archive className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" title="Supprimer" onClick={() => setPageToDelete(page)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Précédent</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Suivant</Button>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} page={editingPage} />
            <PreviewModal isOpen={!!previewingPage} onClose={() => setPreviewingPage(null)} page={previewingPage} />
            <StatsModal isOpen={!!statsPage} onClose={() => setStatsPage(null)} page={statsPage} />
            <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Supprimer cette page ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function EditModal({ isOpen, onClose, onSave, page }: { isOpen: boolean, onClose: () => void, onSave: (title: string) => void, page: LandingPage | null }) {
    const [title, setTitle] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            setTitle(page?.title || '');
        }
    }, [isOpen, page]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(title);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader><DialogTitle>{page ? 'Modifier la page' : 'Nouvelle Landing Page'}</DialogTitle><DialogDescription>Entrez le titre de votre page.</DialogDescription></DialogHeader>
                    <div className="py-4"><Label htmlFor="title">Titre</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                    <DialogFooter><Button variant="outline" type="button" onClick={onClose}>Annuler</Button><Button type="submit">Enregistrer</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PreviewModal({ isOpen, onClose, page }: { isOpen: boolean, onClose: () => void, page: LandingPage | null }) {
    if (!page) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader><DialogTitle>Aperçu : {page.title}</DialogTitle></DialogHeader>
                <div className="py-4 bg-muted flex justify-center rounded-md"><Image src="https://placehold.co/1200x800.png" alt={page.title} width={1200} height={800} data-ai-hint="website page" className="w-full h-auto object-cover rounded-md border" /></div>
            </DialogContent>
        </Dialog>
    );
}

function StatsModal({ isOpen, onClose, page }: { isOpen: boolean, onClose: () => void, page: LandingPage | null }) {
    const funnelData = useMemo(() => {
        if (!page) return [];
        const visitors = page.visitors;
        const leads = visitors * (page.conversionRate / 100);
        const qualified = leads * 0.4; // 40% of leads are qualified
        return [
            { name: 'Visiteurs', value: visitors, fill: 'hsl(var(--chart-1))' },
            { name: 'Leads', value: Math.round(leads), fill: 'hsl(var(--chart-2))' },
            { name: 'Qualifiés', value: Math.round(qualified), fill: 'hsl(var(--chart-3))' },
        ];
    }, [page]);
    
    const funnelChartConfig = funnelData.reduce((acc, cur) => {
        (acc as any)[cur.name] = { label: cur.name, color: cur.fill };
        return acc;
    }, {} as any);

    if (!page) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Statistiques : {page.title}</DialogTitle><DialogDescription>Performance de la landing page.</DialogDescription></DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Visiteurs</p><p className="text-2xl font-bold">{page.visitors.toLocaleString('fr-FR')}</p></div>
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Taux de Conv.</p><p className="text-2xl font-bold">{page.conversionRate.toFixed(1)}%</p></div>
                        <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Conversions</p><p className="text-2xl font-bold">{Math.round(page.visitors * (page.conversionRate / 100)).toLocaleString('fr-FR')}</p></div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-center mb-2">Entonnoir de Conversion</h3>
                        <ChartContainer config={funnelChartConfig} className="mx-auto w-full h-64">
                            <ResponsiveContainer>
                                <FunnelChart>
                                    <Tooltip content={<ChartTooltipContent />} />
                                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                                        <LabelList position="right" fill="#fff" dataKey="name" />
                                    </Funnel>
                                </FunnelChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
