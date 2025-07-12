
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Eye, Pencil, Copy, Trash2, Mail, LayoutTemplate, Newspaper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- TYPES & MOCK DATA ---
type TemplateType = 'Email' | 'Page';
type Template = {
  id: string;
  name: string;
  type: TemplateType;
  lastModified: string;
  thumbnailUrl: string;
  // New fields for editor
  primaryColor: string;
  companyName: string;
  footerText: string;
  headerImageUrl?: string;
};

const initialTemplates: Template[] = [
  { id: 'tpl-1', name: 'Newsletter Mensuelle', type: 'Email', lastModified: '2024-07-20', thumbnailUrl: 'https://placehold.co/600x400.png', primaryColor: '#3b82f6', companyName: 'UNIKORP', footerText: 'Merci de votre confiance.', headerImageUrl: 'https://placehold.co/600x150.png' },
  { id: 'tpl-2', name: 'Lancement Produit Alpha', type: 'Page', lastModified: '2024-07-15', thumbnailUrl: 'https://placehold.co/600x400.png', primaryColor: '#10b981', companyName: 'UNIKORP', footerText: '© 2024 UNIKORP. Tous droits réservés.', headerImageUrl: 'https://placehold.co/600x150.png' },
  { id: 'tpl-3', name: 'Email de Bienvenue', type: 'Email', lastModified: '2024-07-18', thumbnailUrl: 'https://placehold.co/600x400.png', primaryColor: '#673AB7', companyName: 'UNIKORP', footerText: 'Bienvenue chez nous !' },
];

const defaultTemplateData: Omit<Template, 'id' | 'lastModified' | 'thumbnailUrl'> = {
    name: 'Nouveau Modèle',
    type: 'Email',
    primaryColor: '#3b82f6',
    companyName: 'Votre Société S.A.',
    footerText: 'Merci de votre confiance.',
    headerImageUrl: 'https://placehold.co/600x150.png',
};

export default function TemplatesPage() {
    const { toast } = useToast();
    const [templates, setTemplates] = useState(initialTemplates);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleDelete = (id: string) => {
        const templateToDelete = templates.find(t => t.id === id);
        if (!templateToDelete) return;

        setTemplates(prev => prev.filter(t => t.id !== id));
        toast({ title: 'Modèle supprimé', description: `Le modèle "${templateToDelete.name}" a bien été supprimé.` });
    };

    const handleDuplicate = (id: string) => {
        const original = templates.find(t => t.id === id);
        if (original) {
            const newTemplate: Template = { 
                ...original, 
                id: `tpl-${Date.now()}`, 
                name: `${original.name} (Copie)`,
                lastModified: new Date().toISOString().split('T')[0]
            };
            setTemplates(prev => [newTemplate, ...prev]);
            toast({ title: 'Modèle dupliqué', description: `Une copie de "${original.name}" a été créée.` });
        }
    };

    const handleOpenCreateSheet = () => {
        setEditingTemplate(null);
        setIsSheetOpen(true);
    };

    const handleOpenEditSheet = (template: Template) => {
        setEditingTemplate(template);
        setIsSheetOpen(true);
    };

    const handleSave = (data: Omit<Template, 'id' | 'lastModified' | 'thumbnailUrl'>) => {
        if (editingTemplate) {
            setTemplates(templates.map(t => 
                t.id === editingTemplate.id ? { ...t, ...data, lastModified: new Date().toISOString().split('T')[0] } : t
            ));
            toast({ title: "Modèle mis à jour" });
        } else {
            const newTemplate: Template = {
                id: `tpl-${Date.now()}`,
                lastModified: new Date().toISOString().split('T')[0],
                thumbnailUrl: 'https://placehold.co/600x400.png',
                ...data,
            };
            setTemplates(prev => [newTemplate, ...prev]);
            toast({ title: "Modèle créé" });
        }
        setIsSheetOpen(false);
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Newspaper /> Gestion des Modèles</CardTitle>
                            <CardDescription>Créez, modifiez et organisez vos modèles d'emails et de landing pages.</CardDescription>
                        </div>
                        <Button onClick={handleOpenCreateSheet}><PlusCircle className="mr-2 h-4 w-4" /> Nouveau Modèle</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom du Modèle</TableHead>
                                <TableHead className="w-[120px]">Type</TableHead>
                                <TableHead className="w-[180px]">Dernière modification</TableHead>
                                <TableHead className="text-center w-[200px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {templates.map(template => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">{template.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={template.type === 'Email' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                                            {template.type === 'Email' ? <Mail className="h-3 w-3"/> : <LayoutTemplate className="h-3 w-3"/>}
                                            {template.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(template.lastModified).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setPreviewTemplate(template)}><Eye className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDuplicate(template.id)}><Copy className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditSheet(template)}><Pencil className="h-4 w-4"/></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Supprimer "{template.name}" ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(template.id)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Aperçu : {previewTemplate?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Image src={previewTemplate?.thumbnailUrl || 'https://placehold.co/1200x800.png'} alt={previewTemplate?.name || ''} width={1200} height={800} className="w-full rounded-md border" data-ai-hint="website template"/>
                    </div>
                </DialogContent>
            </Dialog>

            <TemplateEditorSheet 
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onSave={handleSave}
                templateToEdit={editingTemplate}
            />
        </>
    );
}

// --- Live Preview Component ---
const LiveTemplatePreview = ({ template }: { template: Omit<Template, 'id' | 'lastModified' | 'thumbnailUrl'> }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-8 w-full mx-auto text-black font-sans text-sm border">
            <header className="flex justify-between items-start mb-8">
                <div>
                     <Logo className="h-12 w-12" style={{ color: template.primaryColor }} />
                    <h1 className="font-bold text-lg mt-2">{template.companyName}</h1>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase" style={{ color: template.primaryColor }}>{template.type === 'Email' ? 'Email' : 'Page'}</h2>
                </div>
            </header>
            <main className="min-h-64 border-y py-8">
                 {template.headerImageUrl && (
                    <div className="mb-6">
                        <Image src={template.headerImageUrl} alt="Contenu" width={600} height={400} className="w-full h-auto object-cover rounded-md" data-ai-hint="email content"/>
                    </div>
                )}
                <h3 className="text-xl font-bold mb-4">Titre de l'Exemple</h3>
                <p>Ceci est un paragraphe d'exemple pour montrer le contenu du modèle. Vous pouvez personnaliser ce texte et bien plus encore dans l'éditeur.</p>
            </main>
            <footer className="mt-4 text-xs text-gray-500 whitespace-pre-line text-center">
                {template.footerText}
            </footer>
        </div>
    );
};
LiveTemplatePreview.displayName = 'LiveTemplatePreview';

// --- Editor Sheet Component ---
function TemplateEditorSheet({ isOpen, onClose, onSave, templateToEdit }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, templateToEdit: Template | null }) {
    const [formData, setFormData] = useState<Omit<Template, 'id' | 'lastModified' | 'thumbnailUrl'>>(defaultTemplateData);
    
    useEffect(() => {
        if (templateToEdit) {
            setFormData(templateToEdit);
        } else {
            setFormData(defaultTemplateData);
        }
    }, [templateToEdit, isOpen]);

    const handleChange = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
         <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-full md:w-[90vw] lg:w-[80vw] xl:w-[70vw] p-0 flex flex-col">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>{templateToEdit ? 'Modifier le modèle' : 'Créer un nouveau modèle'}</SheetTitle>
                    <SheetDescription>Personnalisez les informations de base de votre modèle. L'aperçu se met à jour en temps réel.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                    <ScrollArea className="md:col-span-1 h-full">
                        <div className="p-6 space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Informations Générales</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nom du modèle</Label>
                                        <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type de modèle</Label>
                                        <Select value={formData.type} onValueChange={(v: TemplateType) => handleChange('type', v)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent><SelectItem value="Email">Email</SelectItem><SelectItem value="Page">Page</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>Personnalisation</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="headerImageUrl">URL de l'image de contenu</Label>
                                        <Input id="headerImageUrl" value={formData.headerImageUrl || ''} onChange={(e) => handleChange('headerImageUrl', e.target.value)} placeholder="https://..."/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="primaryColor">Couleur principale (Hex)</Label>
                                        <Input id="primaryColor" value={formData.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Nom de votre société</Label>
                                        <Input id="companyName" value={formData.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="footerText">Texte du pied de page</Label>
                                        <Textarea id="footerText" value={formData.footerText} onChange={(e) => handleChange('footerText', e.target.value)} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                    <ScrollArea className="md:col-span-1 h-full bg-muted">
                       <div className="p-8"><LiveTemplatePreview template={formData} /></div>
                    </ScrollArea>
                </div>
                <SheetFooter className="p-6 border-t">
                    <SheetClose asChild><Button variant="outline">Annuler</Button></SheetClose>
                    <Button onClick={handleSave}>Enregistrer</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
