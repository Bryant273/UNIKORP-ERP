
'use client';

import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Archive, Check, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { requestsAtom, type DemoRequest } from '@/lib/store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function RequestsPage() {
    const [requests, setRequests] = useAtom(requestsAtom);
    const { toast } = useToast();

    const handleStatusChange = (id: string, newStatus: DemoRequest['status']) => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
        toast({ title: 'Statut de la requête mis à jour.' });
    };

    const getStatusBadge = (status: DemoRequest['status']) => {
        switch (status) {
            case 'Nouvelle': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600"><Clock className="mr-1 h-3 w-3" />Nouvelle</Badge>;
            case 'Contacté': return <Badge variant="secondary" className="bg-green-100 text-green-800"><Check className="mr-1 h-3 w-3" />Contacté</Badge>;
            case 'Archivée': return <Badge variant="outline">Archivée</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Requêtes Commerciales</CardTitle>
                <CardDescription>Liste des demandes de démo et de contact reçues depuis la page de présentation.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Nom</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Entreprise</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead className="text-center">Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length > 0 ? requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>{format(new Date(req.requestDate), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                                <TableCell className="font-medium">{req.fullName}</TableCell>
                                <TableCell>{req.email}</TableCell>
                                <TableCell>{req.companyName}</TableCell>
                                <TableCell>{req.phone || 'N/A'}</TableCell>
                                <TableCell className="text-center">{getStatusBadge(req.status)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'Contacté')} disabled={req.status === 'Contacté'}>
                                                <Check className="mr-2 h-4 w-4" /> Marquer comme Contacté
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'Archivée')} disabled={req.status === 'Archivée'}>
                                                <Archive className="mr-2 h-4 w-4" /> Archiver
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={7} className="h-24 text-center">Aucune requête pour le moment.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
