
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
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
import { Pencil, Trash2, PlusCircle, Upload, FileUp, Download } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { handleParseAccountingPlan } from '@/app/actions';
import type { NatureCompte } from '@/ai/flows/parse-accounting-plan';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type SectionType = 'Charges' | 'Centre de coût' | 'Produits' | 'Centre de profit' | 'Projet';

type SectionAnalytique = {
  id: number;
  code: string;
  intitule: string;
  compteGeneral: string;
  type: SectionType;
};

const initialSections: SectionAnalytique[] = [
    { id: 1, code: '60', intitule: 'Achats', compteGeneral: '60x', type: 'Charges' },
    { id: 2, code: '601.01', intitule: 'Achats - Direction', compteGeneral: '601', type: 'Centre de coût' },
    { id: 3, code: '601.02', intitule: 'Achats - Production', compteGeneral: '601', type: 'Centre de coût' },
    { id: 4, code: '601.03', intitule: 'Achats - Commercial', compteGeneral: '601', type: 'Centre de coût' },
    { id: 5, code: '606.01', intitule: 'Fournitures - Direction', compteGeneral: '6061', type: 'Centre de coût' },
    { id: 6, code: '606.02', intitule: 'Fournitures - Production', compteGeneral: '6061', type: 'Centre de coût' },
    { id: 7, code: '606.03', intitule: 'Fournitures - Commercial', compteGeneral: '6061', type: 'Centre de coût' },
    { id: 8, code: '64', intitule: 'Charges de personnel', compteGeneral: '64x', type: 'Charges' },
    { id: 9, code: '641.01', intitule: 'Salaires - Direction', compteGeneral: '641', type: 'Centre de coût' },
    { id: 10, code: '641.02', intitule: 'Salaires - Production', compteGeneral: '641', type: 'Centre de coût' },
    { id: 11, code: '641.03', intitule: 'Salaires - Commercial', compteGeneral: '641', type: 'Centre de coût' },
    { id: 12, code: '70', intitule: 'Ventes', compteGeneral: '70x', type: 'Produits' },
    { id: 13, code: '701.FR', intitule: 'Ventes - France', compteGeneral: '701', type: 'Centre de profit' },
    { id: 14, code: '701.EXP', intitule: 'Ventes - Export', compteGeneral: '701', type: 'Centre de profit' },
    { id: 15, code: '701.PRJ001', intitule: 'Ventes - Projet Alpha', compteGeneral: '701', type: 'Projet' },
    { id: 16, code: '701.PRJ002', intitule: 'Ventes - Projet Beta', compteGeneral: '701', type: 'Projet' },
    { id: 17, code: '61', intitule: 'Services extérieurs', compteGeneral: '61x', type: 'Charges' },
    { id: 18, code: '613.01', intitule: 'Location - Direction', compteGeneral: '613', type: 'Centre de coût' },
    { id: 19, code: '613.02', intitule: 'Location - Production', compteGeneral: '613', type: 'Centre de coût' },
];


const defaultFormData: Omit<SectionAnalytique, 'id'> = {
  code: '',
  intitule: '',
  compteGeneral: '',
  type: 'Centre de coût',
};

const ITEMS_PER_PAGE = 10;

export default function PlanAnalytiquesPage() {
  const [sections, setSections] = useState<SectionAnalytique[]>(initialSections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionAnalytique | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [sectionToDelete, setSectionToDelete] = useState<SectionAnalytique | null>(null);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importOption, setImportOption] = useState<'merge' | 'replace'>('merge');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalPages = Math.ceil(sections.length / ITEMS_PER_PAGE);
  const paginatedSections = sections.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


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
      compteGeneral: section.compteGeneral,
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
        ).sort((a,b) => a.code.localeCompare(b.code))
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
            compteGeneral: item.numero.substring(0, 3) // Simple guess for mapping
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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Plan Analytique', 14, 22);
    autoTable(doc, {
        head: [['Code', 'Intitulé', 'Compte Général', 'Type']],
        body: sections.map(s => [s.code, s.intitule, s.compteGeneral, s.type]),
        startY: 30,
    });
    doc.save('plan_analytique.pdf');
    toast({ title: "Exportation PDF réussie" });
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
              <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
              </Button>
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
                <TableHead className="w-[150px]">Compte général</TableHead>
                <TableHead className="w-[200px]">Type</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSections.map((section) => (
                <TableRow key={section.id} className="odd:bg-muted/50">
                  <TableCell className="font-mono" style={{ paddingLeft: `${getIndentLevel(section.code) + 1}rem` }}>{section.code}</TableCell>
                  <TableCell className="font-medium">{section.intitule}</TableCell>
                  <TableCell className="font-mono">{section.compteGeneral}</TableCell>
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
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total de {sections.length} sections. Page {currentPage} sur {totalPages}.
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
                <Label htmlFor="compteGeneral" className="text-right">Compte général</Label>
                <Input id="compteGeneral" value={formData.compteGeneral} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select value={formData.type} onValueChange={handleSelectChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Charges">Charges</SelectItem>
                    <SelectItem value="Centre de coût">Centre de coût</SelectItem>
                    <SelectItem value="Produits">Produits</SelectItem>
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
