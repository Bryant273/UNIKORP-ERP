
'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import { Trash2, PlusCircle, Palette, Eye, Pencil, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
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
  showTax: boolean;
  footerText: string;
};

const initialTemplates: InvoiceTemplate[] = [
  {
    id: 'tpl_classic',
    name: 'Classique',
    primaryColor: '#3b82f6', // blue-500
    companyName: 'Votre Société S.A.',
    companyAddress: '123 Rue de la Facture\n75001 Paris, France',
    companyLogoUrl: '',
    showTax: true,
    footerText: 'Merci de votre confiance.\nPaiement à 30 jours net.',
  },
  {
    id: 'tpl_modern',
    name: 'Moderne',
    primaryColor: '#10b981', // emerald-500
    companyName: 'Tech Innovante Inc.',
    companyAddress: '456 Avenue du Futur\n69002 Lyon, France',
    companyLogoUrl: '',
    showTax: false,
    footerText: 'Coordonnées bancaires : FR76 ...',
  },
    {
    id: 'tpl_minimal',
    name: 'Minimaliste',
    primaryColor: '#18181b', // neutral-900
    companyName: 'Studio Créatif',
    companyAddress: '789 Boulevard des Arts\n13001 Marseille, France',
    companyLogoUrl: '',
    showTax: true,
    footerText: 'Prestation réalisée par Studio Créatif.',
  },
];

const defaultTemplate: Omit<InvoiceTemplate, 'id'> = {
  name: 'Nouveau Modèle',
  primaryColor: '#673AB7',
  companyName: 'Votre Société S.A.',
  companyAddress: 'Votre Adresse\nVotre Ville, Code Postal',
  companyLogoUrl: '',
  showTax: true,
  footerText: 'Merci pour votre paiement.',
};


// --- INVOICE PREVIEW COMPONENT ---

const LiveInvoicePreview = ({ template }: { template: Omit<InvoiceTemplate, 'id'> }) => {
    const formatFr = (num: number) => num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

    const dummyData = {
        subTotal: 450,
        vatAmount: template.showTax ? 450 * 0.18 : 0,
        total: template.showTax ? 450 * 1.18 : 450
    };

    return (
        <div id="invoice-preview" className="bg-white rounded-lg shadow-md p-8 w-full mx-auto text-black font-sans text-sm border">
            <div className="flex justify-between items-start mb-8">
                <div>
                     {template.companyLogoUrl ? <img src={template.companyLogoUrl} alt="Logo" className="h-12" data-ai-hint="company logo" /> : <Logo className="h-12 w-12" style={{ color: template.primaryColor }} />}
                    <h1 className="font-bold text-lg mt-2">{template.companyName}</h1>
                    <p className="text-xs whitespace-pre-line">{template.companyAddress}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase" style={{ color: template.primaryColor }}>FACTURE</h2>
                    <p className="font-mono text-xs">FACT-XXXX-000</p>
                </div>
            </div>
            <div className="flex justify-between mb-8">
                <div className="text-xs">
                    <p className="font-bold text-gray-500 mb-1">FACTURÉ À</p>
                    <p className="font-bold">Nom du Client</p>
                    <p className="whitespace-pre-line">Adresse du client</p>
                </div>
                <div className="text-right text-xs">
                    <div className="flex items-center justify-end gap-4"><p className="font-bold text-gray-500">Date :</p><p>JJ/MM/AAAA</p></div>
                    <div className="flex items-center justify-end gap-4 mt-1"><p className="font-bold text-gray-500">Échéance :</p><p>JJ/MM/AAAA</p></div>
                </div>
            </div>
            <table className="w-full text-left mb-8 text-xs">
                <thead style={{ backgroundColor: template.primaryColor }} className="text-white">
                    <tr>
                        <th className="p-2 rounded-l-md font-semibold text-center">Description</th>
                        <th className="p-2 font-semibold text-center">Qté</th>
                        <th className="p-2 font-semibold text-center">Prix U. HT</th>
                        <th className="p-2 font-semibold text-center rounded-r-md">Total HT</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b odd:bg-muted/50"><td className="p-2 font-medium text-center">Service ou produit 1</td><td className="p-2 text-center">2</td><td className="p-2 text-center">{formatFr(150)} FCFA</td><td className="p-2 text-center">{formatFr(300)} FCFA</td></tr>
                    <tr className="border-b odd:bg-muted/50"><td className="p-2 font-medium text-center">Service ou produit 2</td><td className="p-2 text-center">1</td><td className="p-2 text-center">{formatFr(150)} FCFA</td><td className="p-2 text-center">{formatFr(150)} FCFA</td></tr>
                </tbody>
            </table>
            <div className="flex justify-end mb-8">
                <div className="w-1/2 max-w-xs text-xs space-y-2">
                    <div className="flex justify-between"><p className="text-gray-500">Sous-total HT :</p><p>{formatFr(dummyData.subTotal)} FCFA</p></div>
                    {template.showTax && (
                        <div className="flex justify-between"><p className="text-gray-500">TVA (18%) :</p><p>{formatFr(dummyData.vatAmount)} FCFA</p></div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-base" style={{ color: template.primaryColor }}><p>TOTAL TTC :</p><p>{formatFr(dummyData.total)} FCFA</p></div>
                </div>
            </div>
            <Separator />
            <div className="mt-4 text-xs text-gray-500 whitespace-pre-line">{template.footerText}</div>
        </div>
    );
};
LiveInvoicePreview.displayName = 'LiveInvoicePreview';

// --- MAIN PAGE COMPONENT ---
export default function ModeleFacturePage() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>(initialTemplates);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<InvoiceTemplate | null>(null);
  
  const [formData, setFormData] = useState<Omit<InvoiceTemplate, 'id'>>(defaultTemplate);
  const { toast } = useToast();

  const handleOpenCreateSheet = () => {
    setEditingTemplate(null);
    setFormData(defaultTemplate);
    setIsSheetOpen(true);
  };
  
  const handleOpenEditSheet = (template: InvoiceTemplate) => {
    setEditingTemplate(template);
    setFormData(JSON.parse(JSON.stringify(template)));
    setIsSheetOpen(true);
  };

  const handleFormChange = (field: keyof Omit<InvoiceTemplate, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (editingTemplate) {
      setTemplates(templates.map(tpl => tpl.id === editingTemplate.id ? { id: tpl.id, ...formData } : tpl));
      toast({ title: "Modèle mis à jour." });
    } else {
      const newTemplate = { id: `tpl_${Date.now()}`, ...formData };
      setTemplates(prev => [newTemplate, ...prev]);
      toast({ title: "Modèle créé avec succès." });
    }
    setIsSheetOpen(false);
  };

  const handleDelete = () => {
      if (templateToDelete) {
          setTemplates(templates.filter(tpl => tpl.id !== templateToDelete.id));
          setTemplateToDelete(null);
          toast({ title: "Modèle supprimé." });
      }
  };

  return (
    <>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Modèles de Facture</CardTitle>
                        <CardDescription>
                            Créez et gérez les différents designs pour vos factures.
                        </CardDescription>
                    </div>
                     <div className="flex gap-2">
                        <Button onClick={handleOpenCreateSheet}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Créer un modèle
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <Card key={template.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                   <div className="w-4 h-4 rounded-full" style={{backgroundColor: template.primaryColor}}/>
                                   {template.name}
                                </CardTitle>
                                <CardDescription>{template.companyName}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="border rounded-md p-4 bg-muted text-xs text-muted-foreground">
                                    <p className="font-semibold">Pied de page :</p>
                                    <p className="whitespace-pre-line">{template.footerText}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleOpenEditSheet(template)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => setTemplateToDelete(template)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent className="w-full sm:max-w-full md:w-[90vw] lg:w-[80vw] xl:w-[70vw] p-0 flex flex-col">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>{editingTemplate ? 'Modifier le modèle de facture' : 'Créer un nouveau modèle'}</SheetTitle>
                    <SheetDescription>
                        Personnalisez l'apparence et les informations par défaut de vos factures.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                    {/* Form Panel */}
                    <ScrollArea className="md:col-span-1 h-full">
                        <div className="p-6 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Informations sur le modèle</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="name">Nom du modèle</Label>
                                        <Input id="name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} placeholder="Ex: Facture Standard" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="primaryColor">Couleur principale (Hex)</Label>
                                        <Input id="primaryColor" value={formData.primaryColor} onChange={(e) => handleFormChange('primaryColor', e.target.value)} placeholder="#3b82f6" />
                                    </div>
                                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                                        <div className="flex-1 space-y-1">
                                            <Label htmlFor="showTax">Afficher la TVA</Label>
                                            <p className="text-xs text-muted-foreground">Calculer et afficher la TVA sur la facture.</p>
                                        </div>
                                        <Switch id="showTax" checked={formData.showTax} onCheckedChange={(checked) => handleFormChange('showTax', checked)} />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Informations sur votre société</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Nom de l'entreprise</Label>
                                        <Input id="companyName" value={formData.companyName} onChange={(e) => handleFormChange('companyName', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyAddress">Adresse de l'entreprise</Label>
                                        <Textarea id="companyAddress" value={formData.companyAddress} onChange={(e) => handleFormChange('companyAddress', e.target.value)} />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Pied de page</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="footerText">Texte du pied de page</Label>
                                        <Textarea id="footerText" value={formData.footerText} onChange={(e) => handleFormChange('footerText', e.target.value)} placeholder="Ex: Merci de votre confiance."/>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                    {/* Preview Panel */}
                    <ScrollArea className="md:col-span-1 h-full bg-muted">
                       <div className="p-8">
                            <LiveInvoicePreview template={formData} />
                       </div>
                    </ScrollArea>
                </div>
                <SheetFooter className="p-6 border-t">
                    <SheetClose asChild><Button variant="outline">Annuler</Button></SheetClose>
                    <Button onClick={handleSave}>Enregistrer</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
        
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
