
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

    const handleDelete = (id: string) => {
        if (!templateToDelete) return;
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast({ title: 'Modèle supprimé', description: `Le modèle "${templateToDelete.name}" a bien été supprimé.` });
        setTemplateToDelete(null);
    };

    const handleDuplicate = (id: string) => {
        const original = templates.find(t => t.id === id);
        if (original) {
            const newTemplate = { 
                ...original, 
                id: `tpl-${Date.now()}`, 
                name: `${original.name} (Copie)`,
                lastModified: new Date().toISOString().split('T')[0]
            };
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
                                            <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Fonctionnalité à venir'})}><Pencil className="h-4 w-4"/></Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setTemplateToDelete(template)}><Trash2 className="h-4 w-4"/></Button>
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
        </>
    );
}

