
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Users, Download, Eye, Briefcase } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

// --- TYPES & MOCK DATA ---

type OfferStatus = 'Ouvert' | 'Fermé' | 'Pourvu';
type Candidate = {
    id: string;
    name: string;
    submissionDate: string;
    avatarUrl: string;
    cvUrl: string;
};

type JobOffer = {
    id: string;
    title: string;
    status: OfferStatus;
    publicationDate: string;
    candidates: Candidate[];
};

const MOCK_OFFERS: JobOffer[] = [
    { 
        id: 'offer-1', 
        title: 'Développeur Full-Stack Senior', 
        status: 'Ouvert', 
        publicationDate: '2024-07-15',
        candidates: [
            { id: 'cand-1', name: 'Alice Bertrand', submissionDate: '2024-07-20', avatarUrl: 'https://placehold.co/100x100.png', cvUrl: '#' },
            { id: 'cand-2', name: 'Charles Martin', submissionDate: '2024-07-22', avatarUrl: 'https://placehold.co/100x100.png', cvUrl: '#' },
        ]
    },
    { 
        id: 'offer-2', 
        title: 'Responsable Marketing Digital', 
        status: 'Ouvert', 
        publicationDate: '2024-07-10',
        candidates: [
            { id: 'cand-3', name: 'Diane Moreau', submissionDate: '2024-07-18', avatarUrl: 'https://placehold.co/100x100.png', cvUrl: '#' },
        ]
    },
    { 
        id: 'offer-3', 
        title: 'Comptable Confirmé', 
        status: 'Pourvu', 
        publicationDate: '2024-06-01',
        candidates: []
    },
    { 
        id: 'offer-4', 
        title: 'Stagiaire RH', 
        status: 'Fermé', 
        publicationDate: '2024-05-20',
        candidates: []
    },
];

const ITEMS_PER_PAGE = 10;

export default function RecrutementPage() {
    const { toast } = useToast();
    const [offers, setOffers] = useState(MOCK_OFFERS);
    const [viewingOffer, setViewingOffer] = useState<JobOffer | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(offers.length / ITEMS_PER_PAGE);
    const paginatedOffers = offers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getStatusBadge = (status: OfferStatus) => {
        switch (status) {
            case 'Ouvert': return <Badge className="bg-green-100 text-green-800">Ouvert</Badge>;
            case 'Fermé': return <Badge variant="secondary">Fermé</Badge>;
            case 'Pourvu': return <Badge variant="default">Pourvu</Badge>;
        }
    };

    const handleCreateOffer = () => {
        toast({ title: "Fonctionnalité à venir", description: "La création d'offres sera bientôt disponible." });
    };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                 <CardTitle className="text-2xl flex items-center gap-2"><Briefcase /> Recrutement</CardTitle>
                <CardDescription>Gérez vos processus de recrutement, des offres d'emploi aux embauches.</CardDescription>
            </div>
            <Button onClick={handleCreateOffer}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Nouvelle Offre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Poste</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-center">Candidats</TableHead>
                <TableHead className="text-center">Date de publication</TableHead>
                <TableHead className="w-[150px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOffers.map(offer => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.title}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(offer.status)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="flex items-center justify-center w-16 mx-auto">
                      <Users className="mr-2 h-4 w-4" />
                      {offer.candidates.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{format(new Date(offer.publicationDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" onClick={() => setViewingOffer(offer)} disabled={offer.candidates.length === 0}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir les candidatures
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="flex items-center justify-between pt-6">
            <div className="text-sm text-muted-foreground">
                Total de {offers.length} offres. Page {currentPage} sur {totalPages}.
            </div>
            {totalPages > 1 && (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Précédent
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Suivant
                    </Button>
                </div>
            )}
        </CardFooter>
      </Card>
      
      <CandidatesModal
        isOpen={!!viewingOffer}
        onClose={() => setViewingOffer(null)}
        offer={viewingOffer}
      />
    </>
  );
}


function CandidatesModal({ isOpen, onClose, offer }: { isOpen: boolean, onClose: () => void, offer: JobOffer | null }) {
    const { toast } = useToast();

    if (!offer) return null;

    const handleDownloadCv = (candidate: Candidate) => {
        toast({
            title: 'Téléchargement simulé',
            description: `Le CV de ${candidate.name} serait téléchargé ici.`,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Candidats pour : {offer.title}</DialogTitle>
                    <DialogDescription>Liste des candidats ayant postulé à cette offre.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nom du candidat</TableHead>
                                <TableHead className="text-center">Date de soumission</TableHead>
                                <TableHead className="text-right">CV</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {offer.candidates.map(candidate => (
                                <TableRow key={candidate.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={candidate.avatarUrl} alt={candidate.name} data-ai-hint="person face" />
                                                <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{candidate.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {format(new Date(candidate.submissionDate), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDownloadCv(candidate)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
