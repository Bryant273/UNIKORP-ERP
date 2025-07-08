
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileCog, PlusCircle, Import, ChevronDown, CheckCircle, AlertTriangle, Library, Palette, ShieldCheck, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const SectionCard = ({ title, description, children, actions }: { title: string, description: string, children: React.ReactNode, actions: React.ReactNode }) => (
    <>
        <div className="flex items-center justify-between mb-4">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-2">
                {actions}
            </div>
        </div>
        {children}
    </>
);


// Mock Data for Tables
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


export default function ParametrageBulletinPage() {
    const { toast } = useToast();
    
    return (
        <div className="w-full">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <FileCog />
                        Paramétrage du Bulletin de Paie
                    </CardTitle>
                    <CardDescription>
                        Configurez toutes les composantes de vos bulletins de paie, des rubriques aux profils employés.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="multiple" defaultValue={['item-1']} className="w-full space-y-4">

                        {/* Section Rubriques de Paie */}
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-xl font-bold p-4 bg-muted/50 rounded-lg">Rubriques de Paie</AccordionTrigger>
                            <AccordionContent className="p-4">
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
                            </AccordionContent>
                        </AccordionItem>

                        {/* Section Cotisations Sociales */}
                         <AccordionItem value="item-2">
                            <AccordionTrigger className="text-xl font-bold p-4 bg-muted/50 rounded-lg">Cotisations Sociales</AccordionTrigger>
                            <AccordionContent className="p-4">
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
                            </AccordionContent>
                        </AccordionItem>
                        
                        {/* Section Profils Employés */}
                         <AccordionItem value="item-3">
                            <AccordionTrigger className="text-xl font-bold p-4 bg-muted/50 rounded-lg">Profils Employés</AccordionTrigger>
                            <AccordionContent className="p-4">
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
                            </AccordionContent>
                        </AccordionItem>

                         {/* Section Paramètres d'Affichage */}
                         <AccordionItem value="item-4">
                            <AccordionTrigger className="text-xl font-bold p-4 bg-muted/50 rounded-lg">Paramètres d'Affichage</AccordionTrigger>
                             <AccordionContent className="p-4">
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
                            </AccordionContent>
                        </AccordionItem>

                        {/* Section Validation et Contrôles */}
                         <AccordionItem value="item-5">
                            <AccordionTrigger className="text-xl font-bold p-4 bg-muted/50 rounded-lg">Validation et Contrôles</AccordionTrigger>
                             <AccordionContent className="p-4">
                                <SectionCard
                                    title="Contrôle de cohérence"
                                    description="Vérifiez la conformité et la cohérence de vos paramètres de paie."
                                    actions={<Button onClick={() => toast({title: "Validation lancée..."})}>Lancer une validation complète</Button>}
                                >
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Card className="text-center bg-green-50 border-green-200"><CardHeader><CheckCircle className="mx-auto h-8 w-8 text-green-600"/><CardTitle className="mt-2 text-lg">Conforme</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">128</p><p className="text-sm text-muted-foreground">éléments validés</p></CardContent></Card>
                                        <Card className="text-center bg-yellow-50 border-yellow-200"><CardHeader><AlertTriangle className="mx-auto h-8 w-8 text-yellow-600"/><CardTitle className="mt-2 text-lg">Avertissements</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">2</p><p className="text-sm text-muted-foreground">éléments à vérifier</p></CardContent></Card>
                                        <Card className="text-center bg-red-50 border-red-200"><CardHeader><XCircle className="mx-auto h-8 w-8 text-red-600"/><CardTitle className="mt-2 text-lg">Erreurs</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">0</p><p className="text-sm text-muted-foreground">erreurs critiques</p></CardContent></Card>
                                    </div>
                                </SectionCard>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Section Modèles et Templates */}
                         <AccordionItem value="item-6">
                            <AccordionTrigger className="text-xl font-bold p-4 bg-muted/50 rounded-lg">Modèles et Templates</AccordionTrigger>
                             <AccordionContent className="p-4">
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
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
