
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileCog, PlusCircle, Import, ChevronDown, CheckCircle, AlertTriangle, Library, Palette, ShieldCheck, User, XCircle, Settings, Edit, Trash2, GitCompareArrows, SlidersHorizontal, Download, Eye, FileText, List, Briefcase, HandCoins, Users2, FileSignature } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- MOCK DATA ---
const mockEmployees = [
    { id: 'e001', matricule: 'UNIK-076', nom: 'Dupont', prenom: 'Jean', poste: 'Développeur Senior', statutPaie: 'Validée' },
    { id: 'e002', matricule: 'UNIK-077', nom: 'Martin', prenom: 'Sophie', poste: 'Chef de projet Marketing', statutPaie: 'Validée' },
    { id: 'e003', matricule: 'UNIK-078', nom: 'Garcia', prenom: 'David', poste: 'Comptable', statutPaie: 'En attente' },
    { id: 'e004', matricule: 'UNIK-042', nom: 'Petit', prenom: 'Lucas', poste: 'Développeur Junior', statutPaie: 'Erreur' },
    { id: 'e005', matricule: 'UNIK-055', nom: 'Leroy', prenom: 'Camille', poste: 'Gestionnaire RH', statutPaie: 'Validée' },
];

const mockRubriques = [
    { code: '001', libelle: 'Salaire de base', type: 'Gain', groupe: 'Salaire', ordre: 10, statut: 'Actif' },
    { code: '105', libelle: 'Prime d\'ancienneté', type: 'Gain', groupe: 'Primes', ordre: 20, statut: 'Actif' },
    { code: '401', libelle: 'Cotisation retraite T1', type: 'Retenue', groupe: 'Cotisations', ordre: 100, statut: 'Actif' },
    { code: '900', libelle: 'Acompte', type: 'Retenue', groupe: 'Avances', ordre: 200, statut: 'Inactif' },
];

const mockCotisations = [
    { code: 'S21.G01.00.001', libelle: 'Maladie, maternité, invalidité', organisme: 'URSSAF', type: 'Mixte', tauxSalarial: '0.75%', tauxPatronal: '13.00%', statut: 'Actif' },
    { code: 'S21.G01.00.002', libelle: 'Retraite de base', organisme: 'AGIRC-ARRCO', type: 'Mixte', tauxSalarial: '6.90%', tauxPatronal: '8.55%', statut: 'Actif' },
    { code: 'S21.G01.00.005', libelle: 'Chômage', organisme: 'France Travail', type: 'Patronale', tauxSalarial: '0%', tauxPatronal: '4.05%', statut: 'Actif' },
];

const mockProfils = [
    { nom: 'Cadre commercial', nbEmployes: 12, statut: 'Cadre', derniereMaj: '15/07/2024' },
    { nom: 'Ouvrier qualifié', nbEmployes: 45, statut: 'Non-cadre', derniereMaj: '10/06/2024' },
    { nom: 'Apprenti', nbEmployes: 5, statut: 'Apprenti', derniereMaj: '01/09/2023' },
];

const mockModeles = [
    { nom: 'Modèle BTP - Cadre', secteur: 'Industrie', type: 'Public', nbElements: 45 },
    { nom: 'Modèle Commerce - Non Cadre', secteur: 'Commerce', type: 'Mes modèles', nbElements: 38 },
];

const SectionCard = ({ title, description, children, actions }: { title: string, description: string, children: React.ReactNode, actions?: React.ReactNode }) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
    </div>
);


export default function TraitementPaiePage() {
    const [employees, setEmployees] = useState(mockEmployees);
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().substring(0, 7));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const { toast } = useToast();

    const openModal = (employee: any) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'Validée': return <Badge><CheckCircle className="mr-1 h-3 w-3" />Validée</Badge>;
            case 'En attente': return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />En attente</Badge>;
            case 'Erreur': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Erreur</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };
    
    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <HandCoins />
                                Traitement de la paie
                            </CardTitle>
                            <CardDescription>
                                Lancez, suivez et validez le processus de paie mensuel pour vos employés.
                            </CardDescription>
                        </div>
                         <Button onClick={() => toast({title: "Fonctionnalité à venir"})} size="lg">Lancer la paie du mois</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex items-center gap-4">
                        <Label htmlFor="period-selector">Période de paie:</Label>
                        <Input type="month" id="period-selector" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} className="w-[200px]" />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Matricule</TableHead>
                                <TableHead>Employé</TableHead>
                                <TableHead>Poste</TableHead>
                                <TableHead className="text-center">Statut de la paie</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map(emp => (
                                <TableRow key={emp.id}>
                                    <TableCell className="font-mono text-xs">{emp.matricule}</TableCell>
                                    <TableCell className="font-medium">{emp.nom} {emp.prenom}</TableCell>
                                    <TableCell>{emp.poste}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(emp.statutPaie)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => openModal(emp)}>
                                            <FileCog className="mr-2 h-4 w-4" />
                                            Gérer la paie
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ParametrageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} employee={selectedEmployee} />
        </>
    );
}

// --- MODAL & SUB-COMPONENTS ---
function ParametrageModal({ isOpen, onClose, employee }: { isOpen: boolean, onClose: () => void, employee: any }) {
    const { toast } = useToast();
    if (!employee) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Paramétrage du Bulletin de Paie</DialogTitle>
                    <DialogDescription>Configuration pour <span className="font-semibold">{employee.prenom} {employee.nom}</span>.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto -mx-6 px-1">
                    <Tabs defaultValue="rubriques" className="w-full">
                        <TabsList className="mx-6">
                            <TabsTrigger value="rubriques"><List className="mr-2 h-4 w-4"/>Rubriques</TabsTrigger>
                            <TabsTrigger value="cotisations"><Percent className="mr-2 h-4 w-4"/>Cotisations</TabsTrigger>
                            <TabsTrigger value="profils"><User className="mr-2 h-4 w-4"/>Profils</TabsTrigger>
                            <TabsTrigger value="affichage"><Palette className="mr-2 h-4 w-4"/>Affichage</TabsTrigger>
                            <TabsTrigger value="validation"><ShieldCheck className="mr-2 h-4 w-4"/>Validation</TabsTrigger>
                            <TabsTrigger value="modeles"><Library className="mr-2 h-4 w-4"/>Modèles</TabsTrigger>
                        </TabsList>
                        <ScrollArea className="h-[calc(80vh-100px)]">
                            <div className="p-6">
                                <TabsContent value="rubriques">
                                    <SectionCard
                                        title="Gestion des rubriques"
                                        description="Définissez chaque ligne de gain, de retenue ou d'information de vos bulletins."
                                        actions={<Button onClick={() => toast({title: "Fonctionnalité à venir"})}><PlusCircle className="mr-2 h-4 w-4"/>Nouvelle rubrique</Button>}
                                    >
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Libellé</TableHead><TableHead>Type</TableHead><TableHead>Groupe</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {mockRubriques.map(r => <TableRow key={r.code}><TableCell>{r.code}</TableCell><TableCell>{r.libelle}</TableCell><TableCell><Badge variant={r.type === 'Gain' ? 'default' : 'destructive'}>{r.type}</Badge></TableCell><TableCell>{r.groupe}</TableCell><TableCell><Badge variant={r.statut === 'Actif' ? 'secondary' : 'outline'}>{r.statut}</Badge></TableCell></TableRow>)}
                                            </TableBody>
                                        </Table>
                                    </SectionCard>
                                </TabsContent>
                                <TabsContent value="cotisations">
                                    <SectionCard
                                        title="Gestion des cotisations"
                                        description="Configurez les taux et les bases de calcul pour chaque cotisation sociale."
                                        actions={<Button onClick={() => toast({title: "Fonctionnalité à venir"})}><PlusCircle className="mr-2 h-4 w-4"/>Nouvelle cotisation</Button>}
                                    >
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Libellé</TableHead><TableHead>Organisme</TableHead><TableHead>Taux Salarial</TableHead><TableHead>Taux Patronal</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {mockCotisations.map(c => <TableRow key={c.code}><TableCell>{c.libelle}</TableCell><TableCell>{c.organisme}</TableCell><TableCell>{c.tauxSalarial}</TableCell><TableCell>{c.tauxPatronal}</TableCell></TableRow>)}
                                            </TableBody>
                                        </Table>
                                    </SectionCard>
                                </TabsContent>
                                <TabsContent value="profils">
                                    <SectionCard
                                        title="Gestion des profils"
                                        description="Créez des profils pour regrouper les employés et leur appliquer des règles de paie spécifiques."
                                        actions={<Button onClick={() => toast({title: "Fonctionnalité à venir"})}><PlusCircle className="mr-2 h-4 w-4"/>Nouveau profil</Button>}
                                    >
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {mockProfils.map(p => (
                                            <Card key={p.nom}>
                                                <CardHeader><CardTitle className="text-base">{p.nom}</CardTitle><CardDescription>Statut: {p.statut}</CardDescription></CardHeader>
                                                <CardContent><p>{p.nbEmployes} employés affectés</p></CardContent>
                                                <CardFooter><p className="text-xs text-muted-foreground">M.à.j : {p.derniereMaj}</p></CardFooter>
                                            </Card>
                                        ))}
                                        </div>
                                    </SectionCard>
                                </TabsContent>
                                <TabsContent value="affichage">
                                      <SectionCard
                                        title="Personnalisation du bulletin"
                                        description="Ajustez l'apparence visuelle des bulletins de paie générés."
                                        actions={<Button onClick={() => toast({title: "Fonctionnalité à venir"})}>Sauvegarder modèle</Button>}
                                    >
                                        <div className="p-4 border rounded-lg space-y-4">
                                            <div className="flex items-center justify-between"><Label>Modèle de base</Label><Select defaultValue="classique"><SelectTrigger className="w-[200px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="classique">Classique</SelectItem><SelectItem value="moderne">Moderne</SelectItem></SelectContent></Select></div>
                                            <div className="flex items-center justify-between"><Label>Police principale</Label><Select defaultValue="arial"><SelectTrigger className="w-[200px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="arial">Arial</SelectItem><SelectItem value="times">Times New Roman</SelectItem></SelectContent></Select></div>
                                            <div className="flex items-center justify-between"><Label>Couleur principale</Label><Input type="color" defaultValue="#673AB7" className="w-[200px]"/></div>
                                        </div>
                                    </SectionCard>
                                </TabsContent>
                                <TabsContent value="validation">
                                    <SectionCard
                                        title="Contrôle de cohérence"
                                        description="Vérifiez la conformité et la cohérence de vos paramètres de paie."
                                        actions={<Button onClick={() => toast({title: "Validation lancée..."})}>Lancer une validation</Button>}
                                    >
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <Card className="text-center bg-green-50 border-green-200"><CardHeader><CheckCircle className="mx-auto h-8 w-8 text-green-600"/><CardTitle className="mt-2 text-lg">Conforme</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">128</p><p className="text-sm text-muted-foreground">éléments validés</p></CardContent></Card>
                                            <Card className="text-center bg-yellow-50 border-yellow-200"><CardHeader><AlertTriangle className="mx-auto h-8 w-8 text-yellow-600"/><CardTitle className="mt-2 text-lg">Avertissements</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">2</p><p className="text-sm text-muted-foreground">éléments à vérifier</p></CardContent></Card>
                                            <Card className="text-center bg-red-50 border-red-200"><CardHeader><XCircle className="mx-auto h-8 w-8 text-red-600"/><CardTitle className="mt-2 text-lg">Erreurs</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0</p><p className="text-sm text-muted-foreground">erreurs critiques</p></CardContent></Card>
                                        </div>
                                    </SectionCard>
                                </TabsContent>
                                <TabsContent value="modeles">
                                    <SectionCard
                                        title="Bibliothèque de modèles"
                                        description="Sauvegardez et réutilisez des configurations complètes de paie."
                                        actions={<Button onClick={() => toast({title: "Fonctionnalité à venir"})}><PlusCircle className="mr-2 h-4 w-4"/>Créer un modèle</Button>}
                                    >
                                       <div className="grid md:grid-cols-2 gap-4">
                                        {mockModeles.map(m => (
                                            <Card key={m.nom}>
                                                <CardHeader><CardTitle className="text-base">{m.nom}</CardTitle><CardDescription>Secteur: {m.secteur}</CardDescription></CardHeader>
                                                <CardContent><Badge variant="secondary">{m.nbElements} éléments</Badge></CardContent>
                                                <CardFooter className="flex justify-end"><Button variant="outline" size="sm" onClick={() => toast({title: "Modèle appliqué (simulation)"})}>Appliquer</Button></CardFooter>
                                            </Card>
                                        ))}
                                        </div>
                                    </SectionCard>
                                </TabsContent>
                            </div>
                        </ScrollArea>
                    </Tabs>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                    <Button onClick={onClose}>Appliquer au bulletin</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
