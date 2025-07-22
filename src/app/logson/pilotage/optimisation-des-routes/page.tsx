
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Map, Zap, CheckCircle, Truck, MapPin, Eye, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const MOCK_ROUTES_INITIAL = [
    { id: 'route-1', name: 'Tournée Abidjan Sud', vehicule: 'Renault Master 1', arrets: 12, distance: '85 km', duree: '4h 30min', status: 'Non optimisée' as const },
    { id: 'route-2', name: 'Tournée Abidjan Nord', vehicule: 'Iveco Daily 1', arrets: 18, distance: '112 km', duree: '6h 15min', status: 'Non optimisée' as const },
    { id: 'route-3', name: 'Livraisons Grand-Bassam', vehicule: 'Renault Master 2', arrets: 8, distance: '95 km', duree: '5h 00min', status: 'Optimisée' as const },
];

export default function OptimisationRoutesPage() {
    const { toast } = useToast();
    const [routes, setRoutes] = useState(MOCK_ROUTES_INITIAL);
    const [optimizingId, setOptimizingId] = useState<string | null>(null);
    const [viewingRoute, setViewingRoute] = useState<typeof MOCK_ROUTES_INITIAL[0] | null>(null);

    const handleOptimize = (routeId: string) => {
        setOptimizingId(routeId);
        toast({ title: 'Optimisation en cours...', description: 'Le calcul du meilleur itinéraire a commencé.' });

        setTimeout(() => {
            setRoutes(prev => prev.map(route => {
                if (route.id === routeId) {
                    const originalDistance = parseInt(route.distance.split(' ')[0]);
                    const originalDurationHours = parseInt(route.duree.split('h')[0]);
                    
                    return {
                        ...route,
                        status: 'Optimisée',
                        distance: `${Math.round(originalDistance * 0.85)} km`,
                        duree: `${Math.round(originalDurationHours * 0.9)}h ${Math.floor(Math.random()*59)}min`
                    };
                }
                return route;
            }));
            setOptimizingId(null);
            toast({ title: 'Optimisation terminée !', description: 'Le nouvel itinéraire est prêt.', className: 'bg-green-100 text-green-800' });
        }, 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Optimisation des Routes</CardTitle>
                        <CardDescription>Planifiez et optimisez les itinéraires de livraison pour réduire les coûts et les délais.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {routes.map(route => (
                            <Card key={route.id} className="odd:bg-muted/50">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2"><Truck className="h-5 w-5"/>{route.name}</CardTitle>
                                        <CardDescription>{route.vehicule}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setViewingRoute(route)}><Eye className="mr-2 h-4 w-4"/>Détails</Button>
                                        <Button size="sm" onClick={() => handleOptimize(route.id)} disabled={route.status === 'Optimisée' || !!optimizingId}>
                                            {optimizingId === route.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Zap className="mr-2 h-4 w-4"/>}
                                            {optimizingId === route.id ? 'Calcul...' : 'Optimiser'}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-4 gap-4 text-center">
                                    <div className="p-2 bg-muted rounded-md"><p className="text-xs text-muted-foreground">Arrêts</p><p className="font-bold">{route.arrets}</p></div>
                                    <div className="p-2 bg-muted rounded-md"><p className="text-xs text-muted-foreground">Distance</p><p className="font-bold">{route.distance}</p></div>
                                    <div className="p-2 bg-muted rounded-md"><p className="text-xs text-muted-foreground">Durée Estimée</p><p className="font-bold">{route.duree}</p></div>
                                     <div className="p-2 bg-muted rounded-md">
                                        <p className="text-xs text-muted-foreground">Statut</p>
                                        <p className={`font-bold ${route.status === 'Optimisée' ? 'text-green-600' : ''}`}>{route.status}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Carte des Itinéraires</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                             <Image src="https://placehold.co/600x600.png" width={600} height={600} alt="Map placeholder" data-ai-hint="street map"/>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <Dialog open={!!viewingRoute} onOpenChange={() => setViewingRoute(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Détails de la Tournée : {viewingRoute?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                         <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                             <Image src="https://placehold.co/600x400.png" width={600} height={400} alt="Map placeholder" data-ai-hint="street map"/>
                        </div>
                        <p><strong>Véhicule:</strong> {viewingRoute?.vehicule}</p>
                        <p><strong>Nombre d'arrêts:</strong> {viewingRoute?.arrets}</p>
                        <p><strong>Distance estimée:</strong> {viewingRoute?.distance}</p>
                        <p><strong>Durée estimée:</strong> {viewingRoute?.duree}</p>
                        <p><strong>Statut:</strong> <span className={viewingRoute?.status === 'Optimisée' ? 'text-green-600 font-bold' : ''}>{viewingRoute?.status}</span></p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
