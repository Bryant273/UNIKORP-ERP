'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tree, Folder, File, PlusCircle, Search, ChevronRight, ChevronDown } from 'lucide-react';

type Section = {
  id: string;
  code: string;
  libelle: string;
  children?: Section[];
};

type Plan = {
  id: string;
  nom: string;
  sections: Section[];
};

const MOCK_DATA: Plan[] = [
  {
    id: 'proj',
    nom: 'Analyse par Projet',
    sections: [
      { id: 'p1', code: 'P2024-01', libelle: 'Développement ERP Unikorp', children: [
        { id: 'p1.1', code: 'P2024-01-DEV', libelle: 'Phase de Développement' },
        { id: 'p1.2', code: 'P2024-01-TEST', libelle: 'Phase de Test' },
      ]},
      { id: 'p2', code: 'P2024-02', libelle: 'Campagne Marketing Q3' },
    ],
  },
  {
    id: 'dept',
    nom: 'Analyse par Département',
    sections: [
      { id: 'd1', code: 'D-FIN', libelle: 'Finance & Comptabilité' },
      { id: 'd2', code: 'D-RH', libelle: 'Ressources Humaines' },
      { id: 'd3', code: 'D-IT', libelle: 'Informatique', children: [
          { id: 'd3.1', code: 'D-IT-INFRA', libelle: 'Infrastructure' },
          { id: 'd3.2', code: 'D-IT-SUPPORT', libelle: 'Support Technique' },
      ] },
    ],
  },
];

const SectionNode = ({ section, level = 0 }: { section: Section, level?: number }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = section.children && section.children.length > 0;
    
    return (
        <div>
            <div className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer">
                <span style={{ paddingLeft: `${level * 1.5}rem` }} className="flex items-center gap-2 flex-1" onClick={() => hasChildren && setIsOpen(!isOpen)}>
                    {hasChildren ? (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <span className="w-4"></span>}
                    {hasChildren ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium">{section.libelle}</span>
                    <span className="text-xs text-muted-foreground font-mono">{section.code}</span>
                </span>
            </div>
             {isOpen && hasChildren && (
                <div>
                    {section.children?.map(child => <SectionNode key={child.id} section={child} level={level + 1} />)}
                </div>
            )}
        </div>
    )
}

export default function SectionsAnalytiquesPage() {
    const [selectedPlanId, setSelectedPlanId] = useState(MOCK_DATA[0].id);
    const selectedPlan = MOCK_DATA.find(p => p.id === selectedPlanId);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2"><Tree/> Sections Analytiques</CardTitle>
            <CardDescription>Gérez la hiérarchie de vos sections pour chaque plan analytique.</CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer une section
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid md:grid-cols-3 gap-4 border-b pb-4">
            <div>
                 <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                    <SelectTrigger><SelectValue placeholder="Sélectionnez un plan..." /></SelectTrigger>
                    <SelectContent>
                       {MOCK_DATA.map(plan => <SelectItem key={plan.id} value={plan.id}>{plan.nom}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="md:col-span-2">
                <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <Input placeholder="Rechercher une section par code ou libellé..." className="pl-9" />
                </div>
            </div>
        </div>
        <div className="p-2 border rounded-lg min-h-[400px]">
            {selectedPlan ? selectedPlan.sections.map(section => (
               <SectionNode key={section.id} section={section} />
            )) : <p>Aucun plan sélectionné.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
