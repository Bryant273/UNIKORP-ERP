
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { countries } from '@/lib/countries';
import { ScrollArea } from './ui/scroll-area';

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
    countryCode: '+225', // Default to Côte d'Ivoire
    motive: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleCountryChange = (value: string) => {
    setFormData(prev => ({...prev, countryCode: value}));
  }

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
    setFormData({ fullName: '', email: '', companyName: '', phone: '', countryCode: '+225', motive: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Demander une démo</DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire et notre équipe vous contactera pour planifier une démonstration personnalisée.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 col-span-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
             <div className="space-y-2 col-span-2">
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input id="companyName" value={formData.companyName} onChange={handleChange} required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="flex gap-2">
                    <Select onValueChange={handleCountryChange} defaultValue={formData.countryCode}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="+225" />
                        </SelectTrigger>
                        <SelectContent>
                             <ScrollArea className="h-72">
                                {countries.map(country => (
                                    <SelectItem key={country.code} value={country.dial_code}>
                                        {country.flag} {country.dial_code}
                                    </SelectItem>
                                ))}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                    <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>
            </div>
             <div className="space-y-2 col-span-2">
                <Label htmlFor="motive">Motif de votre demande</Label>
                <Textarea id="motive" value={formData.motive} onChange={handleChange} required />
             </div>
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
