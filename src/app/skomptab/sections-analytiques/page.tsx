'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SectionType = 'Charges' | 'Centre de coût' | 'Produits' | 'Centre de profit' | 'Projet';

type SectionAnalytique = {
  id: string;
  code: string;
  intitule: string;
  compteGeneral: string;
  type: SectionType;
};

const MOCK_SECTIONS: SectionAnalytique[] = [
  { id: '1', code: '60', intitule: 'Achats', compteGeneral: '60x', type: 'Charges' },
  { id: '2', code: '601.01', intitule: 'Achats - Direction', compteGeneral: '601', type: 'Centre de coût' },
  { id: '3', code: '601.02', intitule: 'Achats - Production', compteGeneral: '601', type: 'Centre de coût' },
  { id: '4', code: '601.03', intitule: 'Achats - Commercial', compteGeneral: '601', type: 'Centre de coût' },
  { id: '5', code: '606.01', intitule: 'Fournitures - Direction', compteGeneral: '6061', type: 'Centre de coût' },
  { id: '6', code: '606.02', intitule: 'Fournitures - Production', compteGeneral: '6061', type: 'Centre de coût' },
  { id: '7', code: '606.03', intitule: 'Fournitures - Commercial', compteGeneral: '6061', type: 'Centre de coût' },
  { id: '8', code: '64', intitule: 'Charges de personnel', compteGeneral: '64x', type: 'Charges' },
  { id: '9', code: '641.01', intitule: 'Salaires - Direction', compteGeneral: '641', type: 'Centre de coût' },
  { id: '10', code: '641.02', intitule: 'Salaires - Production', compteGeneral: '641', type: 'Centre de coût' },
  { id: '11', code: '641.03', intitule: 'Salaires - Commercial', compteGeneral: '641', type: 'Centre de coût' },
  { id: '12', code: '70', intitule: 'Ventes', compteGeneral: '70x', type: 'Produits' },
  { id: '13', code: '701.FR', intitule: 'Ventes - France', compteGeneral: '701', type: 'Centre de profit' },
  { id: '14', code: '701.EXP', intitule: 'Ventes - Export', compteGeneral: '701', type: 'Centre de profit' },
  { id: '15', code: '701.PRJ001', intitule: 'Ventes - Projet Alpha', compteGeneral: '701', type: 'Projet' },
  { id: '16', code: '701.PRJ002', intitule: 'Ventes - Projet Beta', compteGeneral: '701', type: 'Projet' },
  { id: '17', code: '61', intitule: 'Services extérieurs', compteGeneral: '61x', type: 'Charges' },
  { id: '18', code: '613.01', intitule: 'Location - Direction', compteGeneral: '613', type: 'Centre de coût' },
  { id: '19', code: '613.02', intitule: 'Location - Production', compteGeneral: '613', type: 'Centre de coût' },
];

const defaultFormData: Omit<SectionAnalytique, 'id'> = {
  code: '',
  intitule: '',
  compteGeneral: '',
  type: 'Centre de coût',
};

export default function SectionsAnalytiquesPage() {
    const [sections, setSections] = useState<SectionAnalytique[]>(MOCK_SECTIONS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<SectionAnalytique | null>(null);
    const [formData, setFormData] = useState(defaultFormData);
    const [sectionToDelete, setSectionToDelete] = useState<SectionAnalytique | null>(null);
    const { toast } = useToast();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
    };
  
    const handleSelectChange = (value: string) => {
      setFormData((prev) => ({ ...prev, type: value as SectionType }));
    };
    
    const handleOpenCreateModal = () => {
      setEditingSection(null);
      setFormData(defaultFormData);
      setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (section: SectionAnalytique) => {
      setEditingSection(section);
      setFormData({
        code: section.code,
        intitule: section.intitule,
        compteGeneral: section.compteGeneral,
        type: section.type,
      });
      setIsModalOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingSection(null);
    }
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingSection) {
        setSections(
          sections.map((s) =>
            s.id === editingSection.id ? { ...editingSection, ...formData } : s
          ).sort((a,b) => a.code.localeCompare(b.code))
        );
        toast({ title: "Section modifiée avec succès." });
      } else {
        const newSection: SectionAnalytique = {
          id: Date.now().toString(),
          ...formData,
        };
        setSections([...sections, newSection].sort((a,b) => a.code.localeCompare(b.code)));
        toast({ title: "Section créée avec succès." });
      }
      handleCloseModal();
    };
  
    const handleDeleteSection = () => {
      if (sectionToDelete) {
        setSections(sections.filter((c) => c.id !== sectionToDelete.id));
        setSectionToDelete(null);
        toast({ title: "Section supprimée." });
      }
    };
    
    const getIndentLevel = (code: string) => {
        return (code.split('.').length - 1) * 2;
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                        <CardTitle className="text-2xl">Sections Analytiques</CardTitle>
                        <CardDescription>
                            Gérez et consultez la structure de vos sections analytiques.
                        </CardDescription>
                        </div>
                        <Button onClick={handleOpenCreateModal}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Créer une section
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Code</TableHead>
                                <TableHead>Intitulé</TableHead>
                                <TableHead className="w-[150px]">Compte général</TableHead>
                                <TableHead className="w-[200px]">Type</TableHead>
                                <TableHead className="w-[100px] text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sections.map((section) => (
                                <TableRow key={section.id}>
                                    <TableCell className="font-mono" style={{ paddingLeft: `${getIndentLevel(section.code) + 1}rem` }}>
                                        {section.code}
                                    </TableCell>
                                    <TableCell className="font-medium">{section.intitule}</TableCell>
                                    <TableCell className="font-mono">{section.compteGeneral}</TableCell>
                                    <TableCell>{section.type}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(section)}>
                                              <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setSectionToDelete(section)} className="text-destructive hover:text-destructive">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingSection ? 'Modifier la section' : 'Nouvelle section'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input id="code" value={formData.code} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="intitule">Intitulé</Label>
                                <Input id="intitule" value={formData.intitule} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="compteGeneral">Compte général</Label>
                                <Input id="compteGeneral" value={formData.compteGeneral} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={formData.type} onValueChange={handleSelectChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Charges">Charges</SelectItem>
                                    <SelectItem value="Centre de coût">Centre de coût</SelectItem>
                                    <SelectItem value="Produits">Produits</SelectItem>
                                    <SelectItem value="Centre de profit">Centre de profit</SelectItem>
                                    <SelectItem value="Projet">Projet</SelectItem>
                                </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseModal}>Annuler</Button>
                            <Button type="submit">Enregistrer</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous certain ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSectionToDelete(null)}>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSection} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
