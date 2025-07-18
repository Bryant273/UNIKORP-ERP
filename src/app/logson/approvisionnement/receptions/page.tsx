
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
import { Truck, Download } from 'lucide-react';
import { commandesFournisseursAtom, receptionsAtom, fournisseursAtom, type Commande, type LigneCommande, type Reception } from '@/lib/store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

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

    const getReceptionStatus = useMemo(() => {
        const statusMap = new Map<number, { totalReceived: number; totalOrdered: number }>();
        for (const cmd of commandes) {
            const totalOrdered = cmd.lignes.reduce((sum, l) => sum + l.quantite, 0);
            statusMap.set(cmd.id, { totalReceived: 0, totalOrdered });
        }
        for (const reception of receptions) {
            const status = statusMap.get(reception.commandeId);
            if (status) {
                const totalReceived = reception.lignes.reduce((sum, l) => sum + l.quantiteRecue, 0);
                status.totalReceived += totalReceived;
            }
        }
        return statusMap;
    }, [commandes, receptions]);

    const handleOpenReceptionModal = (commande: Commande) => {
        setCommandeToReceive(commande);
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
            lignes: lignesReception.filter(l => l.quantiteRecue > 0),
        };

        if (newReception.lignes.length === 0) {
            toast({ title: 'Aucune quantité saisie', description: 'Veuillez entrer des quantités pour les articles reçus.', variant: 'destructive' });
            return;
        }

        setReceptions(prev => [...prev, newReception]);
        toast({ title: 'Réception enregistrée', description: `Un nouveau bon de réception a été créé pour la commande ${commandeToReceive.numero}.` });
        
        handlePrintBonReception(newReception, commandeToReceive);
        setIsReceptionModalOpen(false);
    };

    const handlePrintBonReception = (reception: Reception, commande: Commande) => {
        const doc = new jsPDF();
        const fournisseur = fournisseurs.find(f => f.id === commande.fournisseurId);

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("BON DE RÉCEPTION", 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("UNIKORP S.A.", 20, 40);
        doc.text("Cocody Angré, Abidjan", 20, 45);
        
        doc.text(`Fournisseur: ${fournisseur?.intitule || 'N/A'}`, 140, 40);
        
        doc.setFontSize(12);
        doc.text(`N° Commande: ${commande.numero}`, 20, 60);
        doc.text(`N° Bon de Réception: ${reception.numeroBon}`, 20, 66);
        doc.text(`Date de réception: ${format(new Date(reception.date), 'dd/MM/yyyy')}`, 140, 60);
        
        autoTable(doc, {
            startY: 80,
            head: [['Description', 'Quantité Reçue']],
            body: reception.lignes.map(l => [l.description, l.quantiteRecue]),
            theme: 'grid',
        });
        
        doc.save(`BR_${commande.numero}.pdf`);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Suivi des Réceptions</CardTitle>
                    <CardDescription>Confirmez la réception des articles de vos commandes fournisseurs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>N° Commande</TableHead><TableHead>Fournisseur</TableHead><TableHead>Articles Commandés</TableHead><TableHead>Articles Reçus</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {commandes.map(cmd => {
                                const status = getReceptionStatus.get(cmd.id) || { totalReceived: 0, totalOrdered: 0 };
                                const isCompleted = status.totalReceived >= status.totalOrdered;
                                return (
                                    <TableRow key={cmd.id} className={isCompleted ? 'bg-green-50' : ''}>
                                        <TableCell>{cmd.numero}</TableCell>
                                        <TableCell>{fournisseurs.find(f => f.id === cmd.fournisseurId)?.intitule}</TableCell>
                                        <TableCell>{status.totalOrdered}</TableCell>
                                        <TableCell>{status.totalReceived}</TableCell>
                                        <TableCell className="text-center">
                                            <Button size="sm" onClick={() => handleOpenReceptionModal(cmd)} disabled={isCompleted}>
                                                <Truck className="mr-2 h-4 w-4" />
                                                {isCompleted ? 'Réception Terminée' : 'Réceptionner'}
                                            </Button>
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
                    <div className="max-h-[60vh] overflow-y-auto p-2">
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
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReceptionModalOpen(false)}>Annuler</Button>
                        <Button onClick={handleSaveReception}>Enregistrer et Imprimer le Bon</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
