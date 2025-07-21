
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { LifeBuoy, Send } from 'lucide-react';

export default function SupportPage() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Demande envoyée !',
      description:
        "Votre demande de support a été envoyée. Notre équipe vous répondra dans les plus brefs délais.",
    });
    // Here you would typically handle form submission, e.g., send data to a server
    e.currentTarget.reset();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <LifeBuoy className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Contacter le Support</CardTitle>
              <CardDescription>
                Soumettez une demande à notre équipe technique.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="module">Module concerné</Label>
            <Select name="module" required>
              <SelectTrigger id="module">
                <SelectValue placeholder="Sélectionnez un module..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Général / Non spécifié</SelectItem>
                <SelectItem value="skomptab">SKOMPTAB - Comptabilité</SelectItem>
                <SelectItem value="socix">SOCIX - RH</SelectItem>
                <SelectItem value="markos">MARKOS - Marketing</SelectItem>
                <SelectItem value="logson">LOGSON - Logistique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Objet de la demande</Label>
            <Input
              id="subject"
              placeholder="Ex: Problème d'exportation du bilan"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description du problème</Label>
            <Textarea
              id="description"
              placeholder="Veuillez décrire le problème que vous rencontrez avec le plus de détails possible."
              rows={8}
              required
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="attachment">Joindre un fichier (capture d'écran, etc.)</Label>
            <Input id="attachment" type="file" />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="ml-auto">
            <Send className="mr-2 h-4 w-4" />
            Envoyer la demande
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
