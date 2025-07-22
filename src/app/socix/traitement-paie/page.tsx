
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, PlusCircle, List, Percent, User, Palette, ShieldCheck, TestTube2, ChevronsUpDown, Copy, Upload, FileUp, Loader2, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


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

const ITEMS_PER_PAGE = 10;

// --- MAIN PAGE COMPONENT ---

function TraitementPaiePage() {
    const { toast } = useToast();
    const [modeles, setModeles] = useState<ModelePaie[]>(initialModeles);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModele, setEditingModele] = useState<ModelePaie | null>(null);
    const [modeleToDelete, setModeleToDelete] = useState<ModelePaie | null>(null);
    const [previewingModele, setPreviewingModele] = useState<ModelePaie | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importOption, setImportOption] = useState<'merge' | 'replace'>('merge');
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    
    const totalPages = Math.ceil(modeles.length / ITEMS_PER_PAGE);
    const paginatedModeles = modeles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };


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

     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    };
    
    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        if (!isImporting) setIsDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setIsDragging(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setIsDragging(false);
        if (isImporting) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFileToUpload(e.dataTransfer.files[0]);
        }
    };

    const resetImportModal = () => {
        if (isImporting) return;
        setIsImportModalOpen(false);
        setFileToUpload(null);
        setImportOption('merge');
        setIsDragging(false);
    };

    const handleImport = async () => {
        if (!fileToUpload) {
            toast({
                title: "Erreur",
                description: "Veuillez sélectionner un fichier à importer.",
                variant: "destructive",
            });
            return;
        }

        setIsImporting(true);
        setImportProgress(0);

        const progressInterval = setInterval(() => {
            setImportProgress(prev => (prev < 90 ? prev + 10 : 90));
        }, 200);

        await new Promise(resolve => setTimeout(resolve, 2200));

        const importedModele: ModelePaie = {
            id: Date.now(),
            nom: `Modèle importé de ${fileToUpload.name.split('.')[0]}`,
            description: `Ce modèle a été importé le ${new Date().toLocaleDateString('fr-FR')}`,
            rubriques: [
                { id: 'r_imp_1', code: 'SAL_BASE', libelle: 'Salaire de Base Importé', type: 'Gain', ordre: 10, formule: 'salaireMensuel', visible: true, actif: true, inversable: true },
                { id: 'r_imp_2', code: 'TRSP', libelle: 'Indemnité Transport', type: 'Gain', ordre: 30, formule: '20000', visible: true, actif: true, inversable: false },
                { id: 'r_imp_3', code: 'I_PRES', libelle: 'Indemnité de Présence', type: 'Gain', ordre: 35, formule: 'nbJoursPresents * 1000', visible: true, actif: true, inversable: false },
                { id: 'r_imp_4', code: 'COT_SOC', libelle: 'Cotisations Sociales Importées', type: 'Cotisation', ordre: 110, formule: 'salaireBrut * 0.15', visible: true, actif: true, inversable: false },
            ],
            constantes: [
                { id: 'c_imp_1', code: 'PLAFOND_SS', libelle: 'Plafond Sécurité Sociale', valeur: 2500000, unite: 'FCFA' }
            ],
            variables: [
                { id: 'v_imp_1', code: 'nbJoursPresents', libelle: 'Jours de présence', description: 'Nombre de jours de présence effective.' },
            ],
        };

        if (importOption === 'replace') {
            setModeles([importedModele]);
        } else {
            setModeles(prev => [...prev, importedModele]);
        }
        
        clearInterval(progressInterval);
        setImportProgress(100);

        toast({
            title: "Importation simulée réussie",
            description: `Le modèle "${importedModele.nom}" a été ajouté.`,
        });
        
        setTimeout(() => {
            resetImportModal();
            setIsImporting(false);
            setImportProgress(0);
        }, 1000);
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
                        <div className="flex items-center gap-2">
                             <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                                <Upload className="mr-2 h-4 w-4" />
                                Importer
                            </Button>
                            <Button onClick={() => openModal()}><PlusCircle className="mr-2 h-4 w-4"/>Créer un modèle</Button>
                        </div>
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
                            {paginatedModeles.map(modele => (
                                <TableRow key={modele.id} className="odd:bg-muted/50">
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
                 <CardFooter className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total de {modeles.length} modèles. Page {currentPage} sur {totalPages}.
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Précédent
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Suivant
                        </Button>
                    </div>
                  )}
                </CardFooter>
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
            
            <Dialog open={isImportModalOpen} onOpenChange={resetImportModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Importer des modèles</DialogTitle>
                        <DialogDescription>
                          Chargez un fichier PRH, PDF, JSON, XML ou CSV pour ajouter de nouveaux modèles de bulletin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                         <div 
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 hover:bg-muted/50",
                                isDragging && "border-primary bg-primary/10",
                                isImporting && "cursor-not-allowed opacity-50"
                            )}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragEvents}
                            onDrop={handleDrop}
                          >
                              <Label htmlFor="file-upload" className={cn("flex flex-col items-center justify-center w-full h-full", isImporting ? "cursor-not-allowed" : "cursor-pointer")}>
                                <FileUp className="w-10 h-10 text-muted-foreground" />
                                <p className="mt-2 text-sm text-center text-muted-foreground">
                                  <span className="font-semibold">Glissez-déposez un fichier</span> ou cliquez pour sélectionner
                                </p>
                                {fileToUpload && !isImporting && (
                                  <p className="mt-2 text-sm font-medium text-foreground">{fileToUpload.name}</p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Fichiers PRH, PDF, JSON, XML, CSV
                                </p>
                              </Label>
                              <Input 
                                  id="file-upload" 
                                  type="file" 
                                  className="sr-only" 
                                  onChange={handleFileChange} 
                                  accept=".prh,.pdf,.json,.xml,.csv" 
                                  disabled={isImporting}
                              />
                        </div>

                        {isImporting && (
                            <div className="space-y-2">
                                <Progress value={importProgress} />
                                <p className="text-sm text-center text-muted-foreground">Importation en cours... {Math.round(importProgress)}%</p>
                            </div>
                        )}
                        
                        {!isImporting && fileToUpload && (
                            <div className="space-y-3">
                                <Label>Option d'importation</Label>
                                <RadioGroup
                                    value={importOption}
                                    onValueChange={(value: 'merge' | 'replace') => setImportOption(value)}
                                    className="flex gap-4 pt-1"
                                    disabled={isImporting}
                                >
                                    <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="merge" id="merge" />
                                    <Label htmlFor="merge" className="font-normal">Fusionner</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="replace" id="replace" />
                                    <Label htmlFor="replace" className="font-normal">Remplacer</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}
                      </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetImportModal} disabled={isImporting}>Annuler</Button>
                        <Button onClick={handleImport} disabled={!fileToUpload || isImporting}>
                            {isImporting ? 'Importation...' : 'Importer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                    <Button className="w-full" onClick={handleInverse}><ChevronsUpDown className="mr-2 h-4 w-4"/>Calculer le brut</Button>
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

function PayslipPreviewModal({ isOpen, onClose, modele }: { isOpen: boolean; onClose: () => void; modele: ModelePaie | null }) {
    if (!modele) return null;

    const gains = modele.rubriques.filter(r => r.type === 'Gain').sort((a,b) => a.ordre - b.ordre);
    const retenues = modele.rubriques.filter(r => r.type === 'Retenue').sort((a,b) => a.ordre - b.ordre);
    const cotisations = modele.rubriques.filter(r => r.type === 'Cotisation').sort((a,b) => a.ordre - b.ordre);

    const getRubriqueTypeStyles = (type: RubriqueType) => {
        switch (type) {
            case 'Gain': return 'text-green-600';
            case 'Retenue': return 'text-red-600';
            case 'Cotisation': return 'text-orange-600';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Aperçu du Modèle de Bulletin</DialogTitle>
                    <DialogDescription>
                        Aperçu de la structure du bulletin pour le modèle: <span className="font-semibold">{modele.nom}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto bg-muted/50 p-6">
                    <div className="p-8 border rounded-lg bg-white text-black font-sans shadow-lg max-w-4xl mx-auto">
                        {/* Header */}
                        <header className="flex justify-between items-center pb-4 border-b">
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">[Nom de l'entreprise]</h1>
                                <p className="text-xs text-gray-500">[Adresse de l'entreprise]</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-primary">BULLETIN DE PAIE</h2>
                                <p className="text-sm text-gray-600">Période du [Date Début] au [Date Fin]</p>
                            </div>
                        </header>

                        {/* Employee Info */}
                        <section className="grid grid-cols-2 gap-4 py-4 border-b">
                            <div>
                                <p className="text-xs text-gray-500">SALARIÉ</p>
                                <p className="font-semibold">[Prénom Nom]</p>
                                <p className="text-xs text-gray-600">[Adresse]</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">MATRICULE</p>
                                <p className="font-semibold">[Matricule]</p>
                            </div>
                        </section>

                        {/* Body */}
                        <main className="py-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-2/5">Description</TableHead>
                                        <TableHead className="text-center">Formule</TableHead>
                                        <TableHead className="text-right">[Montant]</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow className="bg-secondary/50">
                                        <TableCell colSpan={3} className="font-bold">GAINS</TableCell>
                                    </TableRow>
                                    {gains.map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium">{r.libelle}</TableCell>
                                            <TableCell className="text-center font-mono text-xs">{r.formule}</TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">[Montant]</TableCell>
                                        </TableRow>
                                    ))}
                                     <TableRow className="bg-muted/50 font-bold">
                                        <TableCell colSpan={2} className="text-right">Total Brut</TableCell>
                                        <TableCell className="text-right">[Total Brut]</TableCell>
                                    </TableRow>
                                    
                                    <TableRow className="bg-secondary/50">
                                        <TableCell colSpan={3} className="font-bold">COTISATIONS & RETENUES</TableCell>
                                    </TableRow>
                                    {[...cotisations, ...retenues].sort((a,b)=>a.ordre-b.ordre).map(r => (
                                        <TableRow key={r.id}>
                                            <TableCell className={cn("pl-6", getRubriqueTypeStyles(r.type))}>{r.libelle}</TableCell>
                                            <TableCell className="text-center font-mono text-xs">{r.formule}</TableCell>
                                            <TableCell className="text-right text-red-600">-[Montant]</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </main>

                        {/* Footer */}
                        <footer className="flex justify-end pt-4 border-t">
                             <div className="w-1/2 max-w-xs space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Brut</span>
                                    <span className="font-semibold">[Total Brut]</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-gray-600">Total Retenues Salariales</span>
                                    <span className="font-semibold text-red-600">-[Total Retenues]</span>
                                </div>
                                <Separator/>
                                 <div className="flex justify-between font-bold text-lg">
                                    <span>Net à Payer avant impôt</span>
                                    <span>[Net avant IGR]</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span className="text-gray-600">Impôt sur le Revenu (IGR)</span>
                                    <span className="font-semibold text-red-600">-[Montant IGR]</span>
                                </div>
                                <Separator/>
                                 <div className="flex justify-between font-bold text-2xl text-primary p-2 bg-primary/10 rounded-md">
                                    <span>NET À PAYER</span>
                                    <span>[NET À PAYER]</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
export default TraitementPaiePage;
