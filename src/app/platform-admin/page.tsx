
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Users, Clock, CheckCircle, FileText, Ticket, GanttChartSquare } from "lucide-react";
import { format } from "date-fns";

const companies = [
  { id: 'comp-1', name: 'Société Alpha', plan: 'Premium', status: 'Actif', userCount: 25, nextBilling: '2024-08-15' },
  { id: 'comp-2', name: 'Tech Innovate SARL', plan: 'Standard', status: 'Actif', userCount: 10, nextBilling: '2024-08-22' },
  { id: 'comp-3', name: 'Global Corp', plan: 'Premium', status: 'Suspendu', userCount: 50, nextBilling: '2024-07-30' },
  { id: 'comp-4', name: 'Startup Boost', plan: 'Demo', status: 'En attente', userCount: 5, nextBilling: 'N/A' },
];

const subscriptions = [
    { id: 'sub-1', company: 'Société Alpha', status: 'Actif', amount: '150,000 FCFA/mois', nextBilling: '2024-08-15' },
    { id: 'sub-2', company: 'Tech Innovate SARL', status: 'Actif', amount: '75,000 FCFA/mois', nextBilling: '2024-08-22' },
    { id: 'sub-3', company: 'Global Corp', status: 'Réabonnement en attente', amount: '150,000 FCFA/mois', nextBilling: '2024-07-30' },
];

const demos = [
    { id: 'demo-1', company: 'Startup Boost', requestDate: '2024-07-28', status: 'En attente' },
    { id: 'demo-2', company: 'Future Solutions', requestDate: '2024-07-25', status: 'Activé' },
];

const promotions = [
    { id: 'promo-1', code: 'SUMMER2024', description: '-20% sur les 3 premiers mois du plan Premium', status: 'Actif' },
    { id: 'promo-2', code: 'LAUNCH10', description: '-10% à vie pour les 50 premiers clients', status: 'Expiré' },
];

export default function PlatformAdminPage() {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Actif': return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
            case 'Suspendu': return <Badge variant="destructive">{status}</Badge>;
            case 'En attente': return <Badge variant="outline">{status}</Badge>;
            case 'Réabonnement en attente': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{status}</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };
    
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Panneau Fournisseur ERP</h1>
      <Tabs defaultValue="companies">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="companies"><Building className="mr-2 h-4 w-4" /> Entreprises</TabsTrigger>
            <TabsTrigger value="subscriptions"><Clock className="mr-2 h-4 w-4" /> Abonnements</TabsTrigger>
            <TabsTrigger value="demos"><GanttChartSquare className="mr-2 h-4 w-4" /> Démos</TabsTrigger>
            <TabsTrigger value="promotions"><Ticket className="mr-2 h-4 w-4" /> Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
            <Card><CardHeader><CardTitle>Gestion des Entreprises</CardTitle><CardDescription>Consultez la liste des entreprises clientes et leurs informations.</CardDescription></CardHeader><CardContent>
                <Table><TableHeader><TableRow><TableHead>Entreprise</TableHead><TableHead>Plan</TableHead><TableHead className="text-center">Utilisateurs</TableHead><TableHead className="text-center">Statut</TableHead></TableRow></TableHeader><TableBody>
                    {companies.map(c => <TableRow key={c.id}><TableCell className="font-medium">{c.name}</TableCell><TableCell>{c.plan}</TableCell><TableCell className="text-center">{c.userCount}</TableCell><TableCell className="text-center">{getStatusBadge(c.status)}</TableCell></TableRow>)}
                </TableBody></Table>
            </CardContent></Card>
        </TabsContent>
        
        <TabsContent value="subscriptions">
            <Card><CardHeader><CardTitle>Gestion des Abonnements</CardTitle><CardDescription>Suivez les abonnements, les renouvellements et les suspensions.</CardDescription></CardHeader><CardContent>
                <Table><TableHeader><TableRow><TableHead>Entreprise</TableHead><TableHead>Montant</TableHead><TableHead>Prochaine Facturation</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                    {subscriptions.map(s => <TableRow key={s.id}><TableCell className="font-medium">{s.company}</TableCell><TableCell>{s.amount}</TableCell><TableCell>{format(new Date(s.nextBilling), 'dd/MM/yyyy')}</TableCell><TableCell>{getStatusBadge(s.status)}</TableCell><TableCell className="text-right">{s.status.includes('attente') && <Button size="sm">Valider</Button>}</TableCell></TableRow>)}
                </TableBody></Table>
            </CardContent></Card>
        </TabsContent>

        <TabsContent value="demos">
             <Card><CardHeader><CardTitle>Gestion des Comptes Démos</CardTitle><CardDescription>Activez les comptes de démonstration pour les nouveaux prospects.</CardDescription></CardHeader><CardContent>
                <Table><TableHeader><TableRow><TableHead>Entreprise</TableHead><TableHead>Date de Demande</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                    {demos.map(d => <TableRow key={d.id}><TableCell className="font-medium">{d.company}</TableCell><TableCell>{format(new Date(d.requestDate), 'dd/MM/yyyy')}</TableCell><TableCell>{getStatusBadge(d.status)}</TableCell><TableCell className="text-right">{d.status === 'En attente' && <Button size="sm">Activer</Button>}</TableCell></TableRow>)}
                </TableBody></Table>
            </CardContent></Card>
        </TabsContent>

        <TabsContent value="promotions">
             <Card><CardHeader><CardTitle>Gestion des Promotions</CardTitle><CardDescription>Créez et gérez les codes promotionnels pour vos campagnes.</CardDescription></CardHeader><CardContent>
                <Table><TableHeader><TableRow><TableHead>Code Promo</TableHead><TableHead>Description</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>
                    {promotions.map(p => <TableRow key={p.id}><TableCell className="font-medium font-mono">{p.code}</TableCell><TableCell>{p.description}</TableCell><TableCell>{getStatusBadge(p.status)}</TableCell></TableRow>)}
                </TableBody></Table>
            </CardContent></Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
