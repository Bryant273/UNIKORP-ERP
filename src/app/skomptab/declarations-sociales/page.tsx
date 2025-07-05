
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2, Download, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import FiscalPageLayout from '@/components/fiscal-layout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

// --- TYPES ---
type DeclarationType = 'Immatriculation Employeur' | 'Immatriculation Salarié' | 'Déclaration Mensuelle Salaires' | 'DAS' | 'Accident de Travail' | 'Maladie Professionnelle' | 'Modification Salarié';
type DeclarationStatus = 'Brouillon' | 'Validée' | 'Déposée' | 'Traitée';

type Declaration = {
    id: string;
    type: DeclarationType;
    periode: string;
    statut: DeclarationStatus;
    data: any;
};

const DeclarationTypeOptions: DeclarationType[] = ['Immatriculation Employeur', 'Immatriculation Salarié', 'Déclaration Mensuelle Salaires', 'DAS', 'Accident de Travail', 'Maladie Professionnelle', 'Modification Salarié'];

// --- MOCK DATA ---
const initialDeclarations: Declaration[] = [
    { id: 'dms1', type: 'Déclaration Mensuelle Salaires', periode: 'Juillet 2024', statut: 'Validée', data: { masseSalarialeBrute: 86100 } },
    { id: 'dms2', type: 'Déclaration Mensuelle Salaires', periode: 'Juin 2024', statut: 'Traitée', data: { masseSalarialeBrute: 85200 } },
    { id: 'modif1', type: 'Modification Salarié', periode: '01/07/2024', statut: 'Traitée', data: { typeMouvement: 'embauche', identiteSalarie: 'Sophie Martin' } },
    { id: 'das1', type: 'DAS', periode: 'Année 2023', statut: 'Traitée', data: { anneeReference: '2023', masseSalarialeAnnuelle: 1025000 } },
];

const getDefaultDataForType = (type: DeclarationType): any => {
    const base = {
        dateDeclaration: format(new Date(), 'yyyy-MM-dd'),
    };
    switch(type) {
        case 'Immatriculation Employeur': return { ...base, denominationSociale: 'Votre Société S.A.', formeJuridique: 'SARL', adresseSiegeSocial: '', secteurActivite: '', numeroRccm: '', nif: '', nombreEmployesPrevisionnels: 0, dateDebutActivite: '' };
        case 'Immatriculation Salarié': return { ...base, nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: 'Masculin', nationalite: 'Ivoirienne', adresseResidence: '', fonction: '', salaireBase: 0, dateEmbauche: '', numeroCni: '' };
        case 'Déclaration Mensuelle Salaires': return { ...base, numeroCnpEmployeur: 'CNPS-12345', periode: format(new Date(), 'yyyy-MM'), masseSalarialeBrute: 0, detailEmployes: [] };
        case 'DAS': return { ...base, anneeReference: new Date().getFullYear().toString(), effectifTotal: 0, masseSalarialeAnnuelle: 0, cotisationsVersees: 0, regularisations: '' };
        case 'Accident de Travail': return { ...base, identiteVictime: '', circonstances: '', dateAccident: '', heureAccident: '', lieuAccident: '', natureBlessures: '', temoins: '', arretTravail: '' };
        case 'Maladie Professionnelle': return { ...base, identiteTravailleur: '', natureMaladie: '', posteOccupe: '', dureeExposition: '', diagnosticMedical: '', datePremiereConstatation: '' };
        case 'Modification Salarié': return { ...base, typeMouvement: 'embauche', identiteSalarie: '', dateEffet: '', motifDepart: '', nouveauSalaire: 0 };
        default: return { ...base };
    }
}

// --- FORM COMPONENTS ---

const FormField = ({ label, children, isRequired, fullWidth }: { label: string, children: React.ReactNode, isRequired?: boolean, fullWidth?: boolean }) => (
    <div className={cn("space-y-1.5", fullWidth && "col-span-full")}>
        <Label>{label}{isRequired && <span className="text-destructive"> *</span>}</Label>
        {children}
    </div>
);

function DeclarationFormRenderer({ type, data, setData, isViewMode }: { type: DeclarationType, data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    const formatC = (val: number) => val.toLocaleString('fr-FR');

    const renderFormContent = () => {
        switch (type) {
            case 'Immatriculation Employeur':
                return <div className="grid md:grid-cols-2 gap-4"><FormField label="Dénomination sociale" isRequired><Input value={data.denominationSociale} onChange={e => handleChange('denominationSociale', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Forme juridique" isRequired><Input value={data.formeJuridique} onChange={e => handleChange('formeJuridique', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Adresse du siège social" isRequired fullWidth><Input value={data.adresseSiegeSocial} onChange={e => handleChange('adresseSiegeSocial', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Secteur d'activité" isRequired><Input value={data.secteurActivite} onChange={e => handleChange('secteurActivite', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Numéro RCCM" isRequired><Input value={data.numeroRccm} onChange={e => handleChange('numeroRccm', e.target.value)} disabled={isViewMode} /></FormField><FormField label="NIF/NCC" isRequired><Input value={data.nif} onChange={e => handleChange('nif', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Date de début d'activité" isRequired><Input type="date" value={data.dateDebutActivite} onChange={e => handleChange('dateDebutActivite', e.target.value)} disabled={isViewMode} /></FormField></div>;
            case 'Déclaration Mensuelle Salaires': {
                const cotisationsPatronales = (data.masseSalarialeBrute || 0) * 0.165;
                const cotisationsSalariales = (data.masseSalarialeBrute || 0) * 0.035;
                const total = cotisationsPatronales + cotisationsSalariales;
                return <div className="space-y-4"><FormField label="N° CNPS Employeur" isRequired><Input value={data.numeroCnpEmployeur} onChange={e => handleChange('numeroCnpEmployeur', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Masse Salariale Brute" isRequired><Input type="number" value={data.masseSalarialeBrute} onChange={e => handleChange('masseSalarialeBrute', parseFloat(e.target.value))} disabled={isViewMode}/></FormField><Separator/><div className="p-4 border rounded-lg bg-background space-y-2"><h4 className="font-semibold text-center">Calcul des cotisations</h4><div className="flex justify-between text-sm"><span className="text-muted-foreground">Cotisations Patronales (16,5%)</span><span className="font-mono">{formatC(cotisationsPatronales)} €</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Cotisations Salariales (3,5%)</span><span className="font-mono">{formatC(cotisationsSalariales)} €</span></div><div className="flex justify-between text-lg font-bold text-primary pt-2 border-t"><span>Total des Cotisations Dues</span><span className="font-mono">{formatC(total)} €</span></div></div></div>;
            }
            default:
                return <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50"><p>Formulaire non disponible pour le type '{type}'.</p></div>;
        }
    };
    return (
        <Card className="bg-muted/30"><CardContent className="p-4">{renderFormContent()}</CardContent></Card>
    );
}

function DeclarationsSocialesMainContent() {
    const [declarations, setDeclarations] = useState(initialDeclarations);
    const [declarationToDelete, setDeclarationToDelete] = useState<Declaration | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
    const [viewingDeclaration, setViewingDeclaration] = useState<Declaration | null>(null);
    const [selectedType, setSelectedType] = useState<DeclarationType | null>(null);
    const { toast } = useToast();

    const handleOpenCreateModal = () => {
        setEditingDeclaration(null);
        setSelectedType(null); // Force type selection first
        setIsModalOpen(true);
    };

    const openEditModal = (declaration: Declaration) => {
        setEditingDeclaration(declaration);
        setSelectedType(declaration.type);
        setIsModalOpen(true);
    };

    const handleSaveDeclaration = (formData: any) => {
        if (!selectedType) return;
        
        let montant = 0;
        if (selectedType === 'Déclaration Mensuelle Salaires') {
            const masseSalariale = formData.masseSalarialeBrute || 0;
            montant = masseSalariale * 0.165 + masseSalariale * 0.035;
        } else if (selectedType === 'DAS') {
            montant = formData.cotisationsVersees || 0;
        }
        
        if (editingDeclaration) {
            setDeclarations(prev => prev.map(d => d.id === editingDeclaration.id ? { ...editingDeclaration, type: selectedType, data: formData, statut: 'Validée' } : d));
            toast({ title: 'Déclaration modifiée', description: `La déclaration a été mise à jour.` });
        } else {
            const newDeclaration: Declaration = {
                id: `d_${Date.now()}`,
                type: selectedType,
                data: formData,
                statut: 'Brouillon',
                periode: formData.periode || formData.anneeReference || formData.dateEffet || format(new Date(), 'dd/MM/yyyy')
            };
            setDeclarations(prev => [newDeclaration, ...prev]);
            toast({ title: 'Déclaration créée', description: 'La nouvelle déclaration a été ajoutée en tant que brouillon.' });
        }
        setIsModalOpen(false);
    };
    
    const handleDelete = () => {
        if (declarationToDelete) {
            setDeclarations(prev => prev.filter(d => d.id !== declarationToDelete.id));
            toast({ title: 'Déclaration supprimée' });
            setDeclarationToDelete(null);
        }
    };

    const handleStatusChange = (id: string, newStatus: DeclarationStatus) => {
        setDeclarations(prev => prev.map(d => d.id === id ? { ...d, statut: newStatus } : d));
        toast({ title: 'Statut mis à jour', description: `La déclaration est maintenant marquée comme "${newStatus}".` });
    };

    const getStatusBadge = (declaration: Declaration) => {
        switch (declaration.statut) {
            case 'Brouillon': return <Button size="sm" variant="outline" onClick={() => handleStatusChange(declaration.id, 'Validée')}>Valider</Button>;
            case 'Validée': return <Button size="sm" variant="destructive" onClick={() => handleStatusChange(declaration.id, 'Déposée')}>Marquer comme Déposée</Button>;
            case 'Déposée': return <Button size="sm" variant="secondary" onClick={() => handleStatusChange(declaration.id, 'Traitée')}>Marquer comme Traitée</Button>;
            case 'Traitée': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Traitée</Badge>;
        }
    };

     const handlePrintDeclaration = (declaration: Declaration) => {
        toast({ title: "Fonctionnalité d'impression en développement" });
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Suivi des Déclarations Sociales</CardTitle>
                            <CardDescription>Gérez et suivez l'état de toutes vos déclarations sociales.</CardDescription>
                        </div>
                        <Button onClick={handleOpenCreateModal}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nouvelle déclaration
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Période / Date</TableHead>
                                <TableHead>Type de Déclaration</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {declarations.map((d) => {
                                const isFinalized = d.statut === 'Traitée';
                                return (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.periode}</TableCell>
                                    <TableCell><Badge variant="secondary">{d.type}</Badge></TableCell>
                                    <TableCell className="text-center">{getStatusBadge(d)}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setViewingDeclaration(d)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(d)} disabled={isFinalized}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handlePrintDeclaration(d)}><Download className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeclarationToDelete(d)} disabled={isFinalized}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <DeclarationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDeclaration}
                declarationToEdit={editingDeclaration}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
            />
            
             <ViewDeclarationModal 
                isOpen={!!viewingDeclaration}
                onClose={() => setViewingDeclaration(null)}
                declaration={viewingDeclaration}
            />

            <AlertDialog open={!!declarationToDelete} onOpenChange={() => setDeclarationToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Supprimer cette déclaration ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. La déclaration sera supprimée de l'historique.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// --- MODAL & FORM COMPONENTS ---

function DeclarationModal({ isOpen, onClose, onSave, declarationToEdit, selectedType, setSelectedType }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, declarationToEdit: Declaration | null, selectedType: DeclarationType | null, setSelectedType: (type: DeclarationType) => void }) {
    const [data, setData] = useState(declarationToEdit ? declarationToEdit.data : null);

    useEffect(() => {
        if (isOpen) {
            if (declarationToEdit) {
                setSelectedType(declarationToEdit.type);
                setData(declarationToEdit.data);
            } else {
                setSelectedType(null);
                setData(null);
            }
        }
    }, [isOpen, declarationToEdit, setSelectedType]);

    useEffect(() => {
        if (selectedType && !declarationToEdit) {
            setData(getDefaultDataForType(selectedType));
        }
    }, [selectedType, declarationToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(data);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{declarationToEdit ? 'Modifier la' : 'Créer une'} déclaration sociale</DialogTitle>
                        <DialogDescription>Renseignez les détails de la déclaration.</DialogDescription>
                    </DialogHeader>
                     <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                        <FormField label="Type de Déclaration" isRequired>
                            <Select value={selectedType || ''} onValueChange={(v) => setSelectedType(v as DeclarationType)} disabled={!!declarationToEdit}>
                                <SelectTrigger><SelectValue placeholder="Sélectionnez un type de déclaration..."/></SelectTrigger>
                                <SelectContent>{DeclarationTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                            </Select>
                        </FormField>
                        {selectedType && data && <DeclarationFormRenderer type={selectedType} data={data} setData={setData} isViewMode={false} />}
                     </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={!selectedType}>Enregistrer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ViewDeclarationModal({ isOpen, onClose, declaration }: { isOpen: boolean, onClose: () => void, declaration: Declaration | null }) {
    if (!declaration) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Détails de la Déclaration : {declaration.type}</DialogTitle>
                    <DialogDescription>Période: {declaration.periode}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                   <DeclarationFormRenderer type={declaration.type} data={declaration.data} setData={()=>{}} isViewMode={true} />
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function DeclarationsSocialesPage() {
    return (
        <FiscalPageLayout>
            <DeclarationsSocialesMainContent />
        </FiscalPageLayout>
    );
}
