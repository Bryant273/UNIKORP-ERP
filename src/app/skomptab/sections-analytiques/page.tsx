'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trees, Folder, File, PlusCircle, Search, ChevronRight, ChevronDown } from 'lucide-react';

type Section = {
  id: string;
  code: string;
  name: string;
  type: 'folder' | 'item';
  children?: Section[];
}

const MOCK_ANALYTIC_PLAN: Section[] = [
    { 
        id: 'dept', 
        code: 'DEPT',
        name: 'Par Département', 
        type: 'folder', 
        children: [
            { id: 'dept-fin', code: 'D-FIN', name: 'Finance & Comptabilité', type: 'folder', children: [
                { id: 'dept-fin-cpta', code: 'D-FIN-CPTA', name: 'Comptabilité Générale', type: 'item' },
                { id: 'dept-fin-ctrl', code: 'D-FIN-CTRL', name: 'Contrôle de Gestion', type: 'item' },
            ]},
            { id: 'dept-rh', code: 'D-RH', name: 'Ressources Humaines', type: 'item' },
            { id: 'dept-it', code: 'D-IT', name: 'Technologies de l\'Information', type: 'folder', children: [
                 { id: 'dept-it-infra', code: 'D-IT-INFRA', name: 'Infrastructure', type: 'item' },
                 { id: 'dept-it-dev', code: 'D-IT-DEV', name: 'Développement', type: 'item' },
            ]},
        ]
    },
    {
        id: 'proj',
        code: 'PROJ',
        name: 'Par Projet',
        type: 'folder',
        children: [
            { id: 'proj-erp', code: 'P2024-01-DEV', name: 'Développement ERP', type: 'item' },
            { id: 'proj-mkt', code: 'P2024-02-MKT', name: 'Campagne Marketing T3', type: 'item' },
        ]
    }
];

const SectionTree = ({ sections, level = 0 }: { sections: Section[], level?: number }) => {
    const [openFolders, setOpenFolders] = useState<string[]>(sections.map(s => s.id));

    const toggleFolder = (id: string) => {
        setOpenFolders(prev => prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]);
    };
    
    return (
        <div className="space-y-1">
            {sections.map(section => (
                <div key={section.id}>
                    <div 
                        className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer" 
                        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
                        onClick={() => section.type === 'folder' && toggleFolder(section.id)}
                    >
                        {section.type === 'folder' ? (
                            openFolders.includes(section.id) ? <ChevronDown className="h-4 w-4 mr-2"/> : <ChevronRight className="h-4 w-4 mr-2"/>
                        ) : (
                            <File className="h-4 w-4 mr-2 text-muted-foreground"/>
                        )}
                        <span className="font-mono text-xs text-muted-foreground mr-2">{section.code}</span>
                        <span className="font-medium">{section.name}</span>
                    </div>
                    {section.type === 'folder' && section.children && openFolders.includes(section.id) && (
                        <SectionTree sections={section.children} level={level + 1} />
                    )}
                </div>
            ))}
        </div>
    )
}

export default function SectionsAnalytiquesPage() {

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2"><Trees /> Sections Analytiques</CardTitle>
            <CardDescription>
                Explorez, créez et gérez l'arborescence de vos sections analytiques.
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle section
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <Select defaultValue="dept">
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="dept">Plan Analytique par Département</SelectItem>
                        <SelectItem value="proj">Plan Analytique par Projet</SelectItem>
                    </SelectContent>
                </Select>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher une section..." className="pl-9" />
                </div>
            </div>
            <div className="md:col-span-2 border rounded-lg p-4 min-h-[400px]">
                <SectionTree sections={MOCK_ANALYTIC_PLAN} />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
