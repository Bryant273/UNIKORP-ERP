
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
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Logo } from '@/components/logo';

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
    { id: 'c-001', employeeId: 'emp-001', employeeName: 'Jean Dupont', status: 'Actif', TYPE_CONTRAT: 'CDI', DATE_DEBUT: '2020-03-15', FONCTION: 'Développeur Senior', SALAIRE_BASE: 350000, SI_CDI: true, SI_CDD: false, ENTREPRISE_NOM: 'UNIKORP', ENTREPRISE_FORME: 'SAS', ENTREPRISE_ADRESSE: 'Abidjan, Côte d\'Ivoire', ENTREPRISE_SIRET: 'CI-ABJ-2024-B-12345', ENTREPRISE_APE: '6201Z', REPRESENTANT_NOM: 'Elodie Dubois', REPRESENTANT_FONCTION: 'PDG', EMPLOYE_NOM: 'Dupont', EMPLOYE_PRENOM: 'Jean', EMPLOYE_DATE_NAISSANCE: '1985-05-15', EMPLOYE_LIEU_NAISSANCE: 'Abidjan', EMPLOYE_ADRESSE: 'Cocody', EMPLOYE_NUM_SECU: '1 85 05 99 123 456 78', EMPLOYE_NATIONALITE: 'Ivoirienne', CONVENTION_COLLECTIVE: 'Syntec', SI_PERIODE_ESSAI: true, DUREE_ESSAI: '3 mois', DUREE_RENOUVELLEMENT_ESSAI: '3 mois', QUALIFICATION_PROFESSIONNELLE: 'Cadre', CLASSIFICATION: '2.2', COEFFICIENT: '130', SUPERIEUR_HIERARCHIQUE: 'Directeur Technique', LIEU_TRAVAIL: 'Siège social', SI_DEPLACEMENT: false, HORAIRES_TRAVAIL: '9h-18h', DUREE_HEBDOMADAIRE: '40', JOURS_REPOS: 'Samedi, Dimanche', SI_TEMPS_PARTIEL: false, PERIODICITE_SALAIRE: 'mensuel', SI_PRIMES: false, SI_AVANTAGES_NATURE: false, DATE_VERSEMENT: 'le 28 de chaque mois', MODE_PAIEMENT: 'virement bancaire', NOMBRE_JOURS_CONGES: 30, PERIODE_CONGES: '1er Janvier au 31 Décembre', SI_FORMATION_INITIALE: false, OBLIGATIONS_SUPPLEMENTAIRES: 'Respecter la charte informatique.', SI_NON_CONCURRENCE: false, DUREE_PREAVIS: '3 mois', LIEU_SIGNATURE: 'Abidjan', DATE_SIGNATURE: '2020-03-15', SIGNATURE_EMPLOYEUR: 'Elodie Dubois', SIGNATURE_EMPLOYE: 'Jean Dupont', DATE_REMISE: '2020-03-15', DATE_DPAE: '2020-03-14', DATE_VISITE_MEDICALE: '2020-03-18' },
    { id: 'c-002', employeeId: 'emp-002', employeeName: 'Sophie Martin', status: 'Actif', TYPE_CONTRAT: 'CDI', DATE_DEBUT: '2021-09-01', FONCTION: 'Chef de projet Marketing', SALAIRE_BASE: 320000, SI_CDI: true, SI_CDD: false, ENTREPRISE_NOM: 'UNIKORP', ENTREPRISE_FORME: 'SAS', ENTREPRISE_ADRESSE: 'Abidjan, Côte d\'Ivoire', ENTREPRISE_SIRET: 'CI-ABJ-2024-B-12345', ENTREPRISE_APE: '6201Z', REPRESENTANT_NOM: 'Elodie Dubois', REPRESENTANT_FONCTION: 'PDG', EMPLOYE_NOM: 'Martin', EMPLOYE_PRENOM: 'Sophie', EMPLOYE_DATE_NAISSANCE: '1990-11-20', EMPLOYE_LIEU_NAISSANCE: 'Bouaké', EMPLOYE_ADRESSE: 'Marcory', EMPLOYE_NUM_SECU: '2 90 11 98 765 432 10', EMPLOYE_NATIONALITE: 'Ivoirienne', CONVENTION_COLLECTIVE: 'Syntec', SI_PERIODE_ESSAI: false, QUALIFICATION_PROFESSIONNELLE: 'Cadre', CLASSIFICATION: '2.1', COEFFICIENT: '115', SUPERIEUR_HIERARCHIQUE: 'Directeur Marketing', LIEU_TRAVAIL: 'Siège social', SI_DEPLACEMENT: true, ZONE_DEPLACEMENT: 'territoire national', HORAIRES_TRAVAIL: '9h-18h', DUREE_HEBDOMADAIRE: '40', JOURS_REPOS: 'Samedi, Dimanche', SI_TEMPS_PARTIEL: false, PERIODICITE_SALAIRE: 'mensuel', SI_PRIMES: false, SI_AVANTAGES_NATURE: false, DATE_VERSEMENT: 'le 28 de chaque mois', MODE_PAIEMENT: 'virement bancaire', NOMBRE_JOURS_CONGES: 30, PERIODE_CONGES: '1er Janvier au 31 Décembre', SI_FORMATION_INITIALE: false, OBLIGATIONS_SUPPLEMENTAIRES: '', SI_NON_CONCURRENCE: false, DUREE_PREAVIS: '3 mois', LIEU_SIGNATURE: 'Abidjan', DATE_SIGNATURE: '2021-09-01', SIGNATURE_EMPLOYEUR: 'Elodie Dubois', SIGNATURE_EMPLOYE: 'Sophie Martin', DATE_REMISE: '2021-09-01', DATE_DPAE: '2021-08-31', DATE_VISITE_MEDICALE: '2021-09-03' },
    { id: 'c-003', employeeId: 'emp-003', employeeName: 'David Garcia', status: 'Terminé', TYPE_CONTRAT: 'CDD', DATE_DEBUT: '2024-01-20', DATE_FIN: '2024-07-19', FONCTION: 'Comptable', SALAIRE_BASE: 280000, SI_CDI: false, SI_CDD: true, MOTIF_CDD: 'Remplacement de personnel', ENTREPRISE_NOM: 'UNIKORP', ENTREPRISE_FORME: 'SAS', ENTREPRISE_ADRESSE: 'Abidjan, Côte d\'Ivoire', ENTREPRISE_SIRET: 'CI-ABJ-2024-B-12345', ENTREPRISE_APE: '6201Z', REPRESENTANT_NOM: 'Elodie Dubois', REPRESENTANT_FONCTION: 'PDG', EMPLOYE_NOM: 'Garcia', EMPLOYE_PRENOM: 'David', EMPLOYE_DATE_NAISSANCE: '1992-02-25', EMPLOYE_LIEU_NAISSANCE: 'Yamoussoukro', EMPLOYE_ADRESSE: 'Plateau', EMPLOYE_NUM_SECU: '1 92 02 97 654 321 09', EMPLOYE_NATIONALITE: 'Française', CONVENTION_COLLECTIVE: 'Syntec', SI_PERIODE_ESSAI: false, QUALIFICATION_PROFESSIONNELLE: 'Technicien', CLASSIFICATION: '1.2', COEFFICIENT: '95', SUPERIEUR_HIERARCHIQUE: 'Directeur Financier', LIEU_TRAVAIL: 'Siège social', SI_DEPLACEMENT: false, HORAIRES_TRAVAIL: '9h-18h', DUREE_HEBDOMADAIRE: '40', JOURS_REPOS: 'Samedi, Dimanche', SI_TEMPS_PARTIEL: false, PERIODICITE_SALAIRE: 'mensuel', SI_PRIMES: false, SI_AVANTAGES_NATURE: false, DATE_VERSEMENT: 'le 28 de chaque mois', MODE_PAIEMENT: 'virement bancaire', NOMBRE_JOURS_CONGES: 30, PERIODE_CONGES: '1er Janvier au 31 Décembre', SI_FORMATION_INITIALE: false, OBLIGATIONS_SUPPLEMENTAIRES: '', SI_NON_CONCURRENCE: false, LIEU_SIGNATURE: 'Abidjan', DATE_SIGNATURE: '2024-01-20', SIGNATURE_EMPLOYEUR: 'Elodie Dubois', SIGNATURE_EMPLOYE: 'David Garcia', DATE_REMISE: '2024-01-20', DATE_DPAE: '2024-01-19', DATE_VISITE_MEDICALE: '2024-01-22' },
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
                        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Employé</TableHead><TableHead>Type</TableHead><TableHead>Début</TableHead><TableHead>Fin</TableHead><TableHead className="text-center">Statut</TableHead><TableHead className="text-center w-[200px]">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {contracts.map((c, index) => (
                                <TableRow key={c.id} className="odd:bg-muted/50">
                                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
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
                                        <div className="space-y-1"><Label>Salaire de base (FCFA)</Label><Input name="SALAIRE_BASE" type="number" value={formData.SALAIRE_BASE || ''} onChange={handleChange} /></div>
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
    
    if (!contract) return null;

    const handlePrint = () => {
        const doc = new jsPDF();
        let y = 15;
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const pageContentWidth = doc.internal.pageSize.getWidth() - margin * 2;
    
        const companyName = "UNIKORP";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SOCIX";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const printDateTime = format(new Date(), "dd/MM/yyyy 'à' HH:mm:ss");

        const drawHeader = () => {
            doc.setFontSize(9); doc.setTextColor(150);
            doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, margin, 15);
            doc.setDrawColor(220); doc.line(margin, 18, doc.internal.pageSize.width - margin, 18);
            doc.addImage(logoDataUri, 'PNG', margin, 22, 12, 12);
            doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
            doc.text(companyName, margin + 15, 28);
            doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
            const rightX = doc.internal.pageSize.width - margin;
            doc.text(`Document : Contrat de travail`, rightX, 25, { align: 'right' });
            doc.text(`Employé : ${contract.EMPLOYE_PRENOM} ${contract.EMPLOYE_NOM}`, rightX, 30, { align: 'right' });
            doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
            y = 50;
        }

        const addText = (text: string, options: any = {}) => {
            const splitText = doc.splitTextToSize(text, pageContentWidth);
            const textHeight = doc.getTextDimensions(splitText).h;
            if (y + textHeight > pageHeight - margin - 10) {
                doc.addPage();
                drawHeader();
            }
            doc.text(splitText, margin, y, options);
            y += doc.getTextDimensions(splitText).h + 4;
        };

        const addTitle = (text: string) => {
            doc.setFontSize(12).setFont('helvetica', 'bold');
            y += 4;
            addText(text);
            doc.setFontSize(10).setFont('helvetica', 'normal');
        };

        drawHeader();
        
        doc.setFont('times', 'normal');
        doc.setFontSize(18);
        doc.text('CONTRAT DE TRAVAIL', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 10;
        
        doc.setFontSize(11).setFont('helvetica', 'bold');
        addText('Entre les soussignés :');
        doc.setFontSize(10).setFont('helvetica', 'normal');
        
        addText(`L'EMPLOYEUR :\n- Dénomination sociale : ${contract.ENTREPRISE_NOM}\n- Forme Juridique : ${contract.ENTREPRISE_FORME}\n- Adresse : ${contract.ENTREPRISE_ADRESSE}\n- N° SIRET : ${contract.ENTREPRISE_SIRET}\n- Code APE : ${contract.ENTREPRISE_APE}\n- Représenté par : ${contract.REPRESENTANT_NOM}, en sa qualité de ${contract.REPRESENTANT_FONCTION}`);
        addText(`L'EMPLOYÉ :\n- Nom : ${contract.EMPLOYE_NOM}\n- Prénom : ${contract.EMPLOYE_PRENOM}\n- Date de naissance : ${contract.EMPLOYE_DATE_NAISSANCE}\n- Lieu de naissance : ${contract.EMPLOYE_LIEU_NAISSANCE}\n- Adresse : ${contract.EMPLOYE_ADRESSE}\n- Numéro de sécurité sociale : ${contract.EMPLOYE_NUM_SECU}\n- Nationalité : ${contract.EMPLOYE_NATIONALITE}`);
        
        y += 5; doc.setDrawColor(200); doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y); y += 10;
        
        addTitle('ARTICLE 1 - NATURE DU CONTRAT');
        addText(`Il est conclu entre les parties un contrat de travail à durée ${contract.TYPE_CONTRAT} sous le régime de la convention collective ${contract.CONVENTION_COLLECTIVE}.`);
        if (contract.SI_CDD) addText(`Durée du contrat : Du ${contract.DATE_DEBUT} au ${contract.DATE_FIN}.\nMotif de recours : ${contract.MOTIF_CDD}`);
        if (contract.SI_PERIODE_ESSAI) addText(`Période d'essai : ${contract.DUREE_ESSAI}, renouvelable une fois pour une durée de ${contract.DUREE_RENOUVELLEMENT_ESSAI}.`);
        addTitle('ARTICLE 2 - FONCTION ET QUALIFICATION');
        addText(`Le salarié est engagé en qualité de ${contract.FONCTION} - ${contract.QUALIFICATION_PROFESSIONNELLE}.`);
        addText(`Classification : ${contract.CLASSIFICATION} - Coefficient ${contract.COEFFICIENT}`);
        addText(`Rattachement hiérarchique : ${contract.SUPERIEUR_HIERARCHIQUE}`);
        addTitle('ARTICLE 3 - LIEU DE TRAVAIL');
        addText(`Le salarié exercera ses fonctions à l'adresse suivante : ${contract.LIEU_TRAVAIL}.`);
        if (contract.SI_DEPLACEMENT) addText(`Des déplacements pourront être demandés dans le cadre de l'activité professionnelle.`);
        addTitle('ARTICLE 4 - HORAIRES ET DURÉE DU TRAVAIL');
        addText(`Horaires de travail : ${contract.HORAIRES_TRAVAIL}\nDurée hebdomadaire : ${contract.DUREE_HEBDOMADAIRE} heures\nRepos hebdomadaire : ${contract.JOURS_REPOS}`);
        if(contract.SI_TEMPS_PARTIEL) addText(`Travail à temps partiel.`);
        addTitle('ARTICLE 5 - RÉMUNÉRATION');
        addText(`Salaire de base : ${contract.SALAIRE_BASE.toLocaleString('fr-FR')} FCFA ${contract.PERIODICITE_SALAIRE}.`);
        if(contract.SI_PRIMES) addText(`Primes et avantages.`);
        if(contract.SI_AVANTAGES_NATURE) addText(`Avantages en nature.`);
        addText(`Le salaire sera versé le ${contract.DATE_VERSEMENT} par ${contract.MODE_PAIEMENT}.`);
        addTitle('ARTICLE 6 - CONGÉS PAYÉS');
        addText(`Le salarié bénéficie de ${contract.NOMBRE_JOURS_CONGES} jours ouvrables de congés payés par an.`);
        addTitle('ARTICLE 7 - FORMATION PROFESSIONNELLE');
        addText(`Le salarié bénéficie des dispositions légales et conventionnelles en matière de formation professionnelle.`);
        if(contract.SI_FORMATION_INITIALE) addText(`Une formation d'intégration sera dispensée.`);
        addTitle('ARTICLE 8 - OBLIGATIONS DU SALARIÉ');
        addText(`Le salarié s'engage à respecter le règlement intérieur de l'entreprise, à faire preuve de loyauté, et à respecter les consignes de sécurité. ${contract.OBLIGATIONS_SUPPLEMENTAIRES}`);
        addTitle('ARTICLE 9 - CONFIDENTIALITÉ');
        addText(`Le salarié s'engage à observer la plus stricte confidentialité sur toutes les informations dont il aura connaissance dans l'exercice de ses fonctions. Cette obligation subsiste après la rupture du contrat de travail.`);
        addTitle('ARTICLE 10 - CLAUSE DE NON-CONCURRENCE');
        addText(contract.SI_NON_CONCURRENCE ? `Une clause de non-concurrence est applicable.` : "Non applicable.");
        addTitle('ARTICLE 11 - RUPTURE DU CONTRAT');
        if(contract.SI_CDI) addText(`Le contrat peut être rompu par l'une ou l'autre des parties sous réserve du respect des dispositions légales en matière de préavis. Préavis : ${contract.DUREE_PREAVIS}.`);
        if(contract.SI_CDD) addText(`Le contrat prendra fin de plein droit à la date du ${contract.DATE_FIN}, sauf renouvellement.`);
        addTitle('ARTICLE 12 - DISPOSITIONS DIVERSES');
        addText(`Toute modification du présent contrat devra faire l'objet d'un avenant écrit signé par les deux parties.`);
        y += 15;
        addText(`Fait à ${contract.LIEU_SIGNATURE}, le ${contract.DATE_SIGNATURE}, en deux exemplaires.`);
        y += 15;
        doc.text("L'EMPLOYEUR", margin, y);
        doc.text("L'EMPLOYÉ", doc.internal.pageSize.getWidth() / 2 + margin, y);
        y += 10;
        doc.text(`(Signature de ${contract.SIGNATURE_EMPLOYEUR})`, margin, y);
        doc.text(`(Signature de ${contract.SIGNATURE_EMPLOYE})`, doc.internal.pageSize.getWidth() / 2 + margin, y);
        y += 10;
        doc.setDrawColor(200);
        doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
        y += 5;
        doc.setFontSize(8).setTextColor(120);
        addText(`Mentions obligatoires :\n- Exemplaire remis au salarié le : ${contract.DATE_REMISE}\n- Déclaration préalable à l'embauche effectuée le : ${contract.DATE_DPAE}\n- Visite médicale d'embauche : ${contract.DATE_VISITE_MEDICALE}`);

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
                    <div className="bg-white p-8 max-w-3xl mx-auto shadow-lg text-gray-800">
                        <h1 className="text-2xl font-bold text-center mb-6">CONTRAT DE TRAVAIL</h1>
                        <h2 className="font-bold mb-2">Entre les soussignés :</h2>
                        <div className="mb-4 pl-4">
                            <h3 className="font-semibold">L'EMPLOYEUR :</h3>
                            <p>Dénomination sociale : {contract.ENTREPRISE_NOM}</p>
                            <p>Adresse : {contract.ENTREPRISE_ADRESSE}</p>
                        </div>
                        <div className="mb-4 pl-4">
                            <h3 className="font-semibold">L'EMPLOYÉ :</h3>
                            <p>Nom : {contract.EMPLOYE_NOM}</p>
                            <p>Prénom : {contract.EMPLOYE_PRENOM}</p>
                            <p>Date de naissance : {contract.DATE_DEBUT}</p>
                            <p>Adresse : {contract.EMPLOYE_ADRESSE}</p>
                        </div>
                         <Separator className="my-6" />
                        <div className="space-y-4">
                            {/* Contract articles rendered here */}
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 1 - NATURE DU CONTRAT</h3><p>Il est conclu entre les parties un contrat de travail à durée {contract.TYPE_CONTRAT}.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 2 - FONCTION</h3><p>Le salarié est engagé en qualité de {contract.FONCTION}.</p></div>
                             <div><h3 className="text-lg font-bold mb-1">ARTICLE 3 - LIEU DE TRAVAIL</h3><p>Le salarié exercera ses fonctions à l'adresse suivante : {contract.LIEU_TRAVAIL}.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 4 - HORAIRES ET DURÉE DU TRAVAIL</h3><p>La durée hebdomadaire du travail est de {contract.DUREE_HEBDOMADAIRE} heures.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 5 - RÉMUNÉRATION</h3><p>Le salaire de base est fixé à {contract.SALAIRE_BASE.toLocaleString('fr-FR')} FCFA {contract.PERIODICITE_SALAIRE}.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 6 - CONGÉS PAYÉS</h3><p>Le salarié bénéficie de {contract.NOMBRE_JOURS_CONGES} jours ouvrables de congés payés par an.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 7 - FORMATION PROFESSIONNELLE</h3><p>Le salarié bénéficie des dispositions légales et conventionnelles en matière de formation professionnelle.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 8 - OBLIGATIONS DU SALARIÉ</h3><p>Le salarié s'engage à respecter le règlement intérieur de l'entreprise et à faire preuve de loyauté.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 9 - CONFIDENTIALITÉ</h3><p>Le salarié s'engage à observer la plus stricte confidentialité.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 10 - CLAUSE DE NON-CONCURRENCE</h3><p>Non applicable.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 11 - RUPTURE DU CONTRAT</h3><p>Le contrat peut être rompu sous réserve du respect des dispositions légales.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 12 - DISPOSITIONS DIVERSES</h3><p>Toute modification devra faire l'objet d'un avenant.</p></div>
                        </div>
                         <Separator className="my-6" />
                         <div className="mt-12 text-center">
                            <p>Fait à {contract.LIEU_SIGNATURE}, le {contract.DATE_SIGNATURE}, en deux exemplaires.</p>
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
