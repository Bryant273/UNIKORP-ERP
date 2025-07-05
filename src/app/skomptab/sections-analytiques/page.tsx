
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
import { PlusCircle, Eye, Pencil, Trash2, Folder, File, Sigma, ArrowRight } from 'lucide-react';
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
  compteGeneral: string;
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
        id: 'charges-60', code: '60', name: 'Achats', type: 'folder', compteGeneral: '60x',
        children: [
            { id: 'charges-601.01', code: '601.01', name: 'Achats - Direction', type: 'item', compteGeneral: '601' },
            { id: 'charges-601.02', code: '601.02', name: 'Achats - Production', type: 'item', compteGeneral: '601' },
            { id: 'charges-601.03', code: '601.03', name: 'Achats - Commercial', type: 'item', compteGeneral: '601' },
            { id: 'charges-606.01', code: '606.01', name: 'Fournitures - Direction', type: 'item', compteGeneral: '6061' },
            { id: 'charges-606.02', code: '606.02', name: 'Fournitures - Production', type: 'item', compteGeneral: '6061' },
            { id: 'charges-606.03', code: '606.03', name: 'Fournitures - Commercial', type: 'item', compteGeneral: '6061' },
        ]
    },
    { 
        id: 'charges-64', code: '64', name: 'Charges de personnel', type: 'folder', compteGeneral: '64x',
        children: [
            { id: 'charges-641.01', code: '641.01', name: 'Salaires - Direction', type: 'item', compteGeneral: '641' },
            { id: 'charges-641.02', code: '641.02', name: 'Salaires - Production', type: 'item', compteGeneral: '641' },
            { id: 'charges-641.03', code: '641.03', name: 'Salaires - Commercial', type: 'item', compteGeneral: '641' },
        ]
    },
    { 
        id: 'produits-70', code: '70', name: 'Ventes', type: 'folder', compteGeneral: '70x',
        children: [
            { id: 'produits-701.FR', code: '701.FR', name: 'Ventes - France', type: 'item', compteGeneral: '701' },
            { id: 'produits-701.EXP', code: '701.EXP', name: 'Ventes - Export', type: 'item', compteGeneral: '701' },
            { id: 'produits-701.PRJ001', code: '701.PRJ001', name: 'Ventes - Projet Alpha', type: 'item', compteGeneral: '701' },
            { id: 'produits-701.PRJ002', code: '701.PRJ002', name: 'Ventes - Projet Beta', type: 'item', compteGeneral: '701' },
        ]
    },
    { 
        id: 'charges-61', code: '61', name: 'Services extérieurs', type: 'folder', compteGeneral: '61x',
        children: [
            { id: 'charges-613.01', code: '613.01', name: 'Location - Direction', type: 'item', compteGeneral: '613' },
            { id: 'charges-613.02', code: '613.02', name: 'Location - Production', type: 'item', compteGeneral: '613' },
        ]
    }
];

const getMockEntriesForSection = (sectionCode: string): MockEntry[] => {
    return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => {
        const isDebit = Math.random() > 0.5;
        const amount = Math.round(Math.random() * 100000) / 100;
        return {
            id: `e${i}-${sectionCode}`,
            date: `2024-07-${String(10 + i).padStart(2, '0')}`,
            journal: ['AC', 'VE', 'OD'][Math.floor(Math.random() * 3)],
            piece: `F24-${sectionCode}-${i}`,
            libelle: `${isDebit ? 'Charge' : 'Produit'} imputé(e) à ${sectionCode} #${i+1}`,
            debit: isDebit ? amount : 0,
            credit: !isDebit ? amount : 0,
        };
    });
};

const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' XOF';


export default function SectionsAnalytiquesPage() {
    const [sections, setSections] = useState<Section[]>(MOCK_ANALYTIC_PLAN);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [viewingSection, setViewingSection] = useState<Section | null>(null);
    const [mockEntries, setMockEntries] = useState<MockEntry[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
    const [formData, setFormData] = useState<Omit<Section, 'id' | 'children'>>({ code: '', name: '', type: 'item', compteGeneral: '' });
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
        setFormData({ code: '', name: '', type: 'item', compteGeneral: '' });
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (section: Section) => {
        setEditingSection(section);
        setFormData({ code: section.code, name: section.name, type: section.type, compteGeneral: section.compteGeneral });
        setIsModalOpen(true);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, logic to add/update section in the tree would be complex.
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

    const totals = useMemo(() => {
        if (!viewingSection) return { debit: 0, credit: 0, solde: 0 };
        const totalDebit = mockEntries.reduce((sum, entry) => sum + entry.debit, 0);
        const totalCredit = mockEntries.reduce((sum, entry) => sum + entry.credit, 0);
        return { debit: totalDebit, credit: totalCredit, solde: totalDebit - totalCredit };
    }, [mockEntries, viewingSection]);
    
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Sections Analytiques</CardTitle>
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
                  <TableHead>Compte général</TableHead>
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
                    <TableCell className="font-mono text-xs">{section.compteGeneral}</TableCell>
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
        <SheetContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
          {viewingSection && (
            <>
              <SheetHeader>
                <SheetTitle>Détail de la Section : {viewingSection.name}</SheetTitle>
                <SheetDescription>
                  Code: <Badge variant="secondary">{viewingSection.code}</Badge> | Type: <Badge variant="outline">{viewingSection.type === 'folder' ? 'Dossier' : 'Section'}</Badge> | Compte Général: <Badge variant="outline">{viewingSection.compteGeneral}</Badge>
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sigma className="h-5 w-5"/>
                            Synthèse
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-2 rounded-md bg-muted">
                            <p className="text-sm text-muted-foreground">Total Débit</p>
                            <p className="font-bold font-mono text-green-600">{formatCurrency(totals.debit)}</p>
                        </div>
                         <div className="p-2 rounded-md bg-muted">
                            <p className="text-sm text-muted-foreground">Total Crédit</p>
                            <p className="font-bold font-mono text-red-600">{formatCurrency(totals.credit)}</p>
                        </div>
                         <div className="p-2 rounded-md bg-muted">
                            <p className="text-sm text-muted-foreground">Solde</p>
                            <p className={cn("font-bold font-mono", totals.solde > 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(totals.solde)}</p>
                        </div>
                    </CardContent>
                 </Card>
                 
                 {viewingSection.type === 'folder' && viewingSection.children && (
                     <Card>
                        <CardHeader><CardTitle>Contenu du Dossier</CardTitle></CardHeader>
                        <CardContent>
                             <ul className="space-y-2">
                                {viewingSection.children.map(child => (
                                    <li key={child.id} className="flex items-center justify-between p-2 rounded-md border">
                                        <div className="flex items-center gap-2">
                                            {child.type === 'folder' ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
                                            <span className="font-medium">{child.name}</span>
                                            <Badge variant="secondary" className="font-mono">{child.code}</Badge>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => handleViewSection(child)}>
                                            Consulter <ArrowRight className="ml-2 h-4 w-4"/>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                     </Card>
                 )}

                 {viewingSection.type === 'item' && (
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
                                            <TableCell className="text-right font-mono text-green-600">{entry.debit > 0 ? formatCurrency(entry.debit) : ''}</TableCell>
                                            <TableCell className="text-right font-mono text-red-600">{entry.credit > 0 ? formatCurrency(entry.credit) : ''}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                 )}
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
                    <Label htmlFor="compteGeneral">Compte Général de rattachement</Label>
                    <Input id="compteGeneral" value={formData.compteGeneral} onChange={e => setFormData(f => ({...f, compteGeneral: e.target.value}))}/>
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

    