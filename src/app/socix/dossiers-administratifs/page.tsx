
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Eye, Trash2, Download, UploadCloud, Send } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// --- TYPES & MOCK DATA ---
type DocumentStatus = 'Reçu' | 'Manquant' | 'En attente';
type Document = {
    id: string;
    employeeName: string;
    employeeId: string;
    documentType: string;
    fileName?: string;
    uploadDate?: string;
    status: DocumentStatus;
};

const initialDocuments: Document[] = [
    { id: 'doc-01', employeeName: 'Jean Dupont', employeeId: 'emp-001', documentType: 'Contrat de travail', fileName: 'contrat_dupont.pdf', uploadDate: '2020-03-15', status: 'Reçu' },
    { id: 'doc-02', employeeName: 'Jean Dupont', employeeId: 'emp-001', documentType: 'Pièce d\'identité', fileName: 'cni_dupont.pdf', uploadDate: '2020-03-15', status: 'Reçu' },
    { id: 'doc-03', employeeName: 'Sophie Martin', employeeId: 'emp-002', documentType: 'Contrat de travail', fileName: 'contrat_martin.pdf', uploadDate: '2021-09-01', status: 'Reçu' },
    { id: 'doc-04', employeeName: 'Sophie Martin', employeeId: 'emp-002', documentType: 'Pièce d\'identité', status: 'Manquant' },
    { id: 'doc-05', employeeName: 'David Garcia', employeeId: 'emp-003', documentType: 'RIB', status: 'En attente' },
];

const mockEmployees = [
    { id: 'emp-001', name: 'Jean Dupont' },
    { id: 'emp-002', name: 'Sophie Martin' },
    { id: 'emp-003', name: 'David Garcia' },
];
const documentTypes = ['Contrat de travail', 'Pièce d\'identité', 'RIB', 'Attestation de sécurité sociale', 'Photo d\'identité'];

function DossiersAdministratifsContent() {
    const [documents, setDocuments] = useState(initialDocuments);
    const [docToDelete, setDocToDelete] = useState<Document | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewingDoc, setPreviewingDoc] = useState<Document | null>(null);
    const { toast } = useToast();

    const handleUpload = (formData: any) => {
        toast({ title: "Document ajouté (Simulation)", description: `Le fichier ${formData.file.name} a été associé.` });
        setIsUploadModalOpen(false);
    };

    const handleDelete = () => {
        if (docToDelete) {
            setDocuments(prev => prev.filter(d => d.id !== docToDelete.id));
            toast({ title: 'Document supprimé' });
            setDocToDelete(null);
        }
    };
    
    const sendReminder = (doc: Document) => {
        toast({
            title: 'Rappel envoyé',
            description: `Un rappel a été envoyé à ${doc.employeeName} pour le document manquant.`
        });
    };
    
    const handlePreview = (doc: Document) => {
        if (doc.status === 'Reçu') {
            setPreviewingDoc(doc);
            setIsPreviewModalOpen(true);
        } else {
            toast({ title: 'Document non disponible', variant: 'destructive' });
        }
    }

    const getStatusBadgeVariant = (status: DocumentStatus) => {
        switch (status) {
            case 'Reçu': return 'default';
            case 'Manquant': return 'destructive';
            case 'En attente': return 'secondary';
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Dossiers Administratifs</CardTitle>
                            <CardDescription>Centralisez et gérez tous les documents de vos collaborateurs.</CardDescription>
                        </div>
                        <Button onClick={() => setIsUploadModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un document</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employé</TableHead>
                                <TableHead>Type de document</TableHead>
                                <TableHead>Fichier</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-[200px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.employeeName}</TableCell>
                                    <TableCell>{d.documentType}</TableCell>
                                    <TableCell className="text-muted-foreground">{d.fileName || '---'}</TableCell>
                                    <TableCell className="text-center"><Badge variant={getStatusBadgeVariant(d.status)}>{d.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => handlePreview(d)} disabled={d.status !== 'Reçu'}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" disabled={d.status !== 'Reçu'}><Download className="h-4 w-4" /></Button>
                                            {d.status === 'Manquant' && <Button variant="ghost" size="icon" onClick={() => sendReminder(d)}><Send className="h-4 w-4" /></Button>}
                                            <Button variant="ghost" size="icon" onClick={() => setDocToDelete(d)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <UploadDocumentModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} />
            
            <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Aperçu: {previewingDoc?.fileName}</DialogTitle>
                        <DialogDescription>Document de {previewingDoc?.employeeName}.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Image src="/placeholder-doc.png" alt="Document preview" width={800} height={1131} className="rounded-md border"/>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!docToDelete} onOpenChange={() => setDocToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}


function UploadDocumentModal({ isOpen, onClose, onUpload }: { isOpen: boolean, onClose: () => void, onUpload: (data: any) => void }) {
    const [employeeId, setEmployeeId] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !employeeId || !documentType) return;
        onUpload({ employeeId, documentType, file });
    };
    
    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { handleDragEvents(e); setIsDragging(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) { setFile(e.dataTransfer.files[0]); }};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent><form onSubmit={handleSubmit}><DialogHeader><DialogTitle>Ajouter un document</DialogTitle></DialogHeader><div className="grid gap-4 py-4">
                <div className="space-y-2"><Label htmlFor="employeeId">Employé</Label><Select name="employeeId" onValueChange={setEmployeeId}><SelectTrigger><SelectValue placeholder="Sélectionner un employé..."/></SelectTrigger><SelectContent>{mockEmployees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="documentType">Type de document</Label><Select name="documentType" onValueChange={setDocumentType}><SelectTrigger><SelectValue placeholder="Sélectionner un type..."/></SelectTrigger><SelectContent>{documentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div className={cn("relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors", isDragging && "border-primary bg-primary/10")} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragEvents} onDrop={handleDrop}>
                    <UploadCloud className="w-10 h-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-center text-muted-foreground"><span className="font-semibold">Glissez-déposez</span> ou cliquez pour sélectionner</p>
                    {file && <p className="mt-2 text-sm font-medium text-foreground">{file.name}</p>}
                    <Input id="file-upload" type="file" className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
            </div><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Annuler</Button><Button type="submit" disabled={!file || !employeeId || !documentType}>Ajouter</Button></DialogFooter></form></DialogContent>
        </Dialog>
    );
}

export default function DossiersAdministratifsPage() {
    return <DossiersAdministratifsContent />
}
