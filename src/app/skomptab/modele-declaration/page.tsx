'use client';

import React, { useState, useEffect } from 'react';
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

type DeclarationType = 'TVA' | 'IS' | 'CVAE' | 'DSN' | 'Autre';

type ModeleDeclaration = {
  id: number;
  libelle: string;
  description: string;
  type: DeclarationType;
  formContent: any;
};

const initialModeles: ModeleDeclaration[] = [
  {
    id: 1,
    libelle: 'Déclaration de TVA (CA3)',
    description: 'Modèle mensuel pour la Taxe sur la Valeur Ajoutée.',
    type: 'TVA',
    formContent: { tvaCollectee: 25000, tvaDeductible: 18500 },
  },
  {
    id: 2,
    libelle: 'Acompte Impôt sur les Sociétés',
    description: 'Calcul et déclaration des acomptes IS trimestriels.',
    type: 'IS',
    formContent: { resultatFiscal: 120000, tauxIS: 25 },
  },
  {
    id: 3,
    libelle: 'Déclaration Sociale Nominative (Simplifiée)',
    description: 'Modèle simplifié pour le calcul des cotisations sociales.',
    type: 'DSN',
    formContent: { masseSalariale: 75000, tauxPatronales: 42, tauxSalariales: 22 },
  },
    {
    id: 4,
    libelle: 'Cotisation sur la Valeur Ajoutée (CVAE)',
    description: 'Modèle pour la déclaration de la CVAE.',
    type: 'CVAE',
    formContent: { chiffreAffaires: 1500000, valeurAjoutee: 450000 },
  },
];

const getDefaultFormContent = (type: DeclarationType) => {
    switch (type) {
        case 'TVA': return { tvaCollectee: 0, tvaDeductible: 0 };
        case 'IS': return { resultatFiscal: 0, tauxIS: 25 };
        case 'DSN': return { masseSalariale: 0, tauxPatronales: 42, tauxSalariales: 22 };
        case 'CVAE': return { chiffreAffaires: 0, valeurAjoutee: 0 };
        default: return {};
    }
}

const defaultFormData: Omit<ModeleDeclaration, 'id'> = {
  libelle: '',
  description: '',
  type: 'Autre',
  formContent: {},
};

const DeclarationFormRenderer = ({ type, formData, setFormData, isViewMode }: { type: DeclarationType, formData: any, setFormData: Function, isViewMode: boolean }) => {
    
    const handleFormContentChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            formContent: {
                ...prev.formContent,
                [field]: value
            }
        }));
    };
    
    const [tvaDue, setTvaDue] = useState(0);
    const [isCredit, setIsCredit] = useState(false);
    
    useEffect(() => {
        if(type === 'TVA') {
            const collectee = Number(formData.formContent.tvaCollectee) || 0;
            const deductible = Number(formData.formContent.tvaDeductible) || 0;
            const diff = collectee - deductible;
            setTvaDue(Math.abs(diff));
            setIsCredit(diff < 0);
        }
    }, [formData.formContent, type]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

    switch (type) {
        case 'TVA':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Déclaration de TVA</CardTitle>
                        <CardDescription>Renseignez les montants de TVA collectée et déductible pour la période.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tvaCollectee">TVA Collectée</Label>
                                <Input id="tvaCollectee" type="number" placeholder="0.00" value={formData.formContent.tvaCollectee || ''} onChange={(e) => handleFormContentChange('tvaCollectee', e.target.value)} disabled={isViewMode}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tvaDeductible">TVA Déductible</Label>
                                <Input id="tvaDeductible" type="number" placeholder="0.00" value={formData.formContent.tvaDeductible || ''} onChange={(e) => handleFormContentChange('tvaDeductible', e.target.value)} disabled={isViewMode}/>
                            </div>
                        </div>
                        <Separator />
                         <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{isCredit ? 'Crédit de TVA' : 'TVA Nette Due'}</Label>
                                <Input value={formatCurrency(tvaDue)} disabled className={isCredit ? 'text-green-600 font-bold' : 'font-bold'} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        case 'IS':
             const resultatFiscal = Number(formData.formContent.resultatFiscal) || 0;
             const tauxIS = Number(formData.formContent.tauxIS) || 0;
             const acompte = (resultatFiscal * (tauxIS / 100)) / 4;
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Acompte d'Impôt sur les Sociétés (IS)</CardTitle>
                        <CardDescription>Calculez le montant de votre acompte trimestriel.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid md:grid-cols-3 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="resultatFiscal">Résultat Fiscal N-1</Label>
                                <Input id="resultatFiscal" type="number" placeholder="0.00" value={formData.formContent.resultatFiscal || ''} onChange={(e) => handleFormContentChange('resultatFiscal', e.target.value)} disabled={isViewMode}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="tauxIS">Taux d'IS (%)</Label>
                                <Input id="tauxIS" type="number" placeholder="25" value={formData.formContent.tauxIS || ''} onChange={(e) => handleFormContentChange('tauxIS', e.target.value)} disabled={isViewMode}/>
                            </div>
                             <div className="space-y-2">
                                <Label>Montant de l'acompte</Label>
                                <Input value={formatCurrency(acompte)} disabled className="font-bold"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
         case 'DSN':
            const masseSalariale = Number(formData.formContent.masseSalariale) || 0;
            const tauxPatronales = Number(formData.formContent.tauxPatronales) || 0;
            const tauxSalariales = Number(formData.formContent.tauxSalariales) || 0;
            const cotisationsPatronales = masseSalariale * (tauxPatronales / 100);
            const cotisationsSalariales = masseSalariale * (tauxSalariales / 100);
            const totalCotisations = cotisationsPatronales + cotisationsSalariales;
            return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Déclaration Sociale Nominative (Simplifiée)</CardTitle>
                        <CardDescription>Estimez les cotisations sociales sur la base de la masse salariale.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                           <Label htmlFor="masseSalariale">Masse Salariale Brute</Label>
                           <Input id="masseSalariale" type="number" placeholder="0.00" value={formData.formContent.masseSalariale || ''} onChange={(e) => handleFormContentChange('masseSalariale', e.target.value)} disabled={isViewMode}/>
                        </div>
                        <Separator/>
                        <div className="grid md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="cotisationsPatronales">Cotisations Patronales</Label>
                                <Input value={formatCurrency(cotisationsPatronales)} disabled className="font-bold"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="cotisationsSalariales">Cotisations Salariales</Label>
                                <Input value={formatCurrency(cotisationsSalariales)} disabled className="font-bold"/>
                            </div>
                        </div>
                        <CardFooter className="p-0 pt-4">
                            <div className="space-y-2 w-full">
                               <Label>Total des cotisations à verser</Label>
                               <Input value={formatCurrency(totalCotisations)} disabled className="font-bold text-lg h-12"/>
                            </div>
                        </CardFooter>
                    </CardContent>
                </Card>
            );
        case 'CVAE':
            const chiffreAffaires = Number(formData.formContent.chiffreAffaires) || 1;
            const valeurAjoutee = Number(formData.formContent.valeurAjoutee) || 0;
            // Simplified CVAE logic for demonstration
            const tauxEffectif = Math.min(1.5, (valeurAjoutee / chiffreAffaires) * 100);
            const montantCVAE = valeurAjoutee > 500000 ? valeurAjoutee * 0.0025 : 0; // Extremely simplified
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Cotisation sur la Valeur Ajoutée (CVAE)</CardTitle>
                        <CardDescription>Estimez le montant de votre CVAE. (Logique de calcul simplifiée)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="chiffreAffaires">Chiffre d'Affaires</Label>
                                <Input id="chiffreAffaires" type="number" placeholder="0.00" value={formData.formContent.chiffreAffaires || ''} onChange={(e) => handleFormContentChange('chiffreAffaires', e.target.value)} disabled={isViewMode}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="valeurAjoutee">Valeur Ajoutée Produite</Label>
                                <Input id="valeurAjoutee" type="number" placeholder="0.00" value={formData.formContent.valeurAjoutee || ''} onChange={(e) => handleFormContentChange('valeurAjoutee', e.target.value)} disabled={isViewMode}/>
                            </div>
                        </div>
                        <Separator/>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Taux Effectif (Plafonné)</Label>
                                <Input value={`${tauxEffectif.toFixed(2)} %`} disabled className="font-bold"/>
                            </div>
                            <div className="space-y-2">
                                <Label>Montant CVAE (Estimation)</Label>
                                <Input value={formatCurrency(montantCVAE)} disabled className="font-bold"/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        default:
            return (
                <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50">
                    <p>Aucun formulaire de modèle disponible pour le type 'Autre'.<br/>La personnalisation sera disponible dans une future version.</p>
                </div>
            );
    }
};


export default function ModeleDeclarationPage() {
  const [modeles, setModeles] = useState<ModeleDeclaration[]>(initialModeles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModele, setEditingModele] = useState<ModeleDeclaration | null>(null);
  const [formData, setFormData] = useState<Omit<ModeleDeclaration, 'id'>>(defaultFormData);
  const [modeleToDelete, setModeleToDelete] = useState<ModeleDeclaration | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

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
                <TableHead>Libellé</TableHead>
                <TableHead className="w-[180px]">Type de déclaration</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modeles.map((modele) => (
                <TableRow key={modele.id}>
                  <TableCell className="font-medium">{modele.libelle}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{modele.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{modele.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
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
                      <SelectItem value="TVA">TVA</SelectItem>
                      <SelectItem value="IS">IS (Impôt sur les Sociétés)</SelectItem>
                      <SelectItem value="CVAE">CVAE</SelectItem>
                      <SelectItem value="DSN">DSN (Social)</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
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
