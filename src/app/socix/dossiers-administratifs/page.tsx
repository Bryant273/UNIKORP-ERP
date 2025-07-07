
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import {
    Folder, FolderKanban, FolderHeart, FolderClock, FolderKey,
    ScanLine, ShieldCheck, Search, Workflow, History,
    HardDrive, Database, Server, Settings2, Package,
    Eye, Download
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

// --- MOCK DATA ---
const folderTypes = [
    { name: 'Dossiers RH', icon: FolderHeart, count: 125, lastUpdate: '2024-07-30', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', mockDocs: [
        { id: 'rh-1', name: 'Contrat - Jean Dupont.pdf', date: '2020-03-15', size: '256 KB' },
        { id: 'rh-2', name: 'Fiche de paie - Juillet 2024.pdf', date: '2024-07-31', size: '128 KB' },
        { id: 'rh-3', name: 'Évaluation annuelle - Sophie M..pdf', date: '2024-06-15', size: '180 KB' },
    ]},
    { name: 'Dossiers Clients', icon: FolderKanban, count: 48, lastUpdate: '2024-07-28', bgColor: 'bg-green-100', iconColor: 'text-green-600', mockDocs: [
        { id: 'cli-1', name: 'Contrat Cadre - TechCorp.pdf', date: '2023-01-10', size: '1.2 MB' },
        { id: 'cli-2', name: 'Facture FACT-088.pdf', date: '2024-07-20', size: '98 KB' },
    ]},
    { name: 'Dossiers Fournisseurs', icon: FolderClock, count: 72, lastUpdate: '2024-07-29', bgColor: 'bg-orange-100', iconColor: 'text-orange-600', mockDocs: [
        { id: 'fourn-1', name: 'BC_2024_150 - Fournisseur Omega.pdf', date: '2024-07-19', size: '75 KB' },
    ]},
    { name: 'Dossiers Comptables', icon: Folder, count: 1250, lastUpdate: '2024-07-31', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', mockDocs: [
        { id: 'compta-1', name: 'Justificatif - Note de frais #34.pdf', date: '2024-07-22', size: '55 KB' },
    ]},
    { name: 'Dossiers Juridiques', icon: FolderKey, count: 15, lastUpdate: '2024-05-10', bgColor: 'bg-red-100', iconColor: 'text-red-600', mockDocs: [
         { id: 'jur-1', name: 'Statuts de la société - Mise à jour.pdf', date: '2022-01-01', size: '2.5 MB' },
    ]},
];

const keyFeatures = [
    { name: 'Numérisation & Archivage', icon: ScanLine },
    { name: 'Droits d\'accès & Sécurité', icon: ShieldCheck },
    { name: 'Recherche Avancée', icon: Search },
    { name: 'Workflow de Validation', icon: Workflow },
    { name: 'Traçabilité des modifications', icon: History },
];

const technicalAspects = [
    { name: 'Formats Supportés', value: 'PDF, DOCX, XLSX, PNG, JPG', icon: Package },
    { name: 'Capacité de Stockage', value: '1 TB (85% utilisé)', icon: HardDrive },
    { name: 'Sauvegardes', value: 'Quotidiennes, chiffrées', icon: Database },
    { name: 'Intégration GED', value: 'API REST disponible', icon: Settings2 },
];

// --- Main Component ---
export default function DossiersAdministratifsPage() {
    const { toast } = useToast();
    const [explorationModal, setExplorationModal] = useState<{ isOpen: boolean; data: any }>({ isOpen: false, data: null });
    const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; doc: any }>({ isOpen: false, doc: null });

    const handleExplore = (folder: any) => {
        setExplorationModal({ isOpen: true, data: folder });
    };
    
    const handlePreview = (doc: any) => {
        setPreviewModal({ isOpen: true, doc });
    };

    return (
        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Gestion des Dossiers Administratifs</CardTitle>
                        <CardDescription>Vue d'ensemble de la gestion électronique des documents de l'entreprise.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {folderTypes.map(folder => (
                                <Card key={folder.name} className={`overflow-hidden ${folder.bgColor} border-0`}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{folder.name}</CardTitle>
                                        <folder.icon className={`h-6 w-6 ${folder.iconColor}`} />
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="text-2xl font-bold">{folder.count}</div>
                                        <p className="text-xs text-muted-foreground">Mis à jour le {format(new Date(folder.lastUpdate), 'dd/MM/yyyy')}</p>
                                        <Button size="sm" variant="link" className="p-0 h-auto mt-2" onClick={() => handleExplore(folder)}>Explorer</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Fonctionnalités Clés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {keyFeatures.map(f => (
                                    <li key={f.name} className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                            <f.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <span className="font-medium text-sm">{f.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    
                    <div className="md:col-span-2 space-y-6">
                         <Card>
                            <CardHeader><CardTitle>Défis et Bonnes Pratiques</CardTitle></CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="migration"><AccordionTrigger>Migration des archives papier</AccordionTrigger><AccordionContent>Planifier une stratégie de numérisation progressive pour assurer une transition en douceur sans perturber les opérations.</AccordionContent></AccordionItem>
                                    <AccordionItem value="formation"><AccordionTrigger>Formation des utilisateurs</AccordionTrigger><AccordionContent>Organiser des sessions de formation adaptées à chaque profil d'utilisateur pour garantir l'adoption et l'utilisation correcte de l'outil.</AccordionContent></AccordionItem>
                                    <AccordionItem value="rgpd"><AccordionTrigger>Respect de la réglementation (RGPD)</AccordionTrigger><AccordionContent>Assurer la conformité avec les réglementations sur la protection des données personnelles et les durées légales de conservation des documents.</AccordionContent></AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader><CardTitle>Spécifications Techniques</CardTitle></CardHeader>
                             <CardContent className="grid sm:grid-cols-2 gap-4">
                                {technicalAspects.map(t => (
                                    <div key={t.name} className="flex items-start gap-3 rounded-md border p-3">
                                         <t.icon className="h-5 w-5 mt-1 text-muted-foreground" />
                                         <div><p className="font-semibold text-sm">{t.name}</p><p className="text-sm text-muted-foreground">{t.value}</p></div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ExplorationModal 
                isOpen={explorationModal.isOpen} 
                onClose={() => setExplorationModal({isOpen: false, data: null})} 
                folder={explorationModal.data}
                onPreview={handlePreview}
            />
            <PreviewModal 
                isOpen={previewModal.isOpen} 
                onClose={() => setPreviewModal({isOpen: false, doc: null})} 
                doc={previewModal.doc}
            />
        </>
    );
}

// --- Modals Components ---

function ExplorationModal({ isOpen, onClose, folder, onPreview }: { isOpen: boolean, onClose: () => void, folder: any, onPreview: (doc: any) => void }) {
    if (!folder) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><folder.icon className={`h-6 w-6 ${folder.iconColor}`}/> {folder.name}</DialogTitle>
                    <DialogDescription>Liste des documents récents dans cette catégorie.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Table>
                        <TableHeader><TableRow><TableHead>Nom du document</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Taille</TableHead><TableHead className="w-[100px] text-center">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {folder.mockDocs.map((doc: any) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">{doc.name}</TableCell>
                                    <TableCell>{format(new Date(doc.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-right">{doc.size}</TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="ghost" size="icon" onClick={() => onPreview(doc)}><Eye className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon"><Download className="h-4 w-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PreviewModal({ isOpen, onClose, doc }: { isOpen: boolean, onClose: () => void, doc: any }) {
    if (!doc) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Aperçu: {doc.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4 bg-muted flex justify-center rounded-md">
                    <Image src="https://placehold.co/800x1131.png" alt="Document preview" data-ai-hint="document contract" width={595} height={842} className="border shadow-md"/>
                </div>
            </DialogContent>
        </Dialog>
    );
}
