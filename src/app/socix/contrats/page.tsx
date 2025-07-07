
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Eye, Pencil, Repeat, FileSignature, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// --- TYPES & MOCK DATA ---
type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Apprentissage';
type ContractStatus = 'Actif' | 'Expiré' | 'Terminé' | 'En attente' | 'Archivé';
type ContractVariables = {
    id: string;
    employeeId: string;
    employeeName: string;
    status: ContractStatus;
    // ---
    ENTREPRISE_NOM: string;
    ENTREPRISE_FORME: string;
    ENTREPRISE_ADRESSE: string;
    ENTREPRISE_SIRET: string;
    ENTREPRISE_APE: string;
    REPRESENTANT_NOM: string;
    REPRESENTANT_FONCTION: string;
    EMPLOYE_NOM: string;
    EMPLOYE_PRENOM: string;
    EMPLOYE_DATE_NAISSANCE: string;
    EMPLOYE_LIEU_NAISSANCE: string;
    EMPLOYE_ADRESSE: string;
    EMPLOYE_NUM_SECU: string;
    EMPLOYE_NATIONALITE: string;
    TYPE_CONTRAT: ContractType;
    CONVENTION_COLLECTIVE: string;
    DATE_DEBUT: string;
    DATE_FIN?: string;
    MOTIF_CDD?: string;
    SI_PERIODE_ESSAI: boolean;
    DUREE_ESSAI?: string;
    DUREE_RENOUVELLEMENT_ESSAI?: string;
    FONCTION: string;
    QUALIFICATION_PROFESSIONNELLE: string;
    CLASSIFICATION: string;
    COEFFICIENT: string;
    SUPERIEUR_HIERARCHIQUE: string;
    LIEU_TRAVAIL: string;
    SI_DEPLACEMENT: boolean;
    ZONE_DEPLACEMENT?: string;
    HORAIRES_TRAVAIL: string;
    DUREE_HEBDOMADAIRE: string;
    JOURS_REPOS: string;
    SI_TEMPS_PARTIEL: boolean;
    NOMBRE_HEURES_PARTIEL?: string;
    REPARTITION_HORAIRES?: string;
    SALAIRE_BASE: number;
    PERIODICITE_SALAIRE: 'mensuel' | 'annuel';
    SI_PRIMES: boolean;
    LISTE_PRIMES?: string;
    SI_AVANTAGES_NATURE: boolean;
    LISTE_AVANTAGES?: string;
    DATE_VERSEMENT: string;
    MODE_PAIEMENT: string;
    NOMBRE_JOURS_CONGES: number;
    PERIODE_CONGES: string;
    SI_FORMATION_INITIALE: boolean;
    DUREE_FORMATION?: string;
    OBLIGATIONS_SUPPLEMENTAIRES: string;
    SI_NON_CONCURRENCE: boolean;
    DUREE_NON_CONCURRENCE?: string;
    SECTEURS_CONCERNES?: string;
    ZONE_NON_CONCURRENCE?: string;
    MONTANT_CONTREPARTIE?: string;
    SI_CDI: boolean;
    DUREE_PREAVIS?: string;
    SI_CDD: boolean;
    LIEU_SIGNATURE: string;
    DATE_SIGNATURE: string;
    SIGNATURE_EMPLOYEUR: string;
    SIGNATURE_EMPLOYE: string;
    DATE_REMISE: string;
    DATE_DPAE: string;
    DATE_VISITE_MEDICALE: string;
};

const initialContracts: ContractVariables[] = [
    { id: 'c-001', employeeId: 'emp-001', employeeName: 'Jean Dupont', status: 'Actif', TYPE_CONTRAT: 'CDI', DATE_DEBUT: '2020-03-15', FONCTION: 'Développeur Senior', SALAIRE_BASE: 350000, SI_CDI: true, SI_CDD: false, ENTREPRISE_NOM: 'UNIKORP', ENTREPRISE_FORME: 'SAS', ENTREPRISE_ADRESSE: 'Abidjan, Côte d\'Ivoire', ENTREPRISE_SIRET: 'CI-ABJ-2024-B-12345', ENTREPRISE_APE: '6201Z', REPRESENTANT_NOM: 'Elodie Dubois', REPRESENTANT_FONCTION: 'PDG', EMPLOYE_NOM: 'Dupont', EMPLOYE_PRENOM: 'Jean', EMPLOYE_DATE_NAISSANCE: '1985-05-15', EMPLOYE_LIEU_NAISSANCE: 'Abidjan', EMPLOYE_ADRESSE: 'Cocody', EMPLOYE_NUM_SECU: '1 85 05 99 123 456 78', EMPLOYE_NATIONALITE: 'Ivoirienne', CONVENTION_COLLECTIVE: 'Syntec', SI_PERIODE_ESSAI: true, DUREE_ESSAI: '3 mois', QUALIFICATION_PROFESSIONNELLE: 'Cadre', CLASSIFICATION: '2.2', COEFFICIENT: '130', SUPERIEUR_HIERARCHIQUE: 'Directeur Technique', LIEU_TRAVAIL: 'Siège social', SI_DEPLACEMENT: false, HORAIRES_TRAVAIL: '9h-18h', DUREE_HEBDOMADAIRE: '40', JOURS_REPOS: 'Samedi, Dimanche', SI_TEMPS_PARTIEL: false, PERIODICITE_SALAIRE: 'mensuel', SI_PRIMES: false, SI_AVANTAGES_NATURE: false, DATE_VERSEMENT: 'le 28 de chaque mois', MODE_PAIEMENT: 'virement bancaire', NOMBRE_JOURS_CONGES: 30, PERIODE_CONGES: '1er Janvier au 31 Décembre', SI_FORMATION_INITIALE: false, OBLIGATIONS_SUPPLEMENTAIRES: 'Respecter la charte informatique.', SI_NON_CONCURRENCE: false, DUREE_PREAVIS: '3 mois', LIEU_SIGNATURE: 'Abidjan', DATE_SIGNATURE: '15/03/2020', SIGNATURE_EMPLOYEUR: 'Elodie Dubois', SIGNATURE_EMPLOYE: 'Jean Dupont', DATE_REMISE: '15/03/2020', DATE_DPAE: '14/03/2020', DATE_VISITE_MEDICALE: '18/03/2020' },
    { id: 'c-002', employeeId: 'emp-002', employeeName: 'Sophie Martin', status: 'Actif', TYPE_CONTRAT: 'CDI', DATE_DEBUT: '2021-09-01', FONCTION: 'Chef de projet Marketing', SALAIRE_BASE: 320000, SI_CDI: true, SI_CDD: false, ENTREPRISE_NOM: 'UNIKORP', ENTREPRISE_FORME: 'SAS', ENTREPRISE_ADRESSE: 'Abidjan, Côte d\'Ivoire', ENTREPRISE_SIRET: 'CI-ABJ-2024-B-12345', ENTREPRISE_APE: '6201Z', REPRESENTANT_NOM: 'Elodie Dubois', REPRESENTANT_FONCTION: 'PDG', EMPLOYE_NOM: 'Martin', EMPLOYE_PRENOM: 'Sophie', EMPLOYE_DATE_NAISSANCE: '1990-11-20', EMPLOYE_LIEU_NAISSANCE: 'Bouaké', EMPLOYE_ADRESSE: 'Marcory', EMPLOYE_NUM_SECU: '2 90 11 98 765 432 10', EMPLOYE_NATIONALITE: 'Ivoirienne', CONVENTION_COLLECTIVE: 'Syntec', SI_PERIODE_ESSAI: false, QUALIFICATION_PROFESSIONNELLE: 'Cadre', CLASSIFICATION: '2.1', COEFFICIENT: '115', SUPERIEUR_HIERARCHIQUE: 'Directeur Marketing', LIEU_TRAVAIL: 'Siège social', SI_DEPLACEMENT: true, ZONE_DEPLACEMENT: 'territoire national', HORAIRES_TRAVAIL: '9h-18h', DUREE_HEBDOMADAIRE: '40', JOURS_REPOS: 'Samedi, Dimanche', SI_TEMPS_PARTIEL: false, PERIODICITE_SALAIRE: 'mensuel', SI_PRIMES: false, SI_AVANTAGES_NATURE: false, DATE_VERSEMENT: 'le 28 de chaque mois', MODE_PAIEMENT: 'virement bancaire', NOMBRE_JOURS_CONGES: 30, PERIODE_CONGES: '1er Janvier au 31 Décembre', SI_FORMATION_INITIALE: false, OBLIGATIONS_SUPPLEMENTAIRES: '', SI_NON_CONCURRENCE: false, DUREE_PREAVIS: '3 mois', LIEU_SIGNATURE: 'Abidjan', DATE_SIGNATURE: '01/09/2021', SIGNATURE_EMPLOYEUR: 'Elodie Dubois', SIGNATURE_EMPLOYE: 'Sophie Martin', DATE_REMISE: '01/09/2021', DATE_DPAE: '31/08/2021', DATE_VISITE_MEDICALE: '03/09/2021' },
    { id: 'c-003', employeeId: 'emp-003', employeeName: 'David Garcia', status: 'Terminé', TYPE_CONTRAT: 'CDD', DATE_DEBUT: '2024-01-20', DATE_FIN: '2024-07-19', FONCTION: 'Comptable', SALAIRE_BASE: 280000, SI_CDI: false, SI_CDD: true, ENTREPRISE_NOM: 'UNIKORP', ENTREPRISE_FORME: 'SAS', ENTREPRISE_ADRESSE: 'Abidjan, Côte d\'Ivoire', ENTREPRISE_SIRET: 'CI-ABJ-2024-B-12345', ENTREPRISE_APE: '6201Z', REPRESENTANT_NOM: 'Elodie Dubois', REPRESENTANT_FONCTION: 'PDG', EMPLOYE_NOM: 'Garcia', EMPLOYE_PRENOM: 'David', EMPLOYE_DATE_NAISSANCE: '1992-02-25', EMPLOYE_LIEU_NAISSANCE: 'Yamoussoukro', EMPLOYE_ADRESSE: 'Plateau', EMPLOYE_NUM_SECU: '1 92 02 97 654 321 09', EMPLOYE_NATIONALITE: 'Française', CONVENTION_COLLECTIVE: 'Syntec', SI_PERIODE_ESSAI: false, QUALIFICATION_PROFESSIONNELLE: 'Technicien', CLASSIFICATION: '1.2', COEFFICIENT: '95', SUPERIEUR_HIERARCHIQUE: 'Directeur Financier', LIEU_TRAVAIL: 'Siège social', SI_DEPLACEMENT: false, HORAIRES_TRAVAIL: '9h-18h', DUREE_HEBDOMADAIRE: '40', JOURS_REPOS: 'Samedi, Dimanche', SI_TEMPS_PARTIEL: false, PERIODICITE_SALAIRE: 'mensuel', SI_PRIMES: false, SI_AVANTAGES_NATURE: false, DATE_VERSEMENT: 'le 28 de chaque mois', MODE_PAIEMENT: 'virement bancaire', NOMBRE_JOURS_CONGES: 30, PERIODE_CONGES: '1er Janvier au 31 Décembre', SI_FORMATION_INITIALE: false, OBLIGATIONS_SUPPLEMENTAIRES: '', SI_NON_CONCURRENCE: false, LIEU_SIGNATURE: 'Abidjan', DATE_SIGNATURE: '20/01/2024', SIGNATURE_EMPLOYEUR: 'Elodie Dubois', SIGNATURE_EMPLOYE: 'David Garcia', DATE_REMISE: '20/01/2024', DATE_DPAE: '19/01/2024', DATE_VISITE_MEDICALE: '22/01/2024' },
];

function ContratsContent() {
    const [contracts, setContracts] = useState(initialContracts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ mode: 'create' | 'edit' | 'view' | 'renew', contract: Partial<ContractVariables> | null }>({ mode: 'create', contract: null });
    const { toast } = useToast();

    const openModal = (mode: 'create' | 'edit' | 'view' | 'renew', contract: Partial<ContractVariables> | null) => {
        setModalConfig({ mode, contract });
        setIsModalOpen(true);
    };

    const handleSave = (formData: ContractVariables) => {
        if (modalConfig.mode === 'edit' && modalConfig.contract?.id) {
            setContracts(prev => prev.map(c => c.id === modalConfig.contract!.id ? { ...c, ...formData } : c));
            toast({ title: 'Contrat modifié' });
        } else if (modalConfig.mode === 'renew' && modalConfig.contract?.id) {
             // Archive old contract
            setContracts(prev => prev.map(c => c.id === modalConfig.contract!.id ? { ...c, status: 'Archivé' } : c));
             // Create new one
            const newContract: ContractVariables = { ...formData, id: `c-${Date.now()}`, status: 'Actif' };
            setContracts(prev => [newContract, ...prev]);
            toast({ title: 'Contrat renouvelé', description: "L'ancien contrat a été archivé." });
        }
        else {
            const newContract: ContractVariables = { ...formData, id: `c-${Date.now()}`, status: 'En attente' };
            setContracts(prev => [newContract, ...prev]);
            toast({ title: 'Nouveau contrat créé' });
        }
        setIsModalOpen(false);
    };

    const getStatusBadgeVariant = (status: ContractStatus) => {
        switch (status) {
            case 'Actif': return 'default';
            case 'Expiré': return 'destructive';
            case 'Terminé':
            case 'Archivé':
                 return 'secondary';
            case 'En attente': return 'outline';
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Gestion des Contrats</CardTitle>
                            <CardDescription>Gérez les contrats de travail de vos employés.</CardDescription>
                        </div>
                        <Button onClick={() => openModal('create', null)}><PlusCircle className="mr-2 h-4 w-4" /> Nouveau contrat</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Employé</TableHead><TableHead>Type</TableHead><TableHead>Début</TableHead><TableHead>Fin</TableHead><TableHead className="text-center">Statut</TableHead><TableHead className="text-center w-[200px]">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {contracts.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.employeeName}</TableCell>
                                    <TableCell>{c.TYPE_CONTRAT}</TableCell>
                                    <TableCell>{format(new Date(c.DATE_DEBUT), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{c.DATE_FIN ? format(new Date(c.DATE_FIN), 'dd/MM/yyyy') : '---'}</TableCell>
                                    <TableCell className="text-center"><Badge variant={getStatusBadgeVariant(c.status)}>{c.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => openModal('view', c)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => openModal('edit', c)}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => openModal('renew', c)}><Repeat className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <ContractModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} config={modalConfig} />
        </>
    );
}

function ContractModal({ isOpen, onClose, onSave, config }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, config: { mode: 'create' | 'edit' | 'view' | 'renew', contract: Partial<ContractVariables> | null } }) {
    const [formData, setFormData] = useState<Partial<ContractVariables>>({});

    useEffect(() => {
        setFormData(config.contract || {});
    }, [config, isOpen]);
    
    const isReadOnly = config.mode === 'view';

    if (isReadOnly) {
        return <ViewContractModal isOpen={isOpen} onClose={onClose} contract={config.contract as ContractVariables} />;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
    };

    const handleSelectChange = (name: keyof ContractVariables, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const getModalTitle = () => {
        switch(config.mode) {
            case 'create': return 'Nouveau Contrat';
            case 'edit': return `Modifier le contrat de ${config.contract?.employeeName}`;
            case 'renew': return `Renouveler le contrat de ${config.contract?.employeeName}`;
            default: return 'Contrat';
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader>
                        <DialogTitle>{getModalTitle()}</DialogTitle>
                        <DialogDescription>Remplissez les variables du contrat. Le document sera généré automatiquement.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 py-4 pr-6">
                        <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Parties</AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                    <h4 className="font-semibold text-muted-foreground">Employeur</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Dénomination sociale</Label><Input name="ENTREPRISE_NOM" value={formData.ENTREPRISE_NOM || ''} onChange={handleChange} /></div>
                                        <div className="space-y-1"><Label>Forme juridique</Label><Input name="ENTREPRISE_FORME" value={formData.ENTREPRISE_FORME || ''} onChange={handleChange} /></div>
                                        <div className="col-span-2 space-y-1"><Label>Adresse</Label><Textarea name="ENTREPRISE_ADRESSE" value={formData.ENTREPRISE_ADRESSE || ''} onChange={handleChange} /></div>
                                    </div>
                                    <h4 className="font-semibold text-muted-foreground">Employé</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Nom</Label><Input name="EMPLOYE_NOM" value={formData.EMPLOYE_NOM || ''} onChange={handleChange} /></div>
                                        <div className="space-y-1"><Label>Prénom</Label><Input name="EMPLOYE_PRENOM" value={formData.EMPLOYE_PRENOM || ''} onChange={handleChange} /></div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Clauses Principales</AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                     <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1"><Label>Type de Contrat</Label><Select name="TYPE_CONTRAT" value={formData.TYPE_CONTRAT} onValueChange={(v: ContractType) => handleSelectChange('TYPE_CONTRAT', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CDI">CDI</SelectItem><SelectItem value="CDD">CDD</SelectItem><SelectItem value="Stage">Stage</SelectItem><SelectItem value="Apprentissage">Apprentissage</SelectItem></SelectContent></Select></div>
                                        <div className="space-y-1"><Label>Date de début</Label><Input name="DATE_DEBUT" type="date" value={formData.DATE_DEBUT || ''} onChange={handleChange} /></div>
                                        {formData.TYPE_CONTRAT !== 'CDI' && <div className="space-y-1"><Label>Date de fin</Label><Input name="DATE_FIN" type="date" value={formData.DATE_FIN || ''} onChange={handleChange} /></div>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-1"><Label>Fonction</Label><Input name="FONCTION" value={formData.FONCTION || ''} onChange={handleChange} /></div>
                                         <div className="space-y-1"><Label>Supérieur hiérarchique</Label><Input name="SUPERIEUR_HIERARCHIQUE" value={formData.SUPERIEUR_HIERARCHIQUE || ''} onChange={handleChange} /></div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>Rémunération & Conditions</AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Salaire de base</Label><Input name="SALAIRE_BASE" type="number" value={formData.SALAIRE_BASE || ''} onChange={handleChange} /></div>
                                        <div className="space-y-1"><Label>Périodicité</Label><Select name="PERIODICITE_SALAIRE" value={formData.PERIODICITE_SALAIRE} onValueChange={(v: 'mensuel'|'annuel') => handleSelectChange('PERIODICITE_SALAIRE', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mensuel">Mensuel</SelectItem><SelectItem value="annuel">Annuel</SelectItem></SelectContent></Select></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1"><Label>Horaires de travail</Label><Input name="HORAIRES_TRAVAIL" value={formData.HORAIRES_TRAVAIL || ''} onChange={handleChange} /></div>
                                        <div className="space-y-1"><Label>Durée hebdomadaire</Label><Input name="DUREE_HEBDOMADAIRE" value={formData.DUREE_HEBDOMADAIRE || ''} onChange={handleChange} /></div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </ScrollArea>
                    <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ViewContractModal({ isOpen, onClose, contract }: { isOpen: boolean, onClose: () => void, contract: ContractVariables }) {
    const { toast } = useToast();

    const handlePrint = () => {
        const doc = new jsPDF();
        let y = 50; 
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const pageContentWidth = doc.internal.pageSize.getWidth() - margin * 2;
    
        const addText = (text: string, options: any = {}) => {
            const splitText = doc.splitTextToSize(text, pageContentWidth);
            const textHeight = doc.getTextDimensions(splitText).h;
            if (y + textHeight > pageHeight - margin) { doc.addPage(); drawHeader(); }
            doc.text(splitText, margin, y, options);
            y += textHeight + 4;
        };

        const addTitle = (text: string) => { 
            doc.setFontSize(14).setFont('helvetica', 'bold'); 
            addText(text); 
            doc.setFontSize(10).setFont('helvetica', 'normal'); 
        };
        
        const drawHeader = () => {
            doc.setFontSize(18).text('CONTRAT DE TRAVAIL', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' }); 
            y += 10;
        }

        drawHeader();
        
        addTitle('Entre les soussignés :');
        addText(`L'EMPLOYEUR :\nDénomination sociale : ${contract.ENTREPRISE_NOM}\nAdresse : ${contract.ENTREPRISE_ADRESSE}\nReprésenté par : ${contract.REPRESENTANT_NOM}, ${contract.REPRESENTANT_FONCTION}`);
        addText(`L'EMPLOYÉ :\nNom : ${contract.EMPLOYE_NOM}\nPrénom : ${contract.EMPLOYE_PRENOM}\nDate de naissance : ${format(new Date(contract.DATE_DEBUT), 'dd/MM/yyyy')}\nAdresse : ${contract.EMPLOYE_ADRESSE}`);
        
        addTitle('ARTICLE 1 - NATURE DU CONTRAT');
        addText(`Il est conclu un contrat à durée ${contract.TYPE_CONTRAT}.`);
        
        doc.save(`contrat_${contract.employeeName.replace(/\s/g, '_')}.pdf`);
        toast({ title: 'PDF du contrat généré.' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Aperçu du Contrat de Travail</DialogTitle>
                    <DialogDescription>Contrat pour {contract.employeeName}.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 p-6 border rounded-lg bg-muted/50 font-serif text-sm">
                    <div className="bg-white p-8 max-w-3xl mx-auto shadow-lg">
                        <h1 className="text-2xl font-bold text-center mb-6">CONTRAT DE TRAVAIL</h1>
                        <h2 className="font-bold mb-2">Entre les soussignés :</h2>
                        <div className="mb-4 pl-4">
                            <h3 className="font-semibold">L'EMPLOYEUR :</h3>
                            <p>Dénomination sociale : {contract.ENTREPRISE_NOM}</p>
                            <p>Adresse du siège social : {contract.ENTREPRISE_ADRESSE}</p>
                            <p>Représenté par : {contract.REPRESENTANT_NOM}, {contract.REPRESENTANT_FONCTION}</p>
                        </div>
                        <div className="mb-4 pl-4">
                            <h3 className="font-semibold">L'EMPLOYÉ :</h3>
                            <p>Nom : {contract.EMPLOYE_NOM}</p>
                            <p>Prénom : {contract.EMPLOYE_PRENOM}</p>
                            <p>Date de naissance : {format(new Date(contract.DATE_DEBUT), 'dd/MM/yyyy')}</p>
                            <p>Adresse : {contract.EMPLOYE_ADRESSE}</p>
                        </div>
                         <Separator className="my-6" />
                        <div className="space-y-4">
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 1 - NATURE DU CONTRAT</h3><p>Il est conclu entre les parties un contrat de travail à durée {contract.TYPE_CONTRAT}.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 2 - FONCTION</h3><p>Le salarié est engagé en qualité de {contract.FONCTION}.</p></div>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4"/>Imprimer le contrat</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ContratsPage() {
    return <ContratsContent />;
}

    