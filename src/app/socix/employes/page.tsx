
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Eye, Pencil, Trash2, Download, User, Briefcase, Building, Mail, Phone, Calendar, Settings, Search, MoreHorizontal, X, Award, TrendingUp, GraduationCap, FileText, Heart, Users as UsersIcon, FileSignature, FolderKanban } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Logo } from '@/components/logo';


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
    dateNaissance: string;
    statutMatrimonial: 'Marié(e)' | 'Célibataire';
    nombreEnfants: number;
};

const initialEmployees: Employee[] = [
    { id: 'emp-001', matricule: 'UNIK-076', nom: 'Dupont', prenom: 'Jean', poste: 'Développeur Senior', departement: 'IT', email: 'jean.dupont@unikorp.com', telephone: '0102030405', dateEmbauche: '2020-03-15', statut: 'Actif', contractType: 'CDI', avatarUrl: 'https://placehold.co/100x100.png', dateNaissance: '1985-05-15', statutMatrimonial: 'Marié(e)', nombreEnfants: 2 },
    { id: 'emp-002', matricule: 'UNIK-077', nom: 'Martin', prenom: 'Sophie', poste: 'Chef de projet Marketing', departement: 'MARKOS', email: 'sophie.martin@unikorp.com', telephone: '0607080910', dateEmbauche: '2021-09-01', statut: 'Actif', contractType: 'CDI', avatarUrl: 'https://placehold.co/100x100.png', dateNaissance: '1990-11-20', statutMatrimonial: 'Célibataire', nombreEnfants: 0 },
    { id: 'emp-003', matricule: 'UNIK-078', nom: 'Garcia', prenom: 'David', poste: 'Comptable', departement: 'SKOMPTAB', email: 'david.garcia@unikorp.com', telephone: '0708091011', dateEmbauche: '2022-01-20', statut: 'En congé', contractType: 'CDD', avatarUrl: 'https://placehold.co/100x100.png', dateNaissance: '1992-02-25', statutMatrimonial: 'Célibataire', nombreEnfants: 0 },
    { id: 'emp-004', matricule: 'UNIK-042', nom: 'Petit', prenom: 'Lucas', poste: 'Développeur Junior', departement: 'IT', email: 'lucas.petit@unikorp.com', telephone: '0123456789', dateEmbauche: '2023-06-10', statut: 'Actif', contractType: 'Apprentissage', avatarUrl: 'https://placehold.co/100x100.png', dateNaissance: '1998-07-30', statutMatrimonial: 'Célibataire', nombreEnfants: 0 },
    { id: 'emp-005', matricule: 'UNIK-055', nom: 'Leroy', prenom: 'Camille', poste: 'Gestionnaire RH', departement: 'SOCIX', email: 'camille.leroy@unikorp.com', telephone: '0987654321', dateEmbauche: '2019-11-05', statut: 'Actif', contractType: 'CDI', avatarUrl: 'https://placehold.co/100x100.png', dateNaissance: '1988-09-05', statutMatrimonial: 'Marié(e)', nombreEnfants: 1 },
    { id: 'emp-006', matricule: 'UNIK-012', nom: 'Moreau', prenom: 'Léa', poste: 'Responsable Logistique', departement: 'LOGSON', email: 'lea.moreau@unikorp.com', telephone: '0655443322', dateEmbauche: '2018-02-18', statut: 'Inactif', contractType: 'CDI', avatarUrl: 'https://placehold.co/100x100.png', dateNaissance: '1983-01-12', statutMatrimonial: 'Marié(e)', nombreEnfants: 3 },
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
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        matricule: true, departement: true, fonction: true, contractType: true, dateEmbauche: true, statut: true,
    });
    const [currentPage, setCurrentPage] = useState(1);
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
    
    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
    const currentEmployees = filteredEmployees.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };


    const openCreateModal = () => { setEditingEmployee(null); setIsModalOpen(true); };
    const openEditModal = (employee: Employee) => { setEditingEmployee(employee); setIsModalOpen(true); };
    const openViewModal = (employee: Employee) => { setViewingEmployee(employee); };

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

    const handleExport = (formatType: 'pdf' | 'excel') => {
        if (formatType === 'pdf') {
            const doc = new jsPDF();
            const companyName = "UNIKORP";
            const userName = "Utilisateur Unikorp";
            const moduleName = "SOCIX";
            const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
            const printDateTime = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            autoTable(doc, {
                head: [['Matricule', 'Nom Complet', 'Poste', 'Département', 'Statut']],
                body: employees.map(e => [e.matricule, `${e.prenom} ${e.nom}`, e.poste, e.departement, e.statut]),
                startY: 50,
                theme: 'striped',
                headStyles: { fillColor: '#1C2039' },
                didDrawPage: (data) => {
                    doc.setFontSize(9); doc.setTextColor(150);
                    doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
                    doc.setDrawColor(220); doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
                    doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
                    doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
                    doc.text(companyName, data.settings.margin.left + 15, 28);
                    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
                    const rightX = doc.internal.pageSize.width - data.settings.margin.right;
                    doc.text(`État : Liste des Employés`, rightX, 25, { align: 'right' });
                    doc.text(`Imprimé le : ${printDateTime}`, rightX, 30, { align: 'right' });
                    doc.text(`Par : ${userName}`, rightX, 35, { align: 'right' });
                    const pageCountTotal = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(8); doc.setTextColor(150);
                    doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left!, doc.internal.pageSize.height - 10);
                },
                margin: { top: 50 }
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
                                {visibleColumns.matricule && <TableHead className="text-center">Matricule</TableHead>}
                                {visibleColumns.departement && <TableHead className="text-center">Département</TableHead>}
                                {visibleColumns.fonction && <TableHead className="text-center">Fonction</TableHead>}
                                {visibleColumns.contractType && <TableHead className="text-center">Type contrat</TableHead>}
                                {visibleColumns.dateEmbauche && <TableHead className="text-center">Date d'embauche</TableHead>}
                                {visibleColumns.statut && <TableHead className="text-center">Statut</TableHead>}
                                <TableHead className="w-[200px] text-center">Actions</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {currentEmployees.map(e => (
                                    <TableRow key={e.id} className="odd:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar><AvatarImage src={e.avatarUrl} alt={e.nom} data-ai-hint="person face" /><AvatarFallback>{e.prenom[0]}{e.nom[0]}</AvatarFallback></Avatar>
                                                <div><p className="font-medium">{e.prenom} {e.nom}</p><p className="text-xs text-muted-foreground">{e.email}</p></div>
                                            </div>
                                        </TableCell>
                                        {visibleColumns.matricule && <TableCell className="font-mono text-xs text-center">{e.matricule}</TableCell>}
                                        {visibleColumns.departement && <TableCell className="text-center">{e.departement}</TableCell>}
                                        {visibleColumns.fonction && <TableCell className="text-center">{e.poste}</TableCell>}
                                        {visibleColumns.contractType && <TableCell className="text-center"><Badge variant="outline">{e.contractType}</Badge></TableCell>}
                                        {visibleColumns.dateEmbauche && <TableCell className="text-center">{new Date(e.dateEmbauche).toLocaleDateString('fr-FR')}</TableCell>}
                                        {visibleColumns.statut && <TableCell className="text-center"><Badge className={getStatusBadgeStyles(e.statut)}><span className={`h-2 w-2 rounded-full mr-2 ${getStatusIndicatorStyles(e.statut)}`}/>{e.statut}</Badge></TableCell>}
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => { setViewingEmployee(e); setIsContractModalOpen(true); }}><FileSignature className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => { setViewingEmployee(e); setIsDossierModalOpen(true); }}><FolderKanban className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => openViewModal(e)}><Eye className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(e)}><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setEmployeeToDelete(e)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-6">
                    <div className="text-sm text-muted-foreground">
                        Total de {filteredEmployees.length} employés. Page {currentPage} sur {totalPages}.
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Précédent</Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Suivant</Button>
                        </div>
                    )}
                </CardFooter>
            </Card>

            <EmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} employeeToEdit={editingEmployee} />
            <EmployeeProfileModal isOpen={!!viewingEmployee} onClose={() => setViewingEmployee(null)} employee={viewingEmployee} />
            <ContractModal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)} employee={viewingEmployee} />
            <DossierModal isOpen={isDossierModalOpen} onClose={() => setIsDossierModalOpen(false)} employee={viewingEmployee} />


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

function FicheIndividuellePaie() {
    // Mock data based on the image provided by the user
    const data = {
        exercice: "2024",
        salarie: "Jean Dupont",
        periode: "01/01/2024 au 31/03/2024",
        historique: [
            { no: 16, du: '01/01/24', au: '31/01/24', reglt: '31/01/24', brut: 1686000, net: 1297000 },
            { no: 36, du: '01/02/24', au: '29/02/24', reglt: '29/02/24', brut: 1686000, net: 1297000 },
            { no: 37, du: '01/03/24', au: '31/03/24', reglt: '31/03/24', brut: 1686000, net: 1297000 },
        ],
        cumuls: {
            heures: 364.02,
            jours: 52.02,
            brut: 5058000,
            salaireNet: 3891000,
            netImposable: 4111000,
            chargesSalariales: 1166000,
            chargesPatronales: 2193000,
            coutEmployeur: 7491000
        }
    };
    
    const formatCurrencyFCFA = (value: number) => `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`;

    return (
        <div className="p-2 border rounded-lg bg-background text-foreground text-xs font-sans">
            <div className="flex justify-between items-start pb-2 mb-2 border-b">
                <div>
                    <h3 className="font-bold text-sm">UNIKORP</h3>
                    <p className="text-muted-foreground text-xs">39 rue du faubourg Poissonnière 75009 Paris</p>
                </div>
                <div className="text-right">
                    <h4 className="font-bold text-base">FICHE INDIVIDUELLE</h4>
                    <p className="text-xs text-muted-foreground">Exercice : {data.exercice}</p>
                </div>
            </div>

            <div className="flex justify-between items-center py-2 text-xs">
                <p><strong>Salarié :</strong> {data.salarie}</p>
                <p><strong>Période :</strong> {data.periode}</p>
            </div>
            
            <Card className="mt-2">
                <CardHeader className="p-3 bg-muted/50 rounded-t-lg">
                    <CardTitle className="text-sm">Historique des paies</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center">N°</TableHead>
                                <TableHead className="text-center">Du</TableHead>
                                <TableHead className="text-center">Au</TableHead>
                                <TableHead className="text-right">Brut</TableHead>
                                <TableHead className="text-right">Net à payer</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.historique.map(h => (
                                <TableRow key={h.no}>
                                    <TableCell className="text-center">{h.no}</TableCell>
                                    <TableCell className="text-center">{h.du}</TableCell>
                                    <TableCell className="text-center">{h.au}</TableCell>
                                    <TableCell className="text-right">{formatCurrencyFCFA(h.brut)}</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrencyFCFA(h.net)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                             <TableRow>
                                <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrencyFCFA(data.cumuls.brut)}</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrencyFCFA(data.cumuls.salaireNet)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
            
            <Card className="mt-4">
                <CardHeader className="p-3 bg-muted/50 rounded-t-lg">
                    <CardTitle className="text-sm">Cumuls Annuels</CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-muted-foreground">Heures travaillées</span><span className="font-semibold">{data.cumuls.heures.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Jours travaillés</span><span className="font-semibold">{data.cumuls.jours}</span></div>
                    </div>
                    <div className="space-y-1">
                         <div className="flex justify-between"><span className="text-muted-foreground">Brut</span><span className="font-semibold">{formatCurrencyFCFA(data.cumuls.brut)}</span></div>
                         <div className="flex justify-between"><span className="text-muted-foreground">Net imposable</span><span className="font-semibold">{formatCurrencyFCFA(data.cumuls.netImposable)}</span></div>
                         <div className="flex justify-between font-bold text-primary"><span className="">Salaire net</span><span className="">{formatCurrencyFCFA(data.cumuls.salaireNet)}</span></div>
                         <Separator className="my-2" />
                         <div className="flex justify-between"><span className="text-muted-foreground">Charges salariales</span><span className="font-semibold">{formatCurrencyFCFA(data.cumuls.chargesSalariales)}</span></div>
                         <div className="flex justify-between"><span className="text-muted-foreground">Charges patronales</span><span className="font-semibold">{formatCurrencyFCFA(data.cumuls.chargesPatronales)}</span></div>
                          <Separator className="my-2" />
                         <div className="flex justify-between text-base"><span className="font-bold">Coût employeur total</span><span className="font-bold">{formatCurrencyFCFA(data.cumuls.coutEmployeur)}</span></div>
                    </div>
                 </CardContent>
            </Card>
        </div>
    )
}

function EmployeeProfileModal({ isOpen, onClose, employee }: { isOpen: boolean; onClose: () => void; employee: Employee | null }) {
    if (!employee) return null;

    const cvData = {
        education: [
            { year: '2018', degree: 'Master en Informatique', school: 'Université Virtuelle de Côte d\'Ivoire' },
            { year: '2016', degree: 'Licence en Génie Logiciel', school: 'Institut National Polytechnique Houphouët-Boigny' },
        ],
        experience: [
            { year: '2018-2020', position: 'Développeur Junior', company: 'Tech Solutions Abidjan' },
        ]
    };
    const careerData = [
        { date: '2020-03-15', event: `Embauche en tant que Développeur` },
        { date: '2022-04-01', event: `Promotion au poste de ${employee.poste}` },
    ];
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-2xl">Fiche Employé</DialogTitle>
                </DialogHeader>
                <div className="flex-1 grid md:grid-cols-3 gap-6 overflow-y-auto px-6 pb-6">
                    {/* Left Column */}
                    <div className="md:col-span-1 flex flex-col items-center text-center space-y-4 pt-4">
                        <Avatar className="h-28 w-28 border-4 border-primary/10">
                            <AvatarImage src={employee.avatarUrl} alt={employee.nom} data-ai-hint="person face" />
                            <AvatarFallback className="text-3xl">{employee.prenom[0]}{employee.nom[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-bold">{employee.prenom} {employee.nom}</h2>
                            <p className="text-primary">{employee.poste}</p>
                            <Badge className={`mt-2 ${getStatusBadgeStyles(employee.statut)}`}>
                                <span className={`h-2 w-2 rounded-full mr-2 ${getStatusIndicatorStyles(employee.statut)}`}/>
                                {employee.statut}
                            </Badge>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="md:col-span-2">
                        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Informations Professionnelles</AccordionTrigger>
                                <AccordionContent className="space-y-2 text-sm">
                                    <p><strong>Département :</strong> {employee.departement}</p>
                                    <p><strong>Type de contrat :</strong> {employee.contractType}</p>
                                    <p><strong>Date d'embauche :</strong> {new Date(employee.dateEmbauche).toLocaleDateString('fr-FR')}</p>
                                    <p><strong>Matricule :</strong> {employee.matricule}</p>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Informations Personnelles</AccordionTrigger>
                                <AccordionContent className="space-y-2 text-sm">
                                     <p><strong>Email :</strong> {employee.email}</p>
                                    <p><strong>Téléphone :</strong> {employee.telephone}</p>
                                    <p><strong>Date de naissance :</strong> {new Date(employee.dateNaissance).toLocaleDateString('fr-FR')}</p>
                                    <p><strong>Statut matrimonial :</strong> {employee.statutMatrimonial}</p>
                                    <p><strong>Nombre d'enfants :</strong> {employee.nombreEnfants}</p>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger>Mini CV</AccordionTrigger>
                                <AccordionContent className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2"><GraduationCap className="h-4 w-4"/>Formation</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {cvData.education.map(edu => <li key={edu.year}><strong>{edu.year}:</strong> {edu.degree}, <em>{edu.school}</em></li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Briefcase className="h-4 w-4"/>Expérience</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {cvData.experience.map(exp => <li key={exp.year}><strong>{exp.year}:</strong> {exp.position} chez <em>{exp.company}</em></li>)}
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-4">
                                <AccordionTrigger>Évolution de Carrière</AccordionTrigger>
                                <AccordionContent className="space-y-3 text-sm">
                                    {careerData.map((item, index) => (
                                        <div key={item.date} className="flex items-center gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="h-3 w-3 rounded-full bg-primary" />
                                                {index < careerData.length - 1 && <div className="w-px h-8 bg-border" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{new Date(item.date).toLocaleDateString('fr-FR')}</p>
                                                <p className="text-muted-foreground">{item.event}</p>
                                            </div>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5">
                                <AccordionTrigger className="flex items-center gap-2"><FileText className="h-4 w-4"/>Fiche Individuelle (Paie)</AccordionTrigger>
                                <AccordionContent className="p-1">
                                    <FicheIndividuellePaie />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
                <DialogFooter className="p-6 border-t">
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ContractModal({ isOpen, onClose, employee }: { isOpen: boolean; onClose: () => void; employee: Employee | null }) {
    if (!employee) return null;

    const { toast } = useToast();

    const mockContractData = {
        ENTREPRISE_NOM: 'UNIKORP',
        ENTREPRISE_FORME: 'SAS',
        ENTREPRISE_ADRESSE: '123 Avenue Unikorp, Abidjan, Côte d\'Ivoire',
        ENTREPRISE_SIRET: 'CI-ABJ-2024-B-12345',
        ENTREPRISE_APE: '6201Z',
        REPRESENTANT_NOM: 'Elodie Dubois',
        REPRESENTANT_FONCTION: 'Présidente Directrice Générale',
        EMPLOYE_NOM: employee.nom.toUpperCase(),
        EMPLOYE_PRENOM: employee.prenom,
        EMPLOYE_DATE_NAISSANCE: new Date(employee.dateNaissance).toLocaleDateString('fr-FR'),
        EMPLOYE_LIEU_NAISSANCE: 'Abidjan',
        EMPLOYE_ADRESSE: '456 Rue Imaginaire, Cocody',
        EMPLOYE_NUM_SECU: '1 85 05 99 123 456 78',
        EMPLOYE_NATIONALITE: 'Ivoirienne',
        TYPE_CONTRAT: employee.contractType,
        CONVENTION_COLLECTIVE: 'Convention Collective Interprofessionnelle',
        SI_CDD: employee.contractType === 'CDD',
        DATE_DEBUT: new Date(employee.dateEmbauche).toLocaleDateString('fr-FR'),
        DATE_FIN: employee.contractType === 'CDD' ? '31/12/2024' : '',
        MOTIF_CDD: 'Accroissement temporaire d\'activité',
        SI_PERIODE_ESSAI: true,
        DUREE_ESSAI: '3 mois',
        DUREE_RENOUVELLEMENT_ESSAI: '3 mois',
        FONCTION: employee.poste,
        QUALIFICATION_PROFESSIONNELLE: 'Cadre',
        CLASSIFICATION: 'Catégorie 12',
        COEFFICIENT: '450',
        SUPERIEUR_HIERARCHIQUE: 'Directeur du département',
        LIEU_TRAVAIL: 'Siège social, Abidjan',
        SI_DEPLACEMENT: true,
        ZONE_DEPLACEMENT: 'sur le territoire national et international',
        HORAIRES_TRAVAIL: '9h00-12h30 et 14h00-18h00',
        DUREE_HEBDOMADAIRE: '40',
        JOURS_REPOS: 'Samedi et Dimanche',
        SI_TEMPS_PARTIEL: false,
        NOMBRE_HEURES_PARTIEL: '',
        REPARTITION_HORAIRES: '',
        SALAIRE_BASE: (350000).toLocaleString('fr-FR'),
        PERIODICITE_SALAIRE: 'mensuel',
        SI_PRIMES: true,
        LISTE_PRIMES: 'Prime de transport, prime de panier',
        SI_AVANTAGES_NATURE: false,
        LISTE_AVANTAGES: '',
        DATE_VERSEMENT: 'dernier jour ouvré',
        MODE_PAIEMENT: 'virement bancaire',
        NOMBRE_JOURS_CONGES: '30',
        PERIODE_CONGES: 'du 1er janvier au 31 décembre',
        SI_FORMATION_INITIALE: false,
        DUREE_FORMATION: '',
        OBLIGATIONS_SUPPLEMENTAIRES: "Respecter la charte informatique de l'entreprise",
        SI_NON_CONCURRENCE: false,
        DUREE_NON_CONCURRENCE: '',
        SECTEURS_CONCERNES: '',
        ZONE_NON_CONCURRENCE: '',
        MONTANT_CONTREPARTIE: '',
        SI_CDI: employee.contractType === 'CDI',
        DUREE_PREAVIS: '3 mois',
        LIEU_SIGNATURE: 'Abidjan',
        DATE_SIGNATURE: new Date().toLocaleDateString('fr-FR'),
        SIGNATURE_EMPLOYEUR: 'Elodie Dubois',
        SIGNATURE_EMPLOYE: `${employee.prenom} ${employee.nom}`,
        DATE_REMISE: new Date().toLocaleDateString('fr-FR'),
        DATE_DPAE: new Date(employee.dateEmbauche).toLocaleDateString('fr-FR'),
        DATE_VISITE_MEDICALE: 'À programmer',
    };

    const handlePrint = () => {
        const doc = new jsPDF();
        let y = 15;
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const pageContentWidth = doc.internal.pageSize.getWidth() - margin * 2;
    
        const companyName = "UNIKORP";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SOCIX";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const printDateTime = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const drawHeader = () => {
            doc.setFontSize(9); doc.setTextColor(150);
            doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, margin, 15);
            doc.setDrawColor(220); doc.line(margin, 18, doc.internal.pageSize.width - margin, 18);
            doc.addImage(logoDataUri, 'PNG', margin, 22, 12, 12);
            doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
            doc.text(companyName, margin + 15, 28);
            doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
            const rightX = doc.internal.pageSize.width - margin;
            doc.text(`Document : Contrat de travail`, rightX, 25, { align: 'right' });
            doc.text(`Employé : ${employee.prenom} ${employee.nom}`, rightX, 30, { align: 'right' });
            doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
            y = 50; // Reset Y position for content after header
        }

        drawHeader();

        const addText = (text: string, options: any = {}) => {
            const splitText = doc.splitTextToSize(text, pageContentWidth);
            const textHeight = doc.getTextDimensions(splitText).h;
            if (y + textHeight > pageHeight - margin) {
                doc.addPage();
                drawHeader();
            }
            doc.text(splitText, margin, y, options);
            y += textHeight + 4;
        };

        const addTitle = (text: string) => {
            doc.setFontSize(14).setFont('helvetica', 'bold');
            addText(text);
            doc.setFontSize(10).setFont('helvetica', 'normal');
        };

        const addSubtitle = (text: string) => {
            doc.setFontSize(11).setFont('helvetica', 'bold');
            addText(text);
            doc.setFontSize(10).setFont('helvetica', 'normal');
        };
        
        doc.setFont('times', 'normal');
        doc.setFontSize(18);
        doc.text('CONTRAT DE TRAVAIL', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
        y += 10;
        
        addSubtitle('Entre les soussignés :');
        addText(`L'EMPLOYEUR :\n- Dénomination sociale : ${mockContractData.ENTREPRISE_NOM}\n- Adresse : ${mockContractData.ENTREPRISE_ADRESSE}\n- Représenté par : ${mockContractData.REPRESENTANT_NOM}, ${mockContractData.REPRESENTANT_FONCTION}`);
        
        addText(`L'EMPLOYÉ :\n- Nom : ${mockContractData.EMPLOYE_NOM}\n- Prénom : ${mockContractData.EMPLOYE_PRENOM}\n- Date de naissance : ${mockContractData.EMPLOYE_DATE_NAISSANCE}\n- Adresse : ${mockContractData.EMPLOYE_ADRESSE}\n- Numéro de sécurité sociale : ${mockContractData.EMPLOYE_NUM_SECU}`);
        
        y += 5;
        doc.setDrawColor(200);
        doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
        y += 10;

        addTitle('ARTICLE 1 - NATURE DU CONTRAT');
        addText(`Il est conclu entre les parties un contrat de travail à durée ${mockContractData.TYPE_CONTRAT} sous le régime de la convention collective ${mockContractData.CONVENTION_COLLECTIVE}.`);
        if (mockContractData.SI_CDD) addText(`Durée du contrat : Du ${mockContractData.DATE_DEBUT} au ${mockContractData.DATE_FIN}.\nMotif de recours : ${mockContractData.MOTIF_CDD}`);
        if (mockContractData.SI_PERIODE_ESSAI) addText(`Période d'essai : ${mockContractData.DUREE_ESSAI} renouvelable une fois pour une durée de ${mockContractData.DUREE_RENOUVELLEMENT_ESSAI}.`);

        addTitle('ARTICLE 2 - FONCTION ET QUALIFICATION');
        addText(`Le salarié est engagé en qualité de ${mockContractData.FONCTION} - ${mockContractData.QUALIFICATION_PROFESSIONNELLE}.`);
        
        addTitle('ARTICLE 3 - LIEU DE TRAVAIL');
        addText(`Le salarié exercera ses fonctions à l'adresse suivante : ${mockContractData.LIEU_TRAVAIL}.`);
        
        addTitle('ARTICLE 4 - HORAIRES ET DURÉE DU TRAVAIL');
        addText(`La durée hebdomadaire du travail est de ${mockContractData.DUREE_HEBDOMADAIRE} heures.`);
        
        addTitle('ARTICLE 5 - RÉMUNÉRATION');
        addText(`Le salaire de base est fixé à ${mockContractData.SALAIRE_BASE} € ${mockContractData.PERIODICITE_SALAIRE}.`);
        
        addTitle('ARTICLE 6 - CONGÉS PAYÉS');
        addText(`Le salarié bénéficie de ${mockContractData.NOMBRE_JOURS_CONGES} jours ouvrables de congés payés par an.`);
        
        addTitle('ARTICLE 7 - FORMATION PROFESSIONNELLE');
        addText(`Le salarié bénéficie des dispositions légales et conventionnelles en matière de formation professionnelle.`);

        addTitle('ARTICLE 8 - OBLIGATIONS DU SALARIÉ');
        addText(`Le salarié s'engage à respecter le règlement intérieur de l'entreprise, à faire preuve de loyauté et à ne pas divulguer d'informations confidentielles.`);
        
        addTitle('ARTICLE 9 - CONFIDENTIALITÉ');
        addText(`Le salarié s'engage à observer la plus stricte confidentialité sur toutes les informations dont il aura connaissance dans l'exercice de ses fonctions. Cette obligation subsiste après la rupture du contrat de travail.`);
        
        addTitle('ARTICLE 10 - CLAUSE DE NON-CONCURRENCE');
        addText(`Non applicable.`);

        addTitle('ARTICLE 11 - RUPTURE DU CONTRAT');
        addText(`Le contrat peut être rompu par l'une ou l'autre des parties sous réserve du respect des dispositions légales en matière de préavis et d'indemnités.`);
        
        addTitle('ARTICLE 12 - DISPOSITIONS DIVERSES');
        addText(`Toute modification du présent contrat devra faire l'objet d'un avenant écrit signé par les deux parties.`);

        y += 15;
        addText(`Fait à ${mockContractData.LIEU_SIGNATURE}, le ${mockContractData.DATE_SIGNATURE}, en deux exemplaires.`);
        y += 15;
        doc.text("L'EMPLOYEUR", margin, y);
        doc.text("L'EMPLOYÉ", doc.internal.pageSize.getWidth() / 2 + margin, y);
        
        doc.save(`contrat_${employee.nom}.pdf`);
        toast({ title: 'PDF du contrat généré.' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Aperçu du Contrat de Travail</DialogTitle>
                    <DialogDescription>Contrat pour {employee.prenom} {employee.nom}.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 p-6 border rounded-lg bg-muted/50 font-serif text-sm">
                    <div className="bg-white p-8 max-w-3xl mx-auto shadow-lg">
                        <h1 className="text-2xl font-bold text-center mb-6">CONTRAT DE TRAVAIL</h1>
                        <h2 className="font-bold mb-2">Entre les soussignés :</h2>
                        <div className="mb-4 pl-4">
                            <h3 className="font-semibold">L'EMPLOYEUR :</h3>
                            <p>Dénomination sociale : {mockContractData.ENTREPRISE_NOM}</p>
                            <p>Adresse du siège social : {mockContractData.ENTREPRISE_ADRESSE}</p>
                            <p>Représenté par : {mockContractData.REPRESENTANT_NOM}, {mockContractData.REPRESENTANT_FONCTION}</p>
                        </div>
                        <div className="mb-4 pl-4">
                            <h3 className="font-semibold">L'EMPLOYÉ :</h3>
                            <p>Nom : {mockContractData.EMPLOYE_NOM}</p>
                            <p>Prénom : {mockContractData.EMPLOYE_PRENOM}</p>
                            <p>Date de naissance : {mockContractData.EMPLOYE_DATE_NAISSANCE}</p>
                            <p>Adresse : {mockContractData.EMPLOYE_ADRESSE}</p>
                        </div>
                        <Separator className="my-6" />
                        <div className="space-y-4">
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 1 - NATURE DU CONTRAT</h3><p>Il est conclu entre les parties un contrat de travail à durée {mockContractData.TYPE_CONTRAT} sous le régime de la convention collective {mockContractData.CONVENTION_COLLECTIVE}.</p>{mockContractData.SI_CDD && <p className="mt-2"><strong>Durée du contrat :</strong> Du {mockContractData.DATE_DEBUT} au {mockContractData.DATE_FIN}</p>}</div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 2 - FONCTION ET QUALIFICATION</h3><p>Le salarié est engagé en qualité de {mockContractData.FONCTION} - {mockContractData.QUALIFICATION_PROFESSIONNELLE}.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 3 - LIEU DE TRAVAIL</h3><p>Le salarié exercera ses fonctions à l'adresse suivante : {mockContractData.LIEU_TRAVAIL}.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 4 - HORAIRES ET DURÉE DU TRAVAIL</h3><p>La durée hebdomadaire du travail est de {mockContractData.DUREE_HEBDOMADAIRE} heures.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 5 - RÉMUNÉRATION</h3><p>Le salaire de base est fixé à {mockContractData.SALAIRE_BASE} € {mockContractData.PERIODICITE_SALAIRE}.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 6 - CONGÉS PAYÉS</h3><p>Le salarié bénéficie de {mockContractData.NOMBRE_JOURS_CONGES} jours ouvrables de congés payés par an.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 7 - FORMATION PROFESSIONNELLE</h3><p>Le salarié bénéficie des dispositions légales et conventionnelles en matière de formation professionnelle.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 8 - OBLIGATIONS DU SALARIÉ</h3><p>Le salarié s'engage à respecter le règlement intérieur de l'entreprise, à faire preuve de loyauté et à ne pas divulguer d'informations confidentielles.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 9 - CONFIDENTIALITÉ</h3><p>Le salarié s'engage à observer la plus stricte confidentialité sur toutes les informations dont il aura connaissance dans l'exercice de ses fonctions. Cette obligation subsiste après la rupture du contrat de travail.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 10 - CLAUSE DE NON-CONCURRENCE</h3><p>Non applicable.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 11 - RUPTURE DU CONTRAT</h3><p>Le contrat peut être rompu par l'une ou l'autre des parties sous réserve du respect des dispositions légales en matière de préavis et d'indemnités.</p></div>
                            <div><h3 className="text-lg font-bold mb-1">ARTICLE 12 - DISPOSITIONS DIVERSES</h3><p>Toute modification du présent contrat devra faire l'objet d'un avenant écrit signé par les deux parties.</p></div>
                        </div>
                         <Separator className="my-6" />
                         <div className="mt-12 text-center">
                            <p>Fait à {mockContractData.LIEU_SIGNATURE}, le {mockContractData.DATE_SIGNATURE}, en deux exemplaires.</p>
                            <div className="flex justify-around mt-12 pt-8">
                                <div><p className="border-t pt-2">L'EMPLOYEUR</p><p>({mockContractData.SIGNATURE_EMPLOYEUR})</p></div>
                                <div><p className="border-t pt-2">L'EMPLOYÉ</p><p>({mockContractData.SIGNATURE_EMPLOYE})</p></div>
                            </div>
                        </div>
                        <Separator className="my-6" />
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p><em>Exemplaire remis au salarié le : {mockContractData.DATE_REMISE}</em></p>
                            <p><em>Déclaration préalable à l'embauche effectuée le : {mockContractData.DATE_DPAE}</em></p>
                            <p><em>Visite médicale d'embauche : {mockContractData.DATE_VISITE_MEDICALE}</em></p>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4"/>Imprimer le contrat</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DossierModal({ isOpen, onClose, employee }: { isOpen: boolean; onClose: () => void; employee: Employee | null }) {
    if (!employee) return null;

    const documents = [
        { category: 'Personnel', name: 'Pièce d\'identité', status: 'Reçu' },
        { category: 'Personnel', name: 'Photo d\'identité', status: 'Manquant' },
        { category: 'Contrat', name: 'Contrat de travail signé', status: 'Reçu' },
        { category: 'Administratif', name: 'RIB', status: 'Reçu' },
        { category: 'Administratif', name: 'Attestation sécurité sociale', status: 'En attente' },
    ];

    const groupedDocs = documents.reduce((acc, doc) => {
        (acc[doc.category] = acc[doc.category] || []).push(doc);
        return acc;
    }, {} as Record<string, typeof documents>);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Dossier Administratif</DialogTitle>
                    <DialogDescription>Documents pour {employee.prenom} {employee.nom}.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     <Accordion type="multiple" defaultValue={['Personnel']} className="w-full">
                        {Object.entries(groupedDocs).map(([category, docs]) => (
                             <AccordionItem value={category} key={category}>
                                <AccordionTrigger>{category}</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2">
                                        {docs.map(doc => (
                                            <li key={doc.name} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted/50">
                                                <span>{doc.name}</span>
                                                <Badge variant={doc.status === 'Reçu' ? 'default' : doc.status === 'Manquant' ? 'destructive' : 'secondary'}>{doc.status}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function EmployesPage() {
    return (
        <EmployesMainContent />
    )
}
