
'use client';
import { usePathname } from 'next/navigation';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { ChatWidget } from './chat-widget';
import { cn } from '@/lib/utils';
import { ModuleNav } from './module-nav';
import { useAtom } from 'jotai';
import { companyFileAtom, userRoleAtom } from '@/lib/store';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { Logo } from './logo';

const noHeaderPaths = ['/'];

const mockCompanyFiles = [
  "AUTO-GEST-2024-SocieteX",
  "AUTO-GEST-2024-UnikorpCI",
  "AUTO-GEST-2023-SocieteX",
];

function CompanyFileSelection() {
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [, setCompanyFile] = useAtom(companyFileAtom);
  const { toast } = useToast();

  const handleConfirm = () => {
    if (selectedFile) {
        setCompanyFile(selectedFile);
        toast({
            title: "Fichier de gestion sélectionné",
            description: `Vous êtes bien connecté au fichier ${selectedFile}`,
            action: <Check className="h-5 w-5 text-green-500" />,
        });
    } else {
        toast({
            title: "Sélection requise",
            description: "Veuillez sélectionner un fichier de gestion pour continuer.",
            variant: "destructive"
        })
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-md animate-modal-enter">
             <CardHeader className="items-center text-center">
                <Logo className="h-12 w-12 text-primary mb-2" />
                <CardTitle className="text-xl">Sélectionner un Fichier de Gestion</CardTitle>
                <CardDescription>Veuillez sélectionner un fichier pour initialiser votre session de travail.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="company-file-select">Fichier de gestion</Label>
                    <Select onValueChange={setSelectedFile} value={selectedFile}>
                        <SelectTrigger id="company-file-select">
                            <SelectValue placeholder="Choisissez un fichier..." />
                        </SelectTrigger>
                        <SelectContent>
                            {mockCompanyFiles.map(file => (
                                <SelectItem key={file} value={file}>{file}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleConfirm} disabled={!selectedFile}>
                    Continuer
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [companyFile, setCompanyFile] = useAtom(companyFileAtom);
  const [role] = useAtom(userRoleAtom);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (role === 'Fournisseur ERP' && !companyFile) {
      setCompanyFile('AUTO-GEST-2025-INNOVKORP');
    }
  }, [role, companyFile, setCompanyFile]);

  const showHeader = !noHeaderPaths.includes(pathname);
  
  const noSidebarPaths = ['/', '/login', '/employee-dashboard', '/platform-admin', '/super-admin', '/super-admin-innovkorp', '/dashboard'];
  const showSidebar = !noSidebarPaths.includes(pathname);

  const noModuleNavPaths = ['/', '/login', '/employee-dashboard', '/platform-admin', '/super-admin', '/super-admin-innovkorp', '/help', '/support', '/notifications', '/settings'];
  const showModuleNav = showHeader && !noModuleNavPaths.includes(pathname) || pathname === '/dashboard';
  
  const bypassPaths = ['/', '/login', '/platform-admin', '/super-admin', '/super-admin-innovkorp'];
  const requiresCompanyFile = !bypassPaths.includes(pathname) && role !== 'Employé' && role !== 'Fournisseur ERP';

  if (!isClient) {
    return null; 
  }

  if (requiresCompanyFile && !companyFile) {
    return <CompanyFileSelection />;
  }
  
  const isDashboardBlocked = (pathname === '/dashboard' || pathname.startsWith('/skomptab') || pathname.startsWith('/socix') || pathname.startsWith('/markos') || pathname.startsWith('/logson')) && requiresCompanyFile && !companyFile;

  return (
    <div className="flex h-screen w-full flex-col">
      {showHeader && <AppHeader />}
      {showModuleNav && <ModuleNav />}
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && !isDashboardBlocked && <AppSidebar />}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            (showSidebar) && !isDashboardBlocked && 'p-6',
            pathname === '/dashboard' && 'p-4 sm:p-6 lg:p-8',
            !showSidebar && showHeader && !['/dashboard', '/super-admin', '/super-admin-innovkorp'].includes(pathname) && 'p-4 sm:p-6 lg:p-8',
            (pathname === '/super-admin' || pathname === '/platform-admin' || pathname === '/super-admin-innovkorp') && 'p-4 sm:p-6 lg:p-8',
            !showHeader && !showSidebar && 'bg-background', 
            (showHeader || showSidebar) && 'bg-background/80'
          )}
        >
          {children}
        </main>
      </div>
      {pathname !== '/' && <ChatWidget />}
    </div>
  );
}
