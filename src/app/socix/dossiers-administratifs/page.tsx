
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { Eye, Download, Pencil, FolderKanban, File } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// --- DATA STRUCTURE & MOCK DATA ---

type Employee = {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
    poste: string;
    departement: string;
};

const initialEmployees: Employee[] = [
    { id: 'emp-001', matricule: 'UNIK-076', nom: 'Dupont', prenom: 'Jean', poste: 'Développeur Senior', departement: 'IT' },
    { id: 'emp-002', matricule: 'UNIK-077', nom: 'Martin', prenom: 'Sophie', poste: 'Chef de projet Marketing', departement: 'MARKOS' },
    { id: 'emp-003', matricule: 'UNIK-078', nom: 'Garcia', prenom: 'David', poste: 'Comptable', departement: 'SKOMPTAB' },
    { id: 'emp-004', matricule: 'UNIK-042', nom: 'Petit', prenom: 'Lucas', poste: 'Développeur Junior', departement: 'IT' },
    { id: 'emp-005', matricule: 'UNIK-055', nom: 'Leroy', prenom: 'Camille', poste: 'Gestionnaire RH', departement: 'SOCIX' },
];

type Document = {
    id: string;
    name: string;
    date: string;
    uploader: string;
    fileUrl: string;
};

// Generates mock documents for a given employee
const getMockDossierData = (employee: Employee) => ({
    'INFORMATIONS PERSONNELLES': [
        { label: 'État civil', value: `${employee.prenom} ${employee.nom}` },
        { label: 'Date/Lieu de naissance', value: `15/05/1985 / Abidjan` },
        { label: 'Nationalité', value: 'Ivoirienne' },
        { label: 'Adresse', value: `123 Rue de l'Exemple, Cocody` },
        { label: 'Situation familiale', value: `Marié(e), 2 enfant(s)` },
    ],
    'DONNÉES PROFESSIONNELLES': [
        { label: 'Matricule', value: employee.matricule },
        { label: 'Poste', value: employee.poste },
        { label: 'Département', value: employee.departement },
        { label: 'Supérieur direct', value: 'Directeur du département' },
    ],
    'DOCUMENTS CONTRACTUELS': [
        { id: 'doc-c1', name: 'Contrat de travail signé', date: '2020-03-15', uploader: 'Admin' },
        { id: 'doc-c2', name: 'Avenant - Passage Senior', date: '2022-04-01', uploader: 'Admin' },
    ],
    'DOCUMENTS ADMINISTRATIFS': [
        { id: 'doc-a1', name: 'Pièce d\'identité (CNI)', date: '2020-03-15', uploader: employee.nom },
        { id: 'doc-a2', name: 'RIB', date: '2020-03-15', uploader: employee.nom },
        { id: 'doc-a3', name: 'Diplôme Master', date: '2020-03-15', uploader: employee.nom },
    ],
    'GESTION SALARIALE': [
        { id: 'doc-s1', name: 'Bulletin de Paie - Juin 2024', date: '2024-06-30', uploader: 'System' },
        { id: 'doc-s2', name: 'Bulletin de Paie - Mai 2024', date: '2024-05-31', uploader: 'System' },
    ],
});

// --- MAIN PAGE COMPONENT ---
function DossiersAdministratifsContent() {
    const { toast } = useToast();
    const [dossierToView, setDossierToView] = useState<Employee | null>(null);

    const handleExploreDossier = (employee: Employee) => {
        setDossierToView(employee);
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Gestion des Dossiers Administratifs</CardTitle>
                            <CardDescription>Explorez et gérez les dossiers numériques de chaque employé.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employé</TableHead>
                                <TableHead>Matricule</TableHead>
                                <TableHead>Poste</TableHead>
                                <TableHead className="w-[200px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialEmployees.map((employee, index) => (
                                <TableRow key={employee.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                                    <TableCell className="font-medium">{employee.prenom} {employee.nom}</TableCell>
                                    <TableCell>{employee.matricule}</TableCell>
                                    <TableCell>{employee.poste}</TableCell>
                                    <TableCell className="text-center">
                                        <Button onClick={() => handleExploreDossier(employee)}>
                                            <FolderKanban className="mr-2 h-4 w-4" /> Gérer le dossier
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <DossierModal 
                employee={dossierToView} 
                isOpen={!!dossierToView} 
                onClose={() => setDossierToView(null)} 
            />
        </>
    );
}


// --- MODAL COMPONENTS ---

function DossierModal({ employee, isOpen, onClose }: { employee: Employee | null, isOpen: boolean, onClose: () => void }) {
    const { toast } = useToast();
    const [previewingDoc, setPreviewingDoc] = useState<Document | null>(null);

    if (!employee) return null;
    
    const dossierData = getMockDossierData(employee);

    const handleDownloadDocument = (docName: string) => {
        toast({ title: 'Simulation de téléchargement', description: `Le document ${docName} serait téléchargé ici.` });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Dossier Employé : {employee.prenom} {employee.nom}</DialogTitle>
                        <DialogDescription>Consultez et gérez tous les documents et informations relatives à l'employé.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <Accordion type="multiple" defaultValue={['INFORMATIONS PERSONNELLES']} className="w-full">
                            {Object.entries(dossierData).map(([category, items]) => (
                                <AccordionItem value={category} key={category}>
                                    <AccordionTrigger className="font-semibold text-base">{category}</AccordionTrigger>
                                    <AccordionContent>
                                        {Array.isArray(items) && items.length > 0 && 'name' in items[0] ? (
                                            <Table>
                                                <TableHeader><TableRow><TableHead>Nom du document</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                                <TableBody>
                                                    {(items as Document[]).map((doc) => (
                                                        <TableRow key={doc.id}>
                                                            <TableCell className="font-medium flex items-center gap-2"><File className="h-4 w-4 text-muted-foreground"/>{doc.name}</TableCell>
                                                            <TableCell>{format(new Date(doc.date), 'dd/MM/yyyy')}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="icon" onClick={() => setPreviewingDoc(doc)}><Eye className="h-4 w-4"/></Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc.name)}><Download className="h-4 w-4"/></Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm p-4">
                                                {(items as {label: string, value: string}[]).map((item) => (
                                                    <div key={item.label} className="flex justify-between border-b pb-1">
                                                        <span className="text-muted-foreground">{item.label}</span>
                                                        <span className="font-semibold">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DocumentPreviewModal 
                isOpen={!!previewingDoc} 
                onClose={() => setPreviewingDoc(null)} 
                document={previewingDoc} 
                employeeName={`${employee.prenom} ${employee.nom}`}
            />
        </>
    );
}

function DocumentPreviewModal({ isOpen, onClose, document, employeeName }: { isOpen: boolean; onClose: () => void; document: Document | null, employeeName: string }) {
    if (!document) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Aperçu: {document.name}</DialogTitle>
                    <DialogDescription>Document de {employeeName}.</DialogDescription>
                </DialogHeader>
                <div className="py-4 bg-muted flex justify-center rounded-md">
                    <Image src="https://placehold.co/800x1131.png" data-ai-hint="document contract" alt="Aperçu du document" width={595} height={842} className="border shadow-md"/>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function DossiersAdministratifsPage() {
    return <DossiersAdministratifsContent />;
}
