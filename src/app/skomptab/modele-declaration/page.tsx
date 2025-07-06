
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// --- TYPES ---
type DeclarationType = 'TVA' | 'BIC' | 'ITS' | 'ImpotSynthetique' | 'DMS';

type ModeleDeclaration = {
  id: number;
  libelle: string;
  description: string;
  type: DeclarationType;
  formContent: any;
};

const declarationConfigs: Record<DeclarationType, { label: string; description: string; }> = {
    TVA: { label: 'TVA (CA3)', description: "Déclaration mensuelle de TVA." },
    BIC: { label: 'BIC - Impôt sur les Sociétés', description: "Déclaration des bénéfices industriels et commerciaux." },
    ITS: { label: 'ITS - Impôt sur les Salaires', description: "Déclaration de l'impôt sur les traitements et salaires." },
    ImpotSynthetique: { label: 'Impôt Synthétique', description: 'Déclaration pour le régime de l\'impôt synthétique.' },
    DMS: { label: 'Déclaration Mensuelle Salaires (CNPS)', description: 'Déclaration mensuelle des salaires à la CNPS.' },
};

const initialModeles: ModeleDeclaration[] = [
  {
    id: 1,
    libelle: 'TVA Mensuelle - Standard',
    description: 'Modèle de base pour la déclaration de TVA CA3.',
    type: 'TVA',
    formContent: { caHtNormal: 15000000, caHtReduit: 2000000, tvaDeductibleAchats: 1200000, creditTvaAnterieur: 50000 },
  },
  {
    id: 2,
    libelle: 'Acompte IS Trimestriel',
    description: 'Calcul et déclaration des acomptes IS trimestriels.',
    type: 'BIC',
    formContent: { resultatFiscal: 12000000, caTtc: 80000000 },
  },
  {
    id: 3,
    libelle: 'Déclaration Sociale (Standard)',
    description: 'Modèle pour le calcul des cotisations sociales mensuelles.',
    type: 'DMS',
    formContent: { masseSalarialeBrute: 75000000 },
  },
];

const getDefaultFormContent = (type: DeclarationType) => {
    switch (type) {
        case 'TVA': return { caHtNormal: '0', caHtReduit: '0', caExonere: '0', exportations: '0', tvaLasem: '0', tvaDeductibleAchats: '0', tvaDeductibleServices: '0', tvaDeductibleImmo: '0', creditTvaAnterieur: '0' };
        case 'BIC': return { caHt: 0, caTtc: 0, chargesDeductibles: 0, amortissements: 0, resultatFiscal: 0 };
        case 'ITS': return { nombreEmployes: 0, masseSalarialeBrute: 0, abattementsAppliques: 0, retenuesEffectuees: 0 };
        case 'ImpotSynthetique': return { natureActivite: '', caPrevisionnel: 0, montantImpotSynthetique: 0 };
        case 'DMS': return { periode: new Date().toISOString().substring(0, 7), masseSalarialeBrute: 0 };
        default: return {};
    }
}

const defaultFormData: Omit<ModeleDeclaration, 'id'> = {
  libelle: '',
  description: '',
  type: 'TVA',
  formContent: getDefaultFormContent('TVA'),
};

const FormField = ({ label, children, isRequired }: { label: string, children: React.ReactNode, isRequired?: boolean }) => (
    <div className="space-y-1"><Label>{label}{isRequired && <span className="text-destructive"> *</span>}</Label>{children}</div>
);

function TvaForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: string) => setData((d:any) => ({...d, formContent: {...d.formContent, [field]: value}}));
    
    const { totalTvaCollectee, totalTvaDeductible, tvaNetteDue, creditAReporter } = useMemo(() => {
        const caNormal = parseFloat(data.formContent.caHtNormal) || 0;
        const caReduit = parseFloat(data.formContent.caHtReduit) || 0;
        const tvaCollectee18 = caNormal * 0.18;
        const tvaCollecteeReduit = caReduit * 0.10;
        const totalTvaCollectee = tvaCollectee18 + tvaCollecteeReduit + (parseFloat(data.formContent.tvaLasem) || 0);
        const totalTvaDeductible = (parseFloat(data.formContent.tvaDeductibleAchats) || 0) + (parseFloat(data.formContent.tvaDeductibleServices) || 0) + (parseFloat(data.formContent.tvaDeductibleImmo) || 0);
        const tvaDue = totalTvaCollectee - totalTvaDeductible - (parseFloat(data.formContent.creditTvaAnterieur) || 0);
        return { totalTvaCollectee, totalTvaDeductible, tvaNetteDue: tvaDue > 0 ? tvaDue : 0, creditAReporter: tvaDue < 0 ? -tvaDue : 0 };
    }, [data.formContent]);
    
    return (<Card><CardHeader><CardTitle>Déclaration de TVA</CardTitle><CardDescription>Renseignez les montants de TVA collectée et déductible.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"><FormField label="CA Taux Normal (18%)" isRequired><Input type="number" value={data.formContent.caHtNormal || ''} onChange={e => handleChange('caHtNormal', e.target.value)} disabled={isViewMode}/></FormField><FormField label="CA Taux Réduit (10%)"><Input type="number" value={data.formContent.caHtReduit || ''} onChange={e => handleChange('caHtReduit', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Total Achats HT (Déductible)" isRequired><Input type="number" value={data.formContent.tvaDeductibleAchats || ''} onChange={e => handleChange('tvaDeductibleAchats', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Crédit de TVA antérieur"><Input type="number" value={data.formContent.creditTvaAnterieur || ''} onChange={e => handleChange('creditTvaAnterieur', e.target.value)} disabled={isViewMode}/></FormField></div><Separator /><div className="p-4 border rounded-lg bg-background space-y-2"><h4 className="font-semibold text-center">Résultats de la Simulation</h4><div className="flex justify-between text-sm"><span className="text-muted-foreground">TVA Collectée</span><span className="font-mono">{totalTvaCollectee.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">TVA Déductible</span><span className="font-mono">{totalTvaDeductible.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-lg font-bold text-primary pt-2 border-t"><span >{tvaNetteDue > 0 ? 'TVA à Décaisser' : 'Crédit à Reporter'}</span><span className="font-mono">{(tvaNetteDue > 0 ? tvaNetteDue : creditAReporter).toLocaleString('fr-FR')} FCFA</span></div></div></CardContent></Card>);
}

function BicForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: string) => setData((d:any) => ({...d, formContent: {...d.formContent, [field]: parseFloat(value) || 0}}));
    const { bicCalcule, imf, impotDu } = useMemo(() => {
        const resultatFiscal = data.formContent.resultatFiscal || 0;
        const caTtc = data.formContent.caTtc || 0;
        const bic = resultatFiscal > 0 ? resultatFiscal * 0.27 : 0;
        const imfCalc = caTtc * 0.02;
        return { bicCalcule: bic, imf: imfCalc, impotDu: Math.max(bic, imfCalc) };
    }, [data.formContent.resultatFiscal, data.formContent.caTtc]);
    return (<Card><CardHeader><CardTitle>Impôt sur les Sociétés (BIC)</CardTitle><CardDescription>Estimez le montant de votre impôt.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><FormField label="Chiffre d'affaires HT"><Input type="number" value={data.formContent.caHt || ''} onChange={e => handleChange('caHt', e.target.value)} disabled={isViewMode} /></FormField><FormField label="Chiffre d'affaires TTC" isRequired><Input type="number" value={data.formContent.caTtc || ''} onChange={e => handleChange('caTtc', e.target.value)} disabled={isViewMode} /></FormField></div><FormField label="Résultat fiscal" isRequired><Input type="number" value={data.formContent.resultatFiscal || ''} onChange={e => handleChange('resultatFiscal', e.target.value)} disabled={isViewMode} /></FormField><Separator /><div className="p-4 border rounded-lg bg-background space-y-2"><h4 className="font-semibold text-center">Calcul de l'impôt</h4><div className="flex justify-between text-sm"><span className="text-muted-foreground">BIC calculé (27%)</span><span className="font-mono">{bicCalcule.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">IMF (2% du CA TTC)</span><span className="font-mono">{imf.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-lg font-bold text-primary pt-2 border-t"><span >Impôt Dû (le plus élevé)</span><span className="font-mono">{impotDu.toLocaleString('fr-FR')} FCFA</span></div></div></CardContent></Card>);
}

function ItsForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: string) => setData((d:any) => ({...d, formContent: {...d.formContent, [field]: parseFloat(value) || 0}}));
    const { baseImposable, itsCalcule, itsNetAPayer } = useMemo(() => {
        const masseSalariale = data.formContent.masseSalarialeBrute || 0;
        const abattements = data.formContent.abattementsAppliques || 0;
        const retenues = data.formContent.retenuesEffectuees || 0;
        const base = masseSalariale - abattements;
        const its = base * 0.15; // Simplified rate
        return { baseImposable: base, itsCalcule: its, itsNetAPayer: its - retenues };
    }, [data.formContent.masseSalarialeBrute, data.formContent.abattementsAppliques, data.formContent.retenuesEffectuees]);
    return (<Card><CardHeader><CardTitle>Impôt sur les Salaires (ITS)</CardTitle></CardHeader><CardContent className="space-y-4"><FormField label="Masse salariale brute" isRequired><Input type="number" value={data.formContent.masseSalarialeBrute || ''} onChange={e => handleChange('masseSalarialeBrute', e.target.value)} disabled={isViewMode}/></FormField><Separator /><div className="p-4 border rounded-lg bg-background space-y-2"><h4 className="font-semibold text-center">Calcul de l'impôt</h4><div className="flex justify-between text-sm"><span className="text-muted-foreground">Base imposable</span><span className="font-mono">{baseImposable.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">ITS calculé</span><span className="font-mono">{itsCalcule.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-lg font-bold text-primary pt-2 border-t"><span >ITS net à payer</span><span className="font-mono">{itsNetAPayer.toLocaleString('fr-FR')} FCFA</span></div></div></CardContent></Card>);
}

function ImpotSynthetiqueForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((d:any) => ({...d, formContent: {...d.formContent, [field]: value}}));
    return (<Card><CardHeader><CardTitle>Impôt Synthétique</CardTitle></CardHeader><CardContent className="space-y-4"><FormField label="Nature de l'activité" isRequired><Input value={data.formContent.natureActivite || ''} onChange={e => handleChange('natureActivite', e.target.value)} disabled={isViewMode}/></FormField><div className="grid md:grid-cols-2 gap-4"><FormField label="CA Prévisionnel" isRequired><Input type="number" value={data.formContent.caPrevisionnel || ''} onChange={e => handleChange('caPrevisionnel', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Montant de l'impôt" isRequired><Input type="number" value={data.formContent.montantImpotSynthetique || ''} onChange={e => handleChange('montantImpotSynthetique', e.target.value)} disabled={isViewMode}/></FormField></div></CardContent></Card>);
}

function DeclarationMensuelleSalairesForm({ data, setData, isViewMode }: { data: any, setData: Function, isViewMode: boolean }) {
    const handleChange = (field: string, value: any) => setData((d:any) => ({...d, formContent: {...d.formContent, [field]: value}}));
    const { cotisationsPatronales, cotisationsSalariales, total } = useMemo(() => {
        const masseSalariale = data.formContent.masseSalarialeBrute || 0;
        const cp = masseSalariale * 0.165;
        const cs = masseSalariale * 0.035;
        return { cotisationsPatronales: cp, cotisationsSalariales: cs, total: cp + cs };
    }, [data.formContent.masseSalarialeBrute]);
    return (<Card><CardHeader><CardTitle>Déclaration Mensuelle des Salaires (CNPS)</CardTitle></CardHeader><CardContent className="space-y-4"><FormField label="Période (mois/année)" isRequired><Input type="month" value={data.formContent.periode || ''} onChange={e => handleChange('periode', e.target.value)} disabled={isViewMode}/></FormField><FormField label="Masse Salariale Brute" isRequired><Input type="number" value={data.formContent.masseSalarialeBrute || ''} onChange={e => handleChange('masseSalarialeBrute', parseFloat(e.target.value))} disabled={isViewMode}/></FormField><Separator /><div className="grid md:grid-cols-3 gap-4"><div className="space-y-1"><Label>Cotisations Patronales (16.5%)</Label><Input disabled value={cotisationsPatronales.toLocaleString('fr-FR')}/></div><div className="space-y-1"><Label>Cotisations Salariales (3.5%)</Label><Input disabled value={cotisationsSalariales.toLocaleString('fr-FR')}/></div><div className="space-y-1"><Label>Total Cotisations Dues</Label><Input disabled value={total.toLocaleString('fr-FR')} className="font-bold text-primary"/></div></div></CardContent></Card>);
}

function DefaultForm({data}: any) {
    return <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50"><p>Ce modèle ne contient pas de formulaire de calcul spécifique.</p></div>;
}

const DeclarationFormRenderer = ({ type, formData, setFormData, isViewMode }: { type: DeclarationType, formData: any, setFormData: Function, isViewMode: boolean }) => {
    switch (type) {
        case 'TVA': return <TvaForm data={formData} setData={setFormData} isViewMode={isViewMode} />;
        case 'BIC': return <BicForm data={formData} setData={setFormData} isViewMode={isViewMode} />;
        case 'ITS': return <ItsForm data={formData} setData={setFormData} isViewMode={isViewMode} />;
        case 'ImpotSynthetique': return <ImpotSynthetiqueForm data={formData} setData={setFormData} isViewMode={isViewMode} />;
        case 'DMS': return <DeclarationMensuelleSalairesForm data={formData} setData={setFormData} isViewMode={isViewMode} />;
        default: return <DefaultForm data={formData} setData={setFormData} />;
    }
};

const ITEMS_PER_PAGE = 10;

export default function ModeleDeclarationPage() {
  const [modeles, setModeles] = useState<ModeleDeclaration[]>(initialModeles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModele, setEditingModele] = useState<ModeleDeclaration | null>(null);
  const [formData, setFormData] = useState<Omit<ModeleDeclaration, 'id'>>(defaultFormData);
  const [modeleToDelete, setModeleToDelete] = useState<ModeleDeclaration | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(modeles.length / ITEMS_PER_PAGE);
  const paginatedModeles = modeles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenCreateModal = () => {
    setIsViewMode(false);
    setEditingModele(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (modele: ModeleDeclaration) => {
    setIsViewMode(false);
    setEditingModele(modele);
    setFormData({
      libelle: modele.libelle,
      description: modele.description,
      type: modele.type,
      formContent: JSON.parse(JSON.stringify(modele.formContent)),
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (modele: ModeleDeclaration) => {
    setIsViewMode(true);
    setEditingModele(modele);
    setFormData({
      libelle: modele.libelle,
      description: modele.description,
      type: modele.type,
      formContent: JSON.parse(JSON.stringify(modele.formContent)),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingModele(null);
    setIsViewMode(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: DeclarationType) => {
    setFormData((prev) => ({ 
        ...prev, 
        type: value,
        formContent: getDefaultFormContent(value)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModele) {
      setModeles(
        modeles.map((m) =>
          m.id === editingModele.id ? { ...editingModele, ...formData } : m
        )
      );
    } else {
      const newModele: ModeleDeclaration = {
        id: Date.now(),
        ...formData,
      };
      setModeles([...modeles, newModele]);
    }
    handleCloseModal();
  };

  const handleDeleteModele = () => {
    if (modeleToDelete) {
      setModeles(modeles.filter((m) => m.id !== modeleToDelete.id));
      setModeleToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Modèles de déclaration</CardTitle>
              <CardDescription>
                Créez et gérez vos modèles pour les déclarations fiscales et sociales.
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau modèle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Libellé</TableHead>
                <TableHead className="w-[220px] text-center font-semibold">Type de déclaration</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="w-[150px] text-center font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedModeles.map((modele) => (
                <TableRow key={modele.id} className="odd:bg-muted/50">
                  <TableCell className="font-medium">{modele.libelle}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{declarationConfigs[modele.type]?.label || modele.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{modele.description}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenViewModal(modele)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(modele)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setModeleToDelete(modele)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
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

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-3xl" onInteractOutside={(e) => { if (!isViewMode) e.preventDefault()}} onEscapeKeyDown={(e) => { if (!isViewMode) e.preventDefault()}}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isViewMode ? 'Détails du modèle' : editingModele ? 'Modifier le modèle' : 'Nouveau modèle de déclaration'}
              </DialogTitle>
              <DialogDescription>
                {isViewMode ? 'Consultez les détails de ce modèle.' : 'Définissez les informations de base de votre modèle.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="libelle">Libellé du modèle</Label>
                  <Input id="libelle" value={formData.libelle} onChange={handleInputChange} required disabled={isViewMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type de déclaration</Label>
                   <Select value={formData.type} onValueChange={handleSelectChange} disabled={isViewMode}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(declarationConfigs).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleInputChange} disabled={isViewMode}/>
              </div>
              <div className="space-y-2">
                <Label>Contenu du modèle</Label>
                <DeclarationFormRenderer type={formData.type} formData={formData} setFormData={setFormData} isViewMode={isViewMode} />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t mt-4">
              {isViewMode ? (
                 <Button type="button" variant="outline" onClick={handleCloseModal}>Fermer</Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={handleCloseModal}>Annuler</Button>
                  <Button type="submit">Enregistrer</Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!modeleToDelete} onOpenChange={(open) => !open && setModeleToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le modèle sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setModeleToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteModele} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
