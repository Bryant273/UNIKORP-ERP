
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import {
    PlusCircle, Eye, Pencil, Trash2, Download, Search, FileUp, Loader2
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// --- TYPES & MOCK DATA ---
type DocumentCategory = 'RH' | 'Clients' | 'Fournisseurs' | 'Comptables' | 'Juridiques';
type DocumentStatus = 'Validé' | 'En attente' | 'Archivé';
type Document = {
    id: string;
    name: string;
    category: DocumentCategory;
    uploadDate: string;
    size: string;
    uploader: string;
    status: DocumentStatus;
    fileUrl: string;
};

const initialDocuments: Document[] = [
    { id: 'doc-1', name: 'Contrat - Jean Dupont.pdf', category: 'RH', uploadDate: '2024-07-30', size: '256 KB', uploader: 'Sophie Martin', status: 'Validé', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-2', name: 'Facture - TechCorp #INV-001.pdf', category: 'Clients', uploadDate: '2024-07-28', size: '128 KB', uploader: 'David Garcia', status: 'Validé', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-3', name: 'BC - Fournisseur Omega.pdf', category: 'Fournisseurs', uploadDate: '2024-07-29', size: '75 KB', uploader: 'David Garcia', status: 'En attente', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-4', name: 'Bilan Comptable 2023.pdf', category: 'Comptables', uploadDate: '2024-04-15', size: '1.2 MB', uploader: 'David Garcia', status: 'Archivé', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-5', name: 'Statuts de la société.pdf', category: 'Juridiques', uploadDate: '2024-01-10', size: '2.5 MB', uploader: 'Elodie Dubois', status: 'Validé', fileUrl: 'https://placehold.co/800x1131.png' },
    { id: 'doc-6', name: 'Fiche de paie - Juillet 2024.pdf', category: 'RH', uploadDate: '2024-07-31', size: '180 KB', uploader: 'Sophie Martin', status: 'Validé', fileUrl: 'https://placehold.co/800x1131.png' },
];

const ITEMS_PER_PAGE = 10;

// --- Main Component ---
export default function DossiersAdministratifsPage() {
    const { toast } = useToast();
    const [documents, setDocuments] = useState(initialDocuments);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ category: 'all', status: 'all' });

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);

    const [previewingDoc, setPreviewingDoc] = useState<Document | null>(null);
    const [docToDelete, setDocToDelete] = useState<Document | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const searchMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.uploader.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = filters.category === 'all' || doc.category === filters.category;
            const statusMatch = filters.status === 'all' || doc.status === filters.status;
            return searchMatch && categoryMatch && statusMatch;
        });
    }, [documents, searchTerm, filters]);

    const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE);
    const currentDocuments = filteredDocuments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleSaveDocument = (newDocData: Omit<Document, 'id'>, id?: string) => {
        if (id) {
            // Edit mode
            setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...newDocData } : d));
            toast({ title: 'Document modifié', description: 'Les informations du document ont été mises à jour.' });
        } else {
            // Create mode
            const newDocument: Document = {
                id: `doc-${Date.now()}`,
                ...newDocData,
            };
            setDocuments(prev => [newDocument, ...prev]);
            toast({ title: 'Document uploadé', description: `${newDocument.name} a été ajouté à la GED.` });
        }
    };

    const handleDelete = () => {
        if (docToDelete) {
            setDocuments(prev => prev.filter(d => d.id !== docToDelete.id));
            toast({ title: 'Document supprimé' });
            setDocToDelete(null);
        }
    };

    const getStatusBadgeVariant = (status: DocumentStatus) => {
        switch (status) {
            case 'Validé': return 'default';
            case 'En attente': return 'destructive';
            case 'Archivé': return 'secondary';
        }
    };
    
    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Gestion Électronique des Documents</CardTitle>
                            <CardDescription>Consultez, recherchez et gérez tous les documents de l'entreprise.</CardDescription>
                        </div>
                        <Button onClick={() => setIsUploadModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Uploader un document
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher un document..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <Select value={filters.category} onValueChange={v => setFilters(f => ({...f, category: v}))}><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Toutes les catégories</SelectItem><SelectItem value="RH">RH</SelectItem><SelectItem value="Clients">Clients</SelectItem><SelectItem value="Fournisseurs">Fournisseurs</SelectItem><SelectItem value="Comptables">Comptables</SelectItem><SelectItem value="Juridiques">Juridiques</SelectItem></SelectContent></Select>
                        <Select value={filters.status} onValueChange={v => setFilters(f => ({...f, status: v}))}><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem><SelectItem value="Validé">Validé</SelectItem><SelectItem value="En attente">En attente</SelectItem><SelectItem value="Archivé">Archivé</SelectItem></SelectContent></Select>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Nom du document</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Date d'ajout</TableHead>
                                <TableHead>Ajouté par</TableHead>
                                <TableHead>Taille</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="w-[150px] text-center">Actions</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {currentDocuments.map(doc => (
                                    <TableRow key={doc.id} className="odd:bg-muted/50">
                                        <TableCell className="font-medium">{doc.name}</TableCell>
                                        <TableCell><Badge variant="outline">{doc.category}</Badge></TableCell>
                                        <TableCell>{format(new Date(doc.uploadDate), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>{doc.uploader}</TableCell>
                                        <TableCell>{doc.size}</TableCell>
                                        <TableCell className="text-center"><Badge variant={getStatusBadgeVariant(doc.status)}>{doc.status}</Badge></TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => setPreviewingDoc(doc)}><Eye className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => { setEditingDocument(doc); setIsEditModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDocToDelete(doc)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
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

            <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSave={handleSaveDocument} />
            <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveDocument} document={editingDocument} />
            <PreviewModal isOpen={!!previewingDoc} onClose={() => setPreviewingDoc(null)} doc={previewingDoc} />
            <AlertDialog open={!!docToDelete} onOpenChange={() => setDocToDelete(null)}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// --- Modals Components ---

function UploadModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: any, id?: string) => void }) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState<DocumentCategory>('RH');

    const reset = () => {
        setIsUploading(false);
        setUploadProgress(0);
        setIsDragging(false);
        setFile(null);
        onClose();
    };

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) setFile(selectedFile);
    };
    
    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); if (!isUploading) setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setIsDragging(false);
        if (isUploading) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    const handleUpload = () => {
        if (!file) {
            toast({ title: 'Aucun fichier sélectionné', variant: 'destructive' });
            return;
        }
        setIsUploading(true);
        const interval = setInterval(() => {
            setUploadProgress(p => (p < 90 ? p + 10 : 90));
        }, 200);

        setTimeout(() => {
            clearInterval(interval);
            setUploadProgress(100);
            const newDocData = {
                name: file.name,
                category: category,
                uploadDate: new Date().toISOString(),
                size: `${(file.size / 1024).toFixed(2)} KB`,
                uploader: 'Utilisateur Actuel', // Mock data
                status: 'En attente',
                fileUrl: 'https://placehold.co/800x1131.png'
            };
            onSave(newDocData);
            setTimeout(reset, 500);
        }, 2200);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Uploader un nouveau document</DialogTitle>
                    <DialogDescription>Ajoutez un fichier à la GED et catégorisez-le.</DialogDescription>
                </DialogHeader>
                 <div className="grid gap-6 py-4">
                    <div onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop} className={cn("relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 hover:bg-muted/50", isDragging && "border-primary bg-primary/10", isUploading && "cursor-not-allowed opacity-50")}>
                        <Label htmlFor="file-upload" className={cn("flex flex-col items-center justify-center w-full h-full", isUploading ? "cursor-not-allowed" : "cursor-pointer")}>
                            <FileUp className="w-10 h-10 text-muted-foreground" />
                            <p className="mt-2 text-sm text-center text-muted-foreground"><span className="font-semibold">Glissez-déposez un fichier</span> ou cliquez</p>
                            {file && !isUploading && (<p className="mt-2 text-sm font-medium text-foreground">{file.name}</p>)}
                        </Label>
                        <Input id="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} disabled={isUploading} />
                    </div>
                    {isUploading && (<div className="space-y-2"><Progress value={uploadProgress} /><p className="text-sm text-center text-muted-foreground">Téléversement en cours... {Math.round(uploadProgress)}%</p></div>)}
                    <div className="space-y-2">
                        <Label htmlFor="category">Catégorie</Label>
                        <Select value={category} onValueChange={(v: DocumentCategory) => setCategory(v)} disabled={isUploading}><SelectTrigger id="category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RH">RH</SelectItem><SelectItem value="Clients">Clients</SelectItem><SelectItem value="Fournisseurs">Fournisseurs</SelectItem><SelectItem value="Comptables">Comptables</SelectItem><SelectItem value="Juridiques">Juridiques</SelectItem></SelectContent></Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={reset}>Annuler</Button>
                    <Button onClick={handleUpload} disabled={isUploading || !file}>{isUploading ? <Loader2 className="animate-spin" /> : 'Lancer l\'upload'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditModal({ isOpen, onClose, onSave, document }: { isOpen: boolean, onClose: () => void, onSave: (data: any, id?: string) => void, document: Document | null }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<DocumentCategory>('RH');

    React.useEffect(() => {
        if (document) {
            setName(document.name);
            setCategory(document.category);
        }
    }, [document]);

    const handleSubmit = () => {
        if (document) {
            onSave({ name, category }, document.id);
        }
        onClose();
    };

    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader><DialogTitle>Modifier le document</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2"><Label htmlFor="doc-name">Nom du document</Label><Input id="doc-name" value={name} onChange={e => setName(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="doc-category">Catégorie</Label><Select value={category} onValueChange={(v: DocumentCategory) => setCategory(v)}><SelectTrigger id="doc-category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="RH">RH</SelectItem><SelectItem value="Clients">Clients</SelectItem><SelectItem value="Fournisseurs">Fournisseurs</SelectItem><SelectItem value="Comptables">Comptables</SelectItem><SelectItem value="Juridiques">Juridiques</SelectItem></SelectContent></Select></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={onClose}>Annuler</Button><Button onClick={handleSubmit}>Enregistrer</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PreviewModal({ isOpen, onClose, doc }: { isOpen: boolean, onClose: () => void, doc: Document | null }) {
    if (!doc) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Aperçu: {doc.name}</DialogTitle></DialogHeader>
                <div className="py-4 bg-muted flex justify-center rounded-md">
                    <Image src={doc.fileUrl} alt="Document preview" data-ai-hint="document contract" width={595} height={842} className="border shadow-md"/>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => window.open(doc.fileUrl, '_blank')}><Download className="mr-2 h-4"/>Télécharger</Button><Button onClick={onClose}>Fermer</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
