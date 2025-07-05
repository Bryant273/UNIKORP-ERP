
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2, Download, CheckCircle } from 'lucide-react';
import FiscalPageLayout from '@/components/fiscal-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

// --- TYPES ---
type DeclarationStatus = 'Brouillon' | 'À payer' | 'Payé';
type TaxType = 
    | "Impôt synthétique"
    | "Taxe forfaitaire des petits commerçants"
    | "Droits d'enregistrement"
    | "Droits de timbre"
    | "Taxe de publicité foncière"
    | "Droits fiscaux d'entrée"
    | "Droits de douane proprement dits";

type AutreImpot = {
    id: string;
    type: TaxType;
    periode: string;
    montant: number;
    echeance: string;
    statut: DeclarationStatus;
    data: any;
};

const TaxTypeOptions: TaxType[] = [
    "Impôt synthétique", "Taxe forfaitaire des petits commerçants", "Droits d'enregistrement",
    "Droits de timbre", "Taxe de publicité foncière", "Droits fiscaux d'entrée", "Droits de douane proprement dits"
];

// --- MOCK DATA ---
const initialAutresImpots: AutreImpot[] = [
    { id: 'imp-synth', type: 'Impôt synthétique', periode: 'Année 2024', montant: 150000, echeance: 'Trimestriel', statut: 'À payer', data: { ncc: '12345A', raisonSociale: 'Commerce ABC', adresseLocal: 'Abidjan', natureActivite: 'Commerce de détail', caPrevisionnel: 30000000, montantImpotSynthetique: 150000 } },
    { id: 'taxe-forfait', type: 'Taxe forfaitaire des petits commerçants', periode: 'Année 2024', montant: 50000, echeance: 'Annuel', statut: 'Payé', data: { ncc: '67890B', identiteContribuable: 'Artisan XYZ', typeActivite: 'artisanat', localisation: 'Yopougon', caDeclare: 8000000, classeTarifaire: 'Classe 2', montantTaxeForfaitaire: 50000 } },
    { id: 'droit-enreg', type: 'Droits d\'enregistrement', periode: 'Juin 2024', montant: 25000, echeance: 'Ponctuel', statut: 'Payé', data: { natureActe: 'Cession de parts', parties: 'Mr. A et Mme. B', objetContrat: 'Cession de 50 parts', valeurDeclaree: 5000000, tauxApplicable: 0.5, montantDroits: 25000 } },
    { id: 'droit-timbre', type: 'Droits de timbre', periode: 'Juillet 2024', montant: 10000, echeance: 'Continu', statut: 'À payer', data: { typeDocument: 'Contrats commerciaux', nombrePages: 20, valeurTimbreUnitaire: 500, montantTotalTimbres: 10000 } },
    { id: 'droit-douane', type: 'Droits de douane proprement dits', periode: 'Import #123', montant: 750000, echeance: 'Par opération', statut: 'Brouillon', data: { codeTarifaire: '8517.12.00.00', valeurEnDouane: 5000000, tauxDouanier: 15, montantDroits: 750000 } },
];

const getDefaultDataForType = (type: TaxType): any => {
    const base = {
        ncc: '1234567A',
        periode: format(new Date(), 'MMMM yyyy', { locale: fr }),
    };
    switch(type) {
        case "Impôt synthétique": return { ...base, raisonSociale: '', adresseLocal: '', natureActivite: '', caPrevisionnel: 0, montantImpotSynthetique: 0 };
        case "Taxe forfaitaire des petits commerçants": return { ...base, identiteContribuable: '', typeActivite: 'commerce', localisation: '', caDeclare: 0, classeTarifaire: '', montantTaxeForfaitaire: 0 };
        case "Droits d'enregistrement": return { ...base, natureActe: '', parties: '', objetContrat: '', valeurDeclaree: 0, tauxApplicable: 0, montantDroits: 0 };
        case "Droits de timbre": return { ...base, typeDocument: '', nombrePages: 0, valeurTimbreUnitaire: 0, montantTotalTimbres: 0 };
        case "Taxe de publicité foncière": return { ...base, numeroTitreFoncier: '', natureOperation: '', superficie: 0, valeurBien: 0, tauxTaxe: 0, montantTaxe: 0 };
        case "Droits fiscaux d'entrée": return { ...base, numeroDeclarationDouane: '', valeurCIF: 0, tauxDroitsFiscaux: 0, montantCalcule: 0, natureMarchandises: '' };
        case "Droits de douane proprement dits": return { ...base, codeTarifaire: '', valeurEnDouane: 0, tauxDouanier: 0, montantDroits: 0, origineMarchandises: '' };
        default: return { ...base };
    }
};

// --- FORM COMPONENTS ---
const FormField = ({ label, children, isRequired }: { label: string, children: React.ReactNode, isRequired?: boolean }) => (
    <div className="space-y-2"><Label>{label}{isRequired && <span className="text-destructive"> *</span>}</Label>{children}</div>
);

function ImpotSynthetiqueForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((d: any) => ({ ...d, [field]: value }));
    return <div className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><FormField label="NCC" isRequired><Input value={data.ncc || ''} onChange={e => handleChange('ncc', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Raison sociale/Nom" isRequired><Input value={data.raisonSociale || ''} onChange={e => handleChange('raisonSociale', e.target.value)} disabled={isViewMode} /></FormField></div><FormField label="Adresse du local" isRequired><Input value={data.adresseLocal || ''} onChange={e => handleChange('adresseLocal', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Nature de l'activité" isRequired><Input value={data.natureActivite || ''} onChange={e => handleChange('natureActivite', e.target.value)} disabled={isViewMode} /></FormField><div className="grid md:grid-cols-2 gap-4"><FormField label="CA Prévisionnel" isRequired><Input type="number" value={data.caPrevisionnel || ''} onChange={e => handleChange('caPrevisionnel', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Montant de l'impôt" isRequired><Input type="number" value={data.montantImpotSynthetique || ''} onChange={e => handleChange('montantImpotSynthetique', e.target.value)} disabled={isViewMode} /></FormField></div></div>;
}
function DroitsTimbreForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((d: any) => ({ ...d, [field]: value }));
    return <div className="space-y-4"><FormField label="Type de document" isRequired><Input value={data.typeDocument || ''} onChange={e => handleChange('typeDocument', e.target.value)} disabled={isViewMode} /></FormField><div className="grid md:grid-cols-2 gap-4"><FormField label="Nombre de pages" isRequired><Input type="number" value={data.nombrePages || ''} onChange={e => handleChange('nombrePages', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Valeur timbre unitaire" isRequired><Input type="number" value={data.valeurTimbreUnitaire || ''} onChange={e => handleChange('valeurTimbreUnitaire', e.target.value)} disabled={isViewMode} /></FormField></div></div>;
}
// Add other form components here...

function TaxFormRenderer({ type, data, setData, isViewMode }: { type: TaxType, data: any, setData: Function, isViewMode: boolean }) {
    switch (type) {
        case "Impôt synthétique": return <ImpotSynthetiqueForm data={data} setData={setData} isViewMode={isViewMode} />;
        case "Droits de timbre": return <DroitsTimbreForm data={data} setData={setData} isViewMode={isViewMode} />;
        // Other cases will be added here
        default: return <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50"><p>Formulaire non disponible pour le type '{type}'.</p></div>;
    }
}


function AutresImpotsMainContent() {
    const [impots, setImpots] = useState(initialAutresImpots);
    const [impotToDelete, setImpotToDelete] = useState<AutreImpot | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImpot, setEditingImpot] = useState<AutreImpot | null>(null);
    const [viewingImpot, setViewingImpot] = useState<AutreImpot | null>(null);
    const { toast } = useToast();
    
    const openCreateModal = () => {
        setEditingImpot(null);
        setIsModalOpen(true);
    };
    
    const openEditModal = (impot: AutreImpot) => {
        setEditingImpot(impot);
        setIsModalOpen(true);
    };

    const handleSave = (formData: any) => {
        let finalAmount = 0;
        switch(formData.type) {
            case "Droits de timbre":
                finalAmount = (formData.data.nombrePages || 0) * (formData.data.valeurTimbreUnitaire || 0);
                break;
            case "Impôt synthétique":
                finalAmount = formData.data.montantImpotSynthetique || 0;
                break;
            default:
                finalAmount = formData.data.montant || 0;
        }

        if (editingImpot) {
            setImpots(prev => prev.map(d => d.id === editingImpot.id ? { ...editingImpot, ...formData, statut: 'À payer', montant: finalAmount } : d));
            toast({ title: 'Taxe modifiée', description: 'La taxe a été mise à jour.' });
        } else {
            const newImpot: AutreImpot = {
                id: `tax_${Date.now()}`,
                ...formData,
                montant: finalAmount,
                statut: 'Brouillon',
                echeance: formData.echeance || 'À définir',
            };
            setImpots(prev => [newImpot, ...prev]);
            toast({ title: 'Taxe créée', description: 'La nouvelle taxe a été ajoutée en tant que brouillon.' });
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (impotToDelete) {
            setImpots(prev => prev.filter(d => d.id !== impotToDelete.id));
            toast({ title: 'Taxe supprimée' });
            setImpotToDelete(null);
        }
    };
    
    const handleMarkAsPaid = (id: string) => {
        setImpots(prev => prev.map(d => d.id === id ? { ...d, statut: 'Payé' } : d));
        toast({ title: 'Statut mis à jour', description: 'La taxe a été marquée comme payée.' });
    };

    const handlePrint = (impot: AutreImpot) => {
        const doc = new jsPDF();
        const printDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        
        doc.setFontSize(18);
        doc.text("Déclaration - Autres Impôts et Taxes", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Imprimé via UNIKORP ® le ${printDate}`, 105, 28, { align: 'center' });
        
        const bodyData = Object.entries(impot.data).map(([key, value]) => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), String(value)]);

        autoTable(doc, {
            startY: 40,
            head: [['Champ', 'Valeur']],
            body: [
                ['Type d\'impôt', impot.type],
                ['Période', impot.periode],
                ['Échéance', impot.echeance],
                ['Montant Dû', `${impot.montant.toLocaleString('fr-FR')} €`],
                ['Statut', impot.statut],
                ...bodyData,
            ],
            theme: 'grid'
        });

        doc.save(`declaration_${impot.type.replace(/\s/g, '_')}.pdf`);
    };

    const getStatusBadge = (impot: AutreImpot) => {
        switch (impot.statut) {
            case 'Brouillon': return <Badge variant="outline">Brouillon</Badge>;
            case 'À payer': return <Button size="sm" variant="destructive" onClick={() => handleMarkAsPaid(impot.id)}>Marquer comme payée</Button>;
            case 'Payé': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Payé</Badge>;
        }
    };
    
  return (
    <>
    <Card className="w-full">
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">Autres Impôts et Taxes</CardTitle>
                    <CardDescription>Suivi des impôts, taxes et droits divers.</CardDescription>
                </div>
                <Button onClick={openCreateModal}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une taxe
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Période</TableHead>
                        <TableHead>Impôt / Taxe</TableHead>
                        <TableHead className="text-right">Montant Dû</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                        <TableHead className="text-center w-[150px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {impots.map((impot) => {
                        const isPaid = impot.statut === 'Payé';
                        return (
                        <TableRow key={impot.id}>
                            <TableCell className="font-medium">{impot.periode}</TableCell>
                            <TableCell><Badge variant="secondary">{impot.type}</Badge></TableCell>
                            <TableCell className="text-right font-mono">{impot.montant.toLocaleString('fr-FR')} €</TableCell>
                            <TableCell className="text-center">{getStatusBadge(impot)}</TableCell>
                             <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => setViewingImpot(impot)}><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" disabled={isPaid} onClick={() => openEditModal(impot)}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handlePrint(impot)}><Download className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isPaid} onClick={() => setImpotToDelete(impot)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
    
    <TaxModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        taxToEdit={editingImpot}
    />

    <ViewTaxModal 
        isOpen={!!viewingImpot}
        onClose={() => setViewingImpot(null)}
        tax={viewingImpot}
    />
    
    <AlertDialog open={!!impotToDelete} onOpenChange={() => setImpotToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Supprimer cette taxe ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

function TaxModal({ isOpen, onClose, onSave, taxToEdit }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, taxToEdit: AutreImpot | null }) {
    const { toast } = useToast();
    const [type, setType] = useState<TaxType>(taxToEdit?.type || 'Impôt synthétique');
    const [data, setData] = useState(taxToEdit?.data || getDefaultDataForType(type));
    const [echeance, setEcheance] = useState(taxToEdit?.echeance || '');
    const [periode, setPeriode] = useState(taxToEdit?.periode || '');


    useEffect(() => {
        if (isOpen) {
            const initialType = taxToEdit?.type || 'Impôt synthétique';
            setType(initialType);
            setData(taxToEdit ? taxToEdit.data : getDefaultDataForType(initialType));
            setEcheance(taxToEdit?.echeance || '');
            setPeriode(taxToEdit?.periode || '');
        }
    }, [isOpen, taxToEdit]);
    
    const handleTypeChange = (newType: TaxType) => {
        if (!taxToEdit) { // Allow type change only for new declarations
            setType(newType);
            setData(getDefaultDataForType(newType));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type, data, echeance, periode });
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{taxToEdit ? 'Modifier la' : 'Créer une'} taxe</DialogTitle>
                        <DialogDescription>Renseignez les détails de l'impôt ou de la taxe.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField label="Type d'impôt" isRequired>
                                <Select value={type} onValueChange={handleTypeChange} disabled={!!taxToEdit}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{TaxTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormField>
                            <FormField label="Période" isRequired>
                                <Input value={periode} onChange={e => setPeriode(e.target.value)} placeholder="Ex: Année 2024, T3 2024..." />
                            </FormField>
                             <FormField label="Échéance" isRequired>
                                <Input value={echeance} onChange={e => setEcheance(e.target.value)} placeholder="Ex: 15/10/2024..." />
                            </FormField>
                        </div>
                        <Separator />
                        <TaxFormRenderer type={type} data={data} setData={setData} isViewMode={false} />
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

function ViewTaxModal({ isOpen, onClose, tax }: { isOpen: boolean, onClose: () => void, tax: AutreImpot | null }) {
    if (!tax) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Détails de la Taxe : {tax.type}</DialogTitle>
                    <DialogDescription>Période: {tax.periode} | Échéance: {tax.echeance}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                   <TaxFormRenderer type={tax.type} data={tax.data} setData={()=>{}} isViewMode={true} />
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function AutresImpotsPage() {
    return (
        <FiscalPageLayout>
            <AutresImpotsMainContent />
        </FiscalPageLayout>
    )
}
