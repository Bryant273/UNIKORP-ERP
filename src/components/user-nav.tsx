
'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Settings, LifeBuoy, LogOut, Zap, Bell, History, MessageCircleQuestion, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { companyFileAtom, userRoleAtom } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useAtom(userRoleAtom);
  const [, setCompanyFile] = useAtom(companyFileAtom);

  const handleLogout = () => {
    // Reset global state
    setRole(null);
    setCompanyFile(null);
    // Redirect to login page
    router.push('/');
    toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté de votre session.',
    });
  }
  
  const isPlatformAdmin = role === 'Fournisseur ERP';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="user avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{isPlatformAdmin ? "Admin Plateforme" : "Utilisateur Unikorp"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {isPlatformAdmin ? "admin@unikorp-provider.com" : "utilisateur@unikorp.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {isPlatformAdmin ? (
            <DropdownMenuItem asChild>
              <Link href="/platform-admin">
                <Shield className="mr-2 h-4 w-4" />
                <span>Gestion Plateforme</span>
              </Link>
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/settings?tab=profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
               <DropdownMenuItem asChild>
                <Link href="/notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/actions">
                  <History className="mr-2 h-4 w-4" />
                  <span>Actions</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href="/settings?tab=preferences">
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <DropdownMenuItem asChild>
            <Link href="/help">
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Aide & Procédures</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/support">
              <MessageCircleQuestion className="mr-2 h-4 w-4" />
              <span>Contacter le Support</span>
            </Link>
          </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
