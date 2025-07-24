
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, CalendarDays, Plane, Briefcase, User, Mail, Phone, Building, CheckCircle, FileSignature, Hourglass, Download, Pencil, History, Upload, Eye, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';

type Document = {
    name: string;
    category: 'Contrat' | 'Paie' | 'Autre';
    date: string;
    fileUrl: string;
};

type LeaveRequest = {
    id: string;
    type: 'Congé Payé' | 'Télétravail' | 'Congé Maladie' | 'Absence Exceptionnelle';
    dates: string;
    status: 'Approuvé' | 'En attente' | 'Refusé';
};


export default function EmployeeDashboardPage() {
  const { toast } = useToast();
  const [employee, setEmployee] = useState({
    name: 'Jean Dupont',
    position: 'Développeur Senior',
    department: 'IT',
    avatarUrl: 'https://placehold.co/100x100.png',
    email: 'jean.dupont@unikorp.com',
    phone: '01 02 03 04 05',
    hireDate: '2020-03-15',
    dateOfBirth: '1985-05-15',
    manager: 'Marc Lefebvre',
    contractType: 'CDI',
    leaveBalance: 14.5,
  });

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [leaveDates, setLeaveDates] = useState<DateRange | undefined>();
  const [leaveType, setLeaveType] = useState<string | undefined>();
  const [leaveReason, setLeaveReason] = useState('');
  
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([
      { id: 'req-1', type: 'Congé Payé', dates: '15/08/2024 - 30/08/2024', status: 'Approuvé' },
      { id: 'req-2', type: 'Télétravail', dates: '05/09/2024', status: 'En attente' },
      { id: 'req-3', type: 'Congé Maladie', dates: '10/07/2024', status: 'Approuvé' },
      { id: 'req-4', type: 'Absence Exceptionnelle', dates: '01/06/2024', status: 'Refusé' },
  ]);

  const documents: Document[] = [
    { name: 'Contrat de travail initial', category: 'Contrat', date: '2020-03-15', fileUrl: 'https://placehold.co/800x1131.png' },
    { name: 'Avenant - Passage Senior', category: 'Contrat', date: '2022-04-01', fileUrl: 'https://placehold.co/800x1131.png' },
    { name: 'Bulletin de paie - Juin 2024', category: 'Paie', date: '2024-06-30', fileUrl: 'https://placehold.co/800x1131.png' },
    { name: 'Bulletin de paie - Mai 2024', category: 'Paie', date: '2024-05-31', fileUrl: 'https://placehold.co/800x1131.png' },
    { name: 'Attestation de travail', category: 'Autre', date: '2024-01-10', fileUrl: 'https://placehold.co/800x1131.png' },
  ];
  
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: LeaveRequest = {
        id: `req-${Date.now()}`,
        type: leaveType as LeaveRequest['type'],
        dates: leaveDates?.from ? 
            (leaveDates.to ? `${format(leaveDates.from, "dd/MM/yyyy")} - ${format(leaveDates.to, "dd/MM/yyyy")}` : format(leaveDates.from, "dd/MM/yyyy")) 
            : 'Date non spécifiée',
        status: 'En attente'
    };
    setAllRequests(prev => [newRequest, ...prev]);
    setIsLeaveModalOpen(false);
    toast({
        title: 'Demande envoyée',
        description: "Votre demande d'absence a été soumise pour validation.",
    });
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
        switch (status) {
            case 'Approuvé': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3"/>Approuvé</Badge>;
            case 'En attente': return <Badge className="bg-yellow-100 text-yellow-800"><Hourglass className="mr-1 h-3 w-3"/>En attente</Badge>;
            case 'Refusé': return <Badge variant="destructive"><X className="mr-1 h-3 w-3" />Refusé</Badge>;
        }
  }
  
  const handleProfileUpdate = (updatedData: Partial<typeof employee>, newAvatar: File | null) => {
    setEmployee(prev => ({
        ...prev,
        ...updatedData,
        avatarUrl: newAvatar ? URL.createObjectURL(newAvatar) : prev.avatarUrl
    }));
    toast({ title: 'Profil mis à jour', description: 'Vos informations personnelles ont été enregistrées.' });
    setIsProfileModalOpen(false);
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
                <TabsTrigger value="leaves"><CalendarDays className="mr-2 h-4 w-4"/>Mes Congés & Demandes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Informations Personnelles & Professionnelles</CardTitle>
                        <Button variant="outline" onClick={() => setIsProfileModalOpen(true)}><Pencil className="mr-2 h-4 w-4" /> Modifier</Button>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground"/><span>{employee.email}</span></div>
                        <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground"/><span>{employee.phone}</span></div>
                        <div className="flex items-center gap-3"><Building className="h-4 w-4 text-muted-foreground"/><span>Département {employee.department}</span></div>
                        <div className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-muted-foreground"/><span>{employee.position}</span></div>
                        <div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-muted-foreground"/><span>Embauché le {format(new Date(employee.hireDate), "dd MMMM yyyy", { locale: fr })}</span></div>
                        <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground"/><span>Manager: {employee.manager}</span></div>
                        <div className="flex items-center gap-3"><FileSignature className="h-4 w-4 text-muted-foreground"/><span>Contrat en {employee.contractType}</span></div>
                         <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground"/><span>Né le {format(new Date(employee.dateOfBirth), "dd MMMM yyyy", { locale: fr })}</span></div>
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
                                        <TableCell>{format(new Date(doc.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => setSelectedDocument(doc)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => toast({ title: "Fonctionnalité à venir" })}><Download className="h-4 w-4" /></Button>
                                        </TableCell>
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
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Solde de congés payés</p>
                                <p className="text-5xl font-bold text-primary">{employee.leaveBalance}</p>
                                <p className="text-sm text-muted-foreground">jours restants</p>
                                <Button className="w-full mt-6" onClick={() => setIsLeaveModalOpen(true)}><Plane className="mr-2 h-4 w-4"/>Faire une demande</Button>
                            </div>
                            <Card>
                                <CardHeader><h4 className="font-semibold">Historique de vos demandes</h4></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Période</TableHead>
                                                <TableHead className="text-right">Statut</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                        {allRequests.length > 0 ? allRequests.map(req => (
                                            <TableRow key={req.id}>
                                                <TableCell>{req.type}</TableCell>
                                                <TableCell>{req.dates}</TableCell>
                                                <TableCell className="text-right">{getStatusBadge(req.status)}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={3} className="text-center h-24">Aucune demande soumise.</TableCell></TableRow>
                                        )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
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
                    Document de la catégorie "{selectedDocument?.category}" ajouté le {selectedDocument ? format(new Date(selectedDocument.date), 'dd MMMM yyyy', {locale: fr}) : ''}.
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
                        <Select name="leave-type" required onValueChange={setLeaveType}>
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
                        <Textarea id="leave-reason" placeholder="Fournissez plus de détails si nécessaire..." value={leaveReason} onChange={e => setLeaveReason(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsLeaveModalOpen(false)}>Annuler</Button>
                    <Button type="submit">Soumettre la demande</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    
    {/* Edit Profile Modal */}
    <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleProfileUpdate}
        currentUser={employee}
    />
    </>
  );
}

// --- Edit Profile Modal Component ---

type EditProfileModalProps = {
    isOpen: boolean, 
    onClose: () => void, 
    onSave: (data: Partial<typeof employee>, avatar: File | null) => void, 
    currentUser: typeof employee
}

function EditProfileModal({ isOpen, onClose, onSave, currentUser }: EditProfileModalProps) {
    const [formData, setFormData] = useState<Partial<typeof currentUser>>(currentUser);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser.avatarUrl);

    useEffect(() => {
        setFormData(currentUser);
        setAvatarPreview(currentUser.avatarUrl);
    }, [currentUser, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, avatarFile);
    };

    return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Modifier mes informations</DialogTitle>
                        <DialogDescription>Mettez à jour vos informations personnelles.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex items-center gap-4">
                             <Avatar className="h-20 w-20">
                                <AvatarImage src={avatarPreview || ''} alt={formData.name}/>
                                <AvatarFallback className="text-3xl">{formData.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Label htmlFor="avatar-upload">Changer de photo</Label>
                                <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input id="name" value={formData.name || ''} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date de naissance</Label>
                            <Input id="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Numéro de téléphone</Label>
                            <Input id="phone" value={formData.phone || ''} onChange={handleChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer les modifications</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
