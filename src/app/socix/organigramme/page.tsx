
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ZoomIn, ZoomOut, Locate, Download, UserCircle, Users, Mail, Phone, Edit, Plus, GripVertical } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


// --- TYPES & MOCK DATA ---
type OrgNode = {
    id: string;
    name: string;
    position: string;
    team?: string;
    avatarUrl: string;
    children?: OrgNode[];
};

const orgData: OrgNode = {
    id: 'ceo',
    name: 'Elodie Dubois',
    position: 'Présidente Directrice Générale',
    avatarUrl: 'https://placehold.co/100x100.png',
    children: [
        {
            id: 'cto',
            name: 'Marc Lefebvre',
            position: 'Directeur Technique (CTO)',
            team: 'IT & R&D',
            avatarUrl: 'https://placehold.co/100x100.png',
            children: [
                { id: 'dev-001', name: 'Jean Dupont', position: 'Développeur Senior', avatarUrl: 'https://placehold.co/100x100.png', team: 'IT' },
                { id: 'dev-002', name: 'Lucas Petit', position: 'Développeur Junior', avatarUrl: 'https://placehold.co/100x100.png', team: 'IT' },
            ]
        },
        {
            id: 'cfo',
            name: 'Awa Diallo',
            position: 'Directrice Financière (CFO)',
            team: 'SKOMPTAB',
            avatarUrl: 'https://placehold.co/100x100.png',
            children: [
                { id: 'cpt-001', name: 'David Garcia', position: 'Comptable Principal', avatarUrl: 'https://placehold.co/100x100.png', team: 'SKOMPTAB' },
            ]
        },
        {
            id: 'hrd',
            name: 'Camille Leroy',
            position: 'Directrice des RH (DRH)',
            team: 'SOCIX',
            avatarUrl: 'https://placehold.co/100x100.png',
            children: []
        },
        {
            id: 'cmo',
            name: 'Isabelle Rossi',
            position: 'Directrice Marketing (CMO)',
            team: 'MARKOS',
            avatarUrl: 'https://placehold.co/100x100.png',
            children: [
                { id: 'mkt-001', name: 'Sophie Martin', position: 'Chef de projet Marketing', avatarUrl: 'https://placehold.co/100x100.png', team: 'MARKOS' }
            ]
        },
    ]
};

// --- COMPONENTS ---

const NodeCard = ({ node, onSelect }: { node: OrgNode, onSelect: (node: OrgNode) => void }) => (
    <div 
        className="flex items-center gap-4 p-3 bg-card border rounded-lg shadow-sm w-72 cursor-pointer hover:shadow-md hover:border-primary transition-shadow"
        onClick={() => onSelect(node)}
    >
        <Avatar className="h-12 w-12">
            <AvatarImage src={node.avatarUrl} alt={node.name} data-ai-hint="person face" />
            <AvatarFallback>{node.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <p className="font-semibold">{node.name}</p>
            <p className="text-xs text-muted-foreground">{node.position}</p>
            {node.team && <Badge variant="secondary" className="mt-1">{node.team}</Badge>}
        </div>
    </div>
);

const OrgChartNode = ({ node, onSelectNode }: { node: OrgNode, onSelectNode: (node: OrgNode) => void }) => (
    <div className="flex flex-col items-center">
        <NodeCard node={node} onSelect={onSelectNode}/>
        {node.children && node.children.length > 0 && (
            <div className="flex pt-12 relative before:content-[''] before:absolute before:left-1/2 before:-top-2 before:h-12 before:w-px before:bg-border">
                {node.children.map(child => (
                    <div key={child.id} className="px-8 relative before:content-[''] before:absolute before:left-0 before:right-0 before:-top-2 before:h-px before:bg-border after:content-[''] after:absolute after:left-1/2 after:-top-2 after:h-2 after:w-px after:bg-border">
                        <OrgChartNode node={child} onSelectNode={onSelectNode} />
                    </div>
                ))}
            </div>
        )}
    </div>
);


export default function OrganigrammePage() {
    const { toast } = useToast();
    const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);

    const handleSelectNode = (node: OrgNode) => {
        setSelectedNode(node);
    };

    const handleExport = () => {
        toast({ title: "Fonctionnalité à venir", description: "L'export de l'organigramme sera bientôt disponible." });
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Organigramme</CardTitle>
                            <CardDescription>Visualisez la structure hiérarchique de votre organisation.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => toast({title: "Fonctionnalité à venir"})}><Edit className="mr-2 h-4 w-4" /> Modifier structure</Button>
                            <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Exporter</Button>
                            <div className="flex items-center border rounded-md">
                                <Button variant="ghost" size="icon" disabled><ZoomOut className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" disabled><Locate className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" disabled><ZoomIn className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto p-8 bg-muted/50">
                    <div className="flex justify-center min-w-max">
                        <OrgChartNode node={orgData} onSelectNode={handleSelectNode} />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
                <DialogContent>
                    {selectedNode && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedNode.name}</DialogTitle>
                                <DialogDescription>{selectedNode.position}</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="flex items-center gap-4"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selectedNode.name.toLowerCase().replace(/\s/g, '.')}@unikorp.com</span></div>
                                <div className="flex items-center gap-4"><Phone className="h-4 w-4 text-muted-foreground" /><span>+33 1 23 45 67 89</span></div>
                                <div className="flex items-center gap-4"><Users className="h-4 w-4 text-muted-foreground" /><span>Équipe {selectedNode.team || 'N/A'}</span></div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedNode(null)}>Fermer</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

