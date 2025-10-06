
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, BarChart, Eye, Pencil, Trash2, ThumbsUp, MessageSquare, Share2, Linkedin, Facebook, Instagram, Heart, Send } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';


// --- TYPES & MOCK DATA ---
type Platform = 'LinkedIn' | 'Facebook' | 'Instagram';
type PostStatus = 'Planifié' | 'Publié' | 'Archivé';
type SocialPost = {
  id: string;
  platform: Platform;
  content: string;
  status: PostStatus;
  publishDate: string;
  visualUrl?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  engagementRate?: string;
};

const MOCK_POSTS: SocialPost[] = [
  { id: 'post-1', platform: 'LinkedIn', content: 'Unikorp Central: la solution ERP unifiée pour booster votre productivité. Découvrez comment nos modules intégrés peuvent transformer votre gestion d\'entreprise. #ERP #TransformationDigitale', status: 'Publié', publishDate: '2024-07-25', likes: 128, comments: 12, shares: 25, engagementRate: '5.2%', visualUrl: 'https://placehold.co/1200x628.png' },
  { id: 'post-2', platform: 'Facebook', content: '🚀 Découvrez notre nouveau module SOCIX pour une gestion RH simplifiée ! Gagnez du temps sur la paie, les congés et le suivi des employés. Cliquez pour une démo gratuite !', status: 'Publié', publishDate: '2024-07-23', likes: 256, comments: 34, shares: 45, engagementRate: '8.1%', visualUrl: 'https://placehold.co/1200x628.png' },
  { id: 'post-3', platform: 'Instagram', content: 'Notre équipe lors du dernier séminaire. Une journée de cohésion et d\'innovation. #TeamBuilding #UnikorpLife #Innovation', status: 'Publié', publishDate: '2024-07-21', likes: 450, comments: 22, shares: 10, engagementRate: '12.5%', visualUrl: 'https://placehold.co/1080x1080.png' },
  { id: 'post-4', platform: 'LinkedIn', content: 'Livre blanc à télécharger : "Le futur de l\'ERP Cloud et l\'impact de l\'IA sur la gestion d\'entreprise". Lien en commentaire. #IA #Cloud #LivreBlanc', status: 'Planifié', publishDate: '2024-08-05' },
];

const MOCK_COMMENTS = [
  { id: 'c1', name: 'Alice Dubois', avatar: 'https://placehold.co/100x100.png', text: 'Très impressionnant ! Est-ce que cela s\'intègre avec d\'autres outils ?' },
  { id: 'c2', name: 'Bruno Lemaire', avatar: 'https://placehold.co/100x100.png', text: 'Excellente initiative. Le module RH semble très prometteur.' },
  { id: 'c3', name: 'Carine Martin', avatar: 'https://placehold.co/100x100.png', text: 'Superbe photo d\'équipe !' },
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
    const [previewingPost, setPreviewingPost] = useState<SocialPost | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [postToDelete, setPostToDelete] = useState<SocialPost | null>(null);
    
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
    
    const handleDelete = () => {
        if (!postToDelete) return;
        setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
        setPostToDelete(null);
        toast({ title: "Post supprimé", description: `La publication a été supprimée.`});
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
                                <TableHead>#</TableHead>
                                <TableHead className="w-24">Plateforme</TableHead>
                                <TableHead>Contenu</TableHead>
                                <TableHead className="text-center">Date</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-center">Performance</TableHead>
                                <TableHead className="text-center w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedPosts.map((post, index) => (
                                <TableRow key={post.id} className="odd:bg-muted/50">
                                    <TableCell className="font-medium text-muted-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
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
                                     <TableCell className="text-center">
                                        <div className="flex justify-center">
                                            <Button variant="ghost" size="icon" onClick={() => setPreviewingPost(post)}><Eye className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" onClick={() => setPostToDelete(post)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
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

             <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette publication ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <PreviewPostModal 
                isOpen={!!previewingPost} 
                onClose={() => setPreviewingPost(null)}
                post={previewingPost} 
            />
        </>
    );
}


// --- Preview Modal & Components ---

function PreviewPostModal({ isOpen, onClose, post }: { isOpen: boolean, onClose: () => void, post: SocialPost | null }) {
    if (!post) return null;

    const renderPreview = () => {
        switch(post.platform) {
            case 'LinkedIn': return <LinkedInPreview post={post} />;
            case 'Facebook': return <FacebookPreview post={post} />;
            case 'Instagram': return <InstagramPreview post={post} />;
            default: return <p>Aperçu non disponible pour cette plateforme.</p>;
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl p-0 border-0">
                 <DialogHeader>
                    <DialogTitle className="sr-only">Aperçu du post : {post.platform}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[90vh]">
                    <div className="p-4">
                        {renderPreview()}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

const PostHeader = () => (
    <div className="flex items-center gap-3">
        <Avatar><AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="company logo" /><AvatarFallback>U</AvatarFallback></Avatar>
        <div>
            <p className="font-semibold text-sm">UNIKORP</p>
            <p className="text-xs text-muted-foreground">12,5K abonnés • {format(new Date(), 'dd MMM', { locale: fr })}</p>
        </div>
    </div>
);

const Comment = ({ comment }: { comment: { id: string, name: string, avatar: string, text: string }}) => (
    <div className="flex gap-2">
        <Avatar className="h-8 w-8">
            <AvatarImage src={comment.avatar} alt={comment.name} data-ai-hint="person face" />
            <AvatarFallback>{comment.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-muted rounded-lg p-2 text-xs">
            <p className="font-semibold">{comment.name}</p>
            <p>{comment.text}</p>
        </div>
    </div>
);


function LinkedInPreview({ post }: { post: SocialPost }) {
    return (
        <div className="bg-white rounded-lg text-black">
            <div className="p-4 space-y-4">
                <PostHeader />
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            </div>
            {post.visualUrl && <Image src={post.visualUrl} alt="Post visual" width={552} height={290} className="w-full h-auto" data-ai-hint="publication image"/>}
            <div className="p-2 px-4 flex justify-between text-xs text-muted-foreground border-y">
                <span>{post.likes} J'aime</span>
                <span>{post.comments} commentaires</span>
            </div>
            <div className="p-2 flex items-center justify-around">
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground font-semibold"><ThumbsUp className="h-5 w-5"/>J'aime</Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground font-semibold"><MessageSquare className="h-5 w-5"/>Commenter</Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground font-semibold"><Share2 className="h-5 w-5"/>Partager</Button>
            </div>
             <div className="p-4 border-t space-y-4">
                 <h4 className="font-semibold text-sm">Commentaires</h4>
                {MOCK_COMMENTS.slice(0, 2).map(c => <Comment key={c.id} comment={c} />)}
            </div>
        </div>
    );
}

function FacebookPreview({ post }: { post: SocialPost }) {
     return (
        <div className="bg-white rounded-lg text-black">
            <div className="p-4 space-y-4">
                <PostHeader />
                <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            </div>
            {post.visualUrl && <Image src={post.visualUrl} alt="Post visual" width={552} height={290} className="w-full h-auto" data-ai-hint="publication image"/>}
             <div className="p-2 px-4 flex justify-between text-xs text-muted-foreground">
                <span>{post.likes} J'aime</span>
                <span>{post.comments} commentaires</span>
            </div>
            <div className="p-2 flex items-center justify-around border-y">
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground font-semibold"><ThumbsUp className="h-5 w-5"/>J'aime</Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground font-semibold"><MessageSquare className="h-5 w-5"/>Commenter</Button>
                <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground font-semibold"><Share2 className="h-5 w-5"/>Partager</Button>
            </div>
             <div className="p-4 border-t space-y-4">
                 <h4 className="font-semibold text-sm">Commentaires</h4>
                {MOCK_COMMENTS.slice(0, 2).map(c => <Comment key={c.id} comment={c} />)}
            </div>
        </div>
    );
}

function InstagramPreview({ post }: { post: SocialPost }) {
    return (
        <div className="bg-black rounded-lg text-white font-sans">
             <div className="p-3 flex items-center gap-3">
                <Avatar><AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="company logo" /><AvatarFallback>U</AvatarFallback></Avatar>
                <p className="font-semibold text-sm">unikorp_official</p>
            </div>
            {post.visualUrl && <Image src={post.visualUrl} alt="Post visual" width={400} height={400} className="w-full h-auto" data-ai-hint="publication image"/>}
            <div className="p-3 space-y-1">
                <div className="flex items-center gap-4 mb-2">
                    <Heart className="h-6 w-6"/>
                    <MessageSquare className="h-6 w-6 -scale-x-100"/>
                    <Send className="h-6 w-6"/>
                </div>
                <p className="text-sm font-semibold">{post.likes} J'aime</p>
                <p className="text-sm"><span className="font-semibold">unikorp_official</span> <span className="whitespace-pre-wrap">{post.content}</span></p>
                <p className="text-xs text-gray-400 pt-1">Voir les {post.comments} commentaires</p>
                <div className="pt-2">
                    <Comment comment={{...MOCK_COMMENTS[2], name: "client_satisfait", avatar: 'https://placehold.co/100x100.png'}} />
                </div>
            </div>
        </div>
    )
}
