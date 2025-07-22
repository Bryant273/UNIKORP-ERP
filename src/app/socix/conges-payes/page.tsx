
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, CalendarOff, Hourglass, Plane } from 'lucide-react';
import { format } from 'date-fns';

type LeaveBalance = {
    id: string;
    employeeName: string;
    soldeAnterieur: number;
    acquisAnnee: number;
    prisAnnee: number;
    soldeFinal: number;
};

const MOCK_LEAVE_BALANCES: LeaveBalance[] = [
    { id: 'emp-001', employeeName: 'Jean Dupont', soldeAnterieur: 5, acquisAnnee: 25, prisAnnee: 10, soldeFinal: 20 },
    { id: 'emp-002', employeeName: 'Sophie Martin', soldeAnterieur: 2, acquisAnnee: 25, prisAnnee: 15, soldeFinal: 12 },
    { id: 'emp-004', employeeName: 'Lucas Petit', soldeAnterieur: 0, acquisAnnee: 25, prisAnnee: 5, soldeFinal: 20 },
    { id: 'emp-005', employeeName: 'Camille Leroy', soldeAnterieur: 10, acquisAnnee: 25, prisAnnee: 20, soldeFinal: 15 },
];

const ITEMS_PER_PAGE = 10;

export default function CongesPayesPage() {
    const { toast } = useToast();
    const [balances, setBalances] = useState(MOCK_LEAVE_BALANCES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = Math.ceil(balances.length / ITEMS_PER_PAGE);
    const paginatedBalances = balances.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
        }
    };
    
    const handleDeclareAbsence = () => {
        setIsModalOpen(true);
    };

    const handleSubmitAbsence = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: 'Demande enregistrée', description: 'La demande d\'absence a été soumise pour validation.' });
        setIsModalOpen(false);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><Plane /> Gestion des Congés & Absences</CardTitle>
                            <CardDescription>Suivez les soldes de congés, les absences et gérez les demandes.</CardDescription>
                        </div>
                        <Button onClick={handleDeclareAbsence}><PlusCircle className="mr-2 h-4 w-4" /> Déclarer une absence</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 mb-6">
                        <Card><CardHeader className="pb-2"><CardDescription>Solde Moyen de Congés</CardDescription><CardTitle className="text-3xl">16.75 jours</CardTitle></CardHeader></Card>
                        <Card><CardHeader className="pb-2"><CardDescription>Demandes en Attente</CardDescription><CardTitle className="text-3xl">3</CardTitle></CardHeader></Card>
                        <Card><CardHeader className="pb-2"><CardDescription>Prochains Départs en Congé</CardDescription><CardTitle className="text-3xl">2</CardTitle></CardHeader></Card>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Soldes des Congés Payés</h3>
                    <Table>
                        <TableHeader><TableRow><TableHead>Employé</TableHead><TableHead className="text-center">Solde N-1</TableHead><TableHead className="text-center">Acquis N</TableHead><TableHead className="text-center">Pris N</TableHead><TableHead className="text-center font-bold">Solde Final</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {paginatedBalances.map(b => (
                                <TableRow key={b.id} className="odd:bg-muted/50">
                                    <TableCell className="font-medium">{b.employeeName}</TableCell>
                                    <TableCell className="text-center">{b.soldeAnterieur}</TableCell>
                                    <TableCell className="text-center text-green-600">{b.acquisAnnee}</TableCell>
                                    <TableCell className="text-center text-red-600">{b.prisAnnee}</TableCell>
                                    <TableCell className="text-center font-bold text-primary">{b.soldeFinal}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 {totalPages > 1 && (
                    <CardFooter className="flex justify-between items-center pt-6">
                         <div className="text-sm text-muted-foreground">
                            Total de {balances.length} employés. Page {currentPage} sur {totalPages}.
                        </div>
                        <div className="flex items-center gap-2">
                             <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Suivant
                            </Button>
                        </div>
                    </CardFooter>
                 )}
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmitAbsence}>
                        <DialogHeader><DialogTitle>Déclarer une absence ou un congé</DialogTitle><DialogDescription>Remplissez le formulaire ci-dessous.</DialogDescription></DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2"><Label htmlFor="employee">Employé</Label><Select name="employee"><SelectTrigger><SelectValue placeholder="Sélectionnez un employé..." /></SelectTrigger><SelectContent>{balances.map(b => <SelectItem key={b.id} value={b.id}>{b.employeeName}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="type">Type d'absence</Label><Select name="type"><SelectTrigger><SelectValue placeholder="Sélectionnez un type..." /></SelectTrigger><SelectContent><SelectItem value="cp">Congé Payé</SelectItem><SelectItem value="maladie">Arrêt Maladie</SelectItem><SelectItem value="cs">Congé Sans Solde</SelectItem><SelectItem value="autre">Autre</SelectItem></SelectContent></Select></div>
                            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="dateDebut">Date de début</Label><Input type="date" id="dateDebut"/></div><div className="space-y-2"><Label htmlFor="dateFin">Date de fin</Label><Input type="date" id="dateFin"/></div></div>
                        </div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button><Button type="submit">Soumettre</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
