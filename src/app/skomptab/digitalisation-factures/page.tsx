'use client';

import React, { useState, useCallback } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, FileUp, Eye, Pencil, Trash2, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { handleParseInvoice } from '@/app/actions';

type InvoiceType = 'Achat' | 'Vente';

type DigitizedInvoice = {
  id: number;
  dateOperation: string;
  numeroPiece: string;
  tiers: string;
  type: InvoiceType;
  montant: number;
  fileUrl?: string;
};

const initialInvoices: DigitizedInvoice[] = [
  { id: 1, dateOperation: '2024-07-20', numeroPiece: 'FACT-088', tiers: 'Client Alpha', type: 'Vente', montant: 4500.00, fileUrl: 'https://placehold.co/800x1131.png' },
  { id: 2, dateOperation: '2024-07-22', numeroPiece: 'FACT-089', tiers: 'Client Beta', type: 'Vente', montant: 1250.50, fileUrl: 'https://placehold.co/800x1131.png' },
  { id: 3, dateOperation: '2024-07-19', numeroPiece: 'F2024-150', tiers: 'Fournisseur Omega', type: 'Achat', montant: 1440.00, fileUrl: 'https://placehold.co/800x1131.png' },
];

const defaultFormData: Omit<DigitizedInvoice, 'id' | 'type'> = {
  dateOperation: '',
  numeroPiece: '',
  tiers: '',
  montant: 0,
  fileUrl: '',
};

export default function DigitalisationFacturesPage() {
  const [invoices, setInvoices] = useState<DigitizedInvoice[]>(initialInvoices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<DigitizedInvoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<DigitizedInvoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<DigitizedInvoice | null>(null);
  
  // States for the upload/digitization modal
  const [formData, setFormData] = useState(defaultFormData);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const { toast } = useToast();

  const handleFileChange = (file: File | null) => {
    if (file) {
      setFileToUpload(file);
      handleDigitize(file);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    if (!isProcessing) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDigitize = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const fileDataUri = reader.result as string;

      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => (prev < 90 ? prev + 10 : 90));
      }, 250);

      try {
        const parsedData = await handleParseInvoice({
          fileDataUri,
          fileType: file.type,
        });
        
        clearInterval(progressInterval);
        setProcessingProgress(100);

        setFormData({
          numeroPiece: parsedData.numeroPiece,
          tiers: parsedData.tiers,
          dateOperation: parsedData.dateOperation,
          montant: parsedData.montantTotal,
          fileUrl: 'https://placehold.co/800x1131.png', // Placeholder URL
        });
        
        toast({
          title: "Analyse terminée",
          description: "Les informations de la facture ont été extraites.",
        });
        
        setTimeout(() => setIsProcessing(false), 500);

      } catch (error) {
        clearInterval(progressInterval);
        setIsProcessing(false);
        console.error(error);
        toast({
          title: "Erreur d'analyse",
          description: "Impossible d'extraire les informations de la facture.",
          variant: "destructive",
        });
      }
    };
    reader.onerror = () => {
      setIsProcessing(false);
      toast({ title: "Erreur", description: "Impossible de lire le fichier.", variant: "destructive" });
    };
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setEditingInvoice(null);
    setFormData(defaultFormData);
    setFileToUpload(null);
    setProcessingProgress(0);
    setIsProcessing(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInvoice) {
      setInvoices(
        invoices.map((inv) =>
          inv.id === editingInvoice.id ? { ...editingInvoice, ...formData } : inv
        )
      );
      toast({ title: 'Facture modifiée avec succès.' });
    } else {
      const newInvoice: DigitizedInvoice = {
        id: Date.now(),
        type: 'Achat', // Assuming manual uploads are purchases
        ...formData,
      };
      setInvoices([newInvoice, ...invoices]);
      toast({ title: 'Facture enregistrée avec succès.' });
    }
    resetModal();
  };

  const handleDeleteInvoice = () => {
    if (invoiceToDelete) {
      setInvoices(invoices.filter((inv) => inv.id !== invoiceToDelete.id));
      setInvoiceToDelete(null);
      toast({ title: 'Facture supprimée.' });
    }
  };
  
  const handleOpenEditModal = (invoice: DigitizedInvoice) => {
    setEditingInvoice(invoice);
    setFormData({
        dateOperation: invoice.dateOperation,
        numeroPiece: invoice.numeroPiece,
        tiers: invoice.tiers,
        montant: invoice.montant,
        fileUrl: invoice.fileUrl
    });
    setIsModalOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: id === 'montant' ? parseFloat(value) : value }));
  };

  const handleDownload = (invoice: DigitizedInvoice | null) => {
    if (!invoice?.fileUrl) return;
    const link = document.createElement('a');
    link.href = invoice.fileUrl;
    link.target = "_blank";
    link.download = `facture-${invoice.numeroPiece}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Téléchargement initié",
      description: "Le fichier de la facture va s'ouvrir ou se télécharger.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Digitalisation des Factures</CardTitle>
              <CardDescription>
                Importez et gérez vos factures d'achat. Les factures de vente sont ajoutées automatiquement.
              </CardDescription>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Digitaliser une facture
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Opération</TableHead>
                <TableHead>N° Pièce</TableHead>
                <TableHead>Tiers</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="odd:bg-muted/50">
                  <TableCell>{new Date(invoice.dateOperation).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="font-mono">{invoice.numeroPiece}</TableCell>
                  <TableCell className="font-medium">{invoice.tiers}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.type === 'Vente' ? 'default' : 'secondary'}>{invoice.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{invoice.montant.toFixed(2)} FCFA</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewingInvoice(invoice)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(invoice)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setInvoiceToDelete(invoice)} className="text-destructive hover:text-destructive">
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

      {/* Main modal for upload and edit */}
      <Dialog open={isModalOpen} onOpenChange={resetModal}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingInvoice ? 'Modifier la facture' : 'Digitaliser une nouvelle facture'}</DialogTitle>
              <DialogDescription>
                {editingInvoice ? 'Modifiez les informations de la facture ci-dessous.' : 'Chargez un fichier PDF pour que l\'IA l\'analyse, ou remplissez les champs manuellement.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {!editingInvoice && (
                <div 
                  className={cn(
                      "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors duration-200",
                      isDragging && "border-primary bg-primary/10",
                      isProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted/50"
                  )}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragEvents}
                  onDrop={handleDrop}
                >
                  <Label htmlFor="file-upload" className={cn("flex flex-col items-center justify-center w-full h-full text-center", isProcessing ? "cursor-not-allowed" : "cursor-pointer")}>
                    {isProcessing ? (
                      <div className="space-y-4 w-full">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                        <p className="text-sm font-medium text-primary">Analyse par l'IA en cours...</p>
                        <Progress value={processingProgress} />
                      </div>
                    ) : (
                      <>
                        <FileUp className="w-10 h-10 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">Glissez-déposez</span> une facture ou cliquez pour sélectionner
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">PDF (max 5MB)</p>
                      </>
                    )}
                  </Label>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    className="sr-only" 
                    onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                    accept="application/pdf"
                    disabled={isProcessing}
                  />
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroPiece">N° Pièce</Label>
                  <Input id="numeroPiece" value={formData.numeroPiece} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiers">Tiers</Label>
                  <Input id="tiers" value={formData.tiers} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOperation">Date de l'opération</Label>
                  <Input id="dateOperation" type="date" value={formData.dateOperation} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="montant">Montant total (FCFA)</Label>
                  <Input id="montant" type="number" step="0.01" value={formData.montant} onChange={handleInputChange} required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetModal}>Annuler</Button>
              <Button type="submit" disabled={isProcessing}>Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View modal */}
      <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de la facture</DialogTitle>
            <DialogDescription>
              Aperçu des informations et du document pour la facture N° {viewingInvoice?.numeroPiece}.
            </DialogDescription>
          </DialogHeader>
          {viewingInvoice && (
            <div className="grid md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label className="text-sm text-muted-foreground">N° Pièce</Label>
                  <p className="font-semibold">{viewingInvoice.numeroPiece}</p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Tiers</Label>
                  <p className="font-semibold">{viewingInvoice.tiers}</p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Date de l'opération</Label>
                  <p className="font-semibold">{new Date(viewingInvoice.dateOperation).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Type</Label>
                  <p className="font-semibold"><Badge variant={viewingInvoice.type === 'Vente' ? 'default' : 'secondary'}>{viewingInvoice.type}</Badge></p>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Montant Total</Label>
                  <p className="font-bold text-lg">{viewingInvoice.montant.toFixed(2)} FCFA</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Aperçu du document</Label>
                <div className="border rounded-lg overflow-hidden aspect-[1/1.414] bg-muted">
                  {viewingInvoice.fileUrl && (
                      <Image
                        data-ai-hint="invoice document"
                        src={viewingInvoice.fileUrl}
                        alt={`Facture ${viewingInvoice.numeroPiece}`}
                        width={400}
                        height={565}
                        className="w-full h-full object-cover"
                      />
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingInvoice(null)}>Fermer</Button>
            <Button onClick={() => handleDownload(viewingInvoice)}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Delete confirmation dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. La facture sera définitivement supprimée.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setInvoiceToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteInvoice} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
