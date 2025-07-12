
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Search, Library, Image as ImageIcon, Video, FileText, Download, Copy, Trash2, Eye, Loader2, FileUp, X, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';


// --- TYPES & MOCK DATA ---
type AssetType = 'Image' | 'Video' | 'Document';
type Asset = {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  size: string;
  uploadedAt: string;
};

const MOCK_ASSETS: Asset[] = [
  { id: 'asset-1', name: 'hero-banner-q3.jpg', type: 'Image', url: 'https://placehold.co/600x400.png', size: '1.2 MB', uploadedAt: '2024-07-25' },
  { id: 'asset-2', name: 'product-demo.mp4', type: 'Video', url: 'https://placehold.co/600x400.png', size: '15.8 MB', uploadedAt: '2024-07-24' },
  { id: 'asset-3', name: 'whitepaper-seo.pdf', type: 'Document', url: 'https://placehold.co/600x400.png', size: '2.5 MB', uploadedAt: '2024-07-22' },
  { id: 'asset-4', name: 'social-post-image.png', type: 'Image', url: 'https://placehold.co/600x400.png', size: '450 KB', uploadedAt: '2024-07-25' },
  { id: 'asset-5', name: 'logo-vector.svg', type: 'Image', url: 'https://placehold.co/600x400.png', size: '15 KB', uploadedAt: '2024-07-22' },
  { id: 'asset-6', name: 'customer-testimonial.mov', type: 'Video', url: 'https://placehold.co/600x400.png', size: '22.1 MB', uploadedAt: '2024-07-24' },
  { id: 'asset-7', name: 'brochure-produit.pdf', type: 'Document', url: 'https://placehold.co/600x400.png', size: '5.1 MB', uploadedAt: '2024-07-25' },
  { id: 'asset-8', name: 'email-header.gif', type: 'Image', url: 'https://placehold.co/600x400.png', size: '890 KB', uploadedAt: '2024-07-22' },
];

const getAssetIcon = (type: AssetType) => {
    switch (type) {
        case 'Image': return <ImageIcon className="h-5 w-5" />;
        case 'Video': return <Video className="h-5 w-5" />;
        case 'Document': return <FileText className="h-5 w-5" />;
    }
};

export default function MediathequePage() {
    const { toast } = useToast();
    const [assets, setAssets] = useState(MOCK_ASSETS);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: 'URL copiée dans le presse-papiers.' });
    };

    const handleSaveAsset = (newAssetData: Omit<Asset, 'id' | 'uploadedAt'>) => {
        const newAsset: Asset = {
            id: `asset-${Date.now()}`,
            uploadedAt: new Date().toISOString().split('T')[0],
            ...newAssetData,
        };
        setAssets(prev => [newAsset, ...prev]);
        toast({ title: 'Fichier ajouté', description: `Le fichier "${newAsset.name}" a été ajouté à la médiathèque.`});
    };
    
    const handleUpdateAsset = (updatedAsset: Asset) => {
        setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
        setEditingAsset(null);
        toast({ title: 'Fichier mis à jour', description: 'Le nom du fichier a été modifié.' });
    };

    const handleDelete = () => {
        if (assetToDelete) {
            setAssets(prev => prev.filter(a => a.id !== assetToDelete.id));
            toast({ title: 'Fichier supprimé', description: `Le fichier "${assetToDelete.name}" a été supprimé.` });
            setAssetToDelete(null);
        }
    };

    const groupedAssets = useMemo(() => {
        return assets.reduce((acc, asset) => {
            const date = asset.uploadedAt;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(asset);
            return acc;
        }, {} as Record<string, Asset[]>);
    }, [assets]);
    
    const sortedDates = useMemo(() => Object.keys(groupedAssets).sort((a,b) => new Date(b).getTime() - new Date(a).getTime()), [groupedAssets]);

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Library /> Médiathèque</CardTitle>
                            <CardDescription>Gérez toutes vos ressources multimédia pour vos campagnes.</CardDescription>
                        </div>
                        <Button onClick={() => setIsUploadModalOpen(true)}><Upload className="mr-2 h-4 w-4" /> Uploader des fichiers</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher par nom de fichier..." className="pl-9" />
                        </div>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20"></TableHead>
                                    <TableHead>Nom du Fichier</TableHead>
                                    <TableHead className="w-28 text-center">Type</TableHead>
                                    <TableHead className="w-24 text-center">Taille</TableHead>
                                    <TableHead className="w-40 text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedDates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucun fichier dans la médiathèque.</TableCell>
                                    </TableRow>
                                ) : (
                                    sortedDates.map(date => (
                                        <React.Fragment key={date}>
                                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                <TableCell colSpan={5} className="py-2 px-4 font-semibold text-muted-foreground">
                                                    {format(parseISO(date), "EEEE dd MMMM yyyy", { locale: fr })}
                                                </TableCell>
                                            </TableRow>
                                            {groupedAssets[date].map(asset => (
                                                <TableRow key={asset.id}>
                                                    <TableCell>
                                                        <Image src={asset.url} alt={asset.name} width={48} height={48} className="rounded-md aspect-square object-cover border" data-ai-hint="media asset"/>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium">{asset.name}</p>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="flex items-center justify-center gap-2 w-24">
                                                            {getAssetIcon(asset.type)}
                                                            {asset.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground text-xs">{asset.size}</TableCell>
                                                    <TableCell>
                                                         <div className="flex justify-center gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(asset.url)}><Copy className="h-4 w-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => setPreviewAsset(asset)}><Eye className="h-4 w-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => setEditingAsset(asset)}><Pencil className="h-4 w-4" /></Button>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setAssetToDelete(asset)}><Trash2 className="h-4 w-4" /></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <UploadModal 
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSave={handleSaveAsset}
            />
            
             <EditModal
                isOpen={!!editingAsset}
                onClose={() => setEditingAsset(null)}
                asset={editingAsset}
                onSave={handleUpdateAsset}
            />

            <AlertDialog open={!!assetToDelete} onOpenChange={() => setAssetToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer "{assetToDelete?.name}" ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. Le fichier sera définitivement supprimé.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
             <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Aperçu : {previewAsset?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 flex justify-center bg-muted rounded-md">
                        <Image src={previewAsset?.url || 'https://placehold.co/1200x800.png'} alt={previewAsset?.name || ''} width={800} height={600} className="w-auto h-auto max-w-full max-h-[70vh] rounded-md border" data-ai-hint="media asset"/>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}


function UploadModal({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (data: Omit<Asset, 'id' | 'uploadedAt'>) => void }) {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const reset = () => {
        setFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        setIsDragging(false);
        onClose();
    }
    
    const handleClose = () => {
        if(isUploading) return;
        reset();
    }

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            setFile(selectedFile);
        }
    };
    
    const handleUpload = () => {
        if (!file) {
            toast({ title: "Aucun fichier sélectionné", variant: "destructive" });
            return;
        }
        setIsUploading(true);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);

        setTimeout(() => {
            clearInterval(interval);
            setUploadProgress(100);
            const sizeInMB = file.size / (1024*1024);

            const newAssetData: Omit<Asset, 'id' | 'uploadedAt'> = {
                name: file.name,
                type: file.type.startsWith('image') ? 'Image' : file.type.startsWith('video') ? 'Video' : 'Document',
                url: 'https://placehold.co/600x400.png', // Placeholder URL
                size: `${sizeInMB.toFixed(2)} MB`
            };
            onSave(newAssetData);
            setTimeout(() => {
                reset();
            }, 500);
        }, 3500);
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        if (!isUploading) setIsDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setIsDragging(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e);
        setIsDragging(false);
        if (isUploading) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Uploader de nouveaux fichiers</DialogTitle>
                    <DialogDescription>Glissez-déposez vos fichiers ou cliquez pour les sélectionner.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     <div 
                        className={cn(
                            "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 hover:bg-muted/50",
                            isDragging && "border-primary bg-primary/10",
                            (isUploading || file) && "cursor-default opacity-70"
                        )}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragEvents}
                        onDrop={handleDrop}
                      >
                          <Label htmlFor="file-upload" className={cn("flex flex-col items-center justify-center w-full h-full text-center", (isUploading || file) ? "cursor-not-allowed" : "cursor-pointer")}>
                            <FileUp className="w-10 h-10 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              <span className="font-semibold text-primary">Glissez-déposez un fichier</span>
                            </p>
                            <p className="text-xs text-muted-foreground">ou cliquez pour sélectionner</p>
                          </Label>
                          <Input 
                              id="file-upload" 
                              type="file" 
                              className="sr-only" 
                              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} 
                              disabled={isUploading || !!file}
                          />
                    </div>
                    {file && (
                        <div className="mt-4 space-y-2">
                             <p className="font-semibold text-sm">Fichier à uploader :</p>
                             <div className="flex items-center justify-between p-2 border rounded-md">
                                 <p className="text-sm truncate">{file.name}</p>
                                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}><X className="h-4 w-4"/></Button>
                             </div>
                              {isUploading && (
                                <div className="space-y-2 pt-2">
                                    <Progress value={uploadProgress} />
                                    <p className="text-sm text-center text-muted-foreground">Upload en cours... {Math.round(uploadProgress)}%</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>Annuler</Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}
                        <span className="ml-2">{isUploading ? 'Envoi...' : 'Uploader'}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditModal({ isOpen, onClose, asset, onSave }: { isOpen: boolean, onClose: () => void, asset: Asset | null, onSave: (asset: Asset) => void }) {
    const [name, setName] = useState('');
    
    React.useEffect(() => {
        if (asset) {
            setName(asset.name);
        }
    }, [asset]);

    if (!asset) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...asset, name });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Modifier le fichier</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="fileName">Nom du fichier</Label>
                        <Input id="fileName" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
