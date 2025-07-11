
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Library, Image as ImageIcon, Video, FileText, Download, Copy, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

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
  { id: 'asset-4', name: 'social-post-image.png', type: 'Image', url: 'https://placehold.co/600x400.png', size: '450 KB', uploadedAt: '2024-07-21' },
  { id: 'asset-5', name: 'logo-vector.svg', type: 'Image', url: 'https://placehold.co/600x400.png', size: '15 KB', uploadedAt: '2024-07-20' },
  { id: 'asset-6', name: 'customer-testimonial.mov', type: 'Video', url: 'https://placehold.co/600x400.png', size: '22.1 MB', uploadedAt: '2024-07-19' },
  { id: 'asset-7', name: 'brochure-produit.pdf', type: 'Document', url: 'https://placehold.co/600x400.png', size: '5.1 MB', uploadedAt: '2024-07-18' },
  { id: 'asset-8', name: 'email-header.gif', type: 'Image', url: 'https://placehold.co/600x400.png', size: '890 KB', uploadedAt: '2024-07-17' },
];

const getAssetIcon = (type: AssetType) => {
    switch (type) {
        case 'Image': return <ImageIcon className="h-4 w-4" />;
        case 'Video': return <Video className="h-4 w-4" />;
        case 'Document': return <FileText className="h-4 w-4" />;
    }
};

export default function MediathequePage() {
    const { toast } = useToast();
    const [assets, setAssets] = useState(MOCK_ASSETS);
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: 'URL copiée dans le presse-papiers.' });
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Library /> Médiathèque</CardTitle>
                            <CardDescription>Gérez toutes vos ressources multimédia pour vos campagnes.</CardDescription>
                        </div>
                        <Button onClick={() => toast({ title: 'Fonctionnalité à venir'})}><Upload className="mr-2 h-4 w-4" /> Uploader des fichiers</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher par nom de fichier..." className="pl-9" />
                        </div>
                    </div>
                    <Tabs defaultValue="all">
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">Tous</TabsTrigger>
                            <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4"/>Images</TabsTrigger>
                            <TabsTrigger value="video"><Video className="mr-2 h-4 w-4"/>Vidéos</TabsTrigger>
                            <TabsTrigger value="document"><FileText className="mr-2 h-4 w-4"/>Documents</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all"><AssetGrid assets={assets} setPreviewAsset={setPreviewAsset} handleCopyUrl={handleCopyUrl} /></TabsContent>
                        <TabsContent value="image"><AssetGrid assets={assets.filter(a => a.type === 'Image')} setPreviewAsset={setPreviewAsset} handleCopyUrl={handleCopyUrl} /></TabsContent>
                        <TabsContent value="video"><AssetGrid assets={assets.filter(a => a.type === 'Video')} setPreviewAsset={setPreviewAsset} handleCopyUrl={handleCopyUrl} /></TabsContent>
                        <TabsContent value="document"><AssetGrid assets={assets.filter(a => a.type === 'Document')} setPreviewAsset={setPreviewAsset} handleCopyUrl={handleCopyUrl} /></TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

             <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Aperçu : {previewAsset?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Image src={previewAsset?.url || 'https://placehold.co/1200x800.png'} alt={previewAsset?.name || ''} width={1200} height={800} className="w-full rounded-md border" data-ai-hint="media asset"/>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function AssetGrid({ assets, setPreviewAsset, handleCopyUrl }: { assets: Asset[], setPreviewAsset: (asset: Asset) => void, handleCopyUrl: (url: string) => void }) {
     if (assets.length === 0) {
        return <div className="text-center py-16 border-2 border-dashed rounded-lg"><p className="text-muted-foreground">Aucun fichier dans cette catégorie.</p></div>;
    }
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {assets.map(asset => (
                <Card key={asset.id} className="group flex flex-col">
                    <CardHeader className="p-0">
                         <Image src={asset.url} alt={asset.name} width={300} height={200} className="rounded-t-lg aspect-[4/3] object-cover" data-ai-hint="media asset"/>
                    </CardHeader>
                    <CardContent className="p-3 flex-1">
                        <p className="text-xs font-semibold truncate" title={asset.name}>{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.size} - {asset.uploadedAt}</p>
                    </CardContent>
                    <CardFooter className="p-1 flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyUrl(asset.url)}><Copy className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewAsset(asset)}><Eye className="h-4 w-4"/></Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
