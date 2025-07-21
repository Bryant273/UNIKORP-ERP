
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileEdit, UserPlus, LogOut, FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Action = {
  id: string;
  user: { name: string; avatarUrl: string; };
  action: string;
  module: string;
  timestamp: string;
};

const allActions: Action[] = [
    { id: '1', user: { name: 'Jean Dupont', avatarUrl: 'https://placehold.co/100x100.png' }, action: 'A validé la facture #FACT-085', module: 'SKOMPTAB', timestamp: '2024-07-26T14:30:00Z' },
    { id: '2', user: { name: 'Sophie Martin', avatarUrl: 'https://placehold.co/100x100.png' }, action: 'A créé un nouveau prospect: "Global Solutions Ltd"', module: 'MARKOS', timestamp: '2024-07-26T11:15:00Z' },
    { id: '3', user: { name: 'Admin', avatarUrl: 'https://placehold.co/100x100.png' }, action: 'A mis à jour le module LOGSON en v2.1', module: 'System', timestamp: '2024-07-25T14:00:00Z' },
    { id: '4', user: { name: 'David Garcia', avatarUrl: 'https://placehold.co/100x100.png' }, action: 'S\'est connecté', module: 'System', timestamp: '2024-07-25T09:02:00Z' },
    { id: '5', user: { name: 'Jean Dupont', avatarUrl: 'https://placehold.co/100x100.png' }, action: 'A exporté le Grand Livre Tiers', module: 'SKOMPTAB', timestamp: '2024-07-25T08:45:00Z' },
    { id: '6', user: { name: 'Léa Moreau', avatarUrl: 'https://placehold.co/100x100.png' }, action: 'S\'est déconnectée', module: 'System', timestamp: '2024-07-24T18:30:00Z' },
];

const ActionIcon = ({ module }: { module: string }) => {
    switch (module) {
        case 'SKOMPTAB': return <FileEdit className="h-5 w-5 text-blue-500" />;
        case 'MARKOS': return <UserPlus className="h-5 w-5 text-green-500" />;
        case 'System': return <LogOut className="h-5 w-5 text-gray-500" />;
        default: return <FileText className="h-5 w-5" />;
    }
}

const ITEMS_PER_PAGE = 10;

export default function ActionsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    
    const groupedActions = useMemo(() => {
        return allActions.reduce((acc, action) => {
            const date = new Date(action.timestamp).toLocaleDateString('fr-FR', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(action);
            return acc;
        }, {} as Record<string, Action[]>);
    }, []);

    // Pagination logic would be more complex with grouped data.
    // For this example, we'll show all actions.
    // In a real app, you'd paginate the dates or use infinite scroll.

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-2xl">Journal des Actions</CardTitle>
                <CardDescription>Consultez l'historique de toutes les actions effectuées sur la plateforme.</CardDescription>
            </div>
             <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Exporter</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            {Object.keys(groupedActions).length > 0 ? (
                Object.entries(groupedActions).map(([date, actions]) => (
                    <div key={date}>
                        <h3 className="text-lg font-semibold mb-4 capitalize">{date}</h3>
                         <div className="space-y-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24"></TableHead>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead className="text-center">Module</TableHead>
                                        <TableHead className="text-right">Heure</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                {actions.map(action => (
                                    <TableRow key={action.id}>
                                        <TableCell>
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                <ActionIcon module={action.module} />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={action.user.avatarUrl} alt={action.user.name} />
                                                    <AvatarFallback>{action.user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{action.user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{action.action}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={action.module === 'System' ? 'destructive' : 'secondary'}>{action.module}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{format(new Date(action.timestamp), 'HH:mm:ss')}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Aucune action enregistrée.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
