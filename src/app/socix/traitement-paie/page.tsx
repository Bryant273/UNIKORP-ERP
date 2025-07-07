
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { HandCoins, Check, Loader2, BarChart, FileText, Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const MOCK_EMPLOYEES = [
    { id: 'emp-001', name: 'Jean Dupont', salary: 350000, status: 'Vérifié' },
    { id: 'emp-002', name: 'Sophie Martin', salary: 320000, status: 'Vérifié' },
    { id: 'emp-004', name: 'Lucas Petit', salary: 180000, status: 'Vérifié' },
    { id: 'emp-005', name: 'Camille Leroy', salary: 300000, status: 'Vérifié' },
];

const steps = [
    { id: 'select', name: 'Sélection Période' },
    { id: 'verify', name: 'Vérification des Données' },
    { id: 'calculate', name: 'Calcul de la Paie' },
    { id: 'validate', name: 'Validation & Clôture' },
];

export default function TraitementPaiePage() {
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isPayrollDone, setIsPayrollDone] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>(MOCK_EMPLOYEES.map(e => e.id));
    const [selectedPeriod, setSelectedPeriod] = useState('2024-07');

    const handleNextStep = () => {
        setIsLoading(true);
        toast({ title: "Traitement en cours...", description: "Veuillez patienter." });
        setTimeout(() => {
            if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                setIsPayrollDone(true);
            }
            setIsLoading(false);
            toast({ title: "Étape terminée !", description: `"${steps[currentStep].name}" est terminée.`, className: "bg-green-100 border-green-200" });
        }, 1500);
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setIsPayrollDone(false);
        setSelectedEmployees(MOCK_EMPLOYEES.map(e => e.id));
    };

    const toggleEmployee = (id: string) => {
        setSelectedEmployees(prev => prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]);
    };

    const toggleAllEmployees = () => {
        setSelectedEmployees(prev => prev.length === MOCK_EMPLOYEES.length ? [] : MOCK_EMPLOYEES.map(e => e.id));
    };
    
    const kpis = useMemo(() => {
        const includedEmployees = MOCK_EMPLOYEES.filter(e => selectedEmployees.includes(e.id));
        const totalBrut = includedEmployees.reduce((acc, e) => acc + e.salary, 0);
        return {
            nbSalaries: includedEmployees.length,
            masseSalariale: totalBrut,
            cotisations: totalBrut * 0.22,
            netAPayer: totalBrut * 0.78
        }
    }, [selectedEmployees]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><HandCoins /> Traitement de la Paie</CardTitle>
                <CardDescription>Suivez les étapes pour traiter, valider et clôturer la paie du mois.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex-1 text-center">
                                <p className={`text-sm font-semibold ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'}`}>{step.name}</p>
                            </div>
                        ))}
                    </div>
                    <Progress value={((currentStep + (isPayrollDone ? 1 : 0)) / steps.length) * 100} />
                </div>
                
                {isPayrollDone ? (
                    <div className="text-center py-16 space-y-4">
                        <Check className="h-16 w-16 mx-auto bg-green-100 text-green-600 p-3 rounded-full"/>
                        <h3 className="text-2xl font-bold">Paie de {selectedPeriod} clôturée !</h3>
                        <p className="text-muted-foreground">Les bulletins de paie ont été générés et sont disponibles. Les écritures comptables ont été passées.</p>
                        <div className="flex gap-4 justify-center pt-4">
                            <Button><FileText className="mr-2 h-4 w-4" /> Voir les Bulletins</Button>
                            <Button><BarChart className="mr-2 h-4 w-4" /> Voir les écritures</Button>
                            <Button variant="outline" onClick={handleRestart}><Send className="mr-2 h-4 w-4" /> Démarrer une nouvelle paie</Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Left Panel */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold mb-2">Salariés concernés par la paie</h3>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox checked={selectedEmployees.length === MOCK_EMPLOYEES.length} onCheckedChange={toggleAllEmployees} disabled={currentStep !== 1}/>
                                            </TableHead>
                                            <TableHead>Employé</TableHead>
                                            <TableHead className="text-right">Salaire Brut de Base</TableHead>
                                            <TableHead className="text-center">Statut</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {MOCK_EMPLOYEES.map(emp => (
                                            <TableRow key={emp.id}>
                                                <TableCell>
                                                    <Checkbox checked={selectedEmployees.includes(emp.id)} onCheckedChange={() => toggleEmployee(emp.id)} disabled={currentStep !== 1}/>
                                                </TableCell>
                                                <TableCell className="font-medium">{emp.name}</TableCell>
                                                <TableCell className="text-right">{emp.salary.toLocaleString('fr-FR')} FCFA</TableCell>
                                                <TableCell className="text-center"><Badge variant="outline">{emp.status}</Badge></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div className="space-y-4">
                             <h3 className="text-lg font-semibold mb-2">Synthèse de la paie</h3>
                             <Card className="bg-muted/50">
                                <CardContent className="p-4 space-y-2">
                                    <div className="space-y-2">
                                        <Label>Période</Label>
                                        <Input type="month" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)} disabled={currentStep !== 0}/>
                                    </div>
                                    <p className="text-sm"><strong>{kpis.nbSalaries}</strong> salariés sélectionnés</p>
                                    <Separator/>
                                    <dl className="space-y-1 text-sm">
                                        <div className="flex justify-between"><dt>Masse Salariale Brute</dt><dd>{kpis.masseSalariale.toLocaleString('fr-FR')} FCFA</dd></div>
                                        <div className="flex justify-between text-muted-foreground"><dt>Cotisations (estim.)</dt><dd>{kpis.cotisations.toLocaleString('fr-FR')} FCFA</dd></div>
                                        <div className="flex justify-between font-bold text-lg"><dt>Net à Payer (estim.)</dt><dd>{kpis.netAPayer.toLocaleString('fr-FR')} FCFA</dd></div>
                                    </dl>
                                </CardContent>
                             </Card>
                             <Button size="lg" className="w-full" onClick={handleNextStep} disabled={isLoading}>
                                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4"/>}
                                 {isLoading ? 'Traitement...' : `Valider l'étape "${steps[currentStep].name}"`}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
