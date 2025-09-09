
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileEdit, UserPlus, LogOut, FileText, Download, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

export default function ActionsPage() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    
    const filteredActions = useMemo(() => {
        if (!selectedDate) return [];
        return allActions
            .filter(action => format(new Date(action.timestamp), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [selectedDate]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-2xl">Journal des Actions</CardTitle>
                <CardDescription>Consultez l'historique des actions effectuées sur la plateforme.</CardDescription>
            </div>
             <div className="flex items-center gap-2">
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                 <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Exporter</Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {filteredActions.length > 0 ? (
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
                    {filteredActions.map(action => (
                        <TableRow key={action.id}>
                            <TableCell>
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <ActionIcon module={action.module} />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={action.user.avatarUrl} alt={action.user.name} data-ai-hint="person face" />
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
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Aucune action enregistrée pour le {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : ''}.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
