
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Zap, CheckCircle, Truck, MapPin } from 'lucide-react';
import Image from 'next/image';

const MOCK_ROUTES = [
    { id: 'route-1', name: 'Tournée Abidjan Sud', vehicule: 'Renault Master 1', arrets: 12, distance: '85 km', duree: '4h 30min', status: 'Non optimisée' },
    { id: 'route-2', name: 'Tournée Abidjan Nord', vehicule: 'Iveco Daily 1', arrets: 18, distance: '112 km', duree: '6h 15min', status: 'Non optimisée' },
    { id: 'route-3', name: 'Livraisons Grand-Bassam', vehicule: 'Renault Master 2', arrets: 8, distance: '95 km', duree: '5h 00min', status: 'Optimisée' },
];

export default function OptimisationRoutesPage() {
    const [routes, setRoutes] = useState(MOCK_ROUTES);

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
                            <Card key={route.id}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2"><Truck className="h-5 w-5"/>{route.name}</CardTitle>
                                        <CardDescription>{route.vehicule}</CardDescription>
                                    </div>
                                    <Button size="sm" disabled={route.status === 'Optimisée'}>
                                        <Zap className="mr-2 h-4 w-4"/>Optimiser
                                    </Button>
                                </CardHeader>
                                <CardContent className="grid grid-cols-4 gap-4 text-center">
                                    <div className="p-2 bg-muted rounded-md">
                                        <p className="text-xs text-muted-foreground">Arrêts</p>
                                        <p className="font-bold">{route.arrets}</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded-md">
                                        <p className="text-xs text-muted-foreground">Distance</p>
                                        <p className="font-bold">{route.distance}</p>
                                    </div>
                                    <div className="p-2 bg-muted rounded-md">
                                        <p className="text-xs text-muted-foreground">Durée Estimée</p>
                                        <p className="font-bold">{route.duree}</p>
                                    </div>
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
        </div>
    );
}
