
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, BarChart, FileText, Eye, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

type Report = {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    lastModified: string;
};

const MOCK_REPORTS: Report[] = [
    { id: 'rep-1', title: "Analyse des Leads par Région (Q3)", description: "Répartition géographique et conversion des leads.", createdBy: "Sophie Martin", lastModified: '2024-07-25' },
    { id: 'rep-2', title: "Performance des Campagnes Email", description: "Analyse détaillée des taux d'ouverture et de clics.", createdBy: "Sophie Martin", lastModified: '2024-07-20' },
    { id: 'rep-3', title: "Funnel de Conversion B2B", description: "Suivi du pipeline de vente pour les clients B2B.", createdBy: "Admin", lastModified: '2024-07-18' },
];

const reportMetrics = [
    { id: 'leads', label: 'Nombre de Leads' },
    { id: 'mql', label: 'Nombre de MQLs' },
    { id: 'coutParLead', label: 'Coût par Lead' },
    { id: 'revenu', label: 'Revenu Généré' },
    { id: 'roi', label: 'ROI' },
];

const reportDimensions = [
    { id: 'canal', label: 'Par Canal' },
    { id: 'campagne', label: 'Par Campagne' },
    { id: 'region', label: 'Par Région' },
    { id: 'periode', label: 'Par Période' },
];


export default function RapportsPersonnalisesPage() {
    const { toast } = useToast();
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<Report | null>(null);
    const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

    const handleOpenModal = (report: Report | null) => {
        setEditingReport(report);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: editingReport ? 'Rapport Modifié (Simulation)' : 'Rapport Créé (Simulation)', description: 'Votre rapport personnalisé a été sauvegardé.' });
        setIsModalOpen(false);
    };
    
    const handleDelete = () => {
        if (!reportToDelete) return;
        setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
        setReportToDelete(null);
        toast({ title: "Rapport supprimé", description: `Le rapport "${reportToDelete.title}" a été supprimé.`});
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Rapports Personnalisés</CardTitle>
                            <CardDescription>Créez, consultez et gérez vos propres rapports d'analyse marketing.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenModal(null)}><PlusCircle className="mr-2 h-4 w-4" /> Nouveau Rapport</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Titre du Rapport</TableHead>
                            <TableHead>Créé par</TableHead>
                            <TableHead>Dernière modification</TableHead>
                            <TableHead className="text-center w-[200px]">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {reports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        <p className="font-medium">{report.title}</p>
                                        <p className="text-xs text-muted-foreground">{report.description}</p>
                                    </TableCell>
                                    <TableCell>{report.createdBy}</TableCell>
                                    <TableCell>{format(new Date(report.lastModified), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => toast({ title: `Aperçu de "${report.title}"`})}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(report)}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => setReportToDelete(report)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingReport ? "Modifier le rapport" : "Éditeur de Rapport Personnalisé"}</DialogTitle>
                            <DialogDescription>Sélectionnez les métriques et les dimensions pour construire votre rapport.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-semibold">1. Choisir les Métriques</h3>
                                <div className="space-y-2 p-4 border rounded-md">
                                    {reportMetrics.map(metric => (
                                        <div key={metric.id} className="flex items-center gap-2">
                                            <Checkbox id={metric.id} />
                                            <Label htmlFor={metric.id} className="font-normal">{metric.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold">2. Choisir les Dimensions</h3>
                                 <div className="space-y-2 p-4 border rounded-md">
                                    {reportDimensions.map(dim => (
                                        <div key={dim.id} className="flex items-center gap-2">
                                            <Checkbox id={dim.id} />
                                            <Label htmlFor={dim.id} className="font-normal">{dim.label}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2 space-y-4">
                                <h3 className="font-semibold">3. Finaliser</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="reportName">Nom du rapport</Label>
                                    <Input id="reportName" placeholder="Ex: Analyse des leads par région" defaultValue={editingReport?.title || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="chartType">Type de graphique</Label>
                                     <Select><SelectTrigger><SelectValue placeholder="Choisir une visualisation..."/></SelectTrigger><SelectContent><SelectItem value="bar">Graphique à barres</SelectItem><SelectItem value="line">Graphique linéaire</SelectItem><SelectItem value="pie">Diagramme circulaire</SelectItem><SelectItem value="table">Tableau</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                            <Button type="submit">Générer le rapport</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

             <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce rapport ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
