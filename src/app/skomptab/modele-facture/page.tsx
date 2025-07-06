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
  Dialog,
  DialogContent,
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Eye, Pencil, Palette, Building, Milestone, Trash2 } from 'lucide-react';
import { Logo } from '@/components/logo';

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

const dummyInvoiceData = {
  invoiceNumber: 'FACT-2024-00123',
  issueDate: '15/07/2024',
  dueDate: '14/08/2024',
  client: {
    name: 'Client Fidèle SARL',
    address: '10 Rue du Commerce, 33000 Bordeaux',
  },
  items: [
    { description: 'Développement de site web', quantity: 1, unitPrice: 2500000, tax: 20, total: 3000000 },
    { description: 'Hébergement annuel', quantity: 1, unitPrice: 300000, tax: 20, total: 360000 },
    { description: 'Conception de logo', quantity: 1, unitPrice: 800000, tax: 20, total: 960000 },
  ],
  subtotal: 3600000,
  taxAmount: 720000,
  total: 4320000,
};

// Component for the invoice preview
const InvoicePreview = React.forwardRef<HTMLDivElement, { template: InvoiceTemplate }>(({ template }, ref) => {
    const { primaryColor, companyName, companyAddress, companyLogoUrl, showQuantity, showUnitPrice, showTax, footerText } = template;
    const { invoiceNumber, issueDate, dueDate, client, items, subtotal, taxAmount, total } = dummyInvoiceData;
    const formatFr = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

    return (
        <div ref={ref} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl mx-auto text-black font-sans text-sm">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    {companyLogoUrl ? <img src={companyLogoUrl} alt="Logo" className="h-12" data-ai-hint="company logo" /> : <Logo className="h-12 w-12" style={{ color: primaryColor }} />}
                    <h1 className="font-bold text-lg mt-2">{companyName}</h1>
                    <p className="text-xs whitespace-pre-line">{companyAddress}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase" style={{ color: primaryColor }}>FACTURE</h2>
                    <p className="font-mono text-xs">{invoiceNumber}</p>
                </div>
            </div>

            {/* Bill to & Dates */}
            <div className="flex justify-between mb-8">
                <div className="text-xs">
                    <p className="font-bold text-gray-500 mb-1">FACTURÉ À</p>
                    <p className="font-bold">{client.name}</p>
                    <p>{client.address}</p>
                </div>
                <div className="text-right text-xs">
                    <div className="flex items-center justify-end gap-4">
                        <p className="font-bold text-gray-500">Date d'émission :</p>
                        <p>{issueDate}</p>
                    </div>
                     <div className="flex items-center justify-end gap-4 mt-1">
                        <p className="font-bold text-gray-500">Date d'échéance :</p>
                        <p>{dueDate}</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left mb-8 text-xs">
                <thead style={{ backgroundColor: primaryColor }} className="text-white">
                    <tr>
                        <th className="p-2 text-center rounded-l-md font-semibold">Description</th>
                        {showQuantity && <th className="p-2 text-center font-semibold">Quantité</th>}
                        {showUnitPrice && <th className="p-2 text-center font-semibold">Prix Unitaire</th>}
                        {showTax && <th className="p-2 text-center font-semibold">TVA (%)</th>}
                        <th className="p-2 text-center rounded-r-md font-semibold">Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                         <tr key={i} className="border-b odd:bg-muted/50">
                            <td className="p-2 font-medium">{item.description}</td>
                             {showQuantity && <td className="p-2 text-center">{item.quantity}</td>}
                             {showUnitPrice && <td className="p-2 text-right">{formatFr(item.unitPrice)} FCFA</td>}
                             {showTax && <td className="p-2 text-right">{item.tax} %</td>}
                            <td className="p-2 text-right">{formatFr(item.unitPrice * item.quantity)} FCFA</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-1/2 max-w-xs text-xs space-y-2">
                    <div className="flex justify-between">
                        <p className="text-gray-500">Sous-total :</p>
                        <p>{formatFr(subtotal)} FCFA</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-500">TVA (20%) :</p>
                        <p>{formatFr(taxAmount)} FCFA</p>
                    </div>
                     <Separator />
                    <div className="flex justify-between font-bold text-base" style={{ color: primaryColor }}>
                        <p>TOTAL TTC :</p>
                        <p>{formatFr(total)} FCFA</p>
                    </div>
                </div>
            </div>
            
            {/* Footer */}
            <Separator />
            <div className="mt-4 text-center text-xs text-gray-500 whitespace-pre-line">
                {footerText}
            </div>
        </div>
    );
});
InvoicePreview.displayName = 'InvoicePreview';


export default function ModeleFacturePage() {
    const [templates, setTemplates] = useState<InvoiceTemplate[]>(initialTemplates);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
    const [formData, setFormData] = useState<InvoiceTemplate | null>(null);
    const [viewingTemplate, setViewingTemplate] = useState<InvoiceTemplate | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<InvoiceTemplate | null>(null);

    const handleOpenSheet = (template: InvoiceTemplate | null) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({ ...template });
        } else {
            const newId = `tpl_custom_${Date.now()}`;
            const newTemplate = {
                id: newId,
                name: 'Nouveau Modèle',
                primaryColor: '#8b5cf6', // violet-500
                companyName: 'Ma Super Entreprise',
                companyAddress: 'Votre adresse ici',
                companyLogoUrl: '',
                showQuantity: true,
                showUnitPrice: true,
                showTax: true,
                footerText: 'Merci pour votre achat.',
            };
            setEditingTemplate(newTemplate);
            setFormData(newTemplate);
        }
        setIsSheetOpen(true);
    };

    const handleFormChange = (field: keyof InvoiceTemplate, value: any) => {
        if (formData) {
            setFormData(prev => prev ? { ...prev, [field]: value } : null);
        }
    };
    
    const handleSave = () => {
        if(formData) {
            const index = templates.findIndex(t => t.id === formData.id);
            if (index !== -1) {
                setTemplates(prev => {
                    const newTemplates = [...prev];
                    newTemplates[index] = formData;
                    return newTemplates;
                });
            } else {
                setTemplates(prev => [...prev, formData]);
            }
        }
        setIsSheetOpen(false);
        setEditingTemplate(null);
        setFormData(null);
    }

    const handleDelete = () => {
        if (templateToDelete) {
            setTemplates(templates.filter(t => t.id !== templateToDelete.id));
            setTemplateToDelete(null);
        }
    };
    
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Modèles de Facture</CardTitle>
              <CardDescription>Créez et personnalisez des modèles pour vos factures.</CardDescription>
            </div>
            <Button onClick={() => handleOpenSheet(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau modèle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-center">Nom du modèle</TableHead>
                <TableHead className="font-semibold text-center">Couleur principale</TableHead>
                <TableHead className="w-[150px] font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(template => (
                <TableRow key={template.id} className="odd:bg-muted/50">
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: template.primaryColor }} />
                        <span>{template.primaryColor}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewingTemplate(template)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Aperçu</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenSheet(template)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setTemplateToDelete(template)} className="text-destructive hover:text-destructive">
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
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-full md:w-[90vw] lg:w-[80vw] xl:w-[70vw] p-0 flex flex-col">
              <SheetHeader className="p-6 border-b">
                  <SheetTitle>{editingTemplate?.id.startsWith('tpl_custom') ? 'Nouveau Modèle de Facture' : 'Modifier le Modèle de Facture'}</SheetTitle>
                  <SheetDescription>Personnalisez les éléments et le style de votre facture. Les modifications sont visibles en direct.</SheetDescription>
              </SheetHeader>
              {formData && (
                <div className="flex-1 grid grid-cols-12 overflow-hidden">
                    {/* Controls Panel */}
                    <div className="col-span-4 lg:col-span-3 border-r overflow-y-auto p-6 space-y-6">
                       <div className="space-y-2">
                           <Label htmlFor="name">Nom du modèle</Label>
                           <Input id="name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} />
                       </div>
                       <Separator />
                       <div className="space-y-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2"><Building className="h-4 w-4"/>Votre entreprise</h3>
                            <div className="space-y-2">
                               <Label htmlFor="companyName">Nom de l'entreprise</Label>
                               <Input id="companyName" value={formData.companyName} onChange={(e) => handleFormChange('companyName', e.target.value)} />
                           </div>
                           <div className="space-y-2">
                               <Label htmlFor="companyAddress">Adresse</Label>
                               <Textarea id="companyAddress" value={formData.companyAddress} onChange={(e) => handleFormChange('companyAddress', e.target.value)} rows={3}/>
                           </div>
                           <div className="space-y-2">
                               <Label htmlFor="companyLogoUrl">URL du Logo (optionnel)</Label>
                               <Input id="companyLogoUrl" placeholder="https://..." value={formData.companyLogoUrl} onChange={(e) => handleFormChange('companyLogoUrl', e.target.value)} />
                           </div>
                       </div>
                       <Separator />
                       <div className="space-y-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2"><Palette className="h-4 w-4"/>Apparence</h3>
                             <div className="space-y-2">
                               <Label htmlFor="primaryColor">Couleur principale</Label>
                               <div className="relative">
                                    <Input id="primaryColor" value={formData.primaryColor} onChange={(e) => handleFormChange('primaryColor', e.target.value)} className="pr-10"/>
                                    <Input type="color" value={formData.primaryColor} onChange={(e) => handleFormChange('primaryColor', e.target.value)} className="absolute right-1 top-1 h-8 w-8 p-1 bg-transparent border-none cursor-pointer"/>
                               </div>
                           </div>
                       </div>
                       <Separator />
                        <div className="space-y-4">
                           <h3 className="font-semibold text-sm flex items-center gap-2"><Milestone className="h-4 w-4"/>Colonnes</h3>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="showQuantity">Afficher "Quantité"</Label>
                                <Switch id="showQuantity" checked={formData.showQuantity} onCheckedChange={(checked) => handleFormChange('showQuantity', checked)} />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="showUnitPrice">Afficher "Prix Unitaire"</Label>
                                <Switch id="showUnitPrice" checked={formData.showUnitPrice} onCheckedChange={(checked) => handleFormChange('showUnitPrice', checked)} />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="showTax">Afficher "TVA"</Label>
                                <Switch id="showTax" checked={formData.showTax} onCheckedChange={(checked) => handleFormChange('showTax', checked)} />
                            </div>
                        </div>
                         <Separator />
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm">Pied de page</h3>
                           <Textarea value={formData.footerText} onChange={(e) => handleFormChange('footerText', e.target.value)} rows={4} placeholder="Ex: Coordonnées bancaires, mentions légales..."/>
                       </div>
                    </div>
                    {/* Live Preview */}
                    <div className="col-span-8 lg:col-span-9 bg-muted overflow-y-auto p-8">
                       <InvoicePreview template={formData} />
                    </div>
                </div>
              )}
              <SheetFooter className="p-6 border-t">
                  <SheetClose asChild>
                      <Button variant="outline">Annuler</Button>
                  </SheetClose>
                  <Button onClick={handleSave}>Enregistrer le modèle</Button>
              </SheetFooter>
          </SheetContent>
      </Sheet>

      <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none">
          {viewingTemplate && <div className="bg-muted p-8"><InvoicePreview template={viewingTemplate} /></div>}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le modèle de facture sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
