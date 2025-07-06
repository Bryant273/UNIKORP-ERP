
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Eye, Pencil, Trash2, Download, User, Briefcase, Building, Mail, Phone, Calendar, Settings, Search, MoreHorizontal, X } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- TYPES & MOCK DATA ---
type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Apprentissage';
type EmployeeStatus = 'Actif' | 'Inactif' | 'En congé';
type Employee = {
    id: string;
    matricule: string;
    nom: string;
    prenom: string;
    poste: string;
    departement: string;
    email: string;
    telephone: string;
    dateEmbauche: string;
    statut: EmployeeStatus;
    contractType: ContractType;
    avatarUrl: string;
};

const initialEmployees: Employee[] = [
    { id: 'emp-001', matricule: 'UNIK-076', nom: 'Dupont', prenom: 'Jean', poste: 'Développeur Senior', departement: 'IT', email: 'jean.dupont@unikorp.com', telephone: '0102030405', dateEmbauche: '2020-03-15', statut: 'Actif', contractType: 'CDI', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-002', matricule: 'UNIK-077', nom: 'Martin', prenom: 'Sophie', poste: 'Chef de projet Marketing', departement: 'MARKOS', email: 'sophie.martin@unikorp.com', telephone: '0607080910', dateEmbauche: '2021-09-01', statut: 'Actif', contractType: 'CDI', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-003', matricule: 'UNIK-078', nom: 'Garcia', prenom: 'David', poste: 'Comptable', departement: 'SKOMPTAB', email: 'david.garcia@unikorp.com', telephone: '0708091011', dateEmbauche: '2022-01-20', statut: 'En congé', contractType: 'CDD', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-004', matricule: 'UNIK-042', nom: 'Petit', prenom: 'Lucas', poste: 'Développeur Junior', departement: 'IT', email: 'lucas.petit@unikorp.com', telephone: '0123456789', dateEmbauche: '2023-06-10', statut: 'Actif', contractType: 'Apprentissage', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-005', matricule: 'UNIK-055', nom: 'Leroy', prenom: 'Camille', poste: 'Gestionnaire RH', departement: 'SOCIX', email: 'camille.leroy@unikorp.com', telephone: '0987654321', dateEmbauche: '2019-11-05', statut: 'Actif', contractType: 'CDI', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 'emp-006', matricule: 'UNIK-012', nom: 'Moreau', prenom: 'Léa', poste: 'Responsable Logistique', departement: 'LOGSON', email: 'lea.moreau@unikorp.com', telephone: '0655443322', dateEmbauche: '2018-02-18', statut: 'Inactif', contractType: 'CDI', avatarUrl: 'https://placehold.co/100x100.png' },
];

const ITEMS_PER_PAGE = 10;

// --- UTILS ---
const getStatusBadgeStyles = (status: EmployeeStatus) => {
    switch (status) {
        case 'Actif': return 'bg-green-100 text-green-800 border-green-200';
        case 'En congé': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Inactif': return 'bg-red-100 text-red-800 border-red-200';
    }
};

const getStatusIndicatorStyles = (status: EmployeeStatus) => {
    switch (status) {
        case 'Actif': return 'bg-green-500';
        case 'En congé': return 'bg-orange-500';
        case 'Inactif': return 'bg-red-500';
    }
};

// --- MAIN COMPONENT ---
function EmployesMainContent() {
    const [employees, setEmployees] = useState(initialEmployees);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ departement: 'all', contractType: 'all', statut: 'all' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [visibleColumns, setVisibleColumns] = useState({
        matricule: true, departement: true, fonction: true, contractType: true, dateEmbauche: true, statut: true,
    });
    const { toast } = useToast();

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => {
            const searchMatch = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                e.matricule.toLowerCase().includes(searchTerm.toLowerCase());
            const departmentMatch = filters.departement === 'all' || e.departement === filters.departement;
            const contractMatch = filters.contractType === 'all' || e.contractType === filters.contractType;
            const statusMatch = filters.statut === 'all' || e.statut === filters.statut;
            return searchMatch && departmentMatch && contractMatch && statusMatch;
        });
    }, [employees, searchTerm, filters]);

    const openCreateModal = () => { setEditingEmployee(null); setIsModalOpen(true); };
    const openEditModal = (employee: Employee) => { setEditingEmployee(employee); setIsModalOpen(true); };
    const openViewSheet = (employee: Employee) => { setEditingEmployee(employee); setIsSheetOpen(true); };

    const handleSave = (formData: Employee) => {
        if (editingEmployee) {
            setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, ...formData } : e));
            toast({ title: 'Employé modifié', description: `Les informations de ${formData.prenom} ${formData.nom} ont été mises à jour.` });
        } else {
            const newEmployee: Employee = {
                ...formData,
                id: `emp-${Date.now()}`,
                matricule: `UNIK-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
                statut: 'Actif',
                avatarUrl: 'https://placehold.co/100x100.png'
            };
            setEmployees(prev => [newEmployee, ...prev]);
            toast({ title: 'Employé ajouté', description: `${formData.prenom} ${formData.nom} a été ajouté à la liste.` });
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (employeeToDelete) {
            setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
            toast({ title: 'Employé supprimé' });
            setEmployeeToDelete(null);
        }
    };

    const handleExport = (format: 'pdf' | 'excel') => {
        if (format === 'pdf') {
            const doc = new jsPDF();
            doc.text("Liste des Employés", 14, 16);
            autoTable(doc, {
                head: [['Matricule', 'Nom', 'Poste', 'Département', 'Statut']],
                body: employees.map(e => [e.matricule, `${e.prenom} ${e.nom}`, e.poste, e.departement, e.statut]),
                startY: 20
            });
            doc.save('liste_employes.pdf');
            toast({ title: 'Exportation PDF lancée' });
        } else {
            toast({ title: 'Exportation Excel (Simulation)', description: "Un fichier Excel serait généré ici." });
        }
        setIsExportModalOpen(false);
    };
    
    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Gestion des Employés</CardTitle>
                            <CardDescription>Consultez, ajoutez et gérez les fiches des employés.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={openCreateModal}><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un employé</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Toolbar */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher par nom ou matricule..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <Select value={filters.departement} onValueChange={v => setFilters(f => ({...f, departement: v}))}><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tous les départements</SelectItem><SelectItem value="IT">IT</SelectItem><SelectItem value="MARKOS">Marketing</SelectItem><SelectItem value="SKOMPTAB">Comptabilité</SelectItem><SelectItem value="SOCIX">RH</SelectItem><SelectItem value="LOGSON">Logistique</SelectItem></SelectContent></Select>
                        <Select value={filters.contractType} onValueChange={v => setFilters(f => ({...f, contractType: v}))}><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tous les contrats</SelectItem><SelectItem value="CDI">CDI</SelectItem><SelectItem value="CDD">CDD</SelectItem><SelectItem value="Stage">Stage</SelectItem><SelectItem value="Apprentissage">Apprentissage</SelectItem></SelectContent></Select>
                        <Select value={filters.statut} onValueChange={v => setFilters(f => ({...f, statut: v}))}><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem><SelectItem value="Actif">Actif</SelectItem><SelectItem value="En congé">En congé</SelectItem><SelectItem value="Inactif">Inactif</SelectItem></SelectContent></Select>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline"><Settings className="mr-2 h-4 w-4" /> Affichage</Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel><DropdownMenuSeparator />
                                {Object.keys(visibleColumns).map((key) => (
                                    <DropdownMenuCheckboxItem key={key} checked={visibleColumns[key as keyof typeof visibleColumns]} onCheckedChange={(checked) => setVisibleColumns(v => ({...v, [key]: checked}))}>
                                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" onClick={() => setIsExportModalOpen(true)}><Download className="h-4 w-4" /></Button>
                    </div>

                    {/* Table */}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Employé</TableHead>
                                {visibleColumns.matricule && <TableHead>Matricule</TableHead>}
                                {visibleColumns.departement && <TableHead>Département</TableHead>}
                                {visibleColumns.fonction && <TableHead>Fonction</TableHead>}
                                {visibleColumns.contractType && <TableHead>Type contrat</TableHead>}
                                {visibleColumns.dateEmbauche && <TableHead>Date d'embauche</TableHead>}
                                {visibleColumns.statut && <TableHead className="text-center">Statut</TableHead>}
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {filteredEmployees.map(e => (
                                    <TableRow key={e.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar><AvatarImage src={e.avatarUrl} alt={e.nom} data-ai-hint="person face" /><AvatarFallback>{e.prenom[0]}{e.nom[0]}</AvatarFallback></Avatar>
                                                <div><p className="font-medium">{e.prenom} {e.nom}</p><p className="text-xs text-muted-foreground">{e.email}</p></div>
                                            </div>
                                        </TableCell>
                                        {visibleColumns.matricule && <TableCell className="font-mono text-xs">{e.matricule}</TableCell>}
                                        {visibleColumns.departement && <TableCell>{e.departement}</TableCell>}
                                        {visibleColumns.fonction && <TableCell>{e.poste}</TableCell>}
                                        {visibleColumns.contractType && <TableCell><Badge variant="outline">{e.contractType}</Badge></TableCell>}
                                        {visibleColumns.dateEmbauche && <TableCell>{new Date(e.dateEmbauche).toLocaleDateString('fr-FR')}</TableCell>}
                                        {visibleColumns.statut && <TableCell className="text-center"><Badge className={getStatusBadgeStyles(e.statut)}><span className={`h-2 w-2 rounded-full mr-2 ${getStatusIndicatorStyles(e.statut)}`}/>{e.statut}</Badge></TableCell>}
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openViewSheet(e)}><Eye className="mr-2"/>Voir détails</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(e)}><Pencil className="mr-2"/>Modifier</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setEmployeeToDelete(e)}><Trash2 className="mr-2"/>Supprimer</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <EmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} employeeToEdit={editingEmployee} />
            <EmployeeSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} employee={editingEmployee} />

            <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Supprimer cet employé ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. Le dossier de l'employé sera archivé.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent><DialogHeader><DialogTitle>Exporter la liste des employés</DialogTitle><DialogDescription>Choisissez le format d'exportation souhaité.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => handleExport('excel')}>Excel (CSV)</Button><Button onClick={() => handleExport('pdf')}>PDF</Button></DialogFooter></DialogContent>
            </Dialog>
        </>
    );
}

function EmployeeModal({ isOpen, onClose, onSave, employeeToEdit }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, employeeToEdit: Employee | null }) {
    const [formData, setFormData] = useState<Partial<Employee>>(employeeToEdit || {});

    useEffect(() => {
        setFormData(employeeToEdit || {});
    }, [employeeToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof Employee, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Employee);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl"><form onSubmit={handleSubmit}><DialogHeader><DialogTitle>{employeeToEdit ? 'Modifier' : 'Ajouter'} un employé</DialogTitle></DialogHeader><div className="grid gap-4 py-4 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="nom">Nom</Label><Input id="nom" value={formData.nom || ''} onChange={handleChange} required/></div><div className="space-y-2"><Label htmlFor="prenom">Prénoms</Label><Input id="prenom" value={formData.prenom || ''} onChange={handleChange} required/></div><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={handleChange} required/></div><div className="space-y-2"><Label htmlFor="telephone">Téléphone</Label><Input id="telephone" value={formData.telephone || ''} onChange={handleChange} /></div><div className="space-y-2"><Label htmlFor="poste">Poste</Label><Input id="poste" value={formData.poste || ''} onChange={handleChange} /></div><div className="space-y-2"><Label htmlFor="departement">Département</Label><Select name="departement" value={formData.departement} onValueChange={v => handleSelectChange('departement', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="IT">IT</SelectItem><SelectItem value="MARKOS">Marketing</SelectItem><SelectItem value="SKOMPTAB">Comptabilité</SelectItem><SelectItem value="SOCIX">RH</SelectItem><SelectItem value="LOGSON">Logistique</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="dateEmbauche">Date d'embauche</Label><Input id="dateEmbauche" type="date" value={formData.dateEmbauche || ''} onChange={handleChange}/></div><div className="space-y-2"><Label htmlFor="contractType">Type de contrat</Label><Select name="contractType" value={formData.contractType} onValueChange={v => handleSelectChange('contractType', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="CDI">CDI</SelectItem><SelectItem value="CDD">CDD</SelectItem><SelectItem value="Stage">Stage</SelectItem><SelectItem value="Apprentissage">Apprentissage</SelectItem></SelectContent></Select></div></div><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Annuler</Button><Button type="submit">Enregistrer</Button></DialogFooter></form></DialogContent>
        </Dialog>
    );
}

function EmployeeSheet({ isOpen, onClose, employee }: { isOpen: boolean, onClose: () => void, employee: Employee | null }) {
    if (!employee) return null;
    return (
        <Sheet open={isOpen} onOpenChange={onClose}><SheetContent className="sm:max-w-lg"><SheetHeader><SheetTitle>{employee.prenom} {employee.nom}</SheetTitle><SheetDescription>Matricule: {employee.matricule}</SheetDescription></SheetHeader><div className="space-y-6 py-6">
            <div className="flex items-center"><User className="mr-4 h-5 w-5 text-muted-foreground" /><div className="space-y-1"><p className="text-sm text-muted-foreground">Poste</p><p>{employee.poste}</p></div></div>
            <div className="flex items-center"><Building className="mr-4 h-5 w-5 text-muted-foreground" /><div className="space-y-1"><p className="text-sm text-muted-foreground">Département</p><p>{employee.departement}</p></div></div>
            <div className="flex items-center"><Briefcase className="mr-4 h-5 w-5 text-muted-foreground" /><div className="space-y-1"><p className="text-sm text-muted-foreground">Type de contrat</p><p>{employee.contractType}</p></div></div>
            <div className="flex items-center"><Mail className="mr-4 h-5 w-5 text-muted-foreground" /><div className="space-y-1"><p className="text-sm text-muted-foreground">Email</p><p>{employee.email}</p></div></div>
            <div className="flex items-center"><Phone className="mr-4 h-5 w-5 text-muted-foreground" /><div className="space-y-1"><p className="text-sm text-muted-foreground">Téléphone</p><p>{employee.telephone}</p></div></div>
            <div className="flex items-center"><Calendar className="mr-4 h-5 w-5 text-muted-foreground" /><div className="space-y-1"><p className="text-sm text-muted-foreground">Date d'embauche</p><p>{new Date(employee.dateEmbauche).toLocaleDateString('fr-FR')}</p></div></div>
        </div></SheetContent></Sheet>
    );
}

export default function EmployesPage() {
    return (
        <EmployesMainContent />
    )
}

    