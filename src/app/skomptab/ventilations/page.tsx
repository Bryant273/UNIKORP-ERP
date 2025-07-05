'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { GitCompareArrows, Loader2 } from 'lucide-react';

const MOCK_COMPTES_GENERAUX = [
    { numero: '601', intitule: 'Achats stockés' },
    { numero: '606', intitule: 'Achats non stockés' },
    { numero: '613', intitule: 'Locations' },
    { numero: '622', intitule: 'Rémunérations et honoraires' },
    { numero: '641', intitule: 'Rémunérations du personnel' },
    { numero: '701', intitule: 'Ventes de produits finis' },
    { numero: '706', intitule: 'Prestations de services' },
];

const MOCK_ANALYTIC_SECTIONS = [
    { code: '601.01', name: 'Achats - Direction' },
    { code: '601.02', name: 'Achats - Production' },
    { code: '601.03', name: 'Achats - Commercial' },
    { code: '641.01', name: 'Salaires - Direction' },
    { code: '641.02', name: 'Salaires - Production' },
    { code: '701.FR', name: 'Ventes - France' },
    { code: '701.EXP', name: 'Ventes - Export' },
];

export default function VentilationsPage() {
    const { toast } = useToast();
    const [isVentilationModalOpen, setIsVentilationModalOpen] = useState(false);
    const [selectedComptes, setSelectedComptes] = useState<string[]>([]);
    const [selectedSectionsToVentilate, setSelectedSectionsToVentilate] = useState<string[]>([]);
    const [isVentilating, setIsVentilating] = useState(false);

    const handleVentilation = () => {
        if (selectedComptes.length === 0 || selectedSectionsToVentilate.length === 0) {
            toast({
                title: "Sélection requise",
                description: "Veuillez sélectionner au moins un compte général et une section analytique de destination.",
                variant: "destructive",
            });
            return;
        }
        setIsVentilating(true);
        toast({
            title: "Ventilation en cours...",
            description: `Transfert de ${selectedComptes.length} compte(s) vers ${selectedSectionsToVentilate.length} section(s).`,
        });
        setTimeout(() => {
            setIsVentilating(false);
            setIsVentilationModalOpen(false);
            setSelectedComptes([]);
            setSelectedSectionsToVentilate([]);
            toast({
                title: "Ventilation réussie !",
                description: "Les écritures ont été ventilées dans les sections analytiques sélectionnées.",
                className: 'bg-green-100 border-green-300 text-green-800'
            });
        }, 2500);
    };

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2"><GitCompareArrows /> Ventilations Analytiques</CardTitle>
                            <CardDescription>
                                Ventilez les charges et produits de la comptabilité générale vers les sections analytiques.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-96 gap-4 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Lancer une nouvelle ventilation</h3>
                    <p className="text-muted-foreground text-center">Transférez les écritures des comptes généraux vers les sections analytiques correspondantes.</p>
                    <Button size="lg" onClick={() => setIsVentilationModalOpen(true)}>
                        <GitCompareArrows className="mr-2 h-5 w-5" /> Démarrer la ventilation
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={isVentilationModalOpen} onOpenChange={setIsVentilationModalOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Ventilation des Comptes Généraux</DialogTitle>
                        <DialogDescription>
                            Sélectionnez les comptes à ventiler et les sections analytiques de destination.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid md:grid-cols-2 gap-6 py-4">
                        <div>
                            <Label className="font-semibold mb-2 block">1. Comptes généraux à ventiler</Label>
                            <ScrollArea className="h-72 mt-2 rounded-md border p-4">
                                <div className="space-y-2">
                                {MOCK_COMPTES_GENERAUX.map(compte => (
                                    <div key={compte.numero} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`compte-${compte.numero}`}
                                            checked={selectedComptes.includes(compte.numero)}
                                            onCheckedChange={(checked) => {
                                                setSelectedComptes(prev => checked ? [...prev, compte.numero] : prev.filter(c => c !== compte.numero));
                                            }}
                                        />
                                        <Label htmlFor={`compte-${compte.numero}`} className="font-normal flex items-center gap-2 cursor-pointer w-full">
                                            <span className="font-mono text-xs p-1 bg-muted rounded-sm w-16 text-center">{compte.numero}</span>
                                            <span>{compte.intitule}</span>
                                        </Label>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                        </div>
                         <div>
                            <Label className="font-semibold mb-2 block">2. Sections analytiques de destination</Label>
                            <ScrollArea className="h-72 mt-2 rounded-md border p-4">
                                <div className="space-y-2">
                                {MOCK_ANALYTIC_SECTIONS.map(section => (
                                     <div key={section.code} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`section-${section.code}`}
                                            checked={selectedSectionsToVentilate.includes(section.code)}
                                            onCheckedChange={(checked) => {
                                                setSelectedSectionsToVentilate(prev => checked ? [...prev, section.code] : prev.filter(c => c !== section.code));
                                            }}
                                        />
                                        <Label htmlFor={`section-${section.code}`} className="font-normal flex items-center gap-2 cursor-pointer w-full">
                                            <span className="font-mono text-xs p-1 bg-muted rounded-sm w-24 text-center">{section.code}</span>
                                            <span>{section.name}</span>
                                        </Label>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVentilationModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleVentilation} disabled={isVentilating}>
                            {isVentilating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GitCompareArrows className="mr-2 h-4 w-4"/>}
                            {isVentilating ? 'Ventilation en cours...' : 'Lancer la ventilation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
