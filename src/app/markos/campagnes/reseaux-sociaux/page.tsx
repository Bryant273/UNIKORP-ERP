
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, BarChart, Eye, Pencil, Trash2, ThumbsUp, MessageSquare, Share2, Linkedin, Facebook, Instagram } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// --- TYPES & MOCK DATA ---
type Platform = 'LinkedIn' | 'Facebook' | 'Instagram';
type PostStatus = 'Planifié' | 'Publié' | 'Archivé';
type SocialPost = {
  id: string;
  platform: Platform;
  content: string;
  status: PostStatus;
  publishDate: string;
  likes?: number;
  comments?: number;
  shares?: number;
  engagementRate?: string;
};

const MOCK_POSTS: SocialPost[] = [
  { id: 'post-1', platform: 'LinkedIn', content: 'Unikorp Central: la solution ERP unifiée pour booster votre productivité...', status: 'Publié', publishDate: '2024-07-25', likes: 128, comments: 12, shares: 25, engagementRate: '5.2%' },
  { id: 'post-2', platform: 'Facebook', content: 'Découvrez notre nouveau module SOCIX pour une gestion RH simplifiée !', status: 'Publié', publishDate: '2024-07-23', likes: 256, comments: 34, shares: 45, engagementRate: '8.1%' },
  { id: 'post-3', platform: 'Instagram', content: 'Photo de notre équipe lors du dernier séminaire. #TeamBuilding #Unikorp', status: 'Publié', publishDate: '2024-07-21', likes: 450, comments: 22, shares: 10, engagementRate: '12.5%' },
  { id: 'post-4', platform: 'LinkedIn', content: 'Livre blanc à télécharger : "Le futur de l\'ERP Cloud"', status: 'Planifié', publishDate: '2024-08-05' },
];

const kpiData = [
  { title: 'Total Abonnés', value: '12.5K' },
  { title: 'Taux d\'Engagement (30j)', value: '6.8%' },
  { title: 'Portée (30j)', value: '85.2K' },
];

const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
        case 'LinkedIn': return <Linkedin className="h-4 w-4 text-blue-700" />;
        case 'Facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
        case 'Instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
    }
};

const ITEMS_PER_PAGE = 10;

export default function ReseauxSociauxPage() {
    const { toast } = useToast();
    const [posts, setPosts] = useState(MOCK_POSTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
    const paginatedPosts = posts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: 'Publication Planifiée (Simulation)', description: 'Votre publication a été ajoutée au calendrier.' });
        setIsModalOpen(false);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Réseaux Sociaux</CardTitle>
                            <CardDescription>Planifiez, publiez et analysez vos performances sur les réseaux sociaux.</CardDescription>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Planifier un post</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="grid gap-4 md:grid-cols-3">
                        {kpiData.map(kpi => (
                            <Card key={kpi.title}><CardHeader className="p-4 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">{kpi.title}</CardTitle></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpi.value}</div></CardContent></Card>
                        ))}
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Plateforme</TableHead>
                                <TableHead>Contenu</TableHead>
                                <TableHead className="text-center">Date</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center">Performance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedPosts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell className="text-center">{getPlatformIcon(post.platform)}</TableCell>
                                    <TableCell className="max-w-sm truncate">{post.content}</TableCell>
                                    <TableCell className="text-center">{format(new Date(post.publishDate), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                                    <TableCell className="text-center"><Badge variant={post.status === 'Publié' ? 'default' : 'outline'}>{post.status}</Badge></TableCell>
                                    <TableCell>
                                        {post.status === 'Publié' && (
                                            <div className="flex justify-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{post.likes}</span>
                                                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.comments}</span>
                                                <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{post.shares}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="flex items-center justify-between pt-6">
                    <div className="text-sm text-muted-foreground">
                        Total de {posts.length} publications. Page {currentPage} sur {totalPages}.
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Précédent</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Suivant</Button>
                        </div>
                    )}
                </CardFooter>
            </Card>

             <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Planifier une publication</DialogTitle>
                            <DialogDescription>Rédigez votre post et choisissez où et quand le publier.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="platform">Plateforme</Label>
                                <Select><SelectTrigger><SelectValue placeholder="Sélectionnez une plateforme..."/></SelectTrigger><SelectContent><SelectItem value="linkedin">LinkedIn</SelectItem><SelectItem value="facebook">Facebook</SelectItem><SelectItem value="instagram">Instagram</SelectItem></SelectContent></Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Contenu du post</Label>
                                <Textarea id="content" placeholder="Rédigez votre message ici..." rows={5}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="media">Média</Label>
                                <Input id="media" type="file" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="publishDate">Date et heure de publication</Label>
                                <Input id="publishDate" type="datetime-local" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                            <Button type="submit">Planifier</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
