
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { Building, UserCog, Briefcase, Clipboard, User, Moon, Sun, Calculator, Users, Megaphone, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtom } from 'jotai';
import { userRoleAtom, type UserRole } from '@/lib/store';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [, setRole] = useAtom(userRoleAtom);
  
  useEffect(() => setMounted(true), []);


  const handleLogin = (role: UserRole, path: string) => {
    setRole(role);
    toast({
      title: 'Connexion Réussie',
      description: `Vous êtes maintenant connecté en tant que ${role}.`,
    });
    router.push(path);
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
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="absolute top-4 right-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
        </div>

        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <Logo className="mx-auto h-16 w-16 text-primary" />
                <h1 className="text-3xl font-bold mt-6">Bienvenue sur UNIKORP</h1>
                <p className="text-muted-foreground mt-2">Votre solution ERP unifiée</p>
            </div>

            <Card>
            <CardHeader>
                <CardTitle>Se connecter</CardTitle>
            </CardHeader>
            <CardContent>
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

                <Separator className="my-6" />

                <div className="space-y-3 text-center">
                    <p className="text-sm text-muted-foreground">Ou connectez-vous rapidement avec un profil de test :</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => handleLogin('Compte Entreprise', '/super-admin')}><Building />Compte Entreprise</Button>
                        <Button variant="outline" onClick={() => handleLogin('Admin-Gestionnaire', '/dashboard')}><UserCog />Admin-Gestionnaire</Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline"><Briefcase/>Gestionnaire</Button>
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
                                <Button variant="outline"><Clipboard/>Stagiaire</Button>
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

                        <Button variant="outline" onClick={() => handleLogin('Employé', '/employee-dashboard')} className="col-span-2"><User />Employé</Button>
                    </div>
                </div>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
