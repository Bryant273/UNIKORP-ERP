
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Eye, Pencil, Copy, Trash2, Mail, LayoutTemplate, Newspaper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// --- TYPES & MOCK DATA ---
type TemplateType = 'Email' | 'Page';
type Template = {
  id: string;
  name: string;
  type: TemplateType;
  lastModified: string;
  thumbnailUrl: string;
};

const MOCK_TEMPLATES: Template[] = [
  { id: 'tpl-1', name: 'Newsletter Mensuelle', type: 'Email', lastModified: '2024-07-20', thumbnailUrl: 'https://placehold.co/600x400.png' },
  { id: 'tpl-2', name: 'Lancement Produit Alpha', type: 'Page', lastModified: '2024-07-15', thumbnailUrl: 'https://placehold.co/600x400.png' },
  { id: 'tpl-3', name: 'Email de Bienvenue', type: 'Email', lastModified: '2024-07-18', thumbnailUrl: 'https://placehold.co/600x400.png' },
  { id: 'tpl-4', name: 'Promotion Spéciale', type: 'Email', lastModified: '2024-07-22', thumbnailUrl: 'https://placehold.co/600x400.png' },
  { id: 'tpl-5', name: 'Page de Confirmation', type: 'Page', lastModified: '2024-06-30', thumbnailUrl: 'https://placehold.co/600x400.png' },
  { id: 'tpl-6', name: 'Webinaire Tech', type: 'Page', lastModified: '2024-07-25', thumbnailUrl: 'https://placehold.co/600x400.png' },
];

export default function TemplatesPage() {
    const { toast } = useToast();
    const [templates, setTemplates] = useState(MOCK_TEMPLATES);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const handleDelete = (id: string) => {
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast({ title: 'Modèle supprimé', description: 'Le modèle a bien été supprimé.' });
    };

    const handleDuplicate = (id: string) => {
        const original = templates.find(t => t.id === id);
        if (original) {
            const newTemplate = { ...original, id: `tpl-${Date.now()}`, name: `${original.name} (Copie)` };
            setTemplates(prev => [newTemplate, ...prev]);
            toast({ title: 'Modèle dupliqué', description: `Une copie de "${original.name}" a été créée.` });
        }
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
                        <Button onClick={() => toast({ title: 'Fonctionnalité à venir'})}><PlusCircle className="mr-2 h-4 w-4" /> Nouveau Modèle</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all">
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">Tous</TabsTrigger>
                            <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4"/>Emails</TabsTrigger>
                            <TabsTrigger value="page"><LayoutTemplate className="mr-2 h-4 w-4"/>Pages</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all">
                           <TemplateGrid templates={templates} setPreviewTemplate={setPreviewTemplate} handleDuplicate={handleDuplicate} handleDelete={handleDelete} />
                        </TabsContent>
                        <TabsContent value="email">
                            <TemplateGrid templates={templates.filter(t => t.type === 'Email')} setPreviewTemplate={setPreviewTemplate} handleDuplicate={handleDuplicate} handleDelete={handleDelete} />
                        </TabsContent>
                        <TabsContent value="page">
                            <TemplateGrid templates={templates.filter(t => t.type === 'Page')} setPreviewTemplate={setPreviewTemplate} handleDuplicate={handleDuplicate} handleDelete={handleDelete} />
                        </TabsContent>
                    </Tabs>
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
        </>
    );
}


function TemplateGrid({ templates, setPreviewTemplate, handleDuplicate, handleDelete }: { templates: Template[], setPreviewTemplate: (template: Template) => void, handleDuplicate: (id: string) => void, handleDelete: (id: string) => void}) {
     if (templates.length === 0) {
        return <div className="text-center py-16 border-2 border-dashed rounded-lg"><p className="text-muted-foreground">Aucun modèle dans cette catégorie.</p></div>;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map(template => (
                <Card key={template.id} className="group">
                    <CardHeader className="p-0">
                        <Image src={template.thumbnailUrl} alt={template.name} width={600} height={400} className="rounded-t-lg aspect-video object-cover" data-ai-hint="website template" />
                    </CardHeader>
                    <CardContent className="p-4">
                        <Badge variant={template.type === 'Email' ? 'default' : 'secondary'}>{template.type}</Badge>
                        <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                        <CardDescription className="text-xs">Modifié le {template.lastModified}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-2 pt-0">
                         <div className="w-full flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setPreviewTemplate(template)}><Eye className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDuplicate(template.id)}><Copy className="h-4 w-4"/></Button>
                            <Button variant="ghost" size="icon"><Pencil className="h-4 w-4"/></Button>
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
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
