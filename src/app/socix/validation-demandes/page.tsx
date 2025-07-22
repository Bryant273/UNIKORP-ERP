
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock } from 'lucide-react';

type RequestStatus = 'En attente' | 'Approuvée' | 'Refusée';
type LeaveRequest = {
    id: string;
    employeeName: string;
    employeeAvatar: string;
    type: string;
    startDate: string;
    endDate: string;
    duration: string;
    reason: string;
    status: RequestStatus;
};

const initialRequests: LeaveRequest[] = [
    { id: 'req-1', employeeName: 'Jean Dupont', employeeAvatar: 'https://placehold.co/100x100.png', type: 'Congé Payé', startDate: '01/09/2024', endDate: '15/09/2024', duration: '10 jours', reason: 'Vacances annuelles en famille.', status: 'En attente' },
    { id: 'req-2', employeeName: 'Camille Leroy', employeeAvatar: 'https://placehold.co/100x100.png', type: 'Absence exceptionnelle', startDate: '20/08/2024', endDate: '20/08/2024', duration: '1 jour', reason: 'Rendez-vous administratif important.', status: 'En attente' },
    { id: 'req-3', employeeName: 'Lucas Petit', employeeAvatar: 'https://placehold.co/100x100.png', type: 'Congé Payé', startDate: '18/07/2024', endDate: '25/07/2024', duration: '6 jours', reason: 'Voyage personnel', status: 'Approuvée' },
    { id: 'req-4', employeeName: 'Sophie Martin', employeeAvatar: 'https://placehold.co/100x100.png', type: 'Télétravail', startDate: '15/07/2024', endDate: '15/07/2024', duration: '1 jour', reason: 'Réception d\'un colis important.', status: 'Refusée' },
];

export default function ValidationDemandesPage() {
    const { toast } = useToast();
    const [requests, setRequests] = useState(initialRequests);
    
    const handleRequestAction = (id: string, newStatus: 'Approuvée' | 'Refusée') => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        toast({ title: `Demande ${newStatus.toLowerCase()}`, description: `La demande de ${requests.find(r=>r.id===id)?.employeeName} a été ${newStatus.toLowerCase()}.` });
    };

    const renderRequestList = (status: RequestStatus) => {
        const filteredRequests = requests.filter(r => r.status === status);
        if (filteredRequests.length === 0) {
            return <div className="text-center py-16 border-2 border-dashed rounded-lg"><p className="text-muted-foreground">Aucune demande dans cette catégorie.</p></div>;
        }
        return (
            <div className="space-y-4">
                {filteredRequests.map(req => (
                    <Card key={req.id}>
                        <CardContent className="p-4 flex items-start gap-4">
                            <Avatar className="h-12 w-12"><AvatarImage src={req.employeeAvatar} data-ai-hint="person face" /><AvatarFallback>{req.employeeName.charAt(0)}</AvatarFallback></Avatar>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{req.employeeName} <span className="text-muted-foreground font-normal">a demandé un(e)</span></p>
                                        <p><Badge>{req.type}</Badge> du <span className="font-medium">{req.startDate}</span> au <span className="font-medium">{req.endDate}</span> ({req.duration})</p>
                                    </div>
                                    {req.status === 'En attente' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleRequestAction(req.id, 'Refusée')}><X className="mr-2 h-4 w-4"/>Refuser</Button>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRequestAction(req.id, 'Approuvée')}><Check className="mr-2 h-4 w-4"/>Approuver</Button>
                                        </div>
                                    )}
                                </div>
                                {req.reason && <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded-md">Motif: "{req.reason}"</p>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Validation des Demandes</CardTitle>
                <CardDescription>Approuvez ou refusez les demandes de congés et d'absences de vos collaborateurs.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="pending">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending"><Clock className="mr-2 h-4 w-4"/> En attente ({requests.filter(r => r.status === 'En attente').length})</TabsTrigger>
                        <TabsTrigger value="approved"><Check className="mr-2 h-4 w-4"/>Approuvées</TabsTrigger>
                        <TabsTrigger value="rejected"><X className="mr-2 h-4 w-4"/>Refusées</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="pt-4">{renderRequestList('En attente')}</TabsContent>
                    <TabsContent value="approved" className="pt-4">{renderRequestList('Approuvée')}</TabsContent>
                    <TabsContent value="rejected" className="pt-4">{renderRequestList('Refusée')}</TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
