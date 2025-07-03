'use client';

import { useState } from 'react';
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
import { Pencil, Trash2, PlusCircle, Upload, FileUp } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { handleParseAccountingPlan } from '@/app/actions';

type NatureCompte = 'Bilan - Actif' | 'Bilan - Passif' | 'Compte de résultat - Charge' | 'Compte de résultat - Produit' | 'Autre';

type Compte = {
  id: number;
  numero: string;
  intitule: string;
  nature: NatureCompte;
};

// Extrait du Plan Comptable Général (France)
const initialComptes: Compte[] = [
  { id: 1, numero: '101000', intitule: 'Capital social', nature: 'Bilan - Passif' },
  { id: 2, numero: '211000', intitule: 'Terrains', nature: 'Bilan - Actif' },
  { id: 3, numero: '213000', intitule: 'Constructions', nature: 'Bilan - Actif' },
  { id: 4, numero: '215400', intitule: 'Matériel industriel', nature: 'Bilan - Actif' },
  { id: 5, numero: '218300', intitule: 'Matériel de bureau et informatique', nature: 'Bilan - Actif' },
  { id: 6, numero: '370000', intitule: 'Stocks de marchandises', nature: 'Bilan - Actif' },
  { id: 7, numero: '401000', intitule: 'Fournisseurs', nature: 'Bilan - Passif' },
  { id: 8, numero: '411000', intitule: 'Clients', nature: 'Bilan - Actif' },
  { id: 9, numero: '445710', intitule: 'TVA collectée', nature: 'Bilan - Passif' },
  { id: 10, numero: '445660', intitule: 'TVA déductible sur autres biens et services', nature: 'Bilan - Actif' },
  { id: 11, numero: '512000', intitule: 'Banques', nature: 'Bilan - Actif' },
  { id: 12, numero: '530000', intitule: 'Caisse', nature: 'Bilan - Actif' },
  { id: 13, numero: '607000', intitule: 'Achats de marchandises', nature: 'Compte de résultat - Charge' },
  { id: 14, numero: '613000', intitule: 'Locations', nature: 'Compte de résultat - Charge' },
  { id: 15, numero: '622000', intitule: 'Rémunérations d\'intermédiaires et honoraires', nature: 'Compte de résultat - Charge' },
];

const defaultFormData: Omit<Compte, 'id'> = {
  numero: '',
  intitule: '',
  nature: 'Autre',
};

const ITEMS_PER_PAGE = 15;

export default function ComptesGenerauxPage() {
  const [comptes, setComptes] = useState<Compte[]>(initialComptes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompte, setEditingCompte] = useState<Compte | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [compteToDelete, setCompteToDelete] = useState<Compte | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importOption, setImportOption] = useState<'merge' | 'replace'>('merge');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { toast } = useToast();
  
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const totalPages = Math.ceil(comptes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentComptes = comptes.slice(startIndex, endIndex);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, nature: value as NatureCompte }));
  };
  
  const handleOpenCreateModal = () => {
    setEditingCompte(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (compte: Compte) => {
    setEditingCompte(compte);
    setFormData({
      numero: compte.numero,
      intitule: compte.intitule,
      nature: compte.nature,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompte(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompte) {
      setComptes(
        comptes.map((c) =>
          c.id === editingCompte.id ? { ...editingCompte, ...formData } : c
        )
      );
    } else {
      const newCompte: Compte = {
        id: Date.now(),
        ...formData,
      };
      setComptes([...comptes, newCompte]);
    }
    handleCloseModal();
  };

  const handleDeleteCompte = () => {
    if (compteToDelete) {
      setComptes(comptes.filter((c) => c.id !== compteToDelete.id));
      setCompteToDelete(null);
      // Reset to first page if current page becomes empty
      if (currentComptes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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

    const reader = new FileReader();
    reader.readAsDataURL(fileToUpload);
    reader.onload = async () => {
      const fileDataUri = reader.result as string;

      const progressInterval = setInterval(() => {
        setImportProgress(prev => (prev < 90 ? prev + 10 : 90));
      }, 200);

      try {
        const parsedComptes = await handleParseAccountingPlan({
          fileDataUri,
          fileType: fileToUpload.type,
        });

        clearInterval(progressInterval);
        setImportProgress(100);

        const newComptesWithId = parsedComptes.map(c => ({...c, id: Math.random() }));

        if (importOption === 'replace') {
          setComptes(newComptesWithId as Compte[]);
        } else {
          const existingNumeros = new Set(comptes.map(c => c.numero));
          const newUniqueComptes = newComptesWithId.filter(mc => !existingNumeros.has(mc.numero));
          setComptes([...comptes, ...newUniqueComptes as Compte[]]);
        }
        setCurrentPage(1);
        
        toast({
          title: "Importation réussie",
          description: `Le plan comptable a été mis à jour avec succès.`,
        });

      } catch (error) {
        clearInterval(progressInterval);
        console.error(error);
        toast({
          title: "Erreur d'importation",
          description: "Une erreur est survenue lors de l'analyse du fichier.",
          variant: "destructive",
        });
      } finally {
        setTimeout(() => {
          setIsImporting(false);
          setIsImportModalOpen(false);
          setFileToUpload(null);
          setImportOption('merge');
          setImportProgress(0);
        }, 1000);
      }
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({
            title: "Erreur",
            description: "Impossible de lire le fichier.",
            variant: "destructive",
        });
        setIsImporting(false);
    };
  };

  const resetImportModal = () => {
    if (isImporting) return;
    setIsImportModalOpen(false);
    setFileToUpload(null);
    setImportOption('merge');
    setIsDragging(false);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Plan comptable général</CardTitle>
              <CardDescription>
                Consultez et personnalisez le plan comptable de votre organisation.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
              <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau compte
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Numéro</TableHead>
                <TableHead>Intitulé</TableHead>
                <TableHead>Nature</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentComptes.map((compte) => (
                <TableRow key={compte.id}>
                  <TableCell className="font-mono">{compte.numero}</TableCell>
                  <TableCell className="font-medium">{compte.intitule}</TableCell>
                  <TableCell>{compte.nature}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(compte)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setCompteToDelete(compte)} className="text-destructive hover:text-destructive">
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
            Page {currentPage} sur {totalPages}
          </div>
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
        </CardFooter>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCompte ? 'Modifier le compte' : 'Nouveau compte'}</DialogTitle>
              <DialogDescription>
                {editingCompte ? 'Mettez à jour les informations du compte.' : 'Remplissez les informations ci-dessous pour créer un nouveau compte.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numero" className="text-right">Numéro</Label>
                <Input id="numero" value={formData.numero} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="intitule" className="text-right">Intitulé</Label>
                <Input id="intitule" value={formData.intitule} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nature" className="text-right">Nature</Label>
                <Select value={formData.nature} onValueChange={handleSelectChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez une nature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bilan - Actif">Bilan - Actif</SelectItem>
                    <SelectItem value="Bilan - Passif">Bilan - Passif</SelectItem>
                    <SelectItem value="Compte de résultat - Charge">Compte de résultat - Charge</SelectItem>
                    <SelectItem value="Compte de résultat - Produit">Compte de résultat - Produit</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!compteToDelete} onOpenChange={(open) => !open && setCompteToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le compte sera définitivement supprimé du plan comptable.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCompteToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteCompte} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isImportModalOpen} onOpenChange={resetImportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importer un plan comptable</DialogTitle>
            <DialogDescription>
              Chargez un fichier pour remplacer ou fusionner avec le plan comptable existant.
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
                      PDF, MAE, XLSX, XLAM, XLS, CSV
                    </p>
                  </Label>
                  <Input 
                      id="file-upload" 
                      type="file" 
                      className="sr-only" 
                      onChange={handleFileChange} 
                      accept=".pdf,.mae,.xlsx,.xlam,.xls,.csv" 
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
