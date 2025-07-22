
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Clock, AlertTriangle, CheckCircle, Eye, Download, Search, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';


// --- TYPES & MOCK DATA ---
type DocumentCategory = 'Contrat' | 'Administratif' | 'Paie' | 'Évaluation';
type DocumentStatus = 'Validé' | 'En attente' | 'Archivé';

type Document = {
  id: string;
  nom: string;
  categorie: DocumentCategory;
  employe: string;
  dateAjout: string;
  statut: DocumentStatus;
  fileUrl: string;
};

const initialDocuments: Document[] = [
    { id: 'doc-001', nom: 'Contrat de travail - Jean Dupont', categorie: 'Contrat', employe: 'Jean Dupont', dateAjout: '2020-03-15', statut: 'Validé', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-002', nom: 'CNI - Jean Dupont', categorie: 'Administratif', employe: 'Jean Dupont', dateAjout: '2020-03-15', statut: 'Validé', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-003', nom: 'Contrat de travail - Sophie Martin', categorie: 'Contrat', employe: 'Sophie Martin', dateAjout: '2021-09-01', statut: 'Validé', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-004', nom: 'Bulletin de Paie - Juin 2024 - Jean Dupont', categorie: 'Paie', employe: 'Jean Dupont', dateAjout: '2024-06-30', statut: 'Archivé', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-005', nom: 'Évaluation Annuelle 2023 - Sophie Martin', categorie: 'Évaluation', employe: 'Sophie Martin', dateAjout: '2024-01-15', statut: 'Validé', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-006', nom: 'Note de frais - Voyage Lyon', categorie: 'Administratif', employe: 'Sophie Martin', dateAjout: '2024-07-10', statut: 'En attente', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-007', nom: 'Bulletin de Paie - Juin 2024 - Sophie Martin', categorie: 'Paie', employe: 'Sophie Martin', dateAjout: '2024-06-30', statut: 'Archivé', fileUrl: 'https://placehold.co/800x1131.png' },
];

const ITEMS_PER_PAGE = 10;

// --- UTILS ---
const getStatusBadgeStyles = (status: DocumentStatus) => {
    switch (status) {
        case 'Validé': return 'bg-green-100 text-green-800 border-green-200';
        case 'En attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Archivé': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export default function DossiersAdministratifsPage() {
    const [documents, setDocuments] = useState(initialDocuments);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ categorie: 'all', statut: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const [previewingDoc, setPreviewingDoc] = useState<Document | null>(null);
    const { toast } = useToast();

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const searchMatch = doc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                doc.employe.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = filters.categorie === 'all' || doc.categorie === filters.categorie;
            const statusMatch = filters.statut === 'all' || doc.statut === filters.statut;
            return searchMatch && categoryMatch && statusMatch;
        });
    }, [documents, searchTerm, filters]);

    const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
    const paginatedDocuments = filteredDocuments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleDownloadDocument = (doc: Document) => {
        toast({ title: 'Simulation de téléchargement', description: `Le document ${doc.nom} serait téléchargé ici.` });
    };

    const kpiData = useMemo(() => ([
        { title: "Total Documents", value: documents.length.toString(), Icon: FileText, color: "text-blue-500" },
        { title: "Documents Récents (30j)", value: documents.filter(d => (new Date().getTime() - new Date(d.dateAjout).getTime()) < 30 * 24 * 60 * 60 * 1000).length.toString(), Icon: Clock, color: "text-green-500" },
        { title: "En attente de validation", value: documents.filter(d => d.statut === 'En attente').length.toString(), Icon: AlertTriangle, color: "text-yellow-500" },
        { title: "Archivés", value: documents.filter(d => d.statut === 'Archivé').length.toString(), Icon: CheckCircle, color: "text-gray-500" },
    ]), [documents]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Gestion Documentaire</CardTitle>
                            <CardDescription>Un hub centralisé pour tous les documents administratifs de l'entreprise.</CardDescription>
                        </div>
                        <Button onClick={() => toast({ title: "Fonctionnalité à venir" })}><Upload className="mr-2 h-4 w-4" /> Uploader un document</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        {kpiData.map(kpi => (
                            <Card key={kpi.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                    <kpi.Icon className={`h-5 w-5 ${kpi.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{kpi.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {/* Toolbar */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher un document ou un employé..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <Select value={filters.categorie} onValueChange={v => setFilters(f => ({...f, categorie: v}))}><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Toutes les catégories</SelectItem><SelectItem value="Contrat">Contrat</SelectItem><SelectItem value="Administratif">Administratif</SelectItem><SelectItem value="Paie">Paie</SelectItem><SelectItem value="Évaluation">Évaluation</SelectItem></SelectContent></Select>
                        <Select value={filters.statut} onValueChange={v => setFilters(f => ({...f, statut: v}))}><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem><SelectItem value="Validé">Validé</SelectItem><SelectItem value="En attente">En attente</SelectItem><SelectItem value="Archivé">Archivé</SelectItem></SelectContent></Select>
                    </div>
                    {/* Table */}
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Nom du Document</TableHead>
                            <TableHead className="text-center">Catégorie</TableHead>
                            <TableHead className="text-center">Employé</TableHead>
                            <TableHead className="text-center">Date d'ajout</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="w-[150px] text-center">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {paginatedDocuments.map(doc => (
                                <TableRow key={doc.id} className="odd:bg-muted/50">
                                    <TableCell className="font-medium">{doc.nom}</TableCell>
                                    <TableCell className="text-center"><Badge variant="outline">{doc.categorie}</Badge></TableCell>
                                    <TableCell className="text-center">{doc.employe}</TableCell>
                                    <TableCell className="text-center">{format(new Date(doc.dateAjout), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-center"><Badge className={getStatusBadgeStyles(doc.statut)}>{doc.statut}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setPreviewingDoc(doc)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc)}><Download className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-6">
                    <div className="text-sm text-muted-foreground">
                        Total de {filteredDocuments.length} documents. Page {currentPage} sur {totalPages}.
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Précédent</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Suivant</Button>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <Dialog open={!!previewingDoc} onOpenChange={() => setPreviewingDoc(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Aperçu: {previewingDoc?.nom}</DialogTitle>
                        <DialogDescription>Document de {previewingDoc?.employe}.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 bg-muted flex justify-center rounded-md">
                        <Image src={previewingDoc?.fileUrl || ''} data-ai-hint="document contract" alt="Aperçu du document" width={595} height={842} className="border shadow-md"/>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPreviewingDoc(null)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
