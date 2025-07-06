
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Trash2, PlusCircle, Palette, Eye, Pencil, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- DATA TYPES & MOCK DATA ---

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceTemplate = {
  id: string;
  name: string;
  primaryColor: string;
  companyName: string;
  companyAddress: string;
  companyLogoUrl: string;
  showQuantity: boolean;
  showUnitPrice: boolean;
  showTax: boolean;
  footerText: string;
};

const initialTemplates: InvoiceTemplate[] = [
  {
    id: 'tpl_classic',
    name: 'Classique',
    primaryColor: '#3b82f6', // blue-500
    companyName: 'Votre Société S.A.',
    companyAddress: '123 Rue de la Facture, 75001 Paris',
    companyLogoUrl: '',
    showQuantity: true,
    showUnitPrice: true,
    showTax: true,
    footerText: 'Merci de votre confiance.\nPaiement à 30 jours net.',
  },
  {
    id: 'tpl_modern',
    name: 'Moderne',
    primaryColor: '#10b981', // emerald-500
    companyName: 'Tech Innovante Inc.',
    companyAddress: '456 Avenue du Futur, Lyon',
    companyLogoUrl: '',
    showQuantity: true,
    showUnitPrice: true,
    showTax: false,
    footerText: 'Coordonnées bancaires : FR76 ...',
  },
    {
    id: 'tpl_minimal',
    name: 'Minimaliste',
    primaryColor: '#18181b', // neutral-900
    companyName: 'Studio Créatif',
    companyAddress: '789 Boulevard des Arts, Marseille',
    companyLogoUrl: '',
    showQuantity: false,
    showUnitPrice: true,
    showTax: true,
    footerText: 'Prestation réalisée par Studio Créatif.',
  },
];


type InvoiceData = {
  id: string;
  invoiceTitle: string;
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  isVatEnabled: boolean;
  vatRate: number;
  notes: string;
  // From template
  companyName: string;
  companyAddress: string;
  companyLogoUrl: string;
  primaryColor: string;
};

const calculateTotals = (invoice: Omit<InvoiceData, 'id'>) => {
    const subTotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const vatAmount = invoice.isVatEnabled ? subTotal * (invoice.vatRate / 100) : 0;
    const total = subTotal + vatAmount;
    return { subTotal, vatAmount, total };
};

const initialInvoices: InvoiceData[] = [
  {
    id: 'inv_1',
    invoiceTitle: 'Prestation de développement web',
    clientName: 'Client Alpha SARL',
    clientAddress: '10 Rue du Commerce, 33000 Bordeaux',
    invoiceNumber: 'FACT-2024-00123',
    invoiceDate: '2024-07-15',
    dueDate: '2024-08-14',
    lineItems: [
      { id: 'l1', description: 'Développement de site web', quantity: 1, unitPrice: 2500000 },
      { id: 'l2', description: 'Hébergement annuel', quantity: 1, unitPrice: 300000 },
    ],
    isVatEnabled: true,
    vatRate: 20,
    notes: 'Merci de votre confiance.',
    companyName: 'Votre Société S.A.',
    companyAddress: '123 Rue de la Facture, 75001 Paris',
    companyLogoUrl: '',
    primaryColor: '#3b82f6',
  },
  {
    id: 'inv_2',
    invoiceTitle: 'Consulting SEO - Juillet 2024',
    clientName: 'Tech Innovante Inc.',
    clientAddress: '456 Avenue du Futur, Lyon',
    invoiceNumber: 'FACT-2024-00124',
    invoiceDate: '2024-07-18',
    dueDate: '2024-08-17',
    lineItems: [{ id: 'l3', description: 'Consulting SEO', quantity: 10, unitPrice: 150000 }],
    isVatEnabled: true,
    vatRate: 20,
    notes: 'Paiement à réception.',
    companyName: 'Tech Innovante Inc.',
    companyAddress: '456 Avenue du Futur, Lyon',
    companyLogoUrl: '',
    primaryColor: '#10b981',
  },
];

const getDefaultInvoiceData = (template: InvoiceTemplate): Omit<InvoiceData, 'id'> => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);

    const nextInvoiceNumber = `FACT-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-001`;

    return {
        invoiceTitle: '',
        clientName: '',
        clientAddress: '',
        invoiceNumber: nextInvoiceNumber,
        invoiceDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        lineItems: [{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }],
        vatRate: 18,
        // From template
        isVatEnabled: template.showTax,
        notes: template.footerText,
        companyName: template.companyName,
        companyAddress: template.companyAddress,
        companyLogoUrl: template.companyLogoUrl,
        primaryColor: template.primaryColor
    };
};


// --- INVOICE PREVIEW COMPONENT ---

const LiveInvoicePreview = ({ invoice }: { invoice: Omit<InvoiceData, 'id'> }) => {
    const { subTotal, vatAmount, total } = calculateTotals(invoice);
    const formatFr = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

    return (
        <div id="invoice-preview" className="bg-white rounded-lg shadow-md p-8 w-full mx-auto text-black font-sans text-sm border">
            <div className="flex justify-between items-start mb-8">
                <div>
                     {invoice.companyLogoUrl ? <img src={invoice.companyLogoUrl} alt="Logo" className="h-12" data-ai-hint="company logo" /> : <Logo className="h-12 w-12" style={{ color: invoice.primaryColor }} />}
                    <h1 className="font-bold text-lg mt-2">{invoice.companyName}</h1>
                    <p className="text-xs whitespace-pre-line">{invoice.companyAddress}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase" style={{ color: invoice.primaryColor }}>FACTURE</h2>
                    <p className="font-mono text-xs">{invoice.invoiceNumber || 'FACT-XXXX-000'}</p>
                    <p className="text-sm text-muted-foreground mt-1">{invoice.invoiceTitle}</p>
                </div>
            </div>
            <div className="flex justify-between mb-8">
                <div className="text-xs">
                    <p className="font-bold text-gray-500 mb-1">FACTURÉ À</p>
                    <p className="font-bold">{invoice.clientName || 'Nom du Client'}</p>
                    <p className="whitespace-pre-line">{invoice.clientAddress || 'Adresse du client'}</p>
                </div>
                <div className="text-right text-xs">
                    <div className="flex items-center justify-end gap-4">
                        <p className="font-bold text-gray-500">Date :</p>
                        <p>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('fr-FR') : ''}</p>
                    </div>
                     <div className="flex items-center justify-end gap-4 mt-1">
                        <p className="font-bold text-gray-500">Échéance :</p>
                        <p>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : ''}</p>
                    </div>
                </div>
            </div>
            <table className="w-full text-left mb-8 text-xs">
                <thead style={{ backgroundColor: invoice.primaryColor }} className="text-white">
                    <tr>
                        <th className="p-2 rounded-l-md font-semibold text-center">Description</th>
                        <th className="p-2 font-semibold text-center">Qté</th>
                        <th className="p-2 font-semibold text-center">Prix U. HT</th>
                        <th className="p-2 font-semibold text-center rounded-r-md">Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.lineItems.map((item) => (
                         <tr key={item.id} className="border-b odd:bg-muted/50">
                            <td className="p-2 font-medium text-center">{item.description || 'Service ou produit'}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-center">{formatFr(item.unitPrice)} FCFA</td>
                            <td className="p-2 text-center">{formatFr(item.quantity * item.unitPrice)} FCFA</td>
                        </tr>
                    ))}
                    {invoice.lineItems.length === 0 && (
                        <tr><td colSpan={4} className="p-4 text-center text-gray-400">Aucun article</td></tr>
                    )}
                </tbody>
            </table>
            <div className="flex justify-end mb-8">
                <div className="w-1/2 max-w-xs text-xs space-y-2">
                    <div className="flex justify-between">
                        <p className="text-gray-500">Sous-total HT :</p>
                        <p>{formatFr(subTotal)} FCFA</p>
                    </div>
                    {invoice.isVatEnabled && (
                        <div className="flex justify-between">
                            <p className="text-gray-500">TVA ({invoice.vatRate}%) :</p>
                            <p>{formatFr(vatAmount)} FCFA</p>
                        </div>
                    )}
                     <Separator />
                    <div className="flex justify-between font-bold text-base" style={{ color: invoice.primaryColor }}>
                        <p>TOTAL TTC :</p>
                        <p>{formatFr(total)} FCFA</p>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="mt-4 text-xs text-gray-500 whitespace-pre-line">
                {invoice.notes}
            </div>
        </div>
    );
};
LiveInvoicePreview.displayName = 'LiveInvoicePreview';

// --- MAIN PAGE COMPONENT ---
export default function ModeleFacturePage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>(initialInvoices);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceData | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Omit<InvoiceData, 'id'>>(getDefaultInvoiceData(initialTemplates[0]));
  const { toast } = useToast();

  const handleOpenCreateSheet = (template: InvoiceTemplate) => {
    setEditingInvoice(null);
    setIsViewMode(false);
    setFormData(getDefaultInvoiceData(template));
    setIsSheetOpen(true);
  };
  
  const handleOpenEditSheet = (invoice: InvoiceData) => {
    setEditingInvoice(invoice);
    setIsViewMode(false);
    setFormData(JSON.parse(JSON.stringify(invoice)));
    setIsSheetOpen(true);
  };

  const handleOpenViewSheet = (invoice: InvoiceData) => {
    setEditingInvoice(invoice);
    setIsViewMode(true);
    setFormData(JSON.parse(JSON.stringify(invoice)));
    setIsSheetOpen(true);
  };

  const handleFormChange = (field: keyof Omit<InvoiceData, 'id' | 'lineItems'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleLineItemChange = (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeLineItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
    }));
  };

  const handleSave = () => {
    if (editingInvoice) {
      setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? { id: inv.id, ...formData } : inv));
      toast({ title: "Facture mise à jour." });
    } else {
      const newInvoice = { id: `inv_${Date.now()}`, ...formData };
      setInvoices(prev => [newInvoice, ...prev]);
      toast({ title: "Facture créée avec succès." });
    }
    setIsSheetOpen(false);
  };

  const handleDelete = () => {
      if (invoiceToDelete) {
          setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete.id));
          setInvoiceToDelete(null);
          toast({ title: "Facture supprimée." });
      }
  };

  const handleSelectTemplate = (template: InvoiceTemplate) => {
    setIsTemplateModalOpen(false);
    handleOpenCreateSheet(template);
  };

  const generatePDF = (invoice: InvoiceData) => {
    const doc = new jsPDF();
    const { subTotal, vatAmount, total } = calculateTotals(invoice);
    const formatFr = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("FACTURE", 150, 20);
    doc.setFontSize(10);
    doc.text(invoice.invoiceNumber, 150, 26);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(invoice.invoiceTitle, 150, 32, {align: 'right'});
    doc.setTextColor(40, 40, 40);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.companyName, 20, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoice.companyAddress.replace(/\n/g, '\n'), 20, 26);
    
    // Client Info & Dates
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("FACTURÉ À:", 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, 56);
    doc.text(invoice.clientAddress.replace(/\n/g, '\n'), 20, 62);
    
    doc.text(`Date de facture: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}`, 150, 50);
    doc.text(`Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 150, 56);
    
    // Table
    const tableColumn = ["Description", "Qté", "P.U. HT", "Total HT"];
    const tableRows = invoice.lineItems.map(item => [
      item.description,
      item.quantity,
      `${formatFr(item.unitPrice)} FCFA`,
      `${formatFr(item.quantity * item.unitPrice)} FCFA`,
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        headStyles: { fillColor: invoice.primaryColor }, 
        styles: { halign: 'center' },
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(10);
    let currentY = finalY + 10;

    doc.text(`Sous-total HT:`, 140, currentY);
    doc.text(`${formatFr(subTotal)} FCFA`, 190, currentY, { align: 'right' });
    currentY += 7;

    if (invoice.isVatEnabled) {
        doc.text(`TVA (${invoice.vatRate}%):`, 140, currentY);
        doc.text(`${formatFr(vatAmount)} FCFA`, 190, currentY, { align: 'right' });
        currentY += 7;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL TTC:`, 140, currentY);
    doc.text(`${formatFr(total)} FCFA`, 190, currentY, { align: 'right' });
    
    // Footer
    currentY += 20;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(invoice.notes.replace(/\n/g, '\n'), 20, currentY, { maxWidth: 170 });

    doc.save(`facture-${invoice.invoiceNumber}.pdf`);

    toast({
        title: "Facture générée",
        description: `Le fichier facture-${invoice.invoiceNumber}.pdf a été téléchargé.`,
    })
  };


  return (
    <>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-sans text-2xl">Modèles de Facture</CardTitle>
                        <CardDescription>
                            Créez, consultez et gérez toutes vos factures de vente.
                        </CardDescription>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsTemplateModalOpen(true)}>
                            <Palette className="mr-2 h-4 w-4" />
                            Changer de modèle
                        </Button>
                        <Button onClick={() => handleOpenCreateSheet(initialTemplates[0])}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Créer une facture
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px] font-semibold text-center">Date d'émission</TableHead>
                            <TableHead className="font-semibold text-center">Tiers</TableHead>
                            <TableHead className="font-semibold text-center">Libellé</TableHead>
                            <TableHead className="w-[150px] text-right font-semibold">Montant TTC</TableHead>
                            <TableHead className="w-[200px] text-center font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => {
                            const { total } = calculateTotals(invoice);
                            return (
                                <TableRow key={invoice.id} className="odd:bg-muted/50">
                                    <TableCell className="text-center">{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell className="font-medium text-center">{invoice.clientName}</TableCell>
                                    <TableCell className="text-center">{invoice.invoiceTitle}</TableCell>
                                    <TableCell className="font-sans text-right">{total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenViewSheet(invoice)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditSheet(invoice)}><Pencil className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => generatePDF(invoice)}><FileText className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setInvoiceToDelete(invoice)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="w-full sm:max-w-full md:w-[90vw] lg:w-[80vw] xl:w-[70vw] p-0 flex flex-col">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>{editingInvoice ? (isViewMode ? 'Détails de la facture' : 'Modifier la facture') : 'Créer une nouvelle facture'}</SheetTitle>
                    <SheetDescription>
                        {isViewMode ? 'Consultez les informations de la facture.' : 'Remplissez les informations ci-dessous. Les modifications sont visibles en direct.'}
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                    {/* Form Panel */}
                    <ScrollArea className="md:col-span-1 h-full">
                        <div className="p-6 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Informations sur la facture</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="invoiceTitle">Libellé de la facture</Label>
                                        <Input id="invoiceTitle" value={formData.invoiceTitle} onChange={(e) => handleFormChange('invoiceTitle', e.target.value)} placeholder="Ex: Prestation de service" disabled={isViewMode} />
                                    </div>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="space-y-2"><Label htmlFor="invoiceNumber">N° de facture</Label><Input id="invoiceNumber" value={formData.invoiceNumber} onChange={(e) => handleFormChange('invoiceNumber', e.target.value)} disabled={isViewMode} /></div>
                                        <div className="space-y-2"><Label htmlFor="invoiceDate">Date de facturation</Label><Input id="invoiceDate" type="date" value={formData.invoiceDate} onChange={(e) => handleFormChange('invoiceDate', e.target.value)} disabled={isViewMode} /></div>
                                        <div className="space-y-2"><Label htmlFor="dueDate">Date d'échéance</Label><Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => handleFormChange('dueDate', e.target.value)} disabled={isViewMode} /></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Informations sur le client</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label htmlFor="clientName">Nom du client</Label><Input id="clientName" value={formData.clientName} onChange={(e) => handleFormChange('clientName', e.target.value)} placeholder="Nom ou raison sociale" disabled={isViewMode} /></div>
                                    <div className="space-y-2"><Label htmlFor="clientAddress">Adresse du client</Label><Textarea id="clientAddress" value={formData.clientAddress} onChange={(e) => handleFormChange('clientAddress', e.target.value)} placeholder="Adresse complète" disabled={isViewMode} /></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Lignes de la facture</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead className="font-semibold text-center">Description</TableHead><TableHead className="w-[100px] font-semibold text-center">Qté</TableHead><TableHead className="w-[150px] font-semibold text-center">Prix U. (HT)</TableHead><TableHead className="w-[50px] font-semibold text-center"></TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {formData.lineItems.map(item => (
                                                <TableRow key={item.id} className="odd:bg-muted/50"><TableCell><Input value={item.description} onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)} placeholder="Ex: Prestation" disabled={isViewMode} /></TableCell><TableCell><Input type="number" value={item.quantity} onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))} disabled={isViewMode} /></TableCell><TableCell><Input type="number" value={item.unitPrice} onChange={(e) => handleLineItemChange(item.id, 'unitPrice', Number(e.target.value))} disabled={isViewMode} /></TableCell><TableCell className="text-center">{!isViewMode && <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}</TableCell></TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {!isViewMode && <Button onClick={addLineItem} variant="outline" className="mt-4"><PlusCircle className="mr-2 h-4 w-4" />Ajouter une ligne</Button>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>TVA et Notes</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2 rounded-lg border p-4"><div className="flex-1 space-y-1"><Label htmlFor="isVatEnabled">Activer la TVA</Label><p className="text-xs text-muted-foreground">Appliquer la TVA sur le total HT.</p></div><Switch id="isVatEnabled" checked={formData.isVatEnabled} onCheckedChange={(checked) => handleFormChange('isVatEnabled', checked)} disabled={isViewMode} /></div>
                                    <div className="space-y-2"><Label htmlFor="vatRate">Taux de TVA (%)</Label><Input id="vatRate" type="number" value={formData.vatRate} onChange={(e) => handleFormChange('vatRate', Number(e.target.value))} disabled={!formData.isVatEnabled || isViewMode} /></div>
                                    <div className="space-y-2"><Label htmlFor="notes">Notes / Pied de page</Label><Textarea id="notes" value={formData.notes} onChange={(e) => handleFormChange('notes', e.target.value)} disabled={isViewMode} /></div>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                    {/* Preview Panel */}
                    <ScrollArea className="md:col-span-1 h-full bg-muted">
                       <div className="p-8">
                            <LiveInvoicePreview invoice={formData} />
                       </div>
                    </ScrollArea>
                </div>
                <SheetFooter className="p-6 border-t">
                    <SheetClose asChild><Button variant="outline">Annuler</Button></SheetClose>
                    {!isViewMode && <Button onClick={handleSave}>Enregistrer</Button>}
                </SheetFooter>
            </SheetContent>
        </Sheet>
        
        <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. La facture sera définitivement supprimée.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setInvoiceToDelete(null)}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
            <DialogContent>
                <DialogHeader>
                  <DialogTitle>Choisir un modèle de facture</DialogTitle>
                  <DialogDescription>
                    Sélectionnez un modèle pour commencer.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {initialTemplates.map(template => (
                      <Card key={template.id} className="hover:bg-accent transition-colors">
                        <CardHeader className="flex flex-row justify-between items-center p-4">
                            <div>
                               <CardTitle className="text-base font-semibold">{template.name}</CardTitle>
                               <CardDescription className="flex items-center gap-2">
                                   <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: template.primaryColor }} />
                                   {template.companyName}
                               </CardDescription>
                            </div>
                            <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                               Sélectionner
                            </Button>
                        </CardHeader>
                      </Card>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}
