
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
import { PlusCircle, BarChart, CheckCircle, SmartphoneNfc } from 'lucide-react';

// --- TYPES & MOCK DATA ---
type ContactStatus = 'Actif' | 'Désabonné';
type Contact = {
    id: string;
    phone: string;
    name: string;
    status: ContactStatus;
};

const MOCK_CONTACTS: Contact[] = [
    { id: 'contact-1', phone: '+33 6 12 34 56 78', name: 'Jean Dupont', status: 'Actif' },
    { id: 'contact-2', phone: '+33 6 23 45 67 89', name: 'Sophie Martin', status: 'Actif' },
    { id: 'contact-3', phone: '+33 6 34 56 78 90', name: 'David Garcia', status: 'Désabonné' },
];

const kpiData = [
    { title: "Taux de délivrabilité", value: "98.2%" },
    { title: "Taux de réponse", value: "8.7%" },
    { title: "Coût par SMS", value: "50 FCFA" },
];


export default function CampagnesSmsPage() {
    const { toast } = useToast();
    const [contacts, setContacts] = useState(MOCK_CONTACTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const MAX_CHARS = 160;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: 'Campagne SMS Envoyée (Simulation)', description: 'Votre campagne SMS a été envoyée.' });
        setIsModalOpen(false);
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Campagnes par SMS</CardTitle>
                            <CardDescription>Envoyez des campagnes SMS ciblées à vos contacts.</CardDescription>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Campagne SMS</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        {kpiData.map(kpi => (
                            <Card key={kpi.title}><CardHeader className="p-4 flex-row items-center justify-between"><CardTitle className="text-sm font-medium">{kpi.title}</CardTitle><BarChart className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{kpi.value}</div></CardContent></Card>
                        ))}
                    </div>
                    <Table>
                        <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Téléphone</TableHead><TableHead className="text-center">Statut</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {contacts.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>{c.phone}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={c.status === 'Actif' ? 'default' : 'destructive'} className={c.status === 'Actif' ? 'bg-green-100 text-green-800' : ''}>
                                            <SmartphoneNfc className="mr-1 h-3 w-3" />
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
                            <DialogTitle>Nouvelle Campagne SMS</DialogTitle>
                            <DialogDescription>Rédigez et programmez votre message.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2"><Label htmlFor="segment">Destinataires</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionnez un segment..."/></SelectTrigger><SelectContent><SelectItem value="all">Tous les contacts actifs</SelectItem><SelectItem value="vip">Clients VIP</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="content">Message</Label><Textarea id="content" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={MAX_CHARS} placeholder="Votre message ici..." rows={4}/></div>
                            <div className="text-right text-sm text-muted-foreground">{message.length} / {MAX_CHARS} caractères</div>
                        </div>
                        <DialogFooter><Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Annuler</Button><Button type="submit">Envoyer</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
