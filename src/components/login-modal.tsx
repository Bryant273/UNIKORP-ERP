
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { Building, UserCog, Briefcase, Clipboard, User, Moon, Sun, Calculator, Users, Megaphone, Truck, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtom } from 'jotai';
import { userRoleAtom, type UserRole } from '@/lib/store';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type LoginModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

function RegisterModal({ isOpen, onClose }: {isOpen: boolean, onClose: () => void}) {
    const { toast } = useToast();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Inscription (Simulation)",
            description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Finaliser votre Inscription</DialogTitle>
                    <DialogDescription>Remplissez vos informations pour activer votre compte.</DialogDescription>
                </DialogHeader>
                 <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2"><Label htmlFor="reg-name">Nom complet</Label><Input id="reg-name" required /></div>
                    <div className="space-y-2"><Label htmlFor="reg-email">Email</Label><Input id="reg-email" type="email" required /></div>
                    <div className="space-y-2"><Label htmlFor="reg-password">Choisissez un mot de passe</Label><Input id="reg-password" type="password" required /></div>
                    <div className="space-y-2"><Label htmlFor="reg-role">Rôle (attribué)</Label><Input id="reg-role" value="Gestionnaire SKOMPTAB" disabled /></div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
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
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [, setRole] = useAtom(userRoleAtom);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simuler l'arrivée via un lien d'invitation
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('invite') === 'a1b2c3d4e5f6') {
      setIsRegisterModalOpen(true);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = (role: UserRole, path: string) => {
    setRole(role);
    toast({
      title: 'Connexion Réussie',
      description: `Vous êtes maintenant connecté en tant que ${role}.`,
    });
    router.push(path);
    onClose();
  };

  if (!mounted) {
    return null;
  }

  const managerRoles = [
    { role: 'Gestionnaire SKOMPTAB', path: '/skomptab', icon: Calculator, label: 'Gest. SKOMPTAB' },
    { role: 'Gestionnaire SOCIX', path: '/socix', icon: Users, label: 'Gest. SOCIX' },
    { role: 'Gestionnaire MARKOS', path: '/markos', icon: Megaphone, label: 'Gest. MARKOS' },
    { role: 'Gestionnaire LOGSON', path: '/logson', icon: Truck, label: 'Gest. LOGSON' },
  ];
  
  const internRoles = [
    { role: 'Stagiaire SKOMPTAB', path: '/skomptab', icon: Clipboard, label: 'Stag. SKOMPTAB' },
    { role: 'Stagiaire SOCIX', path: '/socix', icon: Clipboard, label: 'Stag. SOCIX' },
    { role: 'Stagiaire MARKOS', path: '/markos', icon: Clipboard, label: 'Stag. MARKOS' },
    { role: 'Stagiaire LOGSON', path: '/logson', icon: Clipboard, label: 'Stag. LOGSON' },
  ];

  return (
    <>
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0">
                 <div className="p-6">
                    <CardHeader className="text-center p-0 mb-6">
                         <Logo className="mx-auto h-12 w-12 text-primary" />
                        <DialogTitle className="text-2xl font-bold mt-4">Bienvenue sur UNIKORP</DialogTitle>
                        <DialogDescription>Votre solution ERP unifiée</DialogDescription>
                    </CardHeader>
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-xl">Se connecter</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="m@example.com" defaultValue="admin@unikorp.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <Input id="password" type="password" defaultValue="password" />
                            </div>
                            <Button className="w-full" type="submit" onClick={(e) => { e.preventDefault(); handleLogin('Admin-Gestionnaire', '/dashboard')}}>
                                Connexion
                            </Button>
                            </form>

                            <Separator className="my-4" />

                            <div className="space-y-3 text-center">
                                <p className="text-xs text-muted-foreground">Ou connectez-vous rapidement avec un profil de test :</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" onClick={() => handleLogin('Compte Entreprise', '/super-admin')}><Building className="mr-2"/>Entrep.</Button>
                                    <Button variant="outline" onClick={() => handleLogin('Admin-Gestionnaire', '/dashboard')}><UserCog className="mr-2"/>Admin</Button>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline"><Briefcase className="mr-2"/>Gest.</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {managerRoles.map(({ role, path, icon: Icon, label }) => (
                                                <DropdownMenuItem key={role} onClick={() => handleLogin(role as UserRole, path)}>
                                                    <Icon className="mr-2 h-4 w-4" />
                                                    <span>{label}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline"><Clipboard className="mr-2"/>Stagiaire</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {internRoles.map(({ role, path, icon: Icon, label }) => (
                                                <DropdownMenuItem key={role} onClick={() => handleLogin(role as UserRole, path)}>
                                                    <Icon className="mr-2 h-4 w-4" />
                                                    <span>{label}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button variant="outline" onClick={() => handleLogin('Employé', '/employee-dashboard')}><User className="mr-2"/>Employé</Button>
                                    <Button variant="outline" onClick={() => handleLogin('Fournisseur ERP', '/platform-admin')}><Shield className="mr-2"/>Fournisseur</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
        <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
    </>
  );
}
