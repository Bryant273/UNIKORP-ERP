
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
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Pencil, Trash2, Copy, SlidersHorizontal, ArrowDownUp, TestTube2, ChevronsUpDown, Info, FileText, List, Percent, User, Palette, ShieldCheck, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Logo } from '@/components/logo';

// --- TYPES ---

type RubriqueType = 'Gain' | 'Retenue' | 'Cotisation' | 'Info';

type Rubrique = {
  id: string;
  code: string;
  libelle: string;
  type: RubriqueType;
  ordre: number;
  formule: string;
  visible: boolean;
  actif: boolean;
  inversable: boolean;
};

type Constante = {
  id: string;
  code: string;
  libelle: string;
  valeur: number;
  unite: string;
};

type Variable = {
  id: string;
  code: string;
  libelle: string;
  description: string;
};

type ModelePaie = {
  id: number;
  nom: string;
  description: string;
  rubriques: Rubrique[];
  constantes: Constante[];
  variables: Variable[];
};

// --- MOCK DATA ---

const initialModeles: ModelePaie[] = [
  {
    id: 1,
    nom: 'Cadre Mensuel',
    description: 'Modèle standard pour les employés cadres mensualisés.',
    rubriques: [
      { id: 'r1', code: 'SB', libelle: 'Salaire de base', type: 'Gain', ordre: 10, formule: 'salaireMensuel', visible: true, actif: true, inversable: true },
      { id: 'r2', code: 'PA', libelle: 'Prime d\'ancienneté', type: 'Gain', ordre: 20, formule: 'SB * anciennete * 0.01', visible: true, actif: true, inversable: false },
      { id: 'r3', code: 'C01', libelle: 'Cotisation CNPS', type: 'Cotisation', ordre: 100, formule: 'salaireBrut * TAUX_CNPS', visible: true, actif: true, inversable: false },
    ],
    constantes: [
      { id: 'c1', code: 'SMIG', libelle: 'Salaire Minimum', valeur: 75000, unite: 'FCFA' },
      { id: 'c2', code: 'TAUX_CNPS', libelle: 'Taux CNPS Salarié', valeur: 0.035, unite: '%' },
    ],
    variables: [
      { id: 'v1', code: 'nbJours', libelle: 'Jours travaillés', description: 'Nombre de jours travaillés dans le mois.' },
      { id: 'v2', code: 'anciennete', libelle: 'Ancienneté (années)', description: 'Nombre d\'années d\'ancienneté.' },
    ],
  },
  {
    id: 2,
    nom: 'Non-Cadre Horaire',
    description: 'Modèle pour les employés non-cadres payés à l\'heure.',
    rubriques: [],
    constantes: [],
    variables: [],
  },
];

// --- MAIN PAGE COMPONENT ---

export default function TraitementPaiePage() {
    const { toast } = useToast();
    const [modeles, setModeles] = useState<ModelePaie[]>(initialModeles);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModele, setEditingModele] = useState<ModelePaie | null>(null);
    const [modeleToDelete, setModeleToDelete] = useState<ModelePaie | null>(null);
    const [previewingModele, setPreviewingModele] = useState<ModelePaie | null>(null);

    const openModal = (modele: ModelePaie | null = null) => {
        setEditingModele(modele);
        setIsModalOpen(true);
    };

    const handleSave = (formData: Omit<ModelePaie, 'id'>) => {
        if (editingModele) {
            setModeles(prev => prev.map(m => m.id === editingModele.id ? { ...editingModele, ...formData } : m));
            toast({ title: "Modèle mis à jour." });
        } else {
            const newModele: ModelePaie = { id: Date.now(), ...formData };
            setModeles(prev => [newModele, ...prev]);
            toast({ title: "Nouveau modèle créé." });
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (modeleToDelete) {
            setModeles(prev => prev.filter(m => m.id !== modeleToDelete.id));
            setModeleToDelete(null);
            toast({ title: "Modèle supprimé." });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Paramétrage des Bulletins de Paie</CardTitle>
                            <CardDescription>Gérez les modèles qui structurent le calcul de la paie pour vos employés.</CardDescription>
                        </div>
                        <Button onClick={() => openModal()}><PlusCircle className="mr-2 h-4 w-4"/>Créer un modèle</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom du Modèle</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Rubriques</TableHead>
                                <TableHead className="text-center">Constantes</TableHead>
                                <TableHead className="text-center">Variables</TableHead>
                                <TableHead className="text-center w-[200px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modeles.map(modele => (
                                <TableRow key={modele.id}>
                                    <TableCell className="font-medium">{modele.nom}</TableCell>
                                    <TableCell className="text-muted-foreground">{modele.description}</TableCell>
                                    <TableCell className="text-center"><Badge variant="secondary">{modele.rubriques.length}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge variant="secondary">{modele.constantes.length}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge variant="secondary">{modele.variables.length}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setPreviewingModele(modele)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => openModal(modele)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => toast({ title: "Fonctionnalité à venir" })}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setModeleToDelete(modele)} className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <PayrollModelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                modeleToEdit={editingModele}
            />

            <PayslipPreviewModal
                isOpen={!!previewingModele}
                onClose={() => setPreviewingModele(null)}
                modele={previewingModele}
            />

            <AlertDialog open={!!modeleToDelete} onOpenChange={() => setModeleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Supprimer ce modèle ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera toutes les rubriques associées.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// --- MODAL & SUB-COMPONENTS ---
function PayrollModelModal({ isOpen, onClose, onSave, modeleToEdit }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, modeleToEdit: ModelePaie | null }) {
    const [formData, setFormData] = useState<Omit<ModelePaie, 'id'>>({ nom: '', description: '', rubriques: [], constantes: [], variables: [] });

    useEffect(() => {
        setFormData(modeleToEdit || { nom: '', description: '', rubriques: [], constantes: [], variables: [] });
    }, [modeleToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader>
                        <DialogTitle>{modeleToEdit ? 'Modifier le modèle' : 'Nouveau Modèle de Paie'}</DialogTitle>
                        <DialogDescription>Configurez toutes les composantes de ce modèle de paie.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-4">
                        <Tabs defaultValue="rubriques" className="w-full">
                            <TabsList className="mx-6">
                                <TabsTrigger value="rubriques"><List className="mr-2 h-4 w-4"/>Rubriques</TabsTrigger>
                                <TabsTrigger value="constantes"><Percent className="mr-2 h-4 w-4"/>Constantes</TabsTrigger>
                                <TabsTrigger value="variables"><User className="mr-2 h-4 w-4"/>Variables</TabsTrigger>
                                <TabsTrigger value="parametres"><Palette className="mr-2 h-4 w-4"/>Paramètres</TabsTrigger>
                                <TabsTrigger value="ordre"><ChevronsUpDown className="mr-2 h-4 w-4"/>Ordre de Calcul</TabsTrigger>
                                <TabsTrigger value="simulation"><TestTube2 className="mr-2 h-4 w-4"/>Simulation</TabsTrigger>
                            </TabsList>
                            <div className="px-6">
                                <TabsContent value="rubriques" className="mt-4"><RubriquesTab formData={formData} setFormData={setFormData} /></TabsContent>
                                <TabsContent value="constantes" className="mt-4"><ConstantesTab formData={formData} setFormData={setFormData} /></TabsContent>
                                <TabsContent value="variables" className="mt-4"><VariablesTab formData={formData} setFormData={setFormData} /></TabsContent>
                                <TabsContent value="parametres" className="mt-4"><ParametresTab formData={formData} setFormData={setFormData} /></TabsContent>
                                <TabsContent value="ordre" className="mt-4"><OrdreCalculTab formData={formData} setFormData={setFormData} /></TabsContent>
                                <TabsContent value="simulation" className="mt-4"><SimulationTab formData={formData} /></TabsContent>
                            </div>
                        </Tabs>
                    </div>
                    <DialogFooter className="pt-4 border-t px-6"><Button type="button" variant="outline" onClick={onClose}>Annuler</Button><Button type="submit">Enregistrer le modèle</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function RubriquesTab({ formData, setFormData }: { formData: Omit<ModelePaie, 'id'>, setFormData: Function }) {
    const { toast } = useToast();
    const getTypeBadge = (type: RubriqueType) => {
        switch(type) {
            case 'Gain': return <Badge variant="default" className="bg-green-600">Gain</Badge>;
            case 'Retenue': return <Badge variant="destructive">Retenue</Badge>;
            case 'Cotisation': return <Badge variant="secondary">Cotisation</Badge>;
            case 'Info': return <Badge variant="outline">Info</Badge>;
        }
    }
    return (
        <SectionCard title="Rubriques de paie" description="Gérez toutes les lignes qui composeront le bulletin de paie." actions={<Button onClick={() => toast({title: "Fonctionnalité à venir"})} size="sm"><PlusCircle className="mr-2 h-4 w-4" />Ajouter</Button>}>
            <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Libellé</TableHead><TableHead>Type</TableHead><TableHead>Formule</TableHead><TableHead className="text-center">Ordre</TableHead><TableHead className="text-center">Actif</TableHead></TableRow></TableHeader>
                <TableBody>
                    {formData.rubriques.map(r => <TableRow key={r.id}><TableCell>{r.code}</TableCell><TableCell>{r.libelle}</TableCell><TableCell>{getTypeBadge(r.type)}</TableCell><TableCell className="font-mono text-xs">{r.formule}</TableCell><TableCell className="text-center">{r.ordre}</TableCell><TableCell className="text-center">{r.actif ? 'Oui' : 'Non'}</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </SectionCard>
    );
}
function ConstantesTab({ formData, setFormData }: { formData: Omit<ModelePaie, 'id'>, setFormData: Function }) {
    const { toast } = useToast();
    return (
        <SectionCard title="Constantes" description="Valeurs fixes réutilisables dans toutes vos formules de calcul." actions={<Button onClick={() => toast({title: "Fonctionnalité à venir"})} size="sm"><PlusCircle className="mr-2 h-4 w-4" />Ajouter</Button>}>
            <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Libellé</TableHead><TableHead className="text-right">Valeur</TableHead><TableHead>Unité</TableHead></TableRow></TableHeader>
                <TableBody>
                    {formData.constantes.map(c => <TableRow key={c.id}><TableCell>{c.code}</TableCell><TableCell>{c.libelle}</TableCell><TableCell className="text-right">{c.valeur.toLocaleString()}</TableCell><TableCell>{c.unite}</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </SectionCard>
    );
}
function VariablesTab({ formData, setFormData }: { formData: Omit<ModelePaie, 'id'>, setFormData: Function }) {
    const { toast } = useToast();
    return (
        <SectionCard title="Variables" description="Variables dynamiques liées à chaque employé ou à la période de paie." actions={<Button onClick={() => toast({title: "Fonctionnalité à venir"})} size="sm"><PlusCircle className="mr-2 h-4 w-4" />Ajouter</Button>}>
             <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Libellé</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                <TableBody>
                    {formData.variables.map(v => <TableRow key={v.id}><TableCell>{v.code}</TableCell><TableCell>{v.libelle}</TableCell><TableCell className="text-muted-foreground">{v.description}</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </SectionCard>
    );
}
function ParametresTab({ formData, setFormData }: { formData: Omit<ModelePaie, 'id'>, setFormData: Function }) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev: Omit<ModelePaie, 'id'>) => ({ ...prev, [id]: value }));
    };
    return (
         <SectionCard title="Paramètres Généraux" description="Configurez le nom et la description de ce modèle de paie.">
            <div className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2"><Label htmlFor="nom">Nom du modèle</Label><Input id="nom" value={formData.nom} onChange={handleChange} /></div>
                <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={handleChange} /></div>
            </div>
        </SectionCard>
    )
}
function OrdreCalculTab({ formData, setFormData }: { formData: Omit<ModelePaie, 'id'>, setFormData: Function }) {
    return (
        <SectionCard title="Ordre de Calcul" description="Réorganisez les rubriques pour définir l'ordre d'exécution lors du calcul du bulletin.">
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">Glissez-déposez les rubriques pour changer leur ordre de calcul (fonctionnalité à venir).</p>
                <ul className="space-y-2">
                    {formData.rubriques.sort((a,b) => a.ordre - b.ordre).map(r => (
                        <li key={r.id} className="p-2 border rounded-md flex items-center justify-between bg-card">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground w-8 text-center">{r.ordre}</span>
                                <span className="font-semibold">{r.libelle}</span>
                                <Badge variant={r.type === 'Gain' ? 'default' : 'destructive'} className={r.type === 'Gain' ? 'bg-green-600' : ''}>{r.type}</Badge>
                            </div>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground cursor-grab"/>
                        </li>
                    ))}
                </ul>
            </div>
        </SectionCard>
    );
}
function SimulationTab({ formData }: { formData: Omit<ModelePaie, 'id'>}) {
    const { toast } = useToast();
    const [netSouhaite, setNetSouhaite] = useState(0);
    const [brutCalcule, setBrutCalcule] = useState<number | null>(null);

    const handleInverse = () => {
        setBrutCalcule(null);
        if (netSouhaite > 0) {
            setTimeout(() => setBrutCalcule(netSouhaite / 0.75), 1000);
        }
    };
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <SectionCard title="Test du Modèle" description="Saisissez des valeurs fictives pour simuler un bulletin.">
                <div className="p-4 border rounded-lg space-y-4">
                    {formData.variables.map(v => (
                        <div key={v.id} className="space-y-2"><Label htmlFor={v.code}>{v.libelle}</Label><Input id={v.code} type="number" placeholder="0" /></div>
                    ))}
                     <Button className="w-full" onClick={() => toast({ title: "Simulation en cours...", description: "Génération d'un aperçu du bulletin."})}><TestTube2 className="mr-2 h-4 w-4"/>Tester le calcul</Button>
                </div>
            </SectionCard>
            <SectionCard title="Calcul Inversé (Net → Brut)" description="Calculez le salaire brut à partir d'un net souhaité.">
                <div className="p-4 border rounded-lg space-y-4">
                    <div className="space-y-2"><Label htmlFor="netSouhaite">Net à payer souhaité</Label><Input id="netSouhaite" type="number" placeholder="Ex: 1 200 000" onChange={e => setNetSouhaite(Number(e.target.value))} /></div>
                    <Button className="w-full" onClick={handleInverse}><ArrowDownUp className="mr-2 h-4 w-4"/>Calculer le brut</Button>
                    {brutCalcule !== null &&
                        <div className="pt-4 border-t text-center space-y-2">
                            <p className="text-sm text-muted-foreground">Salaire Brut Requis</p>
                            <p className="text-2xl font-bold text-primary">{brutCalcule.toLocaleString('fr-FR', {maximumFractionDigits:0})} FCFA</p>
                        </div>
                    }
                </div>
            </SectionCard>
        </div>
    );
}

const SectionCard = ({ title, description, children, actions }: { title: string, description: string, children: React.ReactNode, actions?: React.ReactNode }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
    </div>
);

function PayslipPreview({ modele }: { modele: ModelePaie | null }) {
    if (!modele) return null;

    // Mock data for preview
    const employeeData = {
        name: 'Jean Dupont',
        matricule: 'UNIK-076',
        poste: 'Développeur Senior',
        classification: '2.2 - 130',
        dateEntree: '15/03/2020',
        numSecu: '1 85 05 99 123 456 78',
    };

    const companyData = {
        name: 'UNIKORP',
        address: 'Abidjan, Côte d\'Ivoire',
        siret: 'CI-ABJ-2024-B-12345',
    };

    const periodData = {
        periode: format(new Date(), 'MMMM yyyy', { locale: fr }),
        joursTravailles: 21.67
    };

    // Simulated calculation
    const salaireBase = modele.rubriques.find(r => r.code === 'SB')?.formule === 'salaireMensuel' ? 350000 : 0;
    const primeAnciennete = modele.rubriques.find(r => r.code === 'PA') ? salaireBase * 0.05 : 0;
    const salaireBrut = salaireBase + primeAnciennete;
    const cotisationCNPS = modele.rubriques.find(r => r.code === 'C01') ? salaireBrut * 0.035 : 0;
    const totalRetenues = cotisationCNPS;
    const netAPayer = salaireBrut - totalRetenues;

    return (
        <div className="p-2 border rounded-lg bg-background text-foreground text-xs font-sans">
            <div className="flex justify-between items-start pb-2 mb-2 border-b">
                <div>
                    <h3 className="font-bold text-sm">{companyData.name}</h3>
                    <p className="text-muted-foreground text-xs">{companyData.address}</p>
                </div>
                <div className="text-right">
                    <h4 className="font-bold text-base">BULLETIN DE PAIE</h4>
                    <p className="text-xs text-muted-foreground">{periodData.periode}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 text-xs">
                <div>
                    <p><strong>{employeeData.name}</strong></p>
                    <p>{employeeData.poste}</p>
                    <p>Matricule: {employeeData.matricule}</p>
                </div>
                <div className="text-right">
                     <p>Entrée: {employeeData.dateEntree}</p>
                     <p>Classification: {employeeData.classification}</p>
                </div>
            </div>
             <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Libellé</TableHead><TableHead className="text-right">Gain</TableHead><TableHead className="text-right">Retenue</TableHead></TableRow></TableHeader>
                <TableBody>
                    <TableRow><TableCell>SB</TableCell><TableCell>Salaire de base</TableCell><TableCell className="text-right">{salaireBase.toLocaleString()}</TableCell><TableCell></TableCell></TableRow>
                    <TableRow><TableCell>PA</TableCell><TableCell>Prime d'ancienneté</TableCell><TableCell className="text-right">{primeAnciennete.toLocaleString()}</TableCell><TableCell></TableCell></TableRow>
                    <TableRow><TableCell>C01</TableCell><TableCell>Cotisation CNPS</TableCell><TableCell></TableCell><TableCell className="text-right">{cotisationCNPS.toLocaleString()}</TableCell></TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow><TableCell colSpan={2} className="font-bold text-right">Total Brut</TableCell><TableCell className="font-bold text-right">{salaireBrut.toLocaleString()}</TableCell><TableCell></TableCell></TableRow>
                    <TableRow><TableCell colSpan={3} className="font-bold text-right">Total Retenues</TableCell><TableCell className="font-bold text-right">{totalRetenues.toLocaleString()}</TableCell></TableRow>
                    <TableRow><TableCell colSpan={3} className="font-bold text-lg text-right">NET À PAYER</TableCell><TableCell className="font-bold text-lg text-right">{netAPayer.toLocaleString()} FCFA</TableCell></TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}

function PayslipPreviewModal({ isOpen, onClose, modele }: { isOpen: boolean; onClose: () => void; modele: ModelePaie | null }) {
    if (!modele) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Aperçu du Bulletin de Paie</DialogTitle>
                    <DialogDescription>
                        Modèle: {modele.nom}. Ceci est une prévisualisation basée sur des données de test.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto bg-muted/50 p-6">
                    <PayslipPreview modele={modele} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
