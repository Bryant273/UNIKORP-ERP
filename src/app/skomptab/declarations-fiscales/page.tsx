
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2, Download, CheckCircle, Calculator } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import FiscalPageLayout from '@/components/fiscal-layout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

// --- TYPES ---
type DeclarationType = 'IS' | 'IMF' | 'ITS' | 'Patente' | 'BNC' | 'BIC' | 'BA' | 'TSE' | 'TPS';
type DeclarationStatus = 'Brouillon' | 'Validée' | 'Télédéclarée' | 'Payée';

type BicData = {
    ncc: string;
    raisonSociale: string;
    periode: string;
    caHt: number;
    caTtc: number;
    chargesDeductibles: number;
    amortissements: number;
    resultatFiscal: number;
};
type ItsData = {
    nccEmployeur: string,
    periode: string,
    nombreEmployes: number,
    masseSalarialeBrute: number,
    abattementsAppliques: number,
    retenuesEffectuees: number,
}
// Add other data types as needed
// ...

type Declaration = {
    id: string;
    periode: string;
    type: DeclarationType;
    montant: number;
    echeance: string;
    statut: DeclarationStatus;
    data: any;
};

// --- MOCK DATA ---
const initialDeclarations: Declaration[] = [
    { id: 'd1', periode: 'Année 2023', type: 'BIC', montant: 4500000, echeance: '30/04/2024', statut: 'Payée', data: { caTtc: 20000000, resultatFiscal: 16666667 } },
    { id: 'd2', periode: 'Juillet 2024', type: 'ITS', montant: 1250000, echeance: '15/08/2024', statut: 'Validée', data: { masseSalarialeBrute: 10000000 } },
    { id: 'd3', periode: 'T3 2024', type: 'IMF', montant: 750000, echeance: '15/10/2024', statut: 'Brouillon', data: { caTtc: 37500000 } },
    { id: 'd4', periode: 'Année 2024', type: 'Patente', montant: 350000, echeance: '15/01/2025', statut: 'Brouillon', data: {} },
    { id: 'd5', periode: 'Juin 2024', type: 'ITS', montant: 1230000, echeance: '15/07/2024', statut: 'Payée', data: { masseSalarialeBrute: 9800000 } },
];

const DeclarationTypeOptions: DeclarationType[] = ['BIC', 'ITS', 'Patente', 'Licence', 'TSE', 'TPS', 'BNC', 'BA', 'IMF'];

const getDefaultDataForType = (type: DeclarationType) => {
    const base = {
        ncc: '1234567A',
        raisonSociale: 'Votre Société S.A.',
        periode: format(new Date(), 'MMMM yyyy'),
    }
    switch(type) {
        case 'BIC': return { ...base, caHt: 0, caTtc: 0, chargesDeductibles: 0, amortissements: 0, resultatFiscal: 0 };
        case 'ITS': return { ...base, nccEmployeur: base.ncc, nombreEmployes: 0, masseSalarialeBrute: 0, abattementsAppliques: 0, retenuesEffectuees: 0 };
        case 'Patente': return { ...base, activiteExercee: '', adresseLocal: '', superficieLocal: 0, caAnneePrecedente: 0, valeurLocative: 0, classePatente: '', montantPatente: 0 };
        case 'Licence': return { ...base, typeLicence: '', activiteConcernee: '', caPrevisionnel: 0, dureeValidite: '', montantLicence: 0 };
        case 'TSE': return { ...base, caImposable: 0, tauxTseApplicable: 0, exonerationsEventuelles: 0 };
        case 'TPS': return { ...base, montantPrestationsHt: 0, tauxTpsApplicable: 0, lieuPrestation: '' };
        default: return { ...base, montant: 0 };
    }
}

// --- FORM COMPONENTS ---

const FormField = ({ label, children, isRequired }: { label: string, children: React.ReactNode, isRequired?: boolean }) => (
    <div className="space-y-1">
        <Label>{label}{isRequired && <span className="text-destructive"> *</span>}</Label>
        {children}
    </div>
);

function BicForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: string) => {
        setData((prev: any) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
    
    const { bicCalcule, imf, impotDu } = useMemo(() => {
        const resultatFiscal = data.resultatFiscal || 0;
        const caTtc = data.caTtc || 0;
        const bic = resultatFiscal > 0 ? resultatFiscal * 0.27 : 0;
        const imfCalc = caTtc * 0.02;
        return { bicCalcule: bic, imf: imfCalc, impotDu: Math.max(bic, imfCalc) };
    }, [data.resultatFiscal, data.caTtc]);

    return (
        <Card className="bg-muted/30"><CardContent className="p-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Chiffre d'affaires HT" isRequired><Input type="number" value={data.caHt || ''} onChange={e => handleChange('caHt', e.target.value)} disabled={isViewMode} /></FormField>
                <FormField label="Chiffre d'affaires TTC" isRequired><Input type="number" value={data.caTtc || ''} onChange={e => handleChange('caTtc', e.target.value)} disabled={isViewMode} /></FormField>
            </div>
             <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Charges déductibles"><Input type="number" value={data.chargesDeductibles || ''} onChange={e => handleChange('chargesDeductibles', e.target.value)} disabled={isViewMode} /></FormField>
                <FormField label="Amortissements"><Input type="number" value={data.amortissements || ''} onChange={e => handleChange('amortissements', e.target.value)} disabled={isViewMode} /></FormField>
            </div>
             <FormField label="Résultat fiscal" isRequired><Input type="number" value={data.resultatFiscal || ''} onChange={e => handleChange('resultatFiscal', e.target.value)} disabled={isViewMode} /></FormField>
             <Separator />
            <div className="p-4 border rounded-lg bg-background space-y-2">
                 <h4 className="font-semibold text-center">Calcul de l'impôt</h4>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">BIC calculé (27%)</span><span className="font-mono">{bicCalcule.toLocaleString('fr-FR')} €</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">IMF (2% du CA TTC)</span><span className="font-mono">{imf.toLocaleString('fr-FR')} €</span></div>
                 <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t"><span >Impôt Dû (le plus élevé)</span><span className="font-mono">{impotDu.toLocaleString('fr-FR')} €</span></div>
            </div>
        </CardContent></Card>
    );
}

function ItsForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
     const handleChange = (field: string, value: string) => {
        setData((prev: any) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
    const { baseImposable, itsCalcule, itsNetAPayer } = useMemo(() => {
        const masseSalariale = data.masseSalarialeBrute || 0;
        const abattements = data.abattementsAppliques || 0;
        const retenues = data.retenuesEffectuees || 0;
        const base = masseSalariale - abattements;
        const its = base * 0.15; // Simplified rate
        return { baseImposable: base, itsCalcule: its, itsNetAPayer: its - retenues };
    }, [data.masseSalarialeBrute, data.abattementsAppliques, data.retenuesEffectuees]);

    return (
        <Card className="bg-muted/30"><CardContent className="p-4 space-y-4">
            <FormField label="Nombre d'employés" isRequired><Input type="number" value={data.nombreEmployes || ''} onChange={e => handleChange('nombreEmployes', e.target.value)} disabled={isViewMode}/></FormField>
            <FormField label="Masse salariale brute" isRequired><Input type="number" value={data.masseSalarialeBrute || ''} onChange={e => handleChange('masseSalarialeBrute', e.target.value)} disabled={isViewMode}/></FormField>
            <FormField label="Abattements appliqués"><Input type="number" value={data.abattementsAppliques || ''} onChange={e => handleChange('abattementsAppliques', e.target.value)} disabled={isViewMode}/></FormField>
            <FormField label="Retenues effectuées"><Input type="number" value={data.retenuesEffectuees || ''} onChange={e => handleChange('retenuesEffectuees', e.target.value)} disabled={isViewMode}/></FormField>
            <Separator />
             <div className="p-4 border rounded-lg bg-background space-y-2">
                 <h4 className="font-semibold text-center">Calcul de l'impôt</h4>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base imposable</span><span className="font-mono">{baseImposable.toLocaleString('fr-FR')} €</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">ITS calculé</span><span className="font-mono">{itsCalcule.toLocaleString('fr-FR')} €</span></div>
                 <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t"><span >ITS net à payer</span><span className="font-mono">{itsNetAPayer.toLocaleString('fr-FR')} €</span></div>
            </div>
        </CardContent></Card>
    );
}

// ... other forms would be defined here ...

function DeclarationFormRenderer({ type, data, setData, isViewMode }: { type: DeclarationType, data: any, setData: Function, isViewMode: boolean }) {
    switch (type) {
        case 'BIC': return <BicForm data={data} setData={setData} isViewMode={isViewMode} />;
        case 'ITS': return <ItsForm data={data} setData={setData} isViewMode={isViewMode} />;
        // Add cases for other forms
        default: return <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50"><p>Formulaire non disponible pour le type '{type}'.</p></div>;
    }
}


function DeclarationsFiscalesMainContent() {
    const [declarations, setDeclarations] = useState(initialDeclarations);
    const [declarationToDelete, setDeclarationToDelete] = useState<Declaration | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
    const [viewingDeclaration, setViewingDeclaration] = useState<Declaration | null>(null);
    const { toast } = useToast();

    const openCreateModal = () => {
        setEditingDeclaration(null);
        setIsModalOpen(true);
    };

    const openEditModal = (declaration: Declaration) => {
        setEditingDeclaration(declaration);
        setIsModalOpen(true);
    };

    const handleSaveDeclaration = (formData: any) => {
        let finalAmount = 0;
        switch(formData.type) {
            case 'BIC': {
                const { resultatFiscal = 0, caTtc = 0 } = formData.data;
                const bic = resultatFiscal > 0 ? resultatFiscal * 0.27 : 0;
                const imf = caTtc * 0.02;
                finalAmount = Math.max(bic, imf);
                break;
            }
            case 'ITS': {
                const { masseSalarialeBrute = 0, abattementsAppliques = 0, retenuesEffectuees = 0 } = formData.data;
                const base = masseSalarialeBrute - abattementsAppliques;
                const its = base * 0.15;
                finalAmount = its - retenuesEffectuees;
                break;
            }
            default:
                finalAmount = formData.data.montant || 0;
        }

        if (editingDeclaration) {
            setDeclarations(prev => prev.map(d => d.id === editingDeclaration.id ? { ...editingDeclaration, ...formData, statut: 'Validée', montant: finalAmount } : d));
            toast({ title: 'Déclaration modifiée', description: `La déclaration a été mise à jour.` });
        } else {
            const newDeclaration: Declaration = {
                id: `d_${Date.now()}`,
                ...formData,
                montant: finalAmount,
                statut: 'Brouillon',
                echeance: 'À définir',
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
    
    const handleMarkAsPaid = (id: string) => {
        setDeclarations(prev => prev.map(d => d.id === id ? { ...d, statut: 'Payée' } : d));
        toast({ title: 'Statut mis à jour', description: 'La déclaration a été marquée comme payée.' });
    };
    
    const handlePrintDeclaration = (declaration: Declaration) => {
        const doc = new jsPDF();
        const printDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        
        doc.setFontSize(18);
        doc.text("Déclaration Fiscale", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Imprimé via UNIKORP ® le ${printDate}`, 105, 28, { align: 'center' });
        
        autoTable(doc, {
            startY: 40,
            head: [['Champ', 'Valeur']],
            body: [
                ['Type d\'impôt', declaration.type],
                ['Période', declaration.periode],
                ['Échéance', declaration.echeance],
                ['Montant Dû', `${declaration.montant.toLocaleString('fr-FR')} €`],
                ['Statut', declaration.statut],
            ],
            theme: 'grid'
        });

        doc.save(`declaration_${declaration.type}_${declaration.periode.replace(/\s/g, '_')}.pdf`);
        toast({ title: "Téléchargement lancé" });
    };

    const getStatusBadge = (declaration: Declaration) => {
        switch (declaration.statut) {
            case 'Brouillon': return <Badge variant="outline">Brouillon</Badge>;
            case 'Validée': return <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(declaration.id)}>Marquer comme payée</Button>;
            case 'Télédéclarée': return <Button size="sm" variant="secondary" onClick={() => handleMarkAsPaid(declaration.id)}>Marquer comme payée</Button>;
            case 'Payée': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Payée</Badge>;
        }
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Suivi des Déclarations Fiscales</CardTitle>
                            <CardDescription>Gérez et suivez l'état de toutes vos déclarations fiscales (hors TVA).</CardDescription>
                        </div>
                        <Button onClick={openCreateModal}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Créer une déclaration
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Période</TableHead>
                                <TableHead>Impôt</TableHead>
                                <TableHead className="text-right">Montant Dû</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {declarations.map((d) => {
                                const isFinalized = d.statut === 'Payée' || d.statut === 'Télédéclarée';
                                return (
                                <TableRow key={d.id}>
                                    <TableCell className="font-medium">{d.periode}</TableCell>
                                    <TableCell><Badge variant="secondary">{d.type}</Badge></TableCell>
                                    <TableCell className="text-right font-mono">{d.montant.toLocaleString('fr-FR')} €</TableCell>
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

function DeclarationModal({ isOpen, onClose, onSave, declarationToEdit }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, declarationToEdit: Declaration | null }) {
    const { toast } = useToast();
    const [type, setType] = useState<DeclarationType>(declarationToEdit?.type || 'BIC');
    const [data, setData] = useState(declarationToEdit?.data || getDefaultDataForType(type));

    useEffect(() => {
        if (isOpen) {
            const initialType = declarationToEdit?.type || 'BIC';
            setType(initialType);
            setData(declarationToEdit ? declarationToEdit.data : getDefaultDataForType(initialType));
        }
    }, [isOpen, declarationToEdit]);

    const handleTypeChange = (newType: DeclarationType) => {
        if (!declarationToEdit) { // Allow type change only for new declarations
            setType(newType);
            setData(getDefaultDataForType(newType));
        }
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation can be added here
        onSave({ type, data, periode: data.periode });
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{declarationToEdit ? 'Modifier la' : 'Créer une'} déclaration fiscale</DialogTitle>
                        <DialogDescription>Renseignez les détails de la déclaration fiscale.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField label="Type d'impôt" isRequired>
                                <Select value={type} onValueChange={handleTypeChange} disabled={!!declarationToEdit}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{DeclarationTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Période" isRequired>
                                <Input value={data.periode || ''} onChange={(e) => setData((d: any) => ({...d, periode: e.target.value}))} placeholder="Ex: Année 2024, T3 2024..." />
                            </FormField>
                        </div>
                        <DeclarationFormRenderer type={type} data={data} setData={setData} isViewMode={false} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
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
                    <DialogTitle>Détails de la Déclaration</DialogTitle>
                    <DialogDescription>Déclaration {declaration.type} pour la période {declaration.periode}.</DialogDescription>
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

export default function DeclarationsFiscalesPage() {
    return (
        <FiscalPageLayout>
            <DeclarationsFiscalesMainContent />
        </FiscalPageLayout>
    )
}
