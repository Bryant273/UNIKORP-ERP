
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlusCircle, Eye, Pencil, Trash2, Folder, File, Sigma, ArrowRight, Download, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';

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

// --- MOCK DATA ---
const MOCK_ANALYTIC_PLAN: Section[] = [
    { 
        id: 'charges-60', code: '60', name: 'Achats', type: 'folder', compteGeneral: '60x',
        children: [
            { id: 'charges-601.01', code: '601.01', name: 'Achats - Direction', type: 'item', compteGeneral: '601' },
            { id: 'charges-601.02', code: '601.02', name: 'Achats - Production', type: 'item', compteGeneral: '601' },
            { id: 'charges-601.03', code: '601.03', name: 'Achats - Commercial', type: 'item', compteGeneral: '601' },
        ]
    },
    { 
        id: 'charges-64', code: '64', name: 'Charges de personnel', type: 'folder', compteGeneral: '64x',
        children: [
            { id: 'charges-641.01', code: '641.01', name: 'Salaires - Direction', type: 'item', compteGeneral: '641' },
            { id: 'charges-641.02', code: '641.02', name: 'Salaires - Production', type: 'item', compteGeneral: '641' },
        ]
    },
    { 
        id: 'produits-70', code: '70', name: 'Ventes', type: 'folder', compteGeneral: '70x',
        children: [
            { id: 'produits-701.FR', code: '701.FR', name: 'Ventes - France', type: 'item', compteGeneral: '701' },
            { id: 'produits-701.EXP', code: '701.EXP', name: 'Ventes - Export', type: 'item', compteGeneral: '701' },
        ]
    },
];

const getMockEntriesForSection = (section: Section): MockEntry[] => {
    if (section.type === 'folder' && section.children) {
        return section.children.flatMap(child => getMockEntriesForSection(child));
    }
    
    return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => {
        const isDebit = section.compteGeneral.startsWith('6');
        const amount = Math.round(Math.random() * 100000) / 100;
        return {
            id: `e${i}-${section.code}`,
            date: `2024-07-${String(10 + i).padStart(2, '0')}`,
            journal: ['AC', 'VE', 'OD'][Math.floor(Math.random() * 3)],
            piece: `F24-${section.code}-${i}`,
            libelle: `${isDebit ? 'Charge' : 'Produit'} imputé(e) à ${section.name} #${i+1}`,
            debit: isDebit ? amount : 0,
            credit: !isDebit ? amount : 0,
        };
    });
};

const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' XOF';


export default function SectionsAnalytiquesPage() {
    const [sections, setSections] = useState<Section[]>(MOCK_ANALYTIC_PLAN);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    const [viewingStack, setViewingStack] = useState<Section[]>([]);
    const [mockEntries, setMockEntries] = useState<MockEntry[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
    const [formData, setFormData] = useState<Omit<Section, 'id' | 'children'>>({ code: '', name: '', type: 'item', compteGeneral: '' });
    const { toast } = useToast();

    const viewingSection = viewingStack.length > 0 ? viewingStack[viewingStack.length - 1] : null;

    const handleSheetClose = () => {
        setIsSheetOpen(false);
        setViewingStack([]);
    };

    const updateView = (section: Section) => {
        setMockEntries(getMockEntriesForSection(section));
    };

    const handleViewSection = (section: Section) => {
        setViewingStack([section]);
        updateView(section);
        setIsSheetOpen(true);
    };

    const handleNavigateToChild = (childSection: Section) => {
        setViewingStack(prev => [...prev, childSection]);
        updateView(childSection);
    };

    const handleGoBack = () => {
        const newStack = viewingStack.slice(0, -1);
        setViewingStack(newStack);
        if (newStack.length > 0) {
            updateView(newStack[newStack.length - 1]);
        } else {
            setIsSheetOpen(false);
        }
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
        toast({
            title: editingSection ? "Section modifiée (simulation)" : "Section créée (simulation)",
            description: `Le code de la section est : ${formData.code}`,
        });
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (!sectionToDelete) return;
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
    
    const handleExportPDF = (sectionToExport: Section | null) => {
        if (!sectionToExport) return;
        const entriesToExport = getMockEntriesForSection(sectionToExport);

        const doc = new jsPDF();
        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SKOMPTAB";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const printDateTime = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        const periodString = `Période en cours`;

        const drawHeader = (data: any) => {
             doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
            doc.setDrawColor(220);
            doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
            doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
            doc.setFontSize(14); doc.setTextColor(40, 40, 40); doc.setFont('helvetica', 'bold');
            doc.text(companyName, data.settings.margin.left + 15, 28);
            doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(100);
            const rightX = doc.internal.pageSize.width - data.settings.margin.right;
            doc.text(`Détail Section Analytique`, rightX, 25, { align: 'right' });
            doc.text(`Période : ${periodString}`, rightX, 30, { align: 'right' });
            doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
            doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
        };
        
        doc.setFontSize(18); doc.text(`Détail Section Analytique`, 105, 20, { align: 'center' });
        doc.setFontSize(12); doc.text(`Section: ${sectionToExport.code} - ${sectionToExport.name}`, 15, 30);
        
        if (sectionToExport.type === 'item') {
            const tableColumn = ["Date", "Journal", "Pièce", "Libellé", "Débit", "Crédit"];
            const tableRows = entriesToExport.map(e => [
                e.date, e.journal, e.piece, e.libelle, formatCurrency(e.debit), formatCurrency(e.credit)
            ]);
            autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40, didDrawPage: drawHeader, margin: { top: 50 } });
        } else if (sectionToExport.type === 'folder' && sectionToExport.children) {
            doc.setFontSize(14); doc.text('Sous-sections', 15, 40);
            const tableColumn = ["Code", "Nom", "Compte Général"];
            const tableRows = sectionToExport.children.map(child => [ child.code, child.name, child.compteGeneral ]);
            autoTable(doc, { head: [tableColumn], body: tableRows, startY: 45, didDrawPage: drawHeader, margin: { top: 50 } });
        }

        doc.save(`details_section_${sectionToExport.code}.pdf`);
        toast({ title: "Exportation PDF réussie" });
    };

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
                  <TableHead>Intitulé de la section</TableHead>
                  <TableHead className="w-[150px]">Code</TableHead>
                  <TableHead className="w-[150px]">Compte général</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[150px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id} className="odd:bg-muted/50">
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <Folder className="h-4 w-4 text-primary" /> 
                           {section.name}
                        </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{section.code}</TableCell>
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

      <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col p-0">
          {viewingSection && (
            <>
              <SheetHeader className="p-6 border-b">
                <SheetTitle>Détail de la Section : {viewingSection.name}</SheetTitle>
                <SheetDescription>
                  Code: <Badge variant="secondary">{viewingSection.code}</Badge> | Type: <Badge variant="outline">{viewingSection.type === 'folder' ? 'Dossier' : 'Section'}</Badge> | Compte Général: <Badge variant="outline">{viewingSection.compteGeneral}</Badge>
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5"/>Synthèse</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-2 rounded-md bg-muted"><p className="text-sm text-muted-foreground">Total Débit</p><p className="font-bold font-mono text-green-600">{formatCurrency(totals.debit)}</p></div>
                            <div className="p-2 rounded-md bg-muted"><p className="text-sm text-muted-foreground">Total Crédit</p><p className="font-bold font-mono text-red-600">{formatCurrency(totals.credit)}</p></div>
                            <div className="p-2 rounded-md bg-muted"><p className="text-sm text-muted-foreground">Solde</p><p className={cn("font-bold font-mono", totals.solde >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(totals.solde)}</p></div>
                        </CardContent>
                    </Card>
                    
                    {viewingSection.type === 'folder' && viewingSection.children && (
                        <Card>
                            <CardHeader><CardTitle>Contenu du Dossier</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {viewingSection.children.map(child => (
                                        <li key={child.id} className="flex items-center justify-between p-2 rounded-md border hover:bg-accent">
                                            <div className="flex items-center gap-2">
                                                {child.type === 'folder' ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
                                                <span className="font-medium">{child.name}</span>
                                                <Badge variant="secondary" className="font-mono">{child.code}</Badge>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleNavigateToChild(child)}>
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
                            <CardHeader><CardTitle>Écritures Rattachées (Exemple)</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Libellé</TableHead><TableHead className="text-right">Débit</TableHead><TableHead className="text-right">Crédit</TableHead></TableRow></TableHeader>
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
              </ScrollArea>
              <SheetFooter className="p-6 border-t flex justify-between">
                <div>
                   {viewingStack.length > 1 && (
                     <Button variant="ghost" onClick={handleGoBack}>
                       <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                     </Button>
                   )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSheetClose}>Fermer</Button>
                  <Button onClick={() => handleExportPDF(viewingSection)}><Download className="mr-2 h-4 w-4"/>Exporter en PDF</Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader><DialogTitle>{editingSection ? 'Modifier la section' : 'Nouvelle section analytique'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label htmlFor="code">Code</Label><Input id="code" value={formData.code} onChange={e => setFormData(f => ({...f, code: e.target.value}))}/></div>
                <div className="space-y-2"><Label htmlFor="name">Intitulé</Label><Input id="name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/></div>
                <div className="space-y-2"><Label htmlFor="compteGeneral">Compte Général de rattachement</Label><Input id="compteGeneral" value={formData.compteGeneral} onChange={e => setFormData(f => ({...f, compteGeneral: e.target.value}))}/></div>
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(v: SectionType) => setFormData(f => ({...f, type: v}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="folder">Dossier</SelectItem><SelectItem value="item">Section</SelectItem></SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button><Button type="submit">Enregistrer</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible. La section sera définitivement supprimée.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel onClick={() => setSectionToDelete(null)}>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
