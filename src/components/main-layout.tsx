
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
import { FolderOpen, Check } from 'lucide-react';
import Image from 'next/image';

const noHeaderPaths = ['/'];
const noSidebarPaths = ['/', '/super-admin', '/employee-dashboard'];

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
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><FolderOpen /> Sélectionner un Fichier de Gestion</CardTitle>
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
  const [companyFile] = useAtom(companyFileAtom);
  const [role] = useAtom(userRoleAtom);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showHeader = !noHeaderPaths.includes(pathname);
  const showSidebar = !noSidebarPaths.includes(pathname);
  const showModuleNav = showHeader && !['/', '/super-admin', '/employee-dashboard'].includes(pathname);
  
  const bypassPaths = ['/'];
  const requiresCompanyFile = !bypassPaths.includes(pathname) && role !== 'Employé';

  if (!isClient) {
    return null; 
  }

  if (requiresCompanyFile && !companyFile) {
    return <CompanyFileSelection />;
  }
  
  const isDashboardBlocked = pathname === '/dashboard' && !companyFile;

  return (
    <div className="flex h-screen w-full flex-col">
      {showHeader && <AppHeader />}
      {showModuleNav && <ModuleNav />}
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && !isDashboardBlocked && <AppSidebar />}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            showSidebar && !isDashboardBlocked && 'p-6',
            pathname === '/dashboard' && !isDashboardBlocked && 'p-4 sm:p-6 lg:p-8',
            !showSidebar && showHeader && pathname !== '/dashboard' && 'p-4 sm:p-6 lg:p-8',
            !showHeader && !showSidebar && 'flex items-center justify-center bg-gray-100 dark:bg-gray-900', 
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
