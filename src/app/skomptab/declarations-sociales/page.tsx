
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye, Pencil, Trash2, Download, CheckCircle, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';


// --- TYPES ---
type DeclarationType = 'Immatriculation Employeur' | 'Immatriculation Salarié' | 'Déclaration Mensuelle Salaires' | 'DAS' | 'Accident de Travail' | 'Maladie Professionnelle' | 'Modification Salarié' | 'Déclaration trimestrielle des cotisations';
type DeclarationStatus = 'Brouillon' | 'Validée' | 'Déposée' | 'Traitée';

type Declaration = {
    id: string;
    type: DeclarationType;
    periode: string;
    statut: DeclarationStatus;
    data: any;
};

const DeclarationTypeOptions: DeclarationType[] = [
    'Immatriculation Employeur', 
    'Immatriculation Salarié', 
    'Déclaration Mensuelle Salaires',
    'Déclaration trimestrielle des cotisations',
    'DAS', 
    'Accident de Travail', 
    'Maladie Professionnelle', 
    'Modification Salarié'
];

// --- MOCK DATA ---
const initialDeclarations: Declaration[] = [
    { id: 'dms1', type: 'Déclaration Mensuelle Salaires', periode: 'Juillet 2024', statut: 'Validée', data: { numeroCnpEmployeur: 'CNPS-12345', periode: '2024-07', masseSalarialeBrute: 86100, detailEmployes: [] } },
    { id: 'dms2', type: 'Déclaration Mensuelle Salaires', periode: 'Juin 2024', statut: 'Traitée', data: { numeroCnpEmployeur: 'CNPS-12345', periode: '2024-06', masseSalarialeBrute: 85200, detailEmployes: [] } },
    { id: 'modif1', type: 'Modification Salarié', periode: '01/07/2024', statut: 'Traitée', data: { typeMouvement: 'embauche', identiteSalarie: 'Sophie Martin' } },
    { id: 'das1', type: 'DAS', periode: 'Année 2023', statut: 'Traitée', data: { anneeReference: '2023', masseSalarialeAnnuelle: 1025000 } },
    { id: 'immat1', type: 'Immatriculation Employeur', periode: '15/05/2024', statut: 'Traitée', data: { denominationSociale: 'Nouvelle Filiale SARL' } },
    { id: 'trim1', type: 'Déclaration trimestrielle des cotisations', periode: 'T2 2024', statut: 'Traitée', data: { masseSalarialeTrimestrielle: 255600 } },
];

const getDefaultDataForType = (type: DeclarationType): any => {
    const base = {
        dateDeclaration: format(new Date(), 'yyyy-MM-dd'),
    };
    switch(type) {
        case 'Immatriculation Employeur': return { ...base, denominationSociale: 'Votre Société S.A.', formeJuridique: 'SARL', adresseSiegeSocial: '', secteurActivite: '', numeroRccm: '', nif: '', nombreEmployesPrevisionnels: 0, dateDebutActivite: '', coordonneesDirigeant: '' };
        case 'Immatriculation Salarié': return { ...base, nom: '', prenom: '', dateNaissance: '', lieuNaissance: '', sexe: 'Masculin', nationalite: 'Ivoirienne', adresseResidence: '', fonction: '', salaireBase: 0, dateEmbauche: '', numeroCni: '' };
        case 'Déclaration Mensuelle Salaires': return { ...base, numeroCnpEmployeur: 'CNPS-12345', periode: format(new Date(), 'yyyy-MM'), masseSalarialeBrute: 0, detailEmployes: [] };
        case 'Déclaration trimestrielle des cotisations': return { ...base, numeroCnpEmployeur: 'CNPS-12345', trimestre: 'T1', annee: new Date().getFullYear().toString(), effectifMoyen: 0, masseSalarialeTrimestrielle: 0, montantVerse: 0 };
        case 'DAS': return { ...base, numeroCnpEmployeur: 'CNPS-12345', anneeReference: new Date().getFullYear().toString(), effectifTotal: 0, masseSalarialeAnnuelle: 0, cotisationsVersees: 0, regularisations: '' };
        case 'Accident de Travail': return { ...base, numeroCnpEmployeur: 'CNPS-12345', identiteVictime: '', numeroCnpsVictime: '', circonstances: '', dateAccident: '', heureAccident: '', lieuAccident: '', natureBlessures: '', temoins: '', arretTravail: '' };
        case 'Maladie Professionnelle': return { ...base, numeroCnpEmployeur: 'CNPS-12345', identiteTravailleur: '', numeroCnpsTravailleur: '', natureMaladie: '', posteOccupe: '', dureeExposition: '', diagnosticMedical: '', datePremiereConstatation: '' };
        case 'Modification Salarié': return { ...base, numeroCnpEmployeur: 'CNPS-12345', typeMouvement: 'embauche', identiteSalarie: '', numeroCnpsSalarie: '', dateEffet: '', motifDepart: '', nouveauSalaire: 0 };
        default: return { ...base };
    }
}

const calculateCotisations = (data: any) => {
    const masseSalariale = data.masseSalarialeBrute || 0;
    const cp = masseSalariale * 0.165;
    const cs = masseSalariale * 0.035;
    return { cotisationsPatronales: cp, cotisationsSalariales: cs, total: cp + cs };
};

const calculateCotisationsTrimestrielles = (data: any) => {
    const masse = data.masseSalarialeTrimestrielle || 0;
    const verse = data.montantVerse || 0;
    const dues = masse * (0.165 + 0.035); // 20% total
    return { cotisationsDues: dues, solde: dues - verse };
};


// --- FORM COMPONENTS ---

const FormField = ({ label, children, isRequired, fullWidth }: { label: string, children: React.ReactNode, isRequired?: boolean, fullWidth?: boolean }) => (
    <div className={cn("space-y-1.5", fullWidth && "col-span-full")}>
        <Label>{label}{isRequired && <span className="text-destructive"> *</span>}</Label>
        {children}
    </div>
);

function ImmatriculationEmployeurForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    return <div className="grid md:grid-cols-2 gap-4"><FormField label="Dénomination sociale" isRequired><Input value={data.denominationSociale} onChange={e => handleChange('denominationSociale', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Forme juridique" isRequired><Input value={data.formeJuridique} onChange={e => handleChange('formeJuridique', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Adresse du siège social" isRequired fullWidth><Input value={data.adresseSiegeSocial} onChange={e => handleChange('adresseSiegeSocial', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Secteur d'activité" isRequired><Input value={data.secteurActivite} onChange={e => handleChange('secteurActivite', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Numéro RCCM" isRequired><Input value={data.numeroRccm} onChange={e => handleChange('numeroRccm', e.target.value)} disabled={isViewMode} /></FormField><FormField label="NIF/NCC" isRequired><Input value={data.nif} onChange={e => handleChange('nif', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Date de début d'activité" isRequired><Input type="date" value={data.dateDebutActivite} onChange={e => handleChange('dateDebutActivite', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Nombre d'employés prévisionnels" isRequired><Input type="number" value={data.nombreEmployesPrevisionnels} onChange={e => handleChange('nombreEmployesPrevisionnels', parseInt(e.target.value))} disabled={isViewMode} /></FormField><FormField label="Coordonnées du dirigeant" isRequired><Input value={data.coordonneesDirigeant} onChange={e => handleChange('coordonneesDirigeant', e.target.value)} disabled={isViewMode} /></FormField></div>;
}

function ImmatriculationSalarieForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    return <div className="grid md:grid-cols-2 gap-4"><FormField label="Nom" isRequired><Input value={data.nom} onChange={e => handleChange('nom', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Prénoms" isRequired><Input value={data.prenom} onChange={e => handleChange('prenom', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Date de naissance" isRequired><Input type="date" value={data.dateNaissance} onChange={e => handleChange('dateNaissance', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Lieu de naissance" isRequired><Input value={data.lieuNaissance} onChange={e => handleChange('lieuNaissance', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Sexe" isRequired><Select value={data.sexe} onValueChange={v => handleChange('sexe', v)} disabled={isViewMode}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Masculin">Masculin</SelectItem><SelectItem value="Féminin">Féminin</SelectItem></SelectContent></Select></FormField><FormField label="Nationalité" isRequired><Input value={data.nationalite} onChange={e => handleChange('nationalite', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Adresse de résidence" isRequired fullWidth><Input value={data.adresseResidence} onChange={e => handleChange('adresseResidence', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Fonction/Poste occupé" isRequired><Input value={data.fonction} onChange={e => handleChange('fonction', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Salaire de base" isRequired><Input type="number" value={data.salaireBase} onChange={e => handleChange('salaireBase', parseFloat(e.target.value))} disabled={isViewMode} /></FormField><FormField label="Date d'embauche" isRequired><Input type="date" value={data.dateEmbauche} onChange={e => handleChange('dateEmbauche', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Numéro CNI/Passeport" isRequired><Input value={data.numeroCni} onChange={e => handleChange('numeroCni', e.target.value)} disabled={isViewMode} /></FormField></div>;
}

function DeclarationMensuelleSalairesForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    const { toast } = useToast();
    const handleImport = () => {
        toast({ title: 'Simulation', description: "Importation de l'annexe des salaires simulée." });
        setData((d:any) => ({...d, detailEmployes: [{cnps: 'CNPS-001', nom: 'Jean Dupont', date: '01/01/2024', salaire: 500000}, {cnps: 'CNPS-002', nom: 'Marie Claire', date: '01/03/2024', salaire: 450000}]}));
    }
    const { cotisationsPatronales, cotisationsSalariales, total } = useMemo(() => calculateCotisations(data), [data]);

    return <div className="space-y-4"><FormField label="N° CNPS Employeur" isRequired><Input value={data.numeroCnpEmployeur} onChange={e => handleChange('numeroCnpEmployeur', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Période (mois/année)" isRequired><Input type="month" value={data.periode} onChange={e => handleChange('periode', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Masse Salariale Brute" isRequired><Input type="number" value={data.masseSalarialeBrute} onChange={e => handleChange('masseSalarialeBrute', parseFloat(e.target.value))} disabled={isViewMode}/></FormField><Separator/><div className="grid md:grid-cols-3 gap-4"><div className="space-y-1"><Label>Cotisations Patronales (16.5%)</Label><Input disabled value={cotisationsPatronales.toLocaleString('fr-FR')} /></div><div className="space-y-1"><Label>Cotisations Salariales (3.5%)</Label><Input disabled value={cotisationsSalariales.toLocaleString('fr-FR')} /></div><div className="space-y-1"><Label>Total Cotisations Dues</Label><Input disabled value={total.toLocaleString('fr-FR')} className="font-bold text-primary"/></div></div><Separator/><div className="space-y-2"><div className="flex justify-between items-center"><Label>Détail par employé (Import obligatoire)</Label><Button type="button" variant="outline" size="sm" onClick={handleImport} disabled={isViewMode}><Upload className="mr-2 h-4 w-4" /> Importer Annexe</Button></div><div className="border rounded-md max-h-48 overflow-y-auto"><Table>{!isViewMode && data.detailEmployes.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">Importez le fichier pour voir le détail.</div> : <><TableHeader><TableRow><TableHead>N° CNPS</TableHead><TableHead>Nom & Prénoms</TableHead><TableHead>Date Arrivée</TableHead><TableHead className="text-right">Salaire Brut</TableHead></TableRow></TableHeader><TableBody>{data.detailEmployes.map((e:any, i:number) => <TableRow key={i}><TableCell>{e.cnps}</TableCell><TableCell>{e.nom}</TableCell><TableCell>{e.date}</TableCell><TableCell className="text-right">{e.salaire.toLocaleString('fr-FR')}</TableCell></TableRow>)}</TableBody></>}</Table></div></div></div>;
}

function DeclarationTrimestrielleForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    const { cotisationsDues, solde } = useMemo(() => calculateCotisationsTrimestrielles(data), [data]);
    return <div className="grid md:grid-cols-2 gap-4"><FormField label="N° CNPS Employeur" isRequired><Input value={data.numeroCnpEmployeur} onChange={e => handleChange('numeroCnpEmployeur', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Trimestre"><Select value={data.trimestre} onValueChange={v => handleChange('trimestre', v)} disabled={isViewMode}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="T1">1er Trimestre</SelectItem><SelectItem value="T2">2ème Trimestre</SelectItem><SelectItem value="T3">3ème Trimestre</SelectItem><SelectItem value="T4">4ème Trimestre</SelectItem></SelectContent></Select></FormField><FormField label="Année"><Input value={data.annee} onChange={e => handleChange('annee', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Effectif moyen du trimestre"><Input type="number" value={data.effectifMoyen} onChange={e => handleChange('effectifMoyen', parseInt(e.target.value))} disabled={isViewMode}/></FormField><FormField label="Masse salariale trimestrielle"><Input type="number" value={data.masseSalarialeTrimestrielle} onChange={e => handleChange('masseSalarialeTrimestrielle', parseFloat(e.target.value))} disabled={isViewMode}/></FormField><FormField label="Montant versé"><Input type="number" value={data.montantVerse} onChange={e => handleChange('montantVerse', parseFloat(e.target.value))} disabled={isViewMode}/></FormField><FormField label="Cotisations dues"><Input value={cotisationsDues.toLocaleString('fr-FR')} disabled/></FormField><FormField label="Solde à régulariser"><Input value={solde.toLocaleString('fr-FR')} disabled/></FormField></div>
}

function DasForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    return <div className="grid md:grid-cols-2 gap-4"><FormField label="N° CNPS Employeur" isRequired><Input value={data.numeroCnpEmployeur} onChange={e => handleChange('numeroCnpEmployeur', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Année de référence" isRequired><Input value={data.anneeReference} onChange={e => handleChange('anneeReference', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Effectif total au 31/12" isRequired><Input type="number" value={data.effectifTotal} onChange={e => handleChange('effectifTotal', parseInt(e.target.value))} disabled={isViewMode}/></FormField><FormField label="Masse salariale annuelle" isRequired><Input type="number" value={data.masseSalarialeAnnuelle} onChange={e => handleChange('masseSalarialeAnnuelle', parseFloat(e.target.value))} disabled={isViewMode}/></FormField><FormField label="Cotisations versées dans l'année" isRequired><Input type="number" value={data.cotisationsVersees} onChange={e => handleChange('cotisationsVersees', parseFloat(e.target.value))} disabled={isViewMode}/></FormField><FormField label="Régularisations éventuelles" fullWidth><Textarea value={data.regularisations} onChange={e => handleChange('regularisations', e.target.value)} disabled={isViewMode}/></FormField></div>;
}

function AccidentTravailForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    return <div className="space-y-4"><FormField label="N° CNPS Employeur" isRequired><Input value={data.numeroCnpEmployeur} onChange={e => handleChange('numeroCnpEmployeur', e.target.value)} disabled={isViewMode}/></FormField><div className="grid md:grid-cols-2 gap-4"><FormField label="Identité de la victime" isRequired><Input value={data.identiteVictime} onChange={e => handleChange('identiteVictime', e.target.value)} disabled={isViewMode}/></FormField><FormField label="N° CNPS de la victime" isRequired><Input value={data.numeroCnpsVictime} onChange={e => handleChange('numeroCnpsVictime', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Date de l'accident" isRequired><Input type="date" value={data.dateAccident} onChange={e => handleChange('dateAccident', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Heure de l'accident" isRequired><Input type="time" value={data.heureAccident} onChange={e => handleChange('heureAccident', e.target.value)} disabled={isViewMode}/></FormField></div><FormField label="Lieu de l'accident" isRequired><Input value={data.lieuAccident} onChange={e => handleChange('lieuAccident', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Circonstances de l'accident" isRequired><Textarea value={data.circonstances} onChange={e => handleChange('circonstances', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Nature des blessures" isRequired><Input value={data.natureBlessures} onChange={e => handleChange('natureBlessures', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Témoins éventuels"><Input value={data.temoins} onChange={e => handleChange('temoins', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Arrêt de travail prescrit"><Input value={data.arretTravail} onChange={e => handleChange('arretTravail', e.target.value)} disabled={isViewMode}/></FormField></div>;
}

function MaladieProfessionnelleForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    return <div className="space-y-4"><FormField label="N° CNPS Employeur" isRequired><Input value={data.numeroCnpEmployeur} onChange={e => handleChange('numeroCnpEmployeur', e.target.value)} disabled={isViewMode}/></FormField><div className="grid md:grid-cols-2 gap-4"><FormField label="Identité du travailleur" isRequired><Input value={data.identiteTravailleur} onChange={e => handleChange('identiteTravailleur', e.target.value)} disabled={isViewMode}/></FormField><FormField label="N° CNPS du travailleur" isRequired><Input value={data.numeroCnpsTravailleur} onChange={e => handleChange('numeroCnpsTravailleur', e.target.value)} disabled={isViewMode}/></FormField></div><FormField label="Nature de la maladie" isRequired><Input value={data.natureMaladie} onChange={e => handleChange('natureMaladie', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Poste occupé" isRequired><Input value={data.posteOccupe} onChange={e => handleChange('posteOccupe', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Durée d'exposition au risque"><Input value={data.dureeExposition} onChange={e => handleChange('dureeExposition', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Diagnostic médical" isRequired><Textarea value={data.diagnosticMedical} onChange={e => handleChange('diagnosticMedical', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Date de première constatation médicale" isRequired><Input type="date" value={data.datePremiereConstatation} onChange={e => handleChange('datePremiereConstatation', e.target.value)} disabled={isViewMode}/></FormField></div>;
}

function ModificationSalarieForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    return <div className="grid md:grid-cols-2 gap-4"><FormField label="N° CNPS Employeur" isRequired><Input value={data.numeroCnpEmployeur} onChange={e => handleChange('numeroCnpEmployeur', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Type de mouvement" isRequired><Select value={data.typeMouvement} onValueChange={v => handleChange('typeMouvement', v)} disabled={isViewMode}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="embauche">Embauche</SelectItem><SelectItem value="départ">Départ</SelectItem><SelectItem value="modification">Modification</SelectItem></SelectContent></Select></FormField><FormField label="Identité du salarié" isRequired><Input value={data.identiteSalarie} onChange={e => handleChange('identiteSalarie', e.target.value)} disabled={isViewMode}/></FormField><FormField label="N° CNPS du salarié" isRequired><Input value={data.numeroCnpsSalarie} onChange={e => handleChange('numeroCnpsSalarie', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Date d'effet" isRequired><Input type="date" value={data.dateEffet} onChange={e => handleChange('dateEffet', e.target.value)} disabled={isViewMode}/></FormField>{data.typeMouvement === 'départ' && <FormField label="Motif du départ"><Input value={data.motifDepart} onChange={e => handleChange('motifDepart', e.target.value)} disabled={isViewMode}/></FormField>}{data.typeMouvement === 'modification' && <FormField label="Nouveau salaire"><Input type="number" value={data.nouveauSalaire} onChange={e => handleChange('nouveauSalaire', parseFloat(e.target.value))} disabled={isViewMode}/></FormField>}</div>;
}


function DeclarationFormRenderer({ type, data, setData, isViewMode }: { type: DeclarationType, data: any, setData: Function, isViewMode: boolean }) {
    const renderFormContent = () => {
        switch (type) {
            case 'Immatriculation Employeur': return <ImmatriculationEmployeurForm data={data} setData={setData} isViewMode={isViewMode} />;
            case 'Immatriculation Salarié': return <ImmatriculationSalarieForm data={data} setData={setData} isViewMode={isViewMode} />;
            case 'Déclaration Mensuelle Salaires': return <DeclarationMensuelleSalairesForm data={data} setData={setData} isViewMode={isViewMode} />;
            case 'Déclaration trimestrielle des cotisations': return <DeclarationTrimestrielleForm data={data} setData={setData} isViewMode={isViewMode} />;
            case 'DAS': return <DasForm data={data} setData={setData} isViewMode={isViewMode} />;
            case 'Accident de Travail': return <AccidentTravailForm data={data} setData={setData} isViewMode={isViewMode} />;
            case 'Maladie Professionnelle': return <MaladieProfessionnelleForm data={data} setData={setData} isViewMode={isViewMode} />;
            case 'Modification Salarié': return <ModificationSalarieForm data={data} setData={setData} isViewMode={isViewMode} />;
            default: return <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50"><p>Formulaire non disponible pour le type '{type}'.</p></div>;
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

    const openCreateModal = () => {
        setEditingDeclaration(null);
        setSelectedType(null);
        setIsModalOpen(true);
    };

    const openEditModal = (declaration: Declaration) => {
        setEditingDeclaration(declaration);
        setSelectedType(declaration.type);
        setIsModalOpen(true);
    };

    const handleSaveDeclaration = (formData: any) => {
        if (!selectedType) return;
        
        if (editingDeclaration) {
            setDeclarations(prev => prev.map(d => d.id === editingDeclaration.id ? { ...editingDeclaration, type: selectedType, data: formData, statut: 'Validée' } : d));
            toast({ title: 'Déclaration modifiée', description: `La déclaration a été mise à jour.` });
        } else {
            const newDeclaration: Declaration = {
                id: `d_${Date.now()}`,
                type: selectedType,
                data: formData,
                statut: 'Brouillon',
                periode: formData.periode || formData.anneeReference || formData.dateEffet || format(parseISO(formData.dateDeclaration), 'dd/MM/yyyy', { locale: fr })
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
        const doc = new jsPDF();
        const printDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: fr });
        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SOCIX";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        
        const drawHeader = (pageTitle: string, data: any) => {
            doc.setFontSize(9); doc.setTextColor(150);
            doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
            doc.setDrawColor(220); doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
            doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
            doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
            doc.text(companyName, data.settings.margin.left + 15, 28);
            doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
            const rightX = doc.internal.pageSize.width - data.settings.margin.right;
            doc.text(`État : ${pageTitle}`, rightX, 25, { align: 'right' });
            doc.text(`Période : ${declaration.periode}`, rightX, 30, { align: 'right' });
            doc.text(`Imprimé le : ${printDate}`, rightX, 35, { align: 'right' });
            doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
        };
    
        const addSection = (title: string, body: any[][], startY: number) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 14, startY);
            autoTable(doc, {
                startY: startY + 5,
                body: body,
                theme: 'grid',
                styles: { fontSize: 9 },
                columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' } },
            });
            return (doc as any).lastAutoTable.finalY + 10;
        };

        const generateSimpleTable = (title: string, bodyData: any[][]) => {
            autoTable(doc, {
                head: [[{content: title, styles: {halign: 'center', fillColor: [226, 232, 240]}}]],
                body: bodyData,
                theme: 'grid',
                columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold' } },
                didDrawPage: (d) => drawHeader(declaration.type, d),
                margin: { top: 50 },
            });
        };
        
        switch (declaration.type) {
            case 'Immatriculation Employeur': {
                generateSimpleTable("Demande d'Immatriculation Employeur", Object.entries(declaration.data)
                    .filter(([key]) => key !== 'dateDeclaration')
                    .map(([key, value]) => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), String(value)]));
                break;
            }
             case 'Immatriculation Salarié': {
                generateSimpleTable("Demande d'Immatriculation Salarié", Object.entries(declaration.data)
                    .filter(([key]) => key !== 'dateDeclaration')
                    .map(([key, value]) => [key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), String(value)]));
                break;
            }
            case 'Déclaration Mensuelle Salaires': {
                const data = declaration.data;
                const { cotisationsPatronales, cotisationsSalariales, total } = calculateCotisations(data);
                
                autoTable(doc, {
                    didDrawPage: (d) => drawHeader("Déclaration Mensuelle des Salaires", d),
                    margin: { top: 50 },
                });
                
                let startY = (doc as any).lastAutoTable.finalY || 50;
    
                startY = addSection("Informations Générales", [
                    ['N° CNPS Employeur', data.numeroCnpEmployeur],
                    ['Période', data.periode],
                    ['Masse Salariale Brute', `${(data.masseSalarialeBrute || 0).toLocaleString('fr-FR')} FCFA`],
                ], startY);
                
                startY = addSection("Calcul des Cotisations", [
                    ['Cotisations Patronales (16.5%)', `${cotisationsPatronales.toLocaleString('fr-FR')} FCFA`],
                    ['Cotisations Salariales (3.5%)', `${cotisationsSalariales.toLocaleString('fr-FR')} FCFA`],
                    ['Total Cotisations Dues', `${total.toLocaleString('fr-FR')} FCFA`],
                ], startY);
    
                if (data.detailEmployes && data.detailEmployes.length > 0) {
                     doc.setFontSize(12);
                     doc.setFont('helvetica', 'bold');
                     doc.text("Annexe - Détail des Salaires", 14, startY);
                     autoTable(doc, {
                        startY: startY + 5,
                        head: [['N° CNPS', 'Nom & Prénoms', 'Date Arrivée', 'Salaire Brut']],
                        body: data.detailEmployes.map((e: any) => [e.cnps, e.nom, e.date, `${e.salaire.toLocaleString('fr-FR')} FCFA`]),
                        theme: 'striped',
                        headStyles: { fillColor: '#e2e8f0' },
                     });
                }
    
                break;
            }
             case 'Accident de Travail': {
                 const data = declaration.data;
                 autoTable(doc, {
                    didDrawPage: (d) => drawHeader("Déclaration d'Accident de Travail", d),
                    margin: { top: 50 },
                 });
                let startY = (doc as any).lastAutoTable.finalY || 50;

                startY = addSection("Identification", [
                    ['N° CNPS Employeur', data.numeroCnpEmployeur],
                    ['Identité de la Victime', data.identiteVictime],
                    ['N° CNPS de la Victime', data.numeroCnpsVictime],
                ], startY);
                startY = addSection("Circonstances", [
                    ['Date et Heure', `${data.dateAccident} à ${data.heureAccident}`],
                    ['Lieu', data.lieuAccident],
                    ['Circonstances', data.circonstances],
                    ['Témoins', data.temoins || 'Aucun'],
                ], startY);
                startY = addSection("Conséquences", [
                    ['Nature des Blessures', data.natureBlessures],
                    ['Arrêt de travail prescrit', data.arretTravail || 'Non précisé'],
                ], startY);
    
                break;
            }
            default:
                doc.text("Modèle d'impression non disponible pour ce type de déclaration.", 15, 20);
        }
        
        doc.save(`declaration_${declaration.type.replace(/\s+/g, '_')}_${declaration.periode}.pdf`);
        toast({ title: "Téléchargement lancé" });
    };

    const immatriculationTypes: DeclarationType[] = ['Immatriculation Employeur', 'Immatriculation Salarié'];
    const periodiqueTypes: DeclarationType[] = ['Déclaration Mensuelle Salaires', 'Déclaration trimestrielle des cotisations', 'DAS'];
    const mouvementTypes: DeclarationType[] = ['Modification Salarié'];
    const accidentTypes: DeclarationType[] = ['Accident de Travail', 'Maladie Professionnelle'];

    const immatriculations = declarations.filter(d => immatriculationTypes.includes(d.type));
    const periodiques = declarations.filter(d => periodiqueTypes.includes(d.type));
    const mouvements = declarations.filter(d => mouvementTypes.includes(d.type));
    const accidents = declarations.filter(d => accidentTypes.includes(d.type));
    
    const renderTable = (declarationsToRender: Declaration[]) => (
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
                {declarationsToRender.length > 0 ? declarationsToRender.map((d) => {
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
                )}) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Aucune déclaration dans cette catégorie.</TableCell></TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <>
            <Tabs defaultValue="immatriculations" className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Déclarations Sociales</CardTitle>
                            <CardDescription>Gérez et suivez l'état de toutes vos déclarations sociales.</CardDescription>
                        </div>
                        <Button onClick={openCreateModal}><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Déclaration</Button>
                    </div>
                     <TabsList className="grid w-full grid-cols-4 mt-4">
                        <TabsTrigger value="immatriculations">Immatriculations</TabsTrigger>
                        <TabsTrigger value="periodiques">Périodiques</TabsTrigger>
                        <TabsTrigger value="mouvements">Mouvements</TabsTrigger>
                        <TabsTrigger value="accidents">Accidents & Maladies</TabsTrigger>
                    </TabsList>
                </CardHeader>

                <TabsContent value="immatriculations" className="mt-0">
                     <Card className="border-t-0 rounded-t-none">
                        <CardContent className="pt-6">
                            {renderTable(immatriculations)}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="periodiques" className="mt-0">
                     <Card className="border-t-0 rounded-t-none">
                         <CardContent className="pt-6">
                            {renderTable(periodiques)}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="mouvements" className="mt-0">
                     <Card className="border-t-0 rounded-t-none">
                         <CardContent className="pt-6">
                            {renderTable(mouvements)}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="accidents" className="mt-0">
                     <Card className="border-t-0 rounded-t-none">
                         <CardContent className="pt-6">
                            {renderTable(accidents)}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>


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

function DeclarationModal({ isOpen, onClose, onSave, declarationToEdit, selectedType, setSelectedType }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, declarationToEdit: Declaration | null, selectedType: DeclarationType | null, setSelectedType: (type: DeclarationType | null) => void }) {
    const [data, setData] = useState<any | null>(null);

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
        <DeclarationsSocialesMainContent />
    );
}
