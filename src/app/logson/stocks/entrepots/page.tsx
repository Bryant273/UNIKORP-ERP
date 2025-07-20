
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Warehouse, MapPin, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAtom } from 'jotai';
import { entrepotsAtom } from '@/lib/store';

export default function EntrepotsPage() {
    const [entrepots] = useAtom(entrepotsAtom);
    
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Entrepôts</CardTitle>
                        <CardDescription>Gérez vos entrepôts et emplacements de stockage.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entrepots.map(entrepot => (
                        <Card key={entrepot.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg flex items-center gap-2"><Warehouse className="h-5 w-5"/>{entrepot.nom}</CardTitle>
                                        <CardDescription className="flex items-center gap-2"><MapPin className="h-3 w-3"/>{entrepot.localisation}</CardDescription>
                                    </div>
                                    <Button size="icon" variant="ghost"><Eye className="h-4 w-4"/></Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Taux de remplissage</span>
                                        <span className="font-bold">{entrepot.tauxRemplissage}%</span>
                                    </div>
                                    <Progress value={entrepot.tauxRemplissage} />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Capacité Totale: {entrepot.capacite} m³</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </CardContent>
        </Card>
    );
}
