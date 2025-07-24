
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, CalendarDays, Plane, Briefcase, User, Mail, Phone, Building, CheckCircle, FileSignature, Hourglass, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type Document = {
    name: string;
    category: 'Contrat' | 'Paie' | 'Autre';
    date: string;
    fileUrl: string;
};

export default function EmployeeDashboardPage() {
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveDates, setLeaveDates] = useState<DateRange | undefined>();

  const employee = {
    name: 'Jean Dupont',
    position: 'Développeur Senior',
    department: 'IT',
    avatarUrl: 'https://placehold.co/100x100.png',
    email: 'jean.dupont@unikorp.com',
    phone: '01 02 03 04 05',
    hireDate: '2020-03-15',
    manager: 'Marc Lefebvre',
    contractType: 'CDI',
    leaveBalance: 14.5,
  };

  const documents: Document[] = [
    { name: 'Contrat de travail initial', category: 'Contrat', date: '2020-03-15', fileUrl: 'https://placehold.co/800x1131.png' },
    { name: 'Avenant - Passage Senior', category: 'Contrat', date: '2022-04-01', fileUrl: 'https://placehold.co/800x1131.png' },
    { name: 'Bulletin de paie - Juin 2024', category: 'Paie', date: '2024-06-30', fileUrl: 'https://placehold.co/800x1131.png' },
    { name: 'Bulletin de paie - Mai 2024', category: 'Paie', date: '2024-05-31', fileUrl: 'https://placehold.co/800x1131.png' },
    { name: 'Attestation de travail', category: 'Autre', date: '2024-01-10', fileUrl: 'https://placehold.co/800x1131.png' },
  ];
  
  const upcomingLeaves = [
    { type: 'Congé Payé', dates: '15/08/2024 - 30/08/2024', status: 'Approuvé' },
  ];

  const pendingRequests = [
    { type: 'Télétravail', dates: '05/09/2024', status: 'En attente' },
  ];

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLeaveModalOpen(false);
    toast({
        title: 'Demande envoyée',
        description: "Votre demande d'absence a été soumise pour validation.",
    });
  };

  return (
    <>
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <header className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-4 border-primary/10">
                <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person face" />
                <AvatarFallback className="text-3xl">{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bonjour, {employee.name}</h1>
                <p className="text-muted-foreground">{employee.position} - {employee.department}</p>
            </div>
        </header>

         <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile"><User className="mr-2 h-4 w-4"/>Mon Profil</TabsTrigger>
                <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/>Mes Documents</TabsTrigger>
                <TabsTrigger value="leaves"><CalendarDays className="mr-2 h-4 w-4"/>Mes Congés</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-4">
                <Card>
                    <CardHeader><CardTitle>Informations Personnelles & Professionnelles</CardTitle></CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground"/><span>{employee.email}</span></div>
                        <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground"/><span>{employee.phone}</span></div>
                        <div className="flex items-center gap-3"><Building className="h-4 w-4 text-muted-foreground"/><span>Département {employee.department}</span></div>
                        <div className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-muted-foreground"/><span>{employee.position}</span></div>
                        <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-muted-foreground"/><span>Embauché le {new Date(employee.hireDate).toLocaleDateString('fr-FR')}</span></div>
                        <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground"/><span>Manager: {employee.manager}</span></div>
                        <div className="flex items-center gap-3"><FileSignature className="h-4 w-4 text-muted-foreground"/><span>Contrat en {employee.contractType}</span></div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
                 <Card>
                    <CardHeader><CardTitle>Mes Documents</CardTitle><CardDescription>Retrouvez tous vos documents administratifs et de paie.</CardDescription></CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom du document</TableHead>
                                    <TableHead>Catégorie</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map(doc => (
                                    <TableRow key={doc.name}>
                                        <TableCell className="font-medium">{doc.name}</TableCell>
                                        <TableCell><Badge variant="outline">{doc.category}</Badge></TableCell>
                                        <TableCell>{new Date(doc.date).toLocaleDateString('fr-FR')}</TableCell>
                                        <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => setSelectedDocument(doc)}>Voir</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                       </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="leaves" className="mt-4">
                 <Card>
                    <CardHeader><CardTitle>Mes Congés & Absences</CardTitle></CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
                             <p className="text-muted-foreground">Solde de congés payés</p>
                            <p className="text-5xl font-bold text-primary">{employee.leaveBalance}</p>
                            <p className="text-sm text-muted-foreground">jours restants</p>
                             <Button className="w-full mt-6" onClick={() => setIsLeaveModalOpen(true)}><Plane className="mr-2 h-4 w-4"/>Faire une demande</Button>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Absences à venir</h4>
                                {upcomingLeaves.length > 0 ? (
                                   <div className="flex items-center justify-between text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                        <div className="flex items-center gap-2">
                                           <Plane className="h-4 w-4 text-blue-600"/>
                                           <p>{upcomingLeaves[0].type}</p>
                                        </div>
                                       <p className="font-semibold">{upcomingLeaves[0].dates}</p>
                                       <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3"/>{upcomingLeaves[0].status}</Badge>
                                   </div>
                                ) : (
                                   <p className="text-sm text-muted-foreground text-center p-4 border rounded-md">Aucune absence planifiée.</p>
                                )}
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm mb-2">Demandes en attente</h4>
                                {pendingRequests.length > 0 ? (
                                   <div className="flex items-center justify-between text-sm p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                                        <div className="flex items-center gap-2">
                                           <Briefcase className="h-4 w-4 text-yellow-600"/>
                                           <p>{pendingRequests[0].type}</p>
                                        </div>
                                       <p className="font-semibold">{pendingRequests[0].dates}</p>
                                       <Badge className="bg-yellow-100 text-yellow-800"><Hourglass className="mr-1 h-3 w-3"/>{pendingRequests[0].status}</Badge>
                                   </div>
                                ) : (
                                   <p className="text-sm text-muted-foreground text-center p-4 border rounded-md">Aucune demande en attente.</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>

    {/* Document Viewer Modal */}
    <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{selectedDocument?.name}</DialogTitle>
                <DialogDescription>
                    Document de la catégorie "{selectedDocument?.category}" ajouté le {selectedDocument ? new Date(selectedDocument.date).toLocaleDateString('fr-FR') : ''}.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 bg-muted flex justify-center rounded-md">
                {selectedDocument?.fileUrl && (
                    <Image src={selectedDocument.fileUrl} alt={selectedDocument.name} data-ai-hint="document contract" width={600} height={850} className="border shadow-md" />
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedDocument(null)}>Fermer</Button>
                <Button onClick={() => toast({ title: "Fonctionnalité à venir" })}><Download className="mr-2 h-4 w-4" />Télécharger</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {/* Leave Request Modal */}
    <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
        <DialogContent>
            <form onSubmit={handleLeaveSubmit}>
                <DialogHeader>
                    <DialogTitle>Faire une demande d'absence</DialogTitle>
                    <DialogDescription>Remplissez les détails ci-dessous. Votre manager sera notifié.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="leave-type">Type d'absence</Label>
                        <Select name="leave-type" required>
                            <SelectTrigger id="leave-type">
                                <SelectValue placeholder="Sélectionnez un type..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Congé Payé">Congé Payé</SelectItem>
                                <SelectItem value="Télétravail">Télétravail</SelectItem>
                                <SelectItem value="Congé Maladie">Congé Maladie (justificatif requis)</SelectItem>
                                <SelectItem value="Absence Exceptionnelle">Absence Exceptionnelle</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Période</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {leaveDates?.from ? (
                                        leaveDates.to ? (
                                            `${format(leaveDates.from, "dd LLL yyyy", { locale: fr })} - ${format(leaveDates.to, "dd LLL yyyy", { locale: fr })}`
                                        ) : (
                                            format(leaveDates.from, "dd LLL yyyy", { locale: fr })
                                        )
                                    ) : (
                                        <span>Choisir une date ou une période</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={leaveDates}
                                    onSelect={setLeaveDates}
                                    numberOfMonths={1}
                                    locale={fr}
                                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="leave-reason">Motif (optionnel)</Label>
                        <Textarea id="leave-reason" placeholder="Fournissez plus de détails si nécessaire..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsLeaveModalOpen(false)}>Annuler</Button>
                    <Button type="submit">Soumettre la demande</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}
