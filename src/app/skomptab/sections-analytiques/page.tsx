
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Eye, Pencil, Trash2, Folder, File } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type SectionType = 'folder' | 'item';
type Section = {
  id: string;
  code: string;
  name: string;
  type: SectionType;
  children?: Section[];
};

type MockEntry = {
    id: string;
    date: string;
    journal: string;
    piece: string;
    libelle: string;
    debit: number;
    credit: number;
};

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

const getMockEntriesForSection = (sectionCode: string): MockEntry[] => {
    return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
        id: `e${i}-${sectionCode}`,
        date: `2024-07-${String(10 + i).padStart(2, '0')}`,
        journal: ['AC', 'VE', 'OD'][Math.floor(Math.random() * 3)],
        piece: `F24-${sectionCode}-${i}`,
        libelle: `Charge imputée à ${sectionCode} #${i+1}`,
        debit: Math.random() > 0.5 ? Math.round(Math.random() * 1000) : 0,
        credit: Math.random() <= 0.5 ? Math.round(Math.random() * 1000) : 0,
    }));
};


export default function SectionsAnalytiquesPage() {
    const [sections, setSections] = useState<Section[]>(MOCK_ANALYTIC_PLAN);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewingSection, setViewingSection] = useState<Section | null>(null);
    const [mockEntries, setMockEntries] = useState<MockEntry[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
    const [formData, setFormData] = useState<Omit<Section, 'id' | 'children'>>({ code: '', name: '', type: 'item' });
    const { toast } = useToast();

    const flattenedSections = useMemo(() => {
        const flatten = (items: Section[], level = 0): (Section & { indent: number })[] => {
            let result: (Section & { indent: number })[] = [];
            for (const section of items) {
                result.push({ ...section, indent: level });
                if (section.children) {
                    result = result.concat(flatten(section.children, level + 1));
                }
            }
            return result;
        };
        return flatten(sections);
    }, [sections]);

    const handleViewSection = (section: Section) => {
        setViewingSection(section);
        setMockEntries(getMockEntriesForSection(section.code));
        setIsSheetOpen(true);
    };

    const handleOpenCreateModal = () => {
        setEditingSection(null);
        setFormData({ code: '', name: '', type: 'item' });
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (section: Section) => {
        setEditingSection(section);
        setFormData({ code: section.code, name: section.name, type: section.type });
        setIsModalOpen(true);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, logic to add/update section in the tree would be complex.
        // For this demo, we'll just show a toast.
        toast({
            title: editingSection ? "Section modifiée (simulation)" : "Section créée (simulation)",
            description: `Le code de la section est : ${formData.code}`,
        });
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (!sectionToDelete) return;
        // Logic to remove section from tree would be complex.
        toast({
            title: "Section supprimée (simulation)",
            description: `La section ${sectionToDelete.name} a été supprimée.`,
        });
        setSectionToDelete(null);
    };
    
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Gestion des Sections Analytiques</CardTitle>
              <CardDescription>
                Consultez, modifiez et explorez les sections de votre plan analytique.
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer une section
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Code Section</TableHead>
                  <TableHead>Intitulé</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[150px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flattenedSections.map((section) => (
                  <TableRow key={section.id} className="odd:bg-muted/50">
                    <TableCell 
                        className="font-mono text-xs"
                        style={{ paddingLeft: `${section.indent * 1.5 + 1}rem` }}
                    >
                        {section.code}
                    </TableCell>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           {section.type === 'folder' 
                             ? <Folder className="h-4 w-4 text-primary" /> 
                             : <File className="h-4 w-4 text-muted-foreground" />
                           }
                           {section.name}
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{section.type === 'folder' ? 'Dossier' : 'Section'}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewSection(section)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(section)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setSectionToDelete(section)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl">
          {viewingSection && (
            <>
              <SheetHeader>
                <SheetTitle>Détail de la Section : {viewingSection.name}</SheetTitle>
                <SheetDescription>
                  Code: <span className="font-mono">{viewingSection.code}</span> - Type: <Badge variant="outline">{viewingSection.type === 'folder' ? 'Dossier' : 'Section'}</Badge>
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                 <Card>
                    <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
                    <CardContent className="text-sm">
                        <p>Détails et paramètres de la section ici.</p>
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader><CardTitle>Écritures Rattachées</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Libellé</TableHead>
                                    <TableHead className="text-right">Débit</TableHead>
                                    <TableHead className="text-right">Crédit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockEntries.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{entry.date}</TableCell>
                                        <TableCell>{entry.libelle}</TableCell>
                                        <TableCell className="text-right font-mono">{entry.debit > 0 ? entry.debit.toFixed(2) : ''}</TableCell>
                                        <TableCell className="text-right font-mono">{entry.credit > 0 ? entry.credit.toFixed(2) : ''}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                 </Card>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Fermer</Button>
                </SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{editingSection ? 'Modifier la section' : 'Nouvelle section analytique'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" value={formData.code} onChange={e => setFormData(f => ({...f, code: e.target.value}))}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="name">Intitulé</Label>
                    <Input id="name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(v: SectionType) => setFormData(f => ({...f, type: v}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="folder">Dossier</SelectItem>
                            <SelectItem value="item">Section</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. La section sera définitivement supprimée.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSectionToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
