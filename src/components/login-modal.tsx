
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { useAtom } from 'jotai';
import { userRoleAtom, type UserRole } from '@/lib/store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const userProfiles: { label: string; role: UserRole; path: string }[] = [
    { label: 'Compte Entreprise', role: 'Compte Entreprise', path: '/super-admin' },
    { label: 'Admin-Gestionnaire', role: 'Admin-Gestionnaire', path: '/dashboard' },
    { label: 'Gestionnaire SKOMPTAB', role: 'Gestionnaire SKOMPTAB', path: '/skomptab' },
    { label: 'Stagiaire SKOMPTAB', role: 'Stagiaire SKOMPTAB', path: '/skomptab' },
    { label: 'Gestionnaire SOCIX', role: 'Gestionnaire SOCIX', path: '/socix' },
    { label: 'Stagiaire SOCIX', role: 'Stagiaire SOCIX', path: '/socix' },
    { label: 'Gestionnaire MARKOS', role: 'Gestionnaire MARKOS', path: '/markos' },
    { label: 'Stagiaire MARKOS', role: 'Stagiaire MARKOS', path: '/markos' },
    { label: 'Gestionnaire LOGSON', role: 'Gestionnaire LOGSON', path: '/logson' },
    { label: 'Stagiaire LOGSON', role: 'Stagiaire LOGSON', path: '/logson' },
    { label: 'Employé', role: 'Employé', path: '/employee-dashboard' },
    { label: 'Fournisseur ERP', role: 'Fournisseur ERP', path: '/platform-admin' },
];

function RegisterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Inscription (Simulation)',
      description: 'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finaliser votre Inscription</DialogTitle>
          <DialogDescription>
            Remplissez vos informations pour activer votre compte.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="reg-name">Nom complet</Label>
            <Input id="reg-name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input id="reg-email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Choisissez un mot de passe</Label>
            <Input id="reg-password" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-role">Rôle (attribué)</Label>
            <Input id="reg-role" value="Gestionnaire SKOMPTAB" disabled />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Créer mon compte</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [, setRole] = useAtom(userRoleAtom);
  const [selectedProfileValue, setSelectedProfileValue] = useState<string | null>(null);

  const handleLogin = () => {
    if (!selectedProfileValue) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un profil.',
        variant: 'destructive',
      });
      return;
    }
    
    const selectedProfile = userProfiles.find(p => p.role === selectedProfileValue);

    if (!selectedProfile) return;

    setRole(selectedProfile.role);
    toast({
      title: 'Connexion Réussie',
      description: `Vous êtes maintenant connecté en tant que ${selectedProfile.role}.`,
    });
    router.push(selectedProfile.path);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <div className="p-6">
          <DialogHeader className="text-center mb-6">
            <Logo className="mx-auto h-12 w-12 text-primary" />
            <DialogTitle className="text-2xl font-bold mt-4">
              Bienvenue sur UNIKORP
            </DialogTitle>
            <DialogDescription>Votre solution ERP unifiée</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-select">Profil de test</Label>
               <Select onValueChange={setSelectedProfileValue}>
                <SelectTrigger id="profile-select">
                  <SelectValue placeholder="Sélectionnez un profil pour continuer..." />
                </SelectTrigger>
                <SelectContent>
                  {userProfiles.map(profile => (
                    <SelectItem key={profile.role} value={profile.role}>
                      {profile.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />
            
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" type="password" />
            </div>

             <Button className="w-full" onClick={handleLogin}>
              Se connecter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
