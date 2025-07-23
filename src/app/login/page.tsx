
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
import { Building, UserCog, Briefcase, Clipboard, User, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);


  const handleLogin = (role: string, path: string) => {
    // In a real app, you would handle authentication here.
    // For this simulation, we just navigate to the corresponding dashboard.
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
    <div className="relative flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
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

        <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
            <Logo className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="text-2xl mt-4">Bienvenue sur UNIKORP</CardTitle>
            <CardDescription>Votre solution ERP unifiée</CardDescription>
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
                Se connecter
            </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">Ou connectez-vous rapidement avec un profil de test :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => handleLogin('Compte Entreprise', '/super-admin')}><Building />Compte Entreprise</Button>
                <Button variant="outline" onClick={() => handleLogin('Admin-Gestionnaire', '/dashboard')}><UserCog />Admin-Gestionnaire</Button>
                <Button variant="outline" onClick={() => handleLogin('Gestionnaire (SKOMPTAB)', '/skomptab')}><Briefcase />Gestionnaire</Button>
                <Button variant="outline" onClick={() => handleLogin('Stagiaire (SKOMPTAB)', '/skomptab')}><Clipboard />Stagiaire</Button>
                <Button variant="outline" onClick={() => handleLogin('Employé', '/employee-dashboard')} className="sm:col-span-2"><User />Employé</Button>
            </div>
            </div>
        </CardContent>
        </Card>
    </div>
  );
}
