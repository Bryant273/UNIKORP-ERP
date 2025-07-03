'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Data types
type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceData = {
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  isVatEnabled: boolean;
  vatRate: number;
  notes: string;
};

// Default state
const getDefaultInvoiceData = (): InvoiceData => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);

    return {
        clientName: '',
        clientAddress: '',
        invoiceNumber: `FACT-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-001`,
        invoiceDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        lineItems: [{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }],
        isVatEnabled: true,
        vatRate: 18,
        notes: 'Nous vous remercions de votre confiance.',
    };
};

// Live Preview Component
const LiveInvoicePreview = React.forwardRef<HTMLDivElement, { invoice: InvoiceData, subTotal: number, vatAmount: number, total: number }>(
  ({ invoice, subTotal, vatAmount, total }, ref) => {
    return (
        <div ref={ref} id="invoice-preview" className="bg-white rounded-lg shadow-lg p-8 w-full mx-auto text-black font-sans text-sm border">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <Logo className="h-12 w-12 text-primary" />
                    <h1 className="font-bold text-lg mt-2">Votre Entreprise</h1>
                    <p className="text-xs">123 Rue de l'Exemple, Ville, Pays</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase text-primary">FACTURE</h2>
                    <p className="font-mono text-xs">{invoice.invoiceNumber || 'FACT-XXXX-000'}</p>
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
                <thead className="bg-primary text-white">
                    <tr>
                        <th className="p-2 rounded-l-md">Description</th>
                        <th className="p-2 text-center">Qté</th>
                        <th className="p-2 text-right">Prix U. HT</th>
                        <th className="p-2 text-right rounded-r-md">Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.lineItems.map((item) => (
                         <tr key={item.id} className="border-b">
                            <td className="p-2 font-medium">{item.description || 'Service ou produit'}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">{item.unitPrice.toFixed(2)} XOF</td>
                            <td className="p-2 text-right">{(item.quantity * item.unitPrice).toFixed(2)} XOF</td>
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
                        <p>{subTotal.toFixed(2)} XOF</p>
                    </div>
                    {invoice.isVatEnabled && (
                        <div className="flex justify-between">
                            <p className="text-gray-500">TVA ({invoice.vatRate}%) :</p>
                            <p>{vatAmount.toFixed(2)} XOF</p>
                        </div>
                    )}
                     <Separator />
                    <div className="flex justify-between font-bold text-base text-primary">
                        <p>TOTAL TTC :</p>
                        <p>{total.toFixed(2)} XOF</p>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="mt-4 text-xs text-gray-500 whitespace-pre-line">
                {invoice.notes}
            </div>
        </div>
    );
});
LiveInvoicePreview.displayName = 'LiveInvoicePreview';

// Main Page Component
export default function ElaborationFacturesPage() {
  const [invoice, setInvoice] = useState<InvoiceData>(getDefaultInvoiceData());
  const { toast } = useToast();

  const handleInputChange = (field: keyof InvoiceData, value: any) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLineItem = () => {
    setInvoice(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeLineItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id),
    }));
  };

  const { subTotal, vatAmount, total } = useMemo(() => {
    const subTotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const vatAmount = invoice.isVatEnabled ? subTotal * (invoice.vatRate / 100) : 0;
    const total = subTotal + vatAmount;
    return { subTotal, vatAmount, total };
  }, [invoice.lineItems, invoice.isVatEnabled, invoice.vatRate]);
  
  const handlePrint = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("FACTURE", 150, 20);
    doc.setFontSize(10);
    doc.text(invoice.invoiceNumber, 150, 26);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Votre Entreprise", 20, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("123 Rue de l'Exemple\nVille, Pays", 20, 26);
    
    // Client Info & Dates
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("FACTURÉ À:", 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 20, 56);
    doc.text(invoice.clientAddress, 20, 62);
    
    doc.text(`Date de facture: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}`, 150, 50);
    doc.text(`Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 150, 56);
    
    // Table
    const tableColumn = ["Description", "Qté", "P.U. HT", "Total HT"];
    const tableRows = invoice.lineItems.map(item => [
      item.description,
      item.quantity,
      `${item.unitPrice.toFixed(2)} XOF`,
      `${(item.quantity * item.unitPrice).toFixed(2)} XOF`,
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        headStyles: { fillColor: [67, 58, 183] }, // primary color
        styles: { halign: 'left' },
        columnStyles: {
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' },
        }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(10);
    let currentY = finalY + 10;

    doc.text(`Sous-total HT:`, 140, currentY);
    doc.text(`${subTotal.toFixed(2)} XOF`, 190, currentY, { align: 'right' });
    currentY += 7;

    if (invoice.isVatEnabled) {
        doc.text(`TVA (${invoice.vatRate}%):`, 140, currentY);
        doc.text(`${vatAmount.toFixed(2)} XOF`, 190, currentY, { align: 'right' });
        currentY += 7;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL TTC:`, 140, currentY);
    doc.text(`${total.toFixed(2)} XOF`, 190, currentY, { align: 'right' });
    
    // Footer
    currentY += 20;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(invoice.notes, 20, currentY, { maxWidth: 170 });

    doc.save(`facture-${invoice.invoiceNumber}.pdf`);

    toast({
        title: "Facture générée",
        description: `Le fichier facture-${invoice.invoiceNumber}.pdf a été téléchargé.`,
    })
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-6 lg:p-8">
      {/* Form Column */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations sur la facture</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">N° de facture</Label>
                <Input id="invoiceNumber" value={invoice.invoiceNumber} onChange={(e) => handleInputChange('invoiceNumber', e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="invoiceDate">Date de facturation</Label>
                <Input id="invoiceDate" type="date" value={invoice.invoiceDate} onChange={(e) => handleInputChange('invoiceDate', e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="dueDate">Date d'échéance</Label>
                <Input id="dueDate" type="date" value={invoice.dueDate} onChange={(e) => handleInputChange('dueDate', e.target.value)} />
              </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Informations sur le client</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="clientName">Nom du client</Label>
                    <Input id="clientName" value={invoice.clientName} onChange={(e) => handleInputChange('clientName', e.target.value)} placeholder="Nom ou raison sociale" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="clientAddress">Adresse du client</Label>
                    <Textarea id="clientAddress" value={invoice.clientAddress} onChange={(e) => handleInputChange('clientAddress', e.target.value)} placeholder="Adresse complète" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Lignes de la facture</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[100px]">Quantité</TableHead>
                            <TableHead className="w-[150px]">Prix U. (HT)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.lineItems.map(item => (
                            <TableRow key={item.id}>
                                <TableCell><Input value={item.description} onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)} placeholder="Ex: Prestation de service" /></TableCell>
                                <TableCell><Input type="number" value={item.quantity} onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))} /></TableCell>
                                <TableCell><Input type="number" value={item.unitPrice} onChange={(e) => handleLineItemChange(item.id, 'unitPrice', Number(e.target.value))} /></TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => removeLineItem(item.id)} className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <Button onClick={addLineItem} variant="outline" className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une ligne
                </Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>TVA et Notes</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                 <div className="flex items-center space-x-2 rounded-lg border p-4">
                    <div className="flex-1 space-y-1">
                        <Label htmlFor="isVatEnabled">Activer la TVA</Label>
                        <p className="text-xs text-muted-foreground">Appliquer la TVA sur le total HT.</p>
                    </div>
                    <Switch id="isVatEnabled" checked={invoice.isVatEnabled} onCheckedChange={(checked) => handleInputChange('isVatEnabled', checked)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="vatRate">Taux de TVA (%)</Label>
                    <Input id="vatRate" type="number" value={invoice.vatRate} onChange={(e) => handleInputChange('vatRate', Number(e.target.value))} disabled={!invoice.isVatEnabled} />
                </div>
                 <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="notes">Notes / Pied de page</Label>
                    <Textarea id="notes" value={invoice.notes} onChange={(e) => handleInputChange('notes', e.target.value)} />
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handlePrint} className="w-full md:w-auto ml-auto">
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimer / Générer PDF
                </Button>
            </CardFooter>
        </Card>

      </div>
      
      {/* Preview Column */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
           <Card>
            <CardHeader>
              <CardTitle>Aperçu en direct</CardTitle>
            </CardHeader>
            <CardContent>
                <LiveInvoicePreview invoice={invoice} subTotal={subTotal} vatAmount={vatAmount} total={total} />
            </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
