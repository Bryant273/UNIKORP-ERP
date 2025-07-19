
'use client';
import React, { useState, useMemo } from 'react';
import { useAtom } from 'jotai';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Truck, Download, ListChecks } from 'lucide-react';
import { commandesFournisseursAtom, receptionsAtom, fournisseursAtom, type Commande, type Reception } from '@/lib/store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type LigneReception = {
    ligneCommandeId: string;
    description: string;
    quantiteRecue: number;
    quantiteCommandee: number;
};

export default function ReceptionsPage() {
    const [commandes] = useAtom(commandesFournisseursAtom);
    const [receptions, setReceptions] = useAtom(receptionsAtom);
    const [fournisseurs] = useAtom(fournisseursAtom);
    const { toast } = useToast();

    const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
    const [commandeToReceive, setCommandeToReceive] = useState<Commande | null>(null);
    const [lignesReception, setLignesReception] = useState<LigneReception[]>([]);
    const [bonLivraisonFournisseur, setBonLivraisonFournisseur] = useState('');

    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [viewingCommande, setViewingCommande] = useState<Commande | null>(null);

    const getReceptionStatus = useMemo(() => {
        const statusMap = new Map<number, { totalReceived: number; totalOrdered: number; status: 'En attente' | 'Partielle' | 'Terminée' }>();
        for (const cmd of commandes) {
            const totalOrdered = cmd.lignes.reduce((sum, l) => sum + l.quantite, 0);
            const receptionsForCmd = receptions.filter(r => r.commandeId === cmd.id);
            const totalReceived = receptionsForCmd.reduce((sum, r) => sum + r.lignes.reduce((lSum, l) => lSum + l.quantiteRecue, 0), 0);
            
            let status: 'En attente' | 'Partielle' | 'Terminée' = 'En attente';
            if (totalReceived > 0) {
                status = totalReceived >= totalOrdered ? 'Terminée' : 'Partielle';
            }

            statusMap.set(cmd.id, { totalReceived, totalOrdered, status });
        }
        return statusMap;
    }, [commandes, receptions]);

    const handleOpenReceptionModal = (commande: Commande) => {
        setCommandeToReceive(commande);
        setBonLivraisonFournisseur('');
        setLignesReception(
            commande.lignes.map(l => ({
                ligneCommandeId: l.id,
                description: l.description,
                quantiteCommandee: l.quantite,
                quantiteRecue: 0,
            }))
        );
        setIsReceptionModalOpen(true);
    };

    const handleLigneReceptionChange = (ligneId: string, quantite: number) => {
        setLignesReception(lignes =>
            lignes.map(l =>
                l.ligneCommandeId === ligneId ? { ...l, quantiteRecue: quantite } : l
            )
        );
    };

    const handleSaveReception = () => {
        if (!commandeToReceive) return;
        
        const newReception: Reception = {
            id: `reception-${Date.now()}`,
            commandeId: commandeToReceive.id,
            date: new Date().toISOString().split('T')[0],
            numeroBon: `BR-${commandeToReceive.numero}-${receptions.filter(r => r.commandeId === commandeToReceive.id).length + 1}`,
            numeroBonFournisseur: bonLivraisonFournisseur,
            lignes: lignesReception.filter(l => l.quantiteRecue > 0),
        };

        if (newReception.lignes.length === 0) {
            toast({ title: 'Aucune quantité saisie', description: 'Veuillez entrer des quantités pour les articles reçus.', variant: 'destructive' });
            return;
        }

        setReceptions(prev => [...prev, newReception]);
        toast({ title: 'Réception enregistrée', description: `Un nouveau bon de réception a été créé pour la commande ${commandeToReceive.numero}.` });
        
        setIsReceptionModalOpen(false);
    };

    const receptionsForSelectedCommande = useMemo(() => {
        if (!viewingCommande) return [];
        return receptions.filter(r => r.commandeId === viewingCommande.id);
    }, [viewingCommande, receptions]);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Suivi des Réceptions</CardTitle>
                    <CardDescription>Confirmez la réception des articles de vos commandes fournisseurs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>N° Commande</TableHead>
                                <TableHead>Fournisseur</TableHead>
                                <TableHead>Description des Articles</TableHead>
                                <TableHead className="text-center">Statut Réception</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {commandes.map(cmd => {
                                const statusInfo = getReceptionStatus.get(cmd.id) || { totalReceived: 0, totalOrdered: 0, status: 'En attente' };
                                const isCompleted = statusInfo.status === 'Terminée';
                                const productDescriptions = cmd.lignes.map(l => l.description).join(', ');
                                return (
                                    <TableRow key={cmd.id} className={isCompleted ? 'bg-green-50' : ''}>
                                        <TableCell>{cmd.numero}</TableCell>
                                        <TableCell>{fournisseurs.find(f => f.id === cmd.fournisseurId)?.intitule}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{productDescriptions}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={statusInfo.status === 'Terminée' ? 'default' : statusInfo.status === 'Partielle' ? 'secondary' : 'outline'}>
                                                {statusInfo.status === 'Partielle' ? 'Partielle' : statusInfo.status === 'Terminée' ? 'Terminée' : 'En attente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-1">
                                                <Button size="icon" variant="ghost" onClick={() => { setViewingCommande(cmd); setIsSummaryModalOpen(true); }}>
                                                    <ListChecks className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenReceptionModal(cmd)} disabled={isCompleted}>
                                                    <Truck className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isReceptionModalOpen} onOpenChange={setIsReceptionModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Confirmer la réception de la commande {commandeToReceive?.numero}</DialogTitle>
                        <DialogDescription>Saisissez les quantités réellement reçues pour chaque article.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="bonFournisseur">N° Bon de Livraison Fournisseur</Label>
                            <Input id="bonFournisseur" value={bonLivraisonFournisseur} onChange={(e) => setBonLivraisonFournisseur(e.target.value)} placeholder="Ex: BL-F-2024-XYZ" />
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto p-2 border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-center">Qté Commandée</TableHead>
                                        <TableHead className="w-[150px] text-center">Qté Reçue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lignesReception.map(ligne => (
                                        <TableRow key={ligne.ligneCommandeId}>
                                            <TableCell>{ligne.description}</TableCell>
                                            <TableCell className="text-center">{ligne.quantiteCommandee}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="text-center"
                                                    value={ligne.quantiteRecue}
                                                    onChange={(e) => handleLigneReceptionChange(ligne.ligneCommandeId, parseInt(e.target.value) || 0)}
                                                    max={ligne.quantiteCommandee}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReceptionModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleSaveReception}>Enregistrer la réception</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
             <ReceptionSummaryModal 
                isOpen={isSummaryModalOpen} 
                onClose={() => setIsSummaryModalOpen(false)} 
                commande={viewingCommande}
                receptions={receptionsForSelectedCommande}
                fournisseurs={fournisseurs}
            />
        </>
    );
}

function ReceptionSummaryModal({ isOpen, onClose, commande, receptions, fournisseurs }: { isOpen: boolean, onClose: () => void, commande: Commande | null, receptions: Reception[], fournisseurs: any[] }) {
    if (!commande) return null;

    const handlePrintBonReception = (reception: Reception) => {
        const doc = new jsPDF();
        const fournisseur = fournisseurs.find(f => f.id === commande.fournisseurId);

        // Header
        const companyName = "UNIKORP S.A.";
        const companyAddress = "Cocody Angré, Abidjan";
        const companyReg = "CI-ABJ-01-XXXX";
        const printDate = format(new Date(), "dd/MM/yyyy 'à' HH:mm:ss");

        autoTable(doc, {
             didDrawPage: (data) => {
                doc.setFontSize(22);
                doc.setFont('helvetica', 'bold');
                doc.text("BON DE RÉCEPTION", 105, 20, { align: 'center' });
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(companyName, 20, 40);
                doc.text(companyAddress, 20, 45);
                doc.text(companyReg, 20, 50);

                doc.setFontSize(12);
                doc.text(`N° Commande Fournisseur: ${commande.numero}`, 20, 60);
                doc.text(`N° Bon de Réception: ${reception.numeroBon}`, 20, 66);
                doc.text(`N° BL Fournisseur: ${reception.numeroBonFournisseur || 'N/A'}`, 130, 60);
                doc.text(`Date de réception: ${format(new Date(reception.date), 'dd/MM/yyyy')}`, 130, 66);
             },
             margin: { top: 75 },
        });

        // Section 1
        autoTable(doc, {
            head: [['1. Récapitulatif Commande']],
            body: [
                ['Description', 'Quantité Commandée'],
                ...commande.lignes.map(l => [l.description, l.quantite]),
            ],
            startY: 75,
            theme: 'striped',
            headStyles: { fillColor: '#1e3a8a' },
        });
        
        // Section 2
        autoTable(doc, {
            head: [['2. Détail de cette Réception']],
            body: [
                 ['Description', 'Quantité Reçue'],
                ...reception.lignes.map(l => [l.description, l.quantiteRecue]),
            ],
            startY: (doc as any).lastAutoTable.finalY + 10,
            theme: 'grid',
            headStyles: { fillColor: '#166534' },
        });

        // Section 3
        const balanceLignes = commande.lignes.map(cmdLigne => {
            const totalRecu = receptions.filter(r => new Date(r.date) <= new Date(reception.date)).flatMap(r => r.lignes).filter(rLigne => rLigne.ligneCommandeId === cmdLigne.id).reduce((sum, rLigne) => sum + rLigne.quantiteRecue, 0);
            return {
                description: cmdLigne.description,
                solde: cmdLigne.quantite - totalRecu,
            }
        }).filter(b => b.solde > 0);

        if (balanceLignes.length > 0) {
            autoTable(doc, {
                head: [['3. Solde à recevoir après cette réception']],
                body: [
                     ['Description', 'Quantité Restante'],
                     ...balanceLignes.map(l => [l.description, l.solde]),
                ],
                startY: (doc as any).lastAutoTable.finalY + 10,
                theme: 'striped',
                headStyles: { fillColor: '#f59e0b' },
            });
        }
        
        // Footer
        let footerY = doc.internal.pageSize.getHeight() - 40;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Cachet & Signature de l'entreprise", 105, footerY, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(75, footerY - 5, 135, footerY - 5);

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Document imprimé le ${printDate} via UNIKORP ®`, 105, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

        doc.save(`BR_${commande.numero}.pdf`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Détail des réceptions pour la commande {commande.numero}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] my-4 pr-6">
                    {receptions.length > 0 ? (
                        <div className="space-y-4">
                            {receptions.map(reception => (
                                <Card key={reception.id}>
                                    <CardHeader className="flex flex-row items-center justify-between p-4">
                                        <div>
                                            <CardTitle className="text-lg">{reception.numeroBon}</CardTitle>
                                            <CardDescription>Reçu le {format(new Date(reception.date), 'dd/MM/yyyy', { locale: fr })} (BL Fournisseur: {reception.numeroBonFournisseur || 'N/A'})</CardDescription>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handlePrintBonReception(reception)}>
                                            <Download className="mr-2 h-4 w-4" /> Imprimer ce bon
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Description</TableHead>
                                                    <TableHead className="text-right">Quantité Reçue</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {reception.lignes.map((ligne, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{ligne.description}</TableCell>
                                                        <TableCell className="text-right">{ligne.quantiteRecue}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            Aucune réception enregistrée pour cette commande.
                        </div>
                    )}
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
