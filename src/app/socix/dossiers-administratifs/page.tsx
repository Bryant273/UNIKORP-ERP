'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import {
    Eye, Download,
    FolderKanban, Briefcase, HandCoins, BookUser, Gavel, File, FolderArchive
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// --- DATA STRUCTURE & MOCK DATA ---

type Document = {
    id: string;
    name: string;
    date: string;
    uploader: string;
    fileUrl: string;
};

type DossierSubSection = {
    title: string;
    documents: Document[];
};

type DossierType = 'rh' | 'clients' | 'fournisseurs' | 'comptables' | 'juridiques';

type Dossier = {
    id: DossierType;
    name: string;
    description: string;
    icon: React.ElementType;
    docCount: number;
    lastUpdate: string;
    subSections: DossierSubSection[];
};

const MOCK_DOSSIERS: Dossier[] = [
    {
        id: 'rh',
        name: 'Dossiers RH',
        description: 'Contrats, paies, formations, évaluations...',
        icon: FolderKanban,
        docCount: 15,
        lastUpdate: '2024-07-31',
        subSections: [
            { title: 'Contrats', documents: [{ id: 'rh-c1', name: 'Contrat - Jean Dupont.pdf', date: '2020-03-15', uploader: 'Sophie Martin', fileUrl: 'https://placehold.co/800x1131.png' }] },
            { title: 'Fiches de paie', documents: [{ id: 'rh-p1', name: 'Paie Juillet 2024 - J. Dupont.pdf', date: '2024-07-31', uploader: 'David Garcia', fileUrl: 'https://placehold.co/800x1131.png' }] },
            { title: 'Formations', documents: [] },
            { title: 'Évaluations', documents: [{ id: 'rh-e1', name: 'Entretien annuel 2023 - J. Dupont.pdf', date: '2023-12-15', uploader: 'Elodie Dubois', fileUrl: 'https://placehold.co/800x1131.png' }] },
        ]
    },
    {
        id: 'clients',
        name: 'Dossiers Clients',
        description: 'Contrats, factures, correspondances...',
        icon: Briefcase,
        docCount: 8,
        lastUpdate: '2024-07-28',
        subSections: [
            { title: 'Contrats Commerciaux', documents: [{ id: 'cl-c1', name: 'Contrat Cadre - TechCorp.pdf', date: '2023-01-10', uploader: 'Sophie Martin', fileUrl: 'https://placehold.co/800x1131.png' }] },
            { title: 'Factures', documents: [{ id: 'cl-f1', name: 'Facture #FACT-088.pdf', date: '2024-07-20', uploader: 'David Garcia', fileUrl: 'https://placehold.co/800x1131.png' }] },
            { title: 'Correspondances', documents: [] },
        ]
    },
    {
        id: 'fournisseurs',
        name: 'Dossiers Fournisseurs',
        description: 'Contrats d\'achat, bons de commande...',
        icon: HandCoins,
        docCount: 12,
        lastUpdate: '2024-07-29',
        subSections: [
             { title: 'Contrats d\'achat', documents: [] },
             { title: 'Bons de commande', documents: [{ id: 'fo-bc1', name: 'BC-2024-07-015.pdf', date: '2024-07-15', uploader: 'David Garcia', fileUrl: 'https://placehold.co/800x1131.png' }] },
             { title: 'Factures fournisseurs', documents: [{ id: 'fo-f1', name: 'FACT-FOURN-AB123.pdf', date: '2024-07-22', uploader: 'David Garcia', fileUrl: 'https://placehold.co/800x1131.png' }] },
        ]
    },
    {
        id: 'comptables',
        name: 'Dossiers Comptables',
        description: 'Pièces justificatives, déclarations...',
        icon: BookUser,
        docCount: 42,
        lastUpdate: '2024-07-25',
        subSections: [
            { title: 'Pièces Justificatives', documents: [] },
            { title: 'Déclarations Fiscales', documents: [{ id: 'co-df1', name: 'TVA_Juin_2024.pdf', date: '2024-07-20', uploader: 'David Garcia', fileUrl: 'https://placehold.co/800x1131.png' }] },
        ]
    },
    {
        id: 'juridiques',
        name: 'Dossiers Juridiques',
        description: 'Statuts, litiges, conformité...',
        icon: Gavel,
        docCount: 5,
        lastUpdate: '2024-01-10',
        subSections: [
            { title: 'Statuts & PV d\'AG', documents: [{ id: 'ju-s1', name: 'Statuts_UNIKORP_2024.pdf', date: '2024-01-10', uploader: 'Elodie Dubois', fileUrl: 'https://placehold.co/800x1131.png' }] },
            { title: 'Litiges', documents: [] },
            { title: 'Conformité (RGPD, etc.)', documents: [] },
        ]
    }
];

// --- Main Component ---
export default function DossiersAdministratifsPage() {
    const { toast } = useToast();
    const [viewingDossier, setViewingDossier] = useState<Dossier | null>(null);
    const [previewingDoc, setPreviewingDoc] = useState<Document | null>(null);

    const handleExploreDossier = (dossier: Dossier) => {
        setViewingDossier(dossier);
    };

    const handlePreviewDocument = (doc: Document) => {
        setPreviewingDoc(doc);
    };

    const handleDownloadDocument = (doc: Document) => {
        window.open(doc.fileUrl, '_blank');
        toast({ title: 'Téléchargement lancé', description: doc.name });
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Dossiers Administratifs</CardTitle>
                            <CardDescription>Explorez et gérez les dossiers numériques de l'entreprise.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {MOCK_DOSSIERS.map((dossier) => (
                        <Card key={dossier.id}>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                <div className="p-3 rounded-full bg-primary/10 text-primary">
                                    <dossier.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{dossier.name}</CardTitle>
                                    <CardDescription>{dossier.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="text-sm text-muted-foreground">
                                    <p>{dossier.docCount} documents</p>
                                    <p>Dernière màj: {format(new Date(dossier.lastUpdate), 'dd/MM/yyyy')}</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleExploreDossier(dossier)}>
                                    <FolderArchive className="mr-2 h-4 w-4" /> Explorer
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>

            <Dialog open={!!viewingDossier} onOpenChange={(open) => !open && setViewingDossier(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{viewingDossier?.name}</DialogTitle>
                        <DialogDescription>{viewingDossier?.description}</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-4 -mr-6">
                        <Accordion type="multiple" defaultValue={[viewingDossier?.subSections[0]?.title || '']} className="w-full">
                            {viewingDossier?.subSections.map((sub) => (
                                <AccordionItem value={sub.title} key={sub.title}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2">
                                            {sub.title} <Badge variant="secondary">{sub.documents.length}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {sub.documents.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow><TableHead>Nom</TableHead><TableHead>Date</TableHead><TableHead>Par</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {sub.documents.map(doc => (
                                                        <TableRow key={doc.id}>
                                                            <TableCell className="font-medium flex items-center gap-2"><File className="h-4 w-4 text-muted-foreground"/>{doc.name}</TableCell>
                                                            <TableCell>{format(new Date(doc.date), 'dd/MM/yyyy')}</TableCell>
                                                            <TableCell>{doc.uploader}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="icon" onClick={() => handlePreviewDocument(doc)}><Eye className="h-4 w-4"/></Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc)}><Download className="h-4 w-4"/></Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="text-center text-sm text-muted-foreground py-4">
                                                Aucun document dans cette section.
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewingDossier(null)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!previewingDoc} onOpenChange={() => setPreviewingDoc(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Aperçu: {previewingDoc?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 bg-muted flex justify-center rounded-md">
                        {previewingDoc && <Image src={previewingDoc.fileUrl} alt="Aperçu du document" data-ai-hint="document" width={595} height={842} className="border shadow-md" />}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPreviewingDoc(null)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
