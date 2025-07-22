
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, CalendarDays, Plane, Briefcase } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function EmployeeDashboardPage() {
  const employee = {
    name: 'Jean Dupont',
    position: 'Développeur Senior',
    department: 'IT',
    avatarUrl: 'https://placehold.co/100x100.png',
    leaveBalance: 14.5,
  };

  const recentDocuments = [
    { name: 'Bulletin de paie - Juin 2024', date: '30/06/2024' },
    { name: 'Avenant au contrat', date: '15/05/2024' },
  ];
  
  const upcomingLeaves = [
    { type: 'Congé Payé', dates: '15/08/2024 - 30/08/2024' },
  ];

  return (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Mes Documents Récents</CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-3">
                        {recentDocuments.map(doc => (
                            <li key={doc.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                <div>
                                    <p className="font-medium">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground">Ajouté le {doc.date}</p>
                                </div>
                                <Button variant="outline" size="sm">Voir</Button>
                            </li>
                        ))}
                   </ul>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarDays /> Mes Congés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-muted-foreground">Solde de congés payés</p>
                        <p className="text-4xl font-bold text-primary">{employee.leaveBalance}</p>
                        <p className="text-xs text-muted-foreground">jours restants</p>
                    </div>
                    <Separator />
                     <div>
                        <h4 className="font-semibold text-sm mb-2">Absences à venir</h4>
                        {upcomingLeaves.length > 0 ? (
                           <div className="flex items-center justify-between text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                <div className="flex items-center gap-2">
                                   <Plane className="h-4 w-4 text-blue-600"/>
                                   <p>{upcomingLeaves[0].type}</p>
                                </div>
                               <p className="font-semibold">{upcomingLeaves[0].dates}</p>
                           </div>
                        ) : (
                           <p className="text-sm text-muted-foreground text-center">Aucune absence planifiée.</p>
                        )}
                    </div>
                    <Button className="w-full"><Plane className="mr-2 h-4 w-4"/>Faire une demande d'absence</Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
