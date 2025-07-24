
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { Building, UserCog, Briefcase, Clipboard, User, Moon, Sun, Calculator, Users, Megaphone, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAtom } from 'jotai';
import { userRoleAtom, type UserRole } from '@/lib/store';

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

                <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">Ou connectez-vous rapidement avec un profil de test :</p>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleLogin('Compte Entreprise', '/super-admin')}><Building />Compte Entreprise</Button>
                    <Button variant="outline" onClick={() => handleLogin('Admin-Gestionnaire', '/dashboard')}><UserCog />Admin-Gestionnaire</Button>
                    
                    <h4 className="col-span-2 text-sm font-semibold text-muted-foreground mt-2 border-b pb-1">Gestionnaires</h4>
                    <Button variant="outline" onClick={() => handleLogin('Gestionnaire SKOMPTAB', '/skomptab')}><Calculator/>Gest. SKOMPTAB</Button>
                    <Button variant="outline" onClick={() => handleLogin('Gestionnaire SOCIX', '/socix')}><Users/>Gest. SOCIX</Button>
                    <Button variant="outline" onClick={() => handleLogin('Gestionnaire MARKOS', '/markos')}><Megaphone/>Gest. MARKOS</Button>
                    <Button variant="outline" onClick={() => handleLogin('Gestionnaire LOGSON', '/logson')}><Truck/>Gest. LOGSON</Button>

                    <h4 className="col-span-2 text-sm font-semibold text-muted-foreground mt-2 border-b pb-1">Stagiaires</h4>
                    <Button variant="outline" onClick={() => handleLogin('Stagiaire SKOMPTAB', '/skomptab')}><Clipboard />Stag. SKOMPTAB</Button>
                    <Button variant="outline" onClick={() => handleLogin('Stagiaire SOCIX', '/socix')}><Clipboard />Stag. SOCIX</Button>
                    <Button variant="outline" onClick={() => handleLogin('Stagiaire MARKOS', '/markos')}><Clipboard />Stag. MARKOS</Button>
                    <Button variant="outline" onClick={() => handleLogin('Stagiaire LOGSON', '/logson')}><Clipboard />Stag. LOGSON</Button>

                    <h4 className="col-span-2 text-sm font-semibold text-muted-foreground mt-2 border-b pb-1">Employé</h4>
                    <Button variant="outline" onClick={() => handleLogin('Employé', '/employee-dashboard')} className="sm:col-span-2"><User />Employé</Button>
                </div>
                </div>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
