'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator } from "lucide-react";
import FiscalPageLayout from '@/components/fiscal-layout';

function ISSimulator() {
    const [resultat, setResultat] = useState(250000);
    const [impot, setImpot] = useState(0);

    const handleSimulate = () => {
        let calculatedImpot = 0;
        if (resultat > 0) {
            if (resultat <= 42500) { // Taux réduit de 15% en France sur la première tranche
                calculatedImpot = resultat * 0.15;
            } else {
                calculatedImpot = (42500 * 0.15) + ((resultat - 42500) * 0.25);
            }
        }
        setImpot(calculatedImpot);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Simulateur d'Impôt sur les Sociétés (IS)</CardTitle>
                <CardDescription>Estimez le montant de votre IS en fonction de votre résultat fiscal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="resultat">Résultat fiscal prévisionnel (€)</Label>
                    <Input id="resultat" type="number" value={resultat} onChange={e => setResultat(Number(e.target.value))}/>
                </div>
                <Button onClick={handleSimulate}>
                    <Calculator className="mr-2 h-4 w-4" />
                    Simuler
                </Button>
                <Separator />
                <div className="space-y-2">
                    <Label>Montant estimé de l'IS</Label>
                    <Input value={`${impot.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} disabled className="text-lg font-bold" />
                    <p className="text-xs text-muted-foreground">Simulation basée sur les taux standards (15% jusqu'à 42 500 €, puis 25%).</p>
                </div>
            </CardContent>
        </Card>
    );
}

function TVASimulator() {
    const [ventes, setVentes] = useState(100000);
    const [achats, setAchats] = useState(60000);
    const [tvaDue, setTvaDue] = useState(0);

    const handleSimulate = () => {
        const tvaCollectee = ventes * 0.20; // Assuming 20%
        const tvaDeductible = achats * 0.20;
        setTvaDue(tvaCollectee - tvaDeductible);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Simulateur de TVA</CardTitle>
                <CardDescription>Estimez rapidement votre TVA à décaisser ou votre crédit de TVA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ventes">Total Ventes HT (€)</Label>
                        <Input id="ventes" type="number" value={ventes} onChange={e => setVentes(Number(e.target.value))} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="achats">Total Achats HT (€)</Label>
                        <Input id="achats" type="number" value={achats} onChange={e => setAchats(Number(e.target.value))} />
                    </div>
                </div>
                <Button onClick={handleSimulate}>
                    <Calculator className="mr-2 h-4 w-4" />
                    Simuler
                </Button>
                 <Separator />
                <div className="space-y-2">
                    <Label>{tvaDue >= 0 ? 'TVA à décaisser' : 'Crédit de TVA'}</Label>
                    <Input value={`${Math.abs(tvaDue).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`} disabled className="text-lg font-bold" />
                    <p className="text-xs text-muted-foreground">Simulation basée sur un taux unique de 20%.</p>
                </div>
            </CardContent>
        </Card>
    );
}


function SimulationsFiscalesMainContent() {
  return (
    <div className="flex-1 flex flex-col">
        <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Simulations Fiscales</h1>
            <p className="text-muted-foreground">Outils pour estimer vos impôts et taxes.</p>
        </div>
        <Tabs defaultValue="is" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="is">Impôt sur les Sociétés</TabsTrigger>
                <TabsTrigger value="tva">TVA</TabsTrigger>
            </TabsList>
            <TabsContent value="is">
                <ISSimulator />
            </TabsContent>
            <TabsContent value="tva">
                <TVASimulator />
            </TabsContent>
        </Tabs>
    </div>
  );
}

export default function SimulationsFiscalesPage() {
    return (
        <FiscalPageLayout>
            <SimulationsFiscalesMainContent />
        </FiscalPageLayout>
    )
}
