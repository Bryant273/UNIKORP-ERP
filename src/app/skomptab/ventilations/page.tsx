'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Percent, Settings, FileSpreadsheet, Play } from 'lucide-react';

type ModeleVentilation = {
  id: number;
  nom: string;
  description: string;
  type: 'Pourcentage' | 'Montant Fixe' | 'Clé Variable';
  nbRules: number;
  lastUsed: string;
};

const MOCK_DATA: ModeleVentilation[] = [
    { id: 1, nom: 'Répartition Charges Générales', description: 'Ventile les charges communes (loyer, électricité) sur les départements.', type: 'Pourcentage', nbRules: 4, lastUsed: '25/07/2024' },
    { id: 2, nom: 'Ventilation Coûts Projet Alpha', description: 'Alloue les coûts de développement au projet Alpha.', type: 'Montant Fixe', nbRules: 2, lastUsed: '15/07/2024' },
    { id: 3, nom: 'Clé de répartition Marketing', description: 'Répartit les frais marketing en fonction du chiffre d\'affaires par produit.', type: 'Clé Variable', nbRules: 5, lastUsed: '01/07/2024' },
];

export default function VentilationsPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2"><FileSpreadsheet /> Ventilations Analytiques</CardTitle>
            <CardDescription>
                Créez et gérez vos modèles de répartition des charges et produits.
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un modèle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nom du Modèle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Nb. de Règles</TableHead>
                    <TableHead className="text-center">Dernière Exécution</TableHead>
                    <TableHead className="text-center w-[180px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {MOCK_DATA.map(modele => (
                    <TableRow key={modele.id}>
                        <TableCell className="font-medium">{modele.nom}</TableCell>
                        <TableCell className="flex items-center gap-2">
                           <Percent className="h-4 w-4 text-muted-foreground"/> {modele.type}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{modele.description}</TableCell>
                        <TableCell className="text-center">{modele.nbRules}</TableCell>
                        <TableCell className="text-center">{modele.lastUsed}</TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                                <Button variant="outline" size="sm"><Play className="h-4 w-4 mr-2"/> Exécuter</Button>
                                <Button variant="ghost" size="icon"><Settings className="h-4 w-4"/></Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
