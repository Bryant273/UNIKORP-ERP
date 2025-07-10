
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RecrutementPage() {
    const { toast } = useToast();
    
    const handleAction = () => {
        toast({ title: 'Fonctionnalité à venir', description: 'La gestion des recrutements sera bientôt disponible.' });
    };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                 <CardTitle className="text-2xl">Recrutement</CardTitle>
                <CardDescription>Gérez vos processus de recrutement, des offres d'emploi aux embauches.</CardDescription>
            </div>
            <Button onClick={handleAction}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Nouvelle Offre
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Le module de gestion du recrutement est en cours de construction.</p>
            <p className="text-sm text-muted-foreground">Revenez bientôt pour gérer vos offres d'emploi et vos candidats.</p>
        </div>
      </CardContent>
    </Card>
  );
}
