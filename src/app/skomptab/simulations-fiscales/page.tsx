
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Calculator, FileText, Download, Eye, FilePlus } from 'lucide-react';
import FiscalPageLayout from '@/components/fiscal-layout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// --- TYPES ---
// Combining all declaration types for the selection modal
type DeclarationType = 
    | 'TVA'
    | 'BIC' | 'ITS' // From declarations-fiscales
    | 'ImpotSynthetique' | 'DroitsEnregistrement' // From autres-impots
    | 'DMS'; // From declarations-sociales

type DeclarationConfig = {
    label: string;
    description: string;
    formComponent: React.FC<any>;
};

const declarationConfigs: Record<DeclarationType, DeclarationConfig> = {
    TVA: { label: 'TVA (CA3)', description: "Déclaration mensuelle de TVA.", formComponent: TvaForm },
    BIC: { label: 'BIC - Impôt sur les Sociétés', description: "Déclaration des bénéfices industriels et commerciaux.", formComponent: BicForm },
    ITS: { label: 'ITS - Impôt sur les Salaires', description: "Déclaration de l'impôt sur les traitements et salaires.", formComponent: ItsForm },
    ImpotSynthetique: { label: 'Impôt Synthétique', description: 'Déclaration pour le régime de l\'impôt synthétique.', formComponent: ImpotSynthetiqueForm },
    DMS: { label: 'Déclaration Mensuelle Salaires (CNPS)', description: 'Déclaration mensuelle des salaires à la CNPS.', formComponent: DeclarationMensuelleSalairesForm },
    DroitsEnregistrement: { label: 'Droits d\'Enregistrement', description: 'Pour les actes juridiques.', formComponent: DefaultForm },
};

// --- SIMULATED DATA & HELPERS ---
const calculateTvaTotals = (data: any) => {
    const caNormal = parseFloat(data.caHtNormal) || 0;
    const tvaCollectee18 = caNormal * 0.18;
    const totalTvaCollectee = tvaCollectee18;
    const totalTvaDeductible = (parseFloat(data.tvaDeductibleAchats) || 0) + (parseFloat(data.tvaDeductibleServices) || 0);
    const tvaDue = totalTvaCollectee - totalTvaDeductible - (parseFloat(data.creditTvaAnterieur) || 0);
    return {
        totalTvaCollectee,
        totalTvaDeductible,
        tvaNetteDue: tvaDue > 0 ? tvaDue : 0,
        creditAReporter: tvaDue < 0 ? -tvaDue : 0,
        tvaCollectee18,
        tvaCollecteeReduit: 0,
    };
};

const addWatermarkToPdf = (doc: jsPDF) => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(60);
        doc.setTextColor(150, 150, 150);
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({opacity: 0.2}));
        doc.text('SPECIMEN', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() / 2, {
            angle: -45,
            align: 'center'
        });
        doc.restoreGraphicsState();
    }
}

// --- FORM COMPONENTS (Adapted from other pages) ---
function DefaultForm({data, setData}: any) {
    return <div className="p-4 border rounded-md h-40 flex items-center justify-center text-center text-muted-foreground bg-muted/50"><p>Formulaire de simulation non implémenté pour ce type.</p></div>;
}
const FormField = ({ label, children, isRequired }: { label: string, children: React.ReactNode, isRequired?: boolean }) => (
    <div className="space-y-1"><Label>{label}{isRequired && <span className="text-destructive"> *</span>}</Label>{children}</div>
);

function TvaForm({ data, setData }: { data: any, setData: Function }) {
    const { totalTvaCollectee, totalTvaDeductible, tvaNetteDue, creditAReporter } = useMemo(() => calculateTvaTotals(data), [data]);
    const handleChange = (field: string, value: string) => setData((d:any) => ({...d, [field]: value}));
    return (
        <div className="space-y-4">
            <FormField label="Période (mois/année)"><Input type="month" value={data.periode || ''} onChange={e => handleChange('periode', e.target.value)} /></FormField>
            <div className="grid md:grid-cols-2 gap-4">
                 <FormField label="Total Ventes HT (Taux Normal)" isRequired><Input type="number" value={data.caHtNormal || ''} onChange={e => handleChange('caHtNormal', e.target.value)}/></FormField>
                 <FormField label="Total Achats HT (Déductible)" isRequired><Input type="number" value={data.tvaDeductibleAchats || ''} onChange={e => handleChange('tvaDeductibleAchats', e.target.value)}/></FormField>
                 <FormField label="Crédit de TVA antérieur"><Input type="number" value={data.creditTvaAnterieur || ''} onChange={e => handleChange('creditTvaAnterieur', e.target.value)}/></FormField>
            </div>
             <Separator/>
            <div className="p-4 border rounded-lg bg-background space-y-2">
                 <h4 className="font-semibold text-center">Résultats de la Simulation</h4>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">TVA Collectée (18%)</span><span>{totalTvaCollectee.toLocaleString('fr-FR')} FCFA</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">TVA Déductible</span><span>{totalTvaDeductible.toLocaleString('fr-FR')} FCFA</span></div>
                 <div className="flex justify-between text-sm"><span className="text-muted-foreground">Crédit Antérieur</span><span>{(parseFloat(data.creditTvaAnterieur) || 0).toLocaleString('fr-FR')} FCFA</span></div>
                 <Separator/>
                 <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t"><span >{tvaNetteDue > 0 ? 'TVA à Décaisser' : 'Crédit à Reporter'}</span><span>{tvaNetteDue > 0 ? tvaNetteDue.toLocaleString('fr-FR') : creditAReporter.toLocaleString('fr-FR')} FCFA</span></div>
            </div>
        </div>
    );
}

function BicForm({ data, setData }: { data: any, setData: Function }) {
    const handleChange = (field: string, value: string) => setData((prev: any) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    const { bicCalcule, imf, impotDu } = useMemo(() => {
        const resultatFiscal = data.resultatFiscal || 0;
        const caTtc = data.caTtc || 0;
        const bic = resultatFiscal > 0 ? resultatFiscal * 0.27 : 0;
        const imfCalc = caTtc * 0.02;
        return { bicCalcule: bic, imf: imfCalc, impotDu: Math.max(bic, imfCalc) };
    }, [data.resultatFiscal, data.caTtc]);
    return (<div className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><FormField label="Chiffre d'affaires HT" isRequired><Input type="number" value={data.caHt || ''} onChange={e => handleChange('caHt', e.target.value)}/></FormField><FormField label="Chiffre d'affaires TTC" isRequired><Input type="number" value={data.caTtc || ''} onChange={e => handleChange('caTtc', e.target.value)}/></FormField></div><div className="grid md:grid-cols-2 gap-4"><FormField label="Charges déductibles"><Input type="number" value={data.chargesDeductibles || ''} onChange={e => handleChange('chargesDeductibles', e.target.value)}/></FormField><FormField label="Amortissements"><Input type="number" value={data.amortissements || ''} onChange={e => handleChange('amortissements', e.target.value)}/></FormField></div><FormField label="Résultat fiscal" isRequired><Input type="number" value={data.resultatFiscal || ''} onChange={e => handleChange('resultatFiscal', e.target.value)}/></FormField><Separator /><div className="p-4 border rounded-lg bg-background space-y-2"><h4 className="font-semibold text-center">Calcul de l'impôt</h4><div className="flex justify-between text-sm"><span className="text-muted-foreground">BIC calculé (27%)</span><span>{bicCalcule.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">IMF (2% du CA TTC)</span><span>{imf.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-lg font-bold text-primary pt-2 border-t"><span >Impôt Dû (le plus élevé)</span><span>{impotDu.toLocaleString('fr-FR')} FCFA</span></div></div></div>);
}
function ItsForm({ data, setData }: { data: any, setData: Function }) {
    const handleChange = (field: string, value: string) => setData((prev: any) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    const { baseImposable, itsCalcule, itsNetAPayer } = useMemo(() => {
        const masseSalariale = data.masseSalarialeBrute || 0;
        const abattements = data.abattementsAppliques || 0;
        const retenues = data.retenuesEffectuees || 0;
        const base = masseSalariale - abattements;
        const its = base * 0.15; // Simplified rate
        return { baseImposable: base, itsCalcule: its, itsNetAPayer: its - retenues };
    }, [data.masseSalarialeBrute, data.abattementsAppliques, data.retenuesEffectuees]);
    return (<div className="space-y-4"><FormField label="Nombre d'employés" isRequired><Input type="number" value={data.nombreEmployes || ''} onChange={e => handleChange('nombreEmployes', e.target.value)}/></FormField><FormField label="Masse salariale brute" isRequired><Input type="number" value={data.masseSalarialeBrute || ''} onChange={e => handleChange('masseSalarialeBrute', e.target.value)}/></FormField><FormField label="Abattements appliqués"><Input type="number" value={data.abattementsAppliques || ''} onChange={e => handleChange('abattementsAppliques', e.target.value)}/></FormField><FormField label="Retenues effectuées"><Input type="number" value={data.retenuesEffectuees || ''} onChange={e => handleChange('retenuesEffectuees', e.target.value)}/></FormField><Separator/><div className="p-4 border rounded-lg bg-background space-y-2"><h4 className="font-semibold text-center">Calcul de l'impôt</h4><div className="flex justify-between text-sm"><span className="text-muted-foreground">Base imposable</span><span>{baseImposable.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">ITS calculé</span><span>{itsCalcule.toLocaleString('fr-FR')} FCFA</span></div><div className="flex justify-between text-lg font-bold text-primary pt-2 border-t"><span >ITS net à payer</span><span>{itsNetAPayer.toLocaleString('fr-FR')} FCFA</span></div></div></div>);
}
function ImpotSynthetiqueForm({ data, setData }: { data: any, setData: Function }) {
    const handleChange = (field: string, value: any) => setData((d: any) => ({ ...d, [field]: value }));
    return (<div className="space-y-4"><FormField label="Nature de l'activité" isRequired><Input value={data.natureActivite || ''} onChange={e => handleChange('natureActivite', e.target.value)}/></FormField><div className="grid md:grid-cols-2 gap-4"><FormField label="CA Prévisionnel" isRequired><Input type="number" value={data.caPrevisionnel || ''} onChange={e => handleChange('caPrevisionnel', e.target.value)}/></FormField><FormField label="Montant de l'impôt" isRequired><Input type="number" value={data.montantImpotSynthetique || ''} onChange={e => handleChange('montantImpotSynthetique', e.target.value)}/></FormField></div></div>);
}
function DeclarationMensuelleSalairesForm({ data, setData }: { data: any, setData: Function }) {
    const handleChange = (field: string, value: any) => setData((prev: any) => ({ ...prev, [field]: value }));
    const {cotisationsPatronales, cotisationsSalariales, total} = useMemo(() => {
        const masseSalariale = data.masseSalarialeBrute || 0;
        const cp = masseSalariale * 0.165;
        const cs = masseSalariale * 0.035;
        return { cotisationsPatronales: cp, cotisationsSalariales: cs, total: cp + cs };
    }, [data]);
    return (<div className="space-y-4"><FormField label="Période (mois/année)" isRequired><Input type="month" value={data.periode} onChange={e => handleChange('periode', e.target.value)}/></FormField><FormField label="Masse Salariale Brute" isRequired><Input type="number" value={data.masseSalarialeBrute} onChange={e => handleChange('masseSalarialeBrute', parseFloat(e.target.value))}/></FormField><Separator/><div className="grid md:grid-cols-3 gap-4"><div className="space-y-1"><Label>Cotisations Patronales (16.5%)</Label><Input disabled value={cotisationsPatronales.toLocaleString('fr-FR')}/></div><div className="space-y-1"><Label>Cotisations Salariales (3.5%)</Label><Input disabled value={cotisationsSalariales.toLocaleString('fr-FR')}/></div><div className="space-y-1"><Label>Total Cotisations Dues</Label><Input disabled value={total.toLocaleString('fr-FR')} className="font-bold text-primary"/></div></div></div>);
}

// --- MAIN COMPONENTS ---

function SimulationsFiscalesMainContent() {
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const [selectedDeclarationType, setSelectedDeclarationType] = useState<DeclarationType | null>(null);
    const [simulationData, setSimulationData] = useState<any | null>(null);
    const { toast } = useToast();

    const handleSelectDeclaration = (type: DeclarationType) => {
        setSelectedDeclarationType(type);
        setSimulationData({}); // Reset data for new simulation
        setIsSelectionModalOpen(false);
        setIsSheetOpen(true);
    };

    const handleGeneratePreview = () => {
        if (!simulationData) {
            toast({ title: 'Données manquantes', description: 'Veuillez remplir le formulaire.', variant: 'destructive'});
            return;
        }
        setIsSheetOpen(false);
        setIsPreviewModalOpen(true);
    };

    const handleExportPDF = () => {
        if (!selectedDeclarationType || !simulationData) return;

        const doc = new jsPDF();
        const config = declarationConfigs[selectedDeclarationType];

        const companyName = "Votre Société S.A.";
        const userName = "Utilisateur Unikorp";
        const moduleName = "SKOMPTAB";
        const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVEhLY2BgYPg/lAb8B64DMAaogYvAOhgN3AZGAxQAAAWIAc0gJ15GAAAAAElFTkSuQmCC';
        const printDateTime = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
        const periodeSimulee = simulationData.periode 
            ? simulationData.periode.length > 4 
                ? format(parseISO(simulationData.periode + '-01'), 'MMMM yyyy', { locale: fr }) 
                : simulationData.periode
            : "N/A";
        
        autoTable(doc, {
            startY: 50,
            head: [['Champ', 'Valeur']],
            body: Object.entries(simulationData).map(([key, value]) => [key, String(value)]),
            theme: 'grid',
            didDrawPage: (data) => {
                // Header
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text(`Imprimé via UNIKORP ® - ${moduleName}`, data.settings.margin.left, 15);
                doc.setDrawColor(220);
                doc.line(data.settings.margin.left, 18, doc.internal.pageSize.width - data.settings.margin.right, 18);
                doc.addImage(logoDataUri, 'PNG', data.settings.margin.left, 22, 12, 12);
                
                doc.setFontSize(14);
                doc.setTextColor(40, 40, 40);
                doc.setFont('helvetica', 'bold');
                doc.text(companyName, data.settings.margin.left + 15, 28);
                
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100);
                const rightX = doc.internal.pageSize.width - data.settings.margin.right;
                doc.text(`État : Simulation - ${config.label}`, rightX, 25, { align: 'right' });
                doc.text(`Période : ${periodeSimulee}`, rightX, 30, { align: 'right' });
                doc.text(`Imprimé le : ${printDateTime}`, rightX, 35, { align: 'right' });
                doc.text(`Par : ${userName}`, rightX, 40, { align: 'right' });
    
                // Footer
                const pageCountTotal = (doc as any).internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${String(data.pageNumber)} sur ${String(pageCountTotal)}`, data.settings.margin.left!, doc.internal.pageSize.height - 10);
            }
        });
        
        addWatermarkToPdf(doc);

        doc.save(`simulation_${selectedDeclarationType}.pdf`);
        toast({ title: "Exportation PDF réussie", description: "Le document de simulation a été téléchargé." });
    };

    const FormComponent = selectedDeclarationType ? declarationConfigs[selectedDeclarationType].formComponent : null;
    const config = selectedDeclarationType ? declarationConfigs[selectedDeclarationType] : null;

    return (
        <div className="flex-1 flex flex-col">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Simulations Fiscales et Sociales</CardTitle>
                    <CardDescription>Estimez vos impôts, taxes et cotisations en fonction de différents scénarios. Les documents générés portent un filigrane "SPECIMEN".</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex flex-col items-center justify-center gap-4">
                    <Calculator className="h-16 w-16 text-primary/30" />
                    <Button size="lg" onClick={() => setIsSelectionModalOpen(true)}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Lancer une nouvelle simulation
                    </Button>
                </CardContent>
            </Card>
            
            <SimulationSelectionModal
                isOpen={isSelectionModalOpen}
                onClose={() => setIsSelectionModalOpen(false)}
                onSelect={handleSelectDeclaration}
            />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[600px] sm:max-w-none">
                     <SheetHeader>
                        <SheetTitle>Simulation : {config?.label}</SheetTitle>
                        <SheetDescription>{config?.description}</SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                        {FormComponent && <FormComponent data={simulationData} setData={setSimulationData} />}
                    </div>
                    <SheetFooter>
                        <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Annuler</Button>
                        <Button onClick={handleGeneratePreview}><Eye className="mr-2 h-4 w-4" /> Générer un aperçu</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Aperçu du Spécimen</DialogTitle>
                        <DialogDescription>
                            Ceci est un aperçu du document qui sera généré. Le PDF final contiendra un filigrane "SPECIMEN".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto p-4 border rounded-md bg-muted/30 relative">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-8xl font-bold text-destructive/10 -rotate-45">SPECIMEN</span>
                        </div>
                        <h3 className="text-xl font-bold mb-4">{config?.label}</h3>
                        {FormComponent && <FormComponent data={simulationData} setData={() => {}} />}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsPreviewModalOpen(false); setIsSheetOpen(true); }}>Retour</Button>
                        <Button onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" /> Exporter en PDF</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SimulationSelectionModal({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (type: DeclarationType) => void }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Choisir une simulation</DialogTitle>
                    <DialogDescription>Sélectionnez le type de déclaration que vous souhaitez simuler.</DialogDescription>
                </DialogHeader>
                 <Accordion type="multiple" className="w-full">
                    <AccordionItem value="fiscal">
                        <AccordionTrigger>Déclarations Fiscales</AccordionTrigger>
                        <AccordionContent>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="ghost" className="justify-start" onClick={() => onSelect('TVA')}>TVA (CA3)</Button>
                                <Button variant="ghost" className="justify-start" onClick={() => onSelect('BIC')}>BIC - Impôt sur les Sociétés</Button>
                                <Button variant="ghost" className="justify-start" onClick={() => onSelect('ImpotSynthetique')}>Impôt Synthétique</Button>
                                <Button variant="ghost" className="justify-start" onClick={() => onSelect('DroitsEnregistrement')}>Droits d'Enregistrement</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="social">
                        <AccordionTrigger>Déclarations Sociales</AccordionTrigger>
                        <AccordionContent>
                             <div className="grid grid-cols-2 gap-2">
                                <Button variant="ghost" className="justify-start" onClick={() => onSelect('ITS')}>ITS - Impôt sur les Salaires</Button>
                                <Button variant="ghost" className="justify-start" onClick={() => onSelect('DMS')}>Déclaration Mensuelle Salaires (CNPS)</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </DialogContent>
        </Dialog>
    );
}

export default function SimulationsFiscalesPage() {
    return (
        <FiscalPageLayout>
            <SimulationsFiscalesMainContent />
        </FiscalPageLayout>
    );
}
