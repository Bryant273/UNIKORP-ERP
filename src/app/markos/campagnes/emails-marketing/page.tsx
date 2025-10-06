
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
import { PlusCircle, BarChart, CheckCircle, MailWarning } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// --- TYPES & MOCK DATA ---
type ContactStatus = 'Actif' | 'Désabonné';
type Contact = {
    id: string;
    email: string;
    name: string;
    status: ContactStatus;
};

const MOCK_CONTACTS: Contact[] = [
    { id: 'contact-1', email: 'jean.dupont@example.com', name: 'Jean Dupont', status: 'Actif' },
    { id: 'contact-2', email: 'sophie.martin@example.com', name: 'Sophie Martin', status: 'Actif' },
    { id: 'contact-3', email: 'david.garcia@example.com', name: 'David Garcia', status: 'Désabonné' },
    { id: 'contact-4', email: 'lucas.petit@example.com', name: 'Lucas Petit', status: 'Actif' },
    { id: 'contact-5', email: 'camille.leroy@example.com', name: 'Camille Leroy', status: 'Actif' },
];

const kpiData = [
    { title: "Taux d'ouverture moyen", value: "24.5%" },
    { title: "Taux de clics moyen", value: "3.1%" },
    { title: "Taux de désabonnement", value: "0.8%" },
];


export default function EmailsMarketingPage() {
    const { toast } = useToast();
    const [contacts, setContacts] = useState(MOCK_CONTACTS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: 'Campagne Envoyée (Simulation)', description: 'Votre campagne email a été programmée.' });
        setIsModalOpen(false);
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Campagnes par Email</CardTitle>
                            <CardDescription>Gérez vos listes de contacts et créez vos campagnes d'emailing.</CardDescription>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Campagne</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        {kpiData.map(kpi => (
                            <Card key={kpi.title}><CardHeader className="p-4 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">{kpi.title}</CardTitle><BarChart className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpi.value}</div></CardContent></Card>
                        ))}
                    </div>
                    <Table>
                        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Nom</TableHead><TableHead>Email</TableHead><TableHead className="text-center">Statut</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {contacts.map((c, index) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>{c.email}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={c.status === 'Actif' ? 'default' : 'destructive'} className={c.status === 'Actif' ? 'bg-green-100 text-green-800' : ''}>
                                            {c.status === 'Actif' ? <CheckCircle className="mr-1 h-3 w-3" /> : <MailWarning className="mr-1 h-3 w-3" />}
                                            {c.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Nouvelle Campagne Email</DialogTitle>
                            <DialogDescription>Créez et programmez votre prochaine campagne.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2"><Label htmlFor="subject">Sujet de l'email</Label><Input id="subject" placeholder="Ex: Notre nouvelle collection est arrivée !"/></div>
                            <div className="space-y-2"><Label htmlFor="content">Contenu de l'email</Label><Textarea id="content" placeholder="Rédigez votre message ici..." rows={6}/></div>
                            <div className="space-y-2"><Label htmlFor="segment">Destinataires</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionnez un segment..."/></SelectTrigger><SelectContent><SelectItem value="all">Tous les contacts actifs</SelectItem><SelectItem value="vip">Clients VIP</SelectItem><SelectItem value="prospects">Prospects</SelectItem></SelectContent></Select></div>
                             <div className="flex items-center space-x-2"><Switch id="schedule-switch"/><Label htmlFor="schedule-switch">Programmer pour plus tard</Label></div>
                        </div>
                        <DialogFooter><Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Annuler</Button><Button type="submit">Envoyer la campagne</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
