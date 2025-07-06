
'use client';

import React, { useState } from 'react';
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
import { PlusCircle, FileText, FileSymlink, Repeat, Send, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// --- TYPES & MOCK DATA ---
type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Apprentissage';
type ContractStatus = 'Actif' | 'Expiré' | 'Terminé' | 'En attente';
type Contract = {
    id: string;
    employeeName: string;
    employeeId: string;
    contractType: ContractType;
    startDate: string;
    endDate?: string;
    position: string;
    salary: number;
    status: ContractStatus;
};

const initialContracts: Contract[] = [
    { id: 'c-001', employeeName: 'Jean Dupont', employeeId: 'emp-001', contractType: 'CDI', startDate: '2020-03-15', position: 'Développeur Senior', salary: 350000, status: 'Actif' },
    { id: 'c-002', employeeName: 'Sophie Martin', employeeId: 'emp-002', contractType: 'CDI', startDate: '2021-09-01', position: 'Chef de projet Marketing', salary: 320000, status: 'Actif' },
    { id: 'c-003', employeeName: 'David Garcia', employeeId: 'emp-003', contractType: 'CDD', startDate: '2024-01-20', endDate: '2024-07-19', position: 'Comptable', salary: 280000, status: 'Expiré' },
    { id: 'c-004', employeeName: 'Lucas Petit', employeeId: 'emp-004', contractType: 'Apprentissage', startDate: '2023-09-01', endDate: '2025-08-31', position: 'Développeur Apprenti', salary: 120000, status: 'Actif' },
    { id: 'c-005', employeeName: 'Léa Moreau', employeeId: 'emp-006', contractType: 'CDI', startDate: '2018-02-18', position: 'Responsable Logistique', salary: 400000, status: 'Terminé' },
];

const mockEmployees = [
    { id: 'emp-001', name: 'Jean Dupont' },
    { id: 'emp-002', name: 'Sophie Martin' },
    { id: 'emp-003', name: 'David Garcia' },
    { id: 'emp-004', name: 'Lucas Petit' },
];

function ContratsContent() {
    const [contracts, setContracts] = useState(initialContracts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ title: string; contract: Partial<Contract> | null }>({ title: '', contract: null });
    const { toast } = useToast();

    const openModal = (title: string, contract: Partial<Contract> | null) => {
        setModalConfig({ title, contract });
        setIsModalOpen(true);
    };

    const handleSave = (formData: Contract) => {
        if (modalConfig.contract?.id) {
            setContracts(prev => prev.map(c => c.id === modalConfig.contract!.id ? { ...c, ...formData } : c));
            toast({ title: 'Contrat modifié' });
        } else {
            const newContract: Contract = {
                ...formData,
                id: `c-${Date.now()}`,
                status: 'En attente'
            };
            setContracts(prev => [newContract, ...prev]);
            toast({ title: 'Nouveau contrat créé' });
        }
        setIsModalOpen(false);
    };

    const generatePdf = (contract: Contract) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Contrat de Travail - ${contract.contractType}`, 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Employé: ${contract.employeeName}`, 14, 40);
        doc.text(`Poste: ${contract.position}`, 14, 48);
        doc.text(`Date de début: ${format(new Date(contract.startDate), 'dd/MM/yyyy')}`, 14, 56);
        if(contract.endDate) doc.text(`Date de fin: ${format(new Date(contract.endDate), 'dd/MM/yyyy')}`, 14, 64);
        doc.text(`Salaire: ${contract.salary.toLocaleString('fr-FR')} FCFA`, 14, 72);
        doc.text("...", 14, 90);
        doc.save(`contrat_${contract.employeeName.replace(/\s/g, '_')}.pdf`);
        toast({ title: 'PDF du contrat généré.' });
    };

    const getStatusBadgeVariant = (status: ContractStatus) => {
        switch (status) {
            case 'Actif': return 'default';
            case 'Expiré': return 'destructive';
            case 'Terminé': return 'secondary';
            case 'En attente': return 'outline';
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Gestion des Contrats</CardTitle>
                            <CardDescription>Gérez les contrats de travail de vos employés.</CardDescription>
                        </div>
                        <Button onClick={() => openModal('Nouveau Contrat', null)}><PlusCircle className="mr-2 h-4 w-4" /> Nouveau contrat</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Employé</TableHead><TableHead>Type</TableHead><TableHead>Début</TableHead><TableHead>Fin</TableHead><TableHead className="text-center">Statut</TableHead><TableHead className="text-center w-[200px]">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {contracts.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.employeeName}</TableCell>
                                    <TableCell>{c.contractType}</TableCell>
                                    <TableCell>{format(new Date(c.startDate), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{c.endDate ? format(new Date(c.endDate), 'dd/MM/yyyy') : '---'}</TableCell>
                                    <TableCell className="text-center"><Badge variant={getStatusBadgeVariant(c.status)}>{c.status}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => generatePdf(c)}><Download className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => openModal('Créer un avenant', c)}><FileSymlink className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => openModal('Renouveler le contrat', c)}><Repeat className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => toast({title: 'Fonctionnalité à venir'})}><Send className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <ContractModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} config={modalConfig} />
        </>
    );
}

function ContractModal({ isOpen, onClose, onSave, config }: { isOpen: boolean, onClose: () => void, onSave: (data: any) => void, config: { title: string, contract: Partial<Contract> | null } }) {
    const [formData, setFormData] = useState<Partial<Contract>>({});

    useEffect(() => {
        setFormData(config.contract || {});
    }, [config, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSelectChange = (id: keyof Contract, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isCdd = formData.contractType === 'CDD' || formData.contractType === 'Stage' || formData.contractType === 'Apprentissage';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl"><form onSubmit={handleSubmit}><DialogHeader><DialogTitle>{config.title}</DialogTitle></DialogHeader><div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="employeeId">Employé</Label><Select name="employeeId" value={formData.employeeId} onValueChange={v => handleSelectChange('employeeId', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{mockEmployees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="contractType">Type de contrat</Label><Select name="contractType" value={formData.contractType} onValueChange={v => handleSelectChange('contractType', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="CDI">CDI</SelectItem><SelectItem value="CDD">CDD</SelectItem><SelectItem value="Stage">Stage</SelectItem><SelectItem value="Apprentissage">Apprentissage</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="position">Poste occupé</Label><Input id="position" value={formData.position || ''} onChange={handleChange} /></div>
                <div className="space-y-2"><Label htmlFor="salary">Salaire brut mensuel</Label><Input id="salary" type="number" value={formData.salary || ''} onChange={handleChange} /></div>
                <div className="space-y-2"><Label htmlFor="startDate">Date de début</Label><Input id="startDate" type="date" value={formData.startDate || ''} onChange={handleChange} /></div>
                {isCdd && <div className="space-y-2"><Label htmlFor="endDate">Date de fin</Label><Input id="endDate" type="date" value={formData.endDate || ''} onChange={handleChange} /></div>}
            </div><DialogFooter><Button type="button" variant="outline" onClick={onClose}>Annuler</Button><Button type="submit">Enregistrer</Button></DialogFooter></form></DialogContent>
        </Dialog>
    );
}

export default function ContratsPage() {
    return <ContratsContent />;
}
