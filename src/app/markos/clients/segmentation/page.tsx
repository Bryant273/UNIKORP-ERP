
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Users, BarChart, Percent, Euro, UserCheck, UserX, ShoppingBag, Mail, Eye, Trash2, Pencil } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useToast } from '@/hooks/use-toast';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


// --- DATA & CONFIGS ---
type Segment = {
  id: string;
  name: string;
  description: string;
  size: number;
  conversionRate: string;
  revenue: number;
  type: 'Dynamique' | 'Statique';
  color: string;
};

const segmentsData: Segment[] = [
  { 
    id: 'seg-1', 
    name: 'Clients VIP', 
    description: 'Clients les plus fidèles et à haute valeur.',
    size: 58,
    conversionRate: '12%',
    revenue: 75000000,
    type: 'Dynamique',
    color: 'hsl(var(--chart-1))'
  },
  { 
    id: 'seg-2', 
    name: 'Nouveaux Prospects (30j)', 
    description: 'Leads générés au cours du dernier mois.',
    size: 152,
    conversionRate: '4%',
    revenue: 2500000,
    type: 'Dynamique',
    color: 'hsl(var(--chart-2))'
  },
  { 
    id: 'seg-3', 
    name: 'Clients à Risque', 
    description: 'Clients inactifs depuis plus de 90 jours.',
    size: 112,
    conversionRate: '0.5%',
    revenue: 1200000,
    type: 'Dynamique',
    color: 'hsl(var(--chart-3))'
  },
  { 
    id: 'seg-4', 
    name: 'Campagne Été 2024', 
    description: 'Liste figée pour la campagne promotionnelle.',
    size: 2500,
    conversionRate: 'N/A',
    revenue: 0,
    type: 'Statique',
    color: 'hsl(var(--chart-4))'
  },
];

const pieChartData = segmentsData
    .filter(s => s.type === 'Dynamique')
    .map(s => ({ name: s.name, value: s.size, fill: `var(--color-${s.id})` }));

const pieChartConfig = segmentsData.reduce((acc, segment) => {
    (acc as any)[segment.id] = { label: segment.name, color: segment.color.replace('hsl(','').replace(')','') };
    return acc;
}, {
    value: { label: 'Taille' }
} as ChartConfig);

const barChartData = segmentsData
    .filter(s => s.revenue > 0)
    .map(s => ({ name: s.name, revenue: s.revenue, fill: `var(--color-${s.id})` }));

const barChartConfig = {
    revenue: { label: "Chiffre d'Affaires", color: "hsl(var(--primary))" },
    ...pieChartConfig
} satisfies ChartConfig;


export default function SegmentationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [viewingSegment, setViewingSegment] = useState<Segment | null>(null);

  const { toast } = useToast();

  const handleCreateSegment = () => {
    setIsModalOpen(false);
    toast({
        title: "Segment créé (Simulation)",
        description: "Votre nouveau segment a été ajouté à la liste.",
    });
  };

  const handleOpenEditModal = (segment: Segment) => {
    setEditingSegment(segment);
    setIsModalOpen(true);
  };
  
  const handleOpenViewModal = (segment: Segment) => {
    setViewingSegment(segment);
    setIsViewMembersModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Segmentation Clients & Prospects</CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer un segment
            </Button>
          </div>
          <CardDescription>
            Créez des segments dynamiques ou statiques pour affiner vos campagnes marketing et analyser votre base de contacts.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom du Segment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Taille</TableHead>
                        <TableHead className="text-right">Taux Conv.</TableHead>
                        <TableHead className="text-right">CA Généré (FCFA)</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {segmentsData.map(seg => (
                        <TableRow key={seg.id}>
                            <TableCell className="font-medium">{seg.name}</TableCell>
                            <TableCell><Badge variant={seg.type === 'Dynamique' ? 'default' : 'outline'}>{seg.type}</Badge></TableCell>
                            <TableCell className="text-right">{seg.size}</TableCell>
                            <TableCell className="text-right">{seg.conversionRate}</TableCell>
                            <TableCell className="text-right">{seg.revenue.toLocaleString('fr-FR')}</TableCell>
                            <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenViewModal(seg)}><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(seg)}><Pencil className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Supprimer le segment "{seg.name}" ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => toast({ title: "Simulation", description: "Le segment a été supprimé." })} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Répartition des Contacts</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
                 <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[300px]">
                    <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                        <Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius={60}>
                            <Legend />
                        </Pie>
                    </RechartsPieChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="lg:col-span-3">
             <CardHeader>
                <CardTitle>Performance par Segment</CardTitle>
                <CardDescription>Chiffre d'affaires généré par les principaux segments.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                    <RechartsBarChart data={barChartData} layout="vertical">
                         <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={8} width={100} />
                         <XAxis type="number" hide />
                         <Tooltip cursor={false} content={<ChartTooltipContent />} />
                         <Bar dataKey="revenue" fill="var(--color-revenue)" radius={5} />
                    </RechartsBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

      <CreateEditSegmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleCreateSegment} segment={editingSegment} />
      <ViewMembersModal isOpen={isViewMembersModalOpen} onClose={() => setIsViewMembersModalOpen(false)} segment={viewingSegment}/>
    </div>
  );
}


function CreateEditSegmentModal({ isOpen, onClose, onSave, segment }: {isOpen: boolean; onClose: () => void; onSave: () => void; segment: Segment | null}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{segment ? "Modifier le segment" : "Créer un nouveau segment"}</DialogTitle>
                    <DialogDescription>
                        Combinez les critères pour définir précisément votre audience.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="segment-name">Nom du segment</Label>
                            <Input id="segment-name" placeholder="Ex: Clients inactifs depuis 6 mois" defaultValue={segment?.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="segment-type">Type de segment</Label>
                            <Select defaultValue={segment?.type || "Dynamique"}>
                                <SelectTrigger id="segment-type"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dynamique">Dynamique (Mise à jour auto)</SelectItem>
                                    <SelectItem value="Statique">Statique (Liste figée)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <Tabs defaultValue="demographic">
                        <TabsList>
                            <TabsTrigger value="demographic"><UserCheck className="mr-2 h-4 w-4"/>Démographique</TabsTrigger>
                            <TabsTrigger value="transactional"><ShoppingBag className="mr-2 h-4 w-4"/>Transactionnel</TabsTrigger>
                            <TabsTrigger value="engagement"><Mail className="mr-2 h-4 w-4"/>Engagement</TabsTrigger>
                        </TabsList>
                        <TabsContent value="demographic" className="p-4 border rounded-b-md">
                            <div className="space-y-4">
                                <h4 className="font-semibold">Critères Démographiques</h4>
                                <div className="flex items-center gap-2">
                                    <Select><SelectTrigger className="w-[150px]"><SelectValue placeholder="Champ..."/></SelectTrigger></Select>
                                    <Select><SelectTrigger className="w-[150px]"><SelectValue placeholder="Opérateur..."/></SelectTrigger></Select>
                                    <Input placeholder="Valeur..."/>
                                    <Button variant="ghost" size="icon"><PlusCircle className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="transactional" className="p-4 border rounded-b-md">
                            <div className="space-y-4">
                                <h4 className="font-semibold">Critères Transactionnels</h4>
                                <div className="flex items-center gap-2">
                                    <Select><SelectTrigger className="w-[150px]"><SelectValue placeholder="Panier moyen..."/></SelectTrigger></Select>
                                    <Select><SelectTrigger className="w-[150px]"><SelectValue placeholder="Est supérieur à..."/></SelectTrigger></Select>
                                    <Input placeholder="Valeur..."/>
                                    <Button variant="ghost" size="icon"><PlusCircle className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="engagement" className="p-4 border rounded-b-md">
                            <div className="space-y-4">
                                <h4 className="font-semibold">Critères d'Engagement</h4>
                                <div className="flex items-center gap-2">
                                    <Select><SelectTrigger className="w-[150px]"><SelectValue placeholder="Dernière ouverture d'email..."/></SelectTrigger></Select>
                                    <Select><SelectTrigger className="w-[150px]"><SelectValue placeholder="Date avant le..."/></SelectTrigger></Select>
                                    <Input type="date"/>
                                    <Button variant="ghost" size="icon"><PlusCircle className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Annuler</Button></DialogClose>
                    <Button type="button" onClick={onSave}>Enregistrer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ViewMembersModal({ isOpen, onClose, segment }: { isOpen: boolean; onClose: () => void; segment: Segment | null }) {
    const mockMembers = Array.from({ length: segment?.size || 0 }, (_, i) => ({
        id: `usr-${i}`,
        name: `Membre ${i + 1}`,
        email: `membre${i+1}@example.com`,
        avatar: `https://placehold.co/100x100.png?text=M${i+1}`
    }));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Membres du segment : {segment?.name}</DialogTitle>
                    <DialogDescription>Liste des contacts inclus dans ce segment.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockMembers.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person face" />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{member.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={() => alert("Simulation d'export")}>Exporter la liste</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
