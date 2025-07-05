
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import type { NatureCompte } from '@/ai/flows/parse-accounting-plan';

type SectionType = 'Centre de coût' | 'Centre de profit' | 'Projet';

type SectionAnalytique = {
  id: number;
  code: string;
  intitule: string;
  type: SectionType;
};

const initialSections: SectionAnalytique[] = [
  { id: 1, code: '01', intitule: 'Direction Générale', type: 'Centre de coût' },
  { id: 2, code: '01.01', intitule: 'Administration', type: 'Centre de coût' },
  { id: 3, code: '01.02', intitule: 'Comptabilité', type: 'Centre de coût' },
  { id: 4, code: '02', intitule: 'Production', type: 'Centre de profit' },
  { id: 5, code: '02.01', intitule: 'Atelier 1', type: 'Centre de coût' },
  { id: 6, code: '02.02', intitule: 'Atelier 2', type: 'Centre de coût' },
  { id: 7, code: '03', intitule: 'Commercial', type: 'Centre de profit' },
  { id: 8, code: '03.01', intitule: 'Ventes France', type: 'Centre de profit' },
  { id: 9, code: '03.02', intitule: 'Ventes Export', type: 'Centre de profit' },
];

const defaultFormData: Omit<SectionAnalytique, 'id'> = {
  code: '',
  intitule: '',
  type: 'Centre de coût',
};

export default function PlanAnalytiquesPage() {
  const [sections, setSections] = useState<SectionAnalytique[]>(initialSections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionAnalytique | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [sectionToDelete, setSectionToDelete] = useState<SectionAnalytique | null>(null);
  const { toast } = useToast();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importOption, setImportOption] = useState<'merge' | 'replace'>('merge');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as SectionType }));
  };
  
  const handleOpenCreateModal = () => {
    setEditingSection(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (section: SectionAnalytique) => {
    setEditingSection(section);
    setFormData({
      code: section.code,
      intitule: section.intitule,
      type: section.type,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSection) {
      setSections(
        sections.map((s) =>
          s.id === editingSection.id ? { ...editingSection, ...formData } : s
        )
      );
      toast({ title: "Section modifiée avec succès." });
    } else {
      const newSection: SectionAnalytique = {
        id: Date.now(),
        ...formData,
      };
      setSections([...sections, newSection].sort((a,b) => a.code.localeCompare(b.code)));
      toast({ title: "Section créée avec succès." });
    }
    handleCloseModal();
  };

  const handleDeleteSection = () => {
    if (sectionToDelete) {
      setSections(sections.filter((c) => c.id !== sectionToDelete.id));
      setSectionToDelete(null);
      toast({ title: "Section supprimée." });
    }
  };
  
  const getIndentLevel = (code: string) => {
      return (code.split('.').length - 1) * 2;
  }

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

    const reader = new FileReader();
    reader.readAsDataURL(fileToUpload);
    reader.onload = async () => {
      const fileDataUri = reader.result as string;

      const progressInterval = setInterval(() => {
        setImportProgress(prev => (prev < 90 ? prev + 10 : 90));
      }, 200);

      try {
        const parsedData = await handleParseAccountingPlan({
          fileDataUri,
          fileType: fileToUpload.type,
        });

        clearInterval(progressInterval);
        setImportProgress(100);

        const mapNatureToType = (nature: NatureCompte): SectionType => {
            switch (nature) {
                case 'Compte de résultat - Produit': return 'Centre de profit';
                case 'Autre': return 'Projet';
                default: return 'Centre de coût';
            }
        };

        const newSections: Omit<SectionAnalytique, 'id'>[] = parsedData.map(item => ({
            code: item.numero,
            intitule: item.intitule,
            type: mapNatureToType(item.nature),
        }));

        if (importOption === 'replace') {
          setSections(newSections.map(s => ({...s, id: Math.random()})));
        } else {
          const existingCodes = new Set(sections.map(s => s.code));
          const newUniqueSections = newSections
            .filter(s => !existingCodes.has(s.code))
            .map(s => ({...s, id: Math.random()}));
          setSections([...sections, ...newUniqueSections].sort((a,b) => a.code.localeCompare(b.code)));
        }
        
        toast({
          title: "Importation réussie",
          description: `Le plan analytique a été mis à jour avec succès.`,
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Plan analytique</CardTitle>
              <CardDescription>
                Consultez et personnalisez le plan analytique de votre organisation.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
              <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouvelle section
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Code</TableHead>
                <TableHead>Intitulé</TableHead>
                <TableHead className="w-[200px]">Type</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id} className="odd:bg-muted/50">
                  <TableCell className="font-mono" style={{ paddingLeft: `${getIndentLevel(section.code) + 1}rem` }}>{section.code}</TableCell>
                  <TableCell className="font-medium">{section.intitule}</TableCell>
                  <TableCell>{section.type}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(section)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSectionToDelete(section)} className="text-destructive hover:text-destructive">
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingSection ? 'Modifier la section' : 'Nouvelle section'}</DialogTitle>
              <DialogDescription>
                {editingSection ? 'Mettez à jour les informations de la section.' : 'Remplissez les informations pour créer une nouvelle section.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" value={formData.code} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="intitule" className="text-right">Intitulé</Label>
                <Input id="intitule" value={formData.intitule} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select value={formData.type} onValueChange={handleSelectChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Centre de coût">Centre de coût</SelectItem>
                    <SelectItem value="Centre de profit">Centre de profit</SelectItem>
                    <SelectItem value="Projet">Projet</SelectItem>
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
      
      <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. La section sera définitivement supprimée.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSectionToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSection} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isImportModalOpen} onOpenChange={resetImportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importer un plan analytique</DialogTitle>
            <DialogDescription>
              Chargez un fichier pour remplacer ou fusionner avec le plan analytique existant.
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
