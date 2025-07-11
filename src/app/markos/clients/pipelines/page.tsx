
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Users, DollarSign, Target, ChevronDown, Mail, Phone, Briefcase, MessageSquare } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Funnel, FunnelChart, LabelList, Tooltip, ResponsiveContainer } from "recharts";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// --- TYPES & MOCK DATA ---

type Stage = 'Nouveau' | 'Qualification' | 'Proposition' | 'Négociation' | 'Gagné' | 'Perdu';

type Opportunity = {
  id: string;
  title: string;
  companyName: string;
  contactName: string;
  value: number;
  probability: number;
  stage: Stage;
};

type Activity = {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note';
    date: string;
    notes: string;
    user: string;
};

const MOCK_OPPORTUNITIES_DATA: Opportunity[] = [
  { id: 'opp-1', title: 'Intégration ERP pour Global Corp', companyName: 'Global Corp', contactName: 'Alice Martin', value: 15000000, probability: 75, stage: 'Négociation' },
  { id: 'opp-2', title: 'Campagne Marketing Digital Q4', companyName: 'Innovatech', contactName: 'Bruno Lemaire', value: 5000000, probability: 90, stage: 'Proposition' },
  { id: 'opp-3', title: 'Développement App Mobile', companyName: 'Startup Boost', contactName: 'Carine Dubois', value: 8000000, probability: 25, stage: 'Qualification' },
  { id: 'opp-4', title: 'Maintenance Serveurs 2025', companyName: 'Data Secure', contactName: 'David Garcia', value: 3500000, probability: 50, stage: 'Proposition' },
  { id: 'opp-5', title: 'Refonte site e-commerce', companyName: 'E-Shop Plus', contactName: 'Elise Durand', value: 6000000, probability: 10, stage: 'Nouveau' },
  { id: 'opp-6', title: 'Formation équipe commerciale', companyName: 'Global Corp', contactName: 'Alice Martin', value: 2000000, probability: 100, stage: 'Gagné' },
  { id: 'opp-7', title: 'Audit de sécurité', companyName: 'Data Secure', contactName: 'David Garcia', value: 4000000, probability: 0, stage: 'Perdu' },
];

const MOCK_ACTIVITIES: Activity[] = [
    { id: 'act-1', type: 'meeting', date: '2024-07-28', notes: 'Réunion de présentation de la proposition. Points clés discutés, retour positif.', user: 'Moi' },
    { id: 'act-2', type: 'email', date: '2024-07-25', notes: 'Envoi de la proposition commerciale V1.', user: 'Moi' },
    { id: 'act-3', type: 'call', date: '2024-07-22', notes: 'Appel de qualification. Besoins confirmés.', user: 'Moi' },
];

const STAGES_ORDER: Stage[] = ['Nouveau', 'Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu'];
const funnelData = [
  { name: 'Nouveau', value: 120, fill: 'hsl(var(--chart-1))' },
  { name: 'Qualification', value: 98, fill: 'hsl(var(--chart-2))' },
  { name: 'Proposition', value: 75, fill: 'hsl(var(--chart-3))' },
  { name: 'Négociation', value: 51, fill: 'hsl(var(--chart-4))' },
  { name: 'Gagné', value: 25, fill: 'hsl(var(--chart-5))' },
];
const funnelChartConfig = funnelData.reduce((acc, cur) => {
    (acc as any)[cur.name] = { label: cur.name, color: cur.fill };
    return acc;
}, {} as any);


const kpiData = [
  { title: "Valeur du Pipeline", value: `${(MOCK_OPPORTUNITIES_DATA.filter(o => o.stage !== 'Gagné' && o.stage !== 'Perdu').reduce((s, o) => s + o.value, 0)).toLocaleString('fr-FR')} FCFA`, Icon: DollarSign },
  { title: "Deals en cours", value: MOCK_OPPORTUNITIES_DATA.filter(o => o.stage !== 'Gagné' && o.stage !== 'Perdu').length, Icon: Users },
  { title: "Taux de Conversion Global", value: "20.8%", Icon: Target },
];

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'call': return <Phone className="h-4 w-4 text-blue-500" />;
        case 'email': return <Mail className="h-4 w-4 text-orange-500" />;
        case 'meeting': return <Briefcase className="h-4 w-4 text-purple-500" />;
        case 'note': return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
}

// --- MAIN PAGE COMPONENT ---
export default function PipelinesPage() {
    const [opportunities, setOpportunities] = useState(MOCK_OPPORTUNITIES_DATA);
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

    const stages = useMemo(() => {
        const stageMap = STAGES_ORDER.reduce((acc, stage) => {
            acc[stage] = [];
            return acc;
        }, {} as Record<Stage, Opportunity[]>);

        opportunities.forEach(opp => {
            if (stageMap[opp.stage]) {
                stageMap[opp.stage].push(opp);
            }
        });
        return stageMap;
    }, [opportunities]);

    const handleOpenCreateModal = () => {
        setEditingOpportunity(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (opp: Opportunity) => {
        setEditingOpportunity(opp);
        setSelectedOpportunity(null);
        setIsFormModalOpen(true);
    };

    const handleSaveOpportunity = (formData: Omit<Opportunity, 'id' | 'probability'>) => {
        if (editingOpportunity) {
            setOpportunities(prev => prev.map(opp => opp.id === editingOpportunity.id ? { ...editingOpportunity, ...formData } : opp));
        } else {
            const newOpp: Opportunity = {
                id: `opp-${Date.now()}`,
                ...formData,
                probability: 10, // Default probability
            };
            setOpportunities(prev => [newOpp, ...prev]);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Pipelines de Vente</CardTitle>
                            <CardDescription>Gérez vos opportunités commerciales à travers les différentes étapes du cycle de vente.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                             <Select defaultValue="b2b-pipeline">
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="b2b-pipeline">Pipeline Ventes B2B</SelectItem>
                                    <SelectItem value="services-pipeline">Pipeline Ventes Services</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleOpenCreateModal}><PlusCircle className="mr-2 h-4 w-4"/> Nouvelle Opportunité</Button>
                        </div>
                    </div>
                </CardHeader>
                 <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {kpiData.map(kpi => (
                            <Card key={kpi.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                                    <kpi.Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold">{kpi.value}</div></CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                 {/* Kanban Board */}
                <div className="lg:col-span-5">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {STAGES_ORDER.map(stage => (
                            <div key={stage} className="flex-shrink-0 w-80">
                                <Card className="h-full">
                                    <CardHeader className="flex flex-row items-center justify-between p-4">
                                        <CardTitle className="text-base">{stage}</CardTitle>
                                        <Badge variant="secondary">{stages[stage]?.length || 0}</Badge>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-3 h-[50vh] overflow-y-auto">
                                        {stages[stage]?.map(opp => (
                                            <Card 
                                                key={opp.id} 
                                                className="hover:shadow-md cursor-pointer"
                                                onClick={() => setSelectedOpportunity(opp)}
                                            >
                                                <CardContent className="p-3">
                                                    <p className="font-semibold text-sm">{opp.title}</p>
                                                    <p className="text-xs text-muted-foreground">{opp.companyName}</p>
                                                    <p className="text-sm font-bold text-primary mt-2">
                                                        {opp.value.toLocaleString('fr-FR')} FCFA
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Funnel Chart */}
                <div className="lg:col-span-5">
                    <Card>
                        <CardHeader>
                            <CardTitle>Entonnoir de Conversion</CardTitle>
                            <CardDescription>Visualisation du passage des opportunités entre les étapes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={funnelChartConfig} className="mx-auto w-full h-80">
                                <ResponsiveContainer>
                                    <FunnelChart>
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                                            <LabelList position="right" fill="#fff" dataKey="name" />
                                        </Funnel>
                                    </FunnelChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <OpportunityDetailModal 
                isOpen={!!selectedOpportunity} 
                onClose={() => setSelectedOpportunity(null)} 
                opportunity={selectedOpportunity} 
                onEdit={handleOpenEditModal}
            />

            <OpportunityFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveOpportunity}
                opportunityToEdit={editingOpportunity}
            />
        </div>
    );
}

// --- MODAL COMPONENTS ---

function OpportunityDetailModal({ isOpen, onClose, opportunity, onEdit }: { isOpen: boolean, onClose: () => void, opportunity: Opportunity | null, onEdit: (opp: Opportunity) => void }) {
    if (!opportunity) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{opportunity.title}</DialogTitle>
                    <DialogDescription>{opportunity.companyName}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                    <div className="md:col-span-1 space-y-4">
                        <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">Détails</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-2">
                                <div className="flex justify-between"><span className="text-muted-foreground">Valeur</span> <span className="font-bold">{opportunity.value.toLocaleString('fr-FR')} FCFA</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Probabilité</span> <Badge variant="secondary">{opportunity.probability}%</Badge></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Étape</span> <Badge>{opportunity.stage}</Badge></div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 text-sm space-y-2">
                                <div className="flex items-center gap-3">
                                    <Avatar><AvatarFallback>{opportunity.contactName.charAt(0)}</AvatarFallback></Avatar>
                                    <p className="font-semibold">{opportunity.contactName}</p>
                                </div>
                                <div className="flex items-center gap-3 text-xs"><Mail className="h-3 w-3"/> contact@example.com</div>
                                <div className="flex items-center gap-3 text-xs"><Phone className="h-3 w-3"/> +225 01 02 03 04 05</div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-base">Activités Récentes</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {MOCK_ACTIVITIES.map(act => (
                                    <div key={act.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                            {getActivityIcon(act.type)}
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{format(new Date(act.date), 'dd MMMM yyyy', {locale: fr})} par {act.user}</p>
                                            <p className="text-sm">{act.notes}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={() => onEdit(opportunity)}>Modifier l'opportunité</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function OpportunityFormModal({ isOpen, onClose, onSave, opportunityToEdit }: { isOpen: boolean, onClose: () => void, onSave: (data: Omit<Opportunity, 'id' | 'probability'>) => void, opportunityToEdit: Opportunity | null }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Omit<Opportunity, 'id'| 'probability'>>({
        title: '', companyName: '', contactName: '', value: 0, stage: 'Nouveau'
    });

    React.useEffect(() => {
        if (isOpen && opportunityToEdit) {
            setFormData(opportunityToEdit);
        } else if (isOpen && !opportunityToEdit) {
            setFormData({ title: '', companyName: '', contactName: '', value: 0, stage: 'Nouveau' });
        }
    }, [isOpen, opportunityToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: id === 'value' ? parseFloat(value) : value }));
    };

    const handleStageChange = (value: Stage) => {
        setFormData(prev => ({...prev, stage: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.companyName || formData.value <= 0) {
            toast({ title: "Champs requis manquants", description: "Veuillez remplir le titre, l'entreprise et la valeur.", variant: "destructive" });
            return;
        }
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{opportunityToEdit ? "Modifier l'opportunité" : "Nouvelle Opportunité"}</DialogTitle>
                        <DialogDescription>
                            Remplissez les détails de l'opportunité commerciale.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Titre de l'opportunité</Label>
                            <Input id="title" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Nom de l'entreprise</Label>
                                <Input id="companyName" value={formData.companyName} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactName">Nom du contact</Label>
                                <Input id="contactName" value={formData.contactName} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="value">Valeur (FCFA)</Label>
                                <Input id="value" type="number" value={formData.value || ''} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stage">Étape</Label>
                                <Select value={formData.stage} onValueChange={handleStageChange}>
                                    <SelectTrigger id="stage"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {STAGES_ORDER.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

