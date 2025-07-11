
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Bot, Mail, MessageSquare, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// --- TYPES & MOCK DATA ---
type ScenarioStatus = 'Actif' | 'Inactif';
type Channel = 'Email' | 'SMS';

type AutomationScenario = {
    id: string;
    title: string;
    description: string;
    trigger: string;
    channels: Channel[];
    status: ScenarioStatus;
};

const MOCK_SCENARIOS: AutomationScenario[] = [
    { 
        id: 'auto-1', 
        title: 'Message de Bienvenue', 
        description: 'Envoyé automatiquement après l\'inscription d\'un nouveau prospect.',
        trigger: 'Nouvel Inscrit',
        channels: ['Email'],
        status: 'Actif'
    },
    { 
        id: 'auto-2', 
        title: 'Relance Panier Abandonné', 
        description: 'Envoyé 24h après qu\'un client ait abandonné son panier.',
        trigger: 'Panier Abandonné',
        channels: ['Email', 'SMS'],
        status: 'Actif'
    },
    { 
        id: 'auto-3', 
        title: 'Sondage post-achat', 
        description: 'Envoyé 7 jours après un achat pour recueillir des avis.',
        trigger: 'Achat Terminé',
        channels: ['Email'],
        status: 'Inactif'
    },
     { 
        id: 'auto-4', 
        title: 'Anniversaire Client', 
        description: 'Envoi d\'une offre spéciale le jour de l\'anniversaire du client.',
        trigger: 'Date Anniversaire',
        channels: ['SMS'],
        status: 'Actif'
    },
];

const getChannelIcon = (channel: Channel) => {
    switch (channel) {
        case 'Email': return <Mail className="h-4 w-4" />;
        case 'SMS': return <MessageSquare className="h-4 w-4" />;
    }
};

export default function AutomationMarketingPage() {
    const { toast } = useToast();
    const [scenarios, setScenarios] = useState(MOCK_SCENARIOS);

    const handleToggleStatus = (id: string) => {
        setScenarios(prev => prev.map(s => 
            s.id === id ? { ...s, status: s.status === 'Actif' ? 'Inactif' : 'Actif' } : s
        ));
    };

    const handleDelete = (id: string) => {
        setScenarios(prev => prev.filter(s => s.id !== id));
        toast({ title: 'Scénario supprimé', description: 'Le scénario d\'automatisation a été supprimé.' });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl flex items-center gap-2"><Bot /> Automation Marketing</CardTitle>
                        <CardDescription>Créez et gérez des scénarios de communication automatisés.</CardDescription>
                    </div>
                    <Button onClick={() => toast({ title: 'Fonctionnalité à venir'})}><PlusCircle className="mr-2 h-4 w-4" /> Nouveau Scénario</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map(scenario => (
                        <Card key={scenario.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                                    <Switch checked={scenario.status === 'Actif'} onCheckedChange={() => handleToggleStatus(scenario.id)} />
                                </div>
                                <CardDescription>Déclencheur: <span className="font-semibold text-primary">{scenario.trigger}</span></CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground">{scenario.description}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {scenario.channels.map(channel => (
                                        <Badge key={channel} variant="secondary" className="flex items-center gap-1">
                                            {getChannelIcon(channel)}
                                            {channel}
                                        </Badge>
                                    ))}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(scenario.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
