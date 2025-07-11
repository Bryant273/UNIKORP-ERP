
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Users, BarChart, Percent, Euro, UserCheck, UserX, ShoppingBag, Mail, Eye } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useToast } from '@/hooks/use-toast';

// --- DATA & CONFIGS ---

const segmentsData = [
  { 
    id: 'seg-1', 
    name: 'Clients VIP', 
    description: 'Clients les plus fidèles et à haute valeur.',
    size: 58,
    conversionRate: '12%',
    revenue: 75000000,
    type: 'Dynamique',
    color: 'bg-yellow-400'
  },
  { 
    id: 'seg-2', 
    name: 'Nouveaux Prospects (30j)', 
    description: 'Leads générés au cours du dernier mois.',
    size: 152,
    conversionRate: '4%',
    revenue: 2500000,
    type: 'Dynamique',
    color: 'bg-blue-400'
  },
  { 
    id: 'seg-3', 
    name: 'Clients à Risque', 
    description: 'Clients inactifs depuis plus de 90 jours.',
    size: 112,
    conversionRate: '0.5%',
    revenue: 1200000,
    type: 'Dynamique',
    color: 'bg-red-400'
  },
  { 
    id: 'seg-4', 
    name: 'Campagne Été 2024', 
    description: 'Liste figée pour la campagne promotionnelle.',
    size: 2500,
    conversionRate: 'N/A',
    revenue: 0,
    type: 'Statique',
    color: 'bg-green-400'
  },
];

const pieChartData = segmentsData
    .filter(s => s.type === 'Dynamique')
    .map(s => ({ name: s.name, value: s.size, fill: `var(--color-${s.id})` }));

const pieChartConfig = segmentsData.reduce((acc, segment) => {
    acc[segment.id] = { label: segment.name, color: segment.color };
    return acc;
}, {} as ChartConfig);

const barChartData = segmentsData
    .filter(s => s.revenue > 0)
    .map(s => ({ name: s.name, revenue: s.revenue, fill: `var(--color-${s.id})` }));

const barChartConfig = {
    revenue: { label: "Chiffre d'Affaires", color: "hsl(var(--primary))" },
    ...pieChartConfig
} satisfies ChartConfig;


export default function SegmentationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateSegment = () => {
    setIsModalOpen(false);
    toast({
        title: "Segment créé (Simulation)",
        description: "Votre nouveau segment a été ajouté à la liste.",
    });
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {segmentsData.map(seg => (
                    <Card key={seg.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{seg.name}</CardTitle>
                                <Badge variant={seg.type === 'Dynamique' ? 'default' : 'outline'}>{seg.type}</Badge>
                            </div>
                            <CardDescription className="text-xs pt-1 h-10">{seg.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                           <div className="flex justify-between p-2 rounded-md bg-muted/50"><span className="text-sm text-muted-foreground flex items-center gap-1.5"><Users className="h-4 w-4"/>Taille</span><span className="font-bold">{seg.size}</span></div>
                           <div className="flex justify-between p-2 rounded-md bg-muted/50"><span className="text-sm text-muted-foreground flex items-center gap-1.5"><Percent className="h-4 w-4"/>Taux Conv.</span><span className="font-bold">{seg.conversionRate}</span></div>
                           <div className="flex justify-between p-2 rounded-md bg-muted/50"><span className="text-sm text-muted-foreground flex items-center gap-1.5"><Euro className="h-4 w-4"/>CA Généré</span><span className="font-bold">{seg.revenue.toLocaleString('fr-FR')} FCFA</span></div>
                        </CardContent>
                        <CardFooter className="p-4">
                            <Button variant="outline" className="w-full">
                                <Eye className="mr-2 h-4 w-4" /> Voir les membres
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Répartition des Contacts</CardTitle></CardHeader>
            <CardContent className="flex justify-center">
                 <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[300px]">
                    <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Créer un nouveau segment</DialogTitle>
                <DialogDescription>
                    Combinez les critères pour définir précisément votre audience.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="segment-name">Nom du segment</Label>
                        <Input id="segment-name" placeholder="Ex: Clients inactifs depuis 6 mois" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="segment-type">Type de segment</Label>
                        <Select defaultValue="dynamic">
                            <SelectTrigger id="segment-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dynamic">Dynamique (Mise à jour auto)</SelectItem>
                                <SelectItem value="static">Statique (Liste figée)</SelectItem>
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
                <DialogClose asChild>
                    <Button type="button" variant="outline">Annuler</Button>
                </DialogClose>
                <Button type="button" onClick={handleCreateSegment}>Créer le segment</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

