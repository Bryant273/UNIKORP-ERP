
'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { requestsAtom, type DemoRequest } from '@/lib/store';
import { Send } from 'lucide-react';
import { Textarea } from './ui/textarea';

type RequestDemoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function RequestDemoModal({ isOpen, onClose }: RequestDemoModalProps) {
  const { toast } = useToast();
  const [, setRequests] = useAtom(requestsAtom);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: DemoRequest = {
        id: `req-${Date.now()}`,
        ...formData,
        requestDate: new Date().toISOString(),
        status: 'Nouvelle'
    };
    
    setRequests(prev => [newRequest, ...prev]);

    toast({
      title: 'Demande envoyée !',
      description: "Merci de votre intérêt. Notre équipe vous contactera dans les plus brefs délais.",
    });
    
    onClose();
    setFormData({ fullName: '', email: '', companyName: '', phone: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Demander une démo</DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire et notre équipe vous contactera pour planifier une démonstration personnalisée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input id="fullName" value={formData.fullName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input id="companyName" value={formData.companyName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone (Optionnel)</Label>
            <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Send className="mr-2 h-4 w-4"/>
              Envoyer ma demande
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
