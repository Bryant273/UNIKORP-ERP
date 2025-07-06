
'use client';

import { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, PlusCircle, Upload, FileUp, Download } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type TiersType = 'Client' | 'Fournisseur';

type CompteTiers = {
  id: number;
  numero: string;
  intitule: string;
  type: TiersType;
  telephone: string;
};

const initialComptes: CompteTiers[] = [
  { id: 1, numero: '411CLIENT1', intitule: 'Client Alpha', type: 'Client', telephone: '0123456789' },
  { id: 2, numero: '401FOURN1', intitule: 'Fournisseur Omega', type: 'Fournisseur', telephone: '0987654321' },
  { id: 3, numero: '411CLIENT2', intitule: 'Client Beta', type: 'Client', telephone: '0123456788' },
  { id: 4, numero: '401FOURN2', intitule: 'Fournisseur Gamma', type: 'Fournisseur', telephone: '0987654322' },
  { id: 5, numero: '411CLIENT3', intitule: 'Client Gamma', type: 'Client', telephone: '0123456787' },
];

const defaultFormData: Omit<CompteTiers, 'id'> = {
  numero: '',
  intitule: '',
  type: 'Client',
  telephone: '',
};

const ITEMS_PER_PAGE = 10;

export default function ComptesTiersPage() {
  const [comptes, setComptes] = useState<CompteTiers[]>(initialComptes);
  const [activeTab, setActiveTab] = useState('clients');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompte, setEditingCompte] = useState<CompteTiers | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [compteToDelete, setCompteToDelete] = useState<CompteTiers | null>(null);
  const [currentPage, setCurrentPage] = useState({ clients: 1, fournisseurs: 1 });
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importOption, setImportOption] = useState<'merge' | 'replace'>('merge');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const clients = useMemo(() => comptes.filter(c => c.type === 'Client'), [comptes]);
  const fournisseurs = useMemo(() => comptes.filter(c => c.type === 'Fournisseur'), [comptes]);

  const { paginatedClients, totalClientPages } = useMemo(() => {
    const total = Math.ceil(clients.length / ITEMS_PER_PAGE);
    const start = (currentPage.clients - 1) * ITEMS_PER_PAGE;
    return {
        paginatedClients: clients.slice(start, start + ITEMS_PER_PAGE),
        totalClientPages: total
    }
  }, [clients, currentPage.clients]);

  const { paginatedFournisseurs, totalFournisseurPages } = useMemo(() => {
    const total = Math.ceil(fournisseurs.length / ITEMS_PER_PAGE);
    const start = (currentPage.fournisseurs - 1) * ITEMS_PER_PAGE;
    return {
        paginatedFournisseurs: fournisseurs.slice(start, start + ITEMS_PER_PAGE),
        totalFournisseurPages: total
    }
  }, [fournisseurs, currentPage.fournisseurs]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleOpenCreateModal = () => {
    setEditingCompte(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (compte: CompteTiers) => {
    setEditingCompte(compte);
    setFormData({
      numero: compte.numero,
      intitule: compte.intitule,
      type: compte.type,
      telephone: compte.telephone,
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
      const newCompte: CompteTiers = {
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

    const progressInterval = setInterval(() => {
        setImportProgress(prev => (prev < 90 ? prev + 10 : 90));
    }, 200);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2200));
    
    clearInterval(progressInterval);
    setImportProgress(100);

    toast({
        title: "Importation simulée réussie",
        description: `Le fichier ${fileToUpload.name} a été traité.`,
    });
    
    setTimeout(() => {
        resetImportModal();
        setIsImporting(false);
        setImportProgress(0);
    }, 1000);
  };

  const resetImportModal = () => {
    if (isImporting) return;
    setIsImportModalOpen(false);
    setFileToUpload(null);
    setImportOption('merge');
    setIsDragging(false);
  };
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = activeTab === 'clients' ? clients : fournisseurs;
    const tableTitle = activeTab === 'clients' ? 'Clients' : 'Fournisseurs';

    const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';

    doc.addImage(logoDataUri, 'PNG', 15, 12, 10, 10);
    doc.setFontSize(18);
    doc.text(`Liste des ${tableTitle}`, 105, 20, { align: 'center' });
    
    autoTable(doc, {
        startY: 30,
        head: [['Numéro', 'Intitulé', 'Téléphone']],
        body: tableData.map(c => [c.numero, c.intitule, c.telephone]),
        theme: 'striped',
        headStyles: { fillColor: '#1C2039' },
    });

    doc.save(`export_${activeTab}.pdf`);
  };

  const renderTable = (data: CompteTiers[], type: 'clients' | 'fournisseurs') => {
    const paginatedData = type === 'clients' ? paginatedClients : paginatedFournisseurs;
    const totalPages = type === 'clients' ? totalClientPages : totalFournisseurPages;
    const currentP = currentPage[type];

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(prev => ({ ...prev, [type]: newPage }));
        }
    };
    
    return (
        <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px] text-center font-semibold">Numéro</TableHead>
                  <TableHead className="text-center font-semibold">Intitulé</TableHead>
                  <TableHead className="text-center font-semibold">Téléphone</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((compte) => (
                  <TableRow key={compte.id} className="odd:bg-muted/50">
                    <TableCell className="text-center">{compte.numero}</TableCell>
                    <TableCell className="font-medium text-center">{compte.intitule}</TableCell>
                    <TableCell className="text-center">{compte.telephone}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
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
            <CardFooter className="flex items-center justify-between pt-6">
              <div className="text-sm text-muted-foreground">
                Total de {data.length} {type}. Page {currentP} sur {totalPages}.
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentP - 1)}
                    disabled={currentP === 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentP + 1)}
                    disabled={currentP === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </CardFooter>
        </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Comptes Tiers</CardTitle>
              <CardDescription>Gestion des comptes clients et fournisseurs.</CardDescription>
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
                Nouveau tiers
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="clients" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clients" className="data-[state=active]:hover:bg-primary/10">Clients</TabsTrigger>
              <TabsTrigger value="fournisseurs" className="data-[state=active]:hover:bg-primary/10">Fournisseurs</TabsTrigger>
            </TabsList>
            <TabsContent value="clients" className="pt-4">
              {renderTable(clients, 'clients')}
            </TabsContent>
            <TabsContent value="fournisseurs" className="pt-4">
              {renderTable(fournisseurs, 'fournisseurs')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCompte ? 'Modifier le compte tiers' : 'Nouveau compte tiers'}</DialogTitle>
              <DialogDescription>
                {editingCompte ? 'Mettez à jour les informations du compte.' : 'Remplissez les informations ci-dessous.'}
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
                <Label htmlFor="telephone" className="text-right">Téléphone</Label>
                <Input id="telephone" value={formData.telephone} onChange={handleInputChange} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type</Label>
                <RadioGroup 
                  value={formData.type} 
                  onValueChange={(value: TiersType) => setFormData(f => ({...f, type: value}))} 
                  className="flex gap-4 col-span-3"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Client" id="client" />
                        <Label htmlFor="client" className="font-normal">Client</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Fournisseur" id="fournisseur" />
                        <Label htmlFor="fournisseur" className="font-normal">Fournisseur</Label>
                    </div>
                </RadioGroup>
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
                    Cette action est irréversible. Le compte sera définitivement supprimé.
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
            <DialogTitle>Importer des comptes tiers</DialogTitle>
            <DialogDescription>
              Chargez un fichier (PDF, Excel) pour ajouter des clients ou fournisseurs.
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
                      PDF, XLSX, XLS, CSV
                    </p>
                  </Label>
                  <Input 
                      id="file-upload" 
                      type="file" 
                      className="sr-only" 
                      onChange={handleFileChange} 
                      accept=".pdf,.xlsx,.xls,.csv" 
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
