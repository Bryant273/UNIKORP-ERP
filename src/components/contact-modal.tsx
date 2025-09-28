
'use client';

import { useState } from 'react';
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
import { Send } from 'lucide-react';
import { Textarea } from './ui/textarea';

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would send this data to your backend
    console.log('Contact form submitted:', formData);

    toast({
      title: 'Message envoyé !',
      description: "Merci de votre intérêt. Notre équipe vous contactera dans les plus brefs délais.",
    });
    
    onClose();
    setFormData({ fullName: '', email: '', message: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contactez-nous</DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire et notre équipe vous contactera pour planifier une démonstration ou répondre à vos questions.
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
              <Label htmlFor="message">Votre message</Label>
              <Textarea id="message" value={formData.message} onChange={handleChange} required placeholder="Comment pouvons-nous vous aider ?"/>
           </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              <Send className="mr-2 h-4 w-4"/>
              Envoyer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
