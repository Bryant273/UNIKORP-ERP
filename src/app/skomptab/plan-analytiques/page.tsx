'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, PlusCircle, Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PlanAnalytique = {
  id: number;
  code: string;
  nom: string;
  type: 'Projet' | 'Département' | 'Produit' | 'Région';
  statut: 'Actif' | 'Inactif';
  description: string;
};

const initialPlans: PlanAnalytique[] = [
  { id: 1, code: 'PROJ', nom: 'Analyse par Projet', type: 'Projet', statut: 'Actif', description: 'Suivi des coûts et revenus par projet individuel.' },
  { id: 2, code: 'DEPT', nom: 'Analyse par Département', type: 'Département', statut: 'Actif', description: 'Analyse des charges par centre de coût interne.' },
  { id: 3, code: 'PROD', nom: 'Analyse par Ligne de Produit', type: 'Produit', statut: 'Inactif', description: 'Suivi de la rentabilité par gamme de produits.' },
  { id: 4, code: 'REG', nom: 'Analyse par Région', type: 'Région', statut: 'Actif', description: 'Performance commerciale par zone géographique.' },
];

const defaultFormData: Omit<PlanAnalytique, 'id'> = {
  code: '',
  nom: '',
  description: '',
  type: 'Projet',
  statut: 'Actif',
};

export default function PlanAnalytiquesPage() {
  const [plans, setPlans] = useState<PlanAnalytique[]>(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanAnalytique | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PlanAnalytique | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const { toast } = useToast();

  const handleOpenModal = (plan: PlanAnalytique | null) => {
    setEditingPlan(plan);
    setFormData(plan ? { ...plan } : defaultFormData);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingPlan) {
      setPlans(plans.map(p => (p.id === editingPlan.id ? { ...p, ...formData } : p)));
      toast({ title: 'Plan mis à jour avec succès.' });
    } else {
      const newPlan = { id: Date.now(), ...formData };
      setPlans([...plans, newPlan]);
      toast({ title: 'Nouveau plan créé avec succès.' });
    }
    setIsModalOpen(false);
  };
  
  const handleDelete = () => {
      if(planToDelete) {
          setPlans(plans.filter(p => p.id !== planToDelete.id));
          setPlanToDelete(null);
          toast({ title: 'Plan supprimé.' });
      }
  }

  const toggleStatut = (plan: PlanAnalytique) => {
      const newStatut = plan.statut === 'Actif' ? 'Inactif' : 'Actif';
      setPlans(plans.map(p => p.id === plan.id ? {...p, statut: newStatut} : p));
      toast({ title: `Le plan "${plan.nom}" est maintenant ${newStatut.toLowerCase()}.` });
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2"><Network /> Plan Analytique</CardTitle>
              <CardDescription>Créez et gérez vos axes d'analyse pour un suivi financier détaillé.</CardDescription>
            </div>
            <Button onClick={() => handleOpenModal(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Créer un plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom du plan</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map(plan => (
                <TableRow key={plan.id}>
                  <TableCell className="font-mono">{plan.code}</TableCell>
                  <TableCell className="font-medium">{plan.nom}</TableCell>
                  <TableCell>{plan.type}</TableCell>
                  <TableCell className="text-muted-foreground">{plan.description}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={plan.statut === 'Actif'}
                      onCheckedChange={() => toggleStatut(plan)}
                      aria-label="Toggle plan status"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                     <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(plan)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setPlanToDelete(plan)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>{editingPlan ? 'Modifier le plan analytique' : 'Créer un nouveau plan analytique'}</DialogTitle>
                <DialogDescription>Définissez les paramètres de votre axe d'analyse.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">Code</Label>
                    <Input id="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nom" className="text-right">Nom</Label>
                    <Input id="nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button onClick={handleSave}>Enregistrer</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce plan ?</AlertDialogTitle>
                <AlertDialogDescription>Cette action est irréversible et supprimera le plan et toutes ses sections associées.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
