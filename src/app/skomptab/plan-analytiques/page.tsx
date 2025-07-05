
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash2, PlusCircle, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SectionType = 'Centre de coût' | 'Centre de profit' | 'Projet';

type SectionAnalytique = {
  id: number;
  code: string;
  intitule: string;
  type: SectionType;
};

const initialSections: SectionAnalytique[] = [
  { id: 1, code: '01', intitule: 'Direction Générale', type: 'Centre de coût' },
  { id: 2, code: '01.01', intitule: 'Administration', type: 'Centre de coût' },
  { id: 3, code: '01.02', intitule: 'Comptabilité', type: 'Centre de coût' },
  { id: 4, code: '02', intitule: 'Production', type: 'Centre de profit' },
  { id: 5, code: '02.01', intitule: 'Atelier 1', type: 'Centre de coût' },
  { id: 6, code: '02.02', intitule: 'Atelier 2', type: 'Centre de coût' },
  { id: 7, code: '03', intitule: 'Commercial', type: 'Centre de profit' },
  { id: 8, code: '03.01', intitule: 'Ventes France', type: 'Centre de profit' },
  { id: 9, code: '03.02', intitule: 'Ventes Export', type: 'Centre de profit' },
];

const defaultFormData: Omit<SectionAnalytique, 'id'> = {
  code: '',
  intitule: '',
  type: 'Centre de coût',
};

export default function PlanAnalytiquesPage() {
  const [sections, setSections] = useState<SectionAnalytique[]>(initialSections);
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
        )
      );
      toast({ title: "Section modifiée avec succès." });
    } else {
      const newSection: SectionAnalytique = {
        id: Date.now(),
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
      return (code.split('.').length - 1) * 2; // 2rem padding for each level
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Plan analytique</CardTitle>
              <CardDescription>
                Consultez et personnalisez le plan analytique de votre organisation.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </Button>
              <Button onClick={handleOpenCreateModal}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouvelle section
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Code</TableHead>
                <TableHead>Intitulé</TableHead>
                <TableHead className="w-[200px]">Type</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id} className="odd:bg-muted/50">
                  <TableCell className="font-mono" style={{ paddingLeft: `${getIndentLevel(section.code) + 1}rem` }}>{section.code}</TableCell>
                  <TableCell className="font-medium">{section.intitule}</TableCell>
                  <TableCell>{section.type}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(section)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setSectionToDelete(section)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
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
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingSection ? 'Modifier la section' : 'Nouvelle section'}</DialogTitle>
              <DialogDescription>
                {editingSection ? 'Mettez à jour les informations de la section.' : 'Remplissez les informations pour créer une nouvelle section.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" value={formData.code} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="intitule" className="text-right">Intitulé</Label>
                <Input id="intitule" value={formData.intitule} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select value={formData.type} onValueChange={handleSelectChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Centre de coût">Centre de coût</SelectItem>
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
                <AlertDialogTitle>Êtes-vous absolument certain ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. La section sera définitivement supprimée.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSectionToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSection} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
