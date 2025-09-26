
'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from "react";
import { useAtom } from 'jotai';

import { userRoleAtom, type UserRole } from '@/lib/store';
import { cn } from '@/lib/utils';
import ActionsPage from '../actions/page';
import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, ShieldCheck, Download, Users, Briefcase, Settings, PlayCircle, StopCircle, UserPlus, Link2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DashboardPage from '../dashboard/page';
import { useToast } from '@/hooks/use-toast';

// --- DATA ---
type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
    status: 'Actif' | 'Inactif';
    lastLogin: string;
}

const allUsers: User[] = [
    { id: '1', name: 'Jean Dupont', email: 'jean.dupont@unikorp.com', role: 'Gestionnaire SKOMPTAB', avatarUrl: 'https://placehold.co/100x100.png', status: 'Actif', lastLogin: '2024-07-26T14:30:00Z' },
    { id: '2', name: 'Sophie Martin', email: 'sophie.martin@unikorp.com', role: 'Gestionnaire MARKOS', avatarUrl: 'https://placehold.co/100x100.png', status: 'Actif', lastLogin: '2024-07-26T11:15:00Z' },
    { id: '3', name: 'Admin', email: 'admin@unikorp.com', role: 'Admin-Gestionnaire', avatarUrl: 'https://placehold.co/100x100.png', status: 'Actif', lastLogin: '2024-07-26T14:00:00Z' },
    { id: '4', name: 'David Garcia', email: 'david.garcia@unikorp.com', role: 'Stagiaire SKOMPTAB', avatarUrl: 'https://placehold.co/100x100.png', status: 'Actif', lastLogin: '2024-07-25T09:02:00Z' },
    { id: '5', name: 'Léa Moreau', email: 'lea.moreau@unikorp.com', role: 'Employé', avatarUrl: 'https://placehold.co/100x100.png', status: 'Inactif', lastLogin: '2024-07-24T18:30:00Z' },
];

const navItems = [
    { href: '/super-admin?tab=dashboard', label: 'Tableau de bord', value: 'dashboard' },
    { href: '/super-admin?tab=users', label: 'Utilisateurs', value: 'users' },
    { href: '/super-admin?tab=actions', label: 'Actions', value: 'actions' },
    { href: '/super-admin?tab=settings', label: 'Configuration', value: 'settings' },
    { href: '/dashboard', label: 'Accès ERP', value: 'erp' },
];


// --- COMPONENTS ---
function AdminDashboard() {
    const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Tableau de Bord de Supervision</h2>
                    <p className="text-muted-foreground">Vue globale de l'activité de l'entreprise pour le mois en cours.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsOpeningModalOpen(true)}><PlayCircle className="mr-2 h-4 w-4"/>Ouverture d'exercice</Button>
                    <Button variant="destructive" onClick={() => setIsClosingModalOpen(true)}><StopCircle className="mr-2 h-4 w-4"/>Clôture d'exercice</Button>
                </div>
            </div>
            <div className="mt-6">
                <DashboardPage />
            </div>

            <Dialog open={isOpeningModalOpen} onOpenChange={setIsOpeningModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ouverture d'un Nouvel Exercice Comptable</DialogTitle>
                        <DialogDescription>Configurez les dates pour le nouvel exercice. Cette action générera les écritures de report à nouveau.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label htmlFor="startDate">Date de début</Label><Input id="startDate" type="date" /></div>
                        <div className="space-y-2"><Label htmlFor="endDate">Date de fin</Label><Input id="endDate" type="date" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpeningModalOpen(false)}>Annuler</Button>
                        <Button>Confirmer et ouvrir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isClosingModalOpen} onOpenChange={setIsClosingModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clôturer l'exercice en cours ?</AlertDialogTitle>
                        <AlertDialogDescription>Cette action est irréversible. Une fois clôturé, aucune modification ne sera possible sur l'exercice 2024. Les résultats seront reportés.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Confirmer la clôture</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function UserManagement() {
    const { toast } = useToast();
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
    
    const inviteLink = "https://unikorp.com/invite/a1b2c3d4e5f6";
    
    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        toast({ title: "Lien copié !", description: "Le lien d'invitation a été copié dans le presse-papiers." });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Gestion des Utilisateurs</CardTitle>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setIsInviteUserModalOpen(true)}>
                                <Link2 className="mr-2 h-4 w-4"/>
                                Inviter un utilisateur
                            </Button>
                            <Button onClick={() => setIsAddUserModalOpen(true)}>
                                <UserPlus className="mr-2 h-4 w-4"/>
                                Ajouter un utilisateur
                            </Button>
                        </div>
                    </div>
                    <CardDescription>Ajoutez, modifiez ou suspendez les accès des utilisateurs à l'ERP.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead>Dernière connexion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9"><AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person face" /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar>
                                            <div><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                                    <TableCell className="text-center"><Badge variant={user.status === 'Actif' ? 'default' : 'destructive'} className={cn(user.status === 'Actif' && 'bg-green-100 text-green-800')}>{user.status}</Badge></TableCell>
                                    <TableCell>{format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm', {locale: fr})}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add User Modal */}
            <AddUserModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} />

            {/* Invite User Modal */}
            <Dialog open={isInviteUserModalOpen} onOpenChange={setIsInviteUserModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Inviter un utilisateur</DialogTitle>
                        <DialogDescription>Générez un lien d'invitation sécurisé à envoyer à un nouvel utilisateur. Il pourra compléter ses informations lui-même.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Label htmlFor="invite-link">Lien d'invitation unique</Label>
                        <div className="flex items-center gap-2">
                            <Input id="invite-link" value={inviteLink} readOnly />
                            <Button onClick={handleCopyLink} size="icon" variant="outline"><Copy className="h-4 w-4" /></Button>
                        </div>
                         <p className="text-xs text-muted-foreground">Ce lien est valide pour 7 jours.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInviteUserModalOpen(false)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

function AddUserModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [generatedPassword, setGeneratedPassword] = useState('');
    const { toast } = useToast();

    const generatePassword = () => {
        const pass = `pass${Math.random().toString(36).slice(-8)}`;
        setGeneratedPassword(pass);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copié !' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                    <DialogDescription>Remplissez les informations pour créer un nouveau compte.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label htmlFor="name">Nom complet</Label><Input id="name" placeholder="Jean Dupont"/></div>
                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="jean.dupont@example.com"/></div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Rôle</Label>
                        <Select><SelectTrigger><SelectValue placeholder="Attribuer un rôle..."/></SelectTrigger><SelectContent>
                            <SelectItem value="admin">Admin-Gestionnaire</SelectItem>
                            <SelectItem value="gest_skomptab">Gestionnaire SKOMPTAB</SelectItem>
                            <SelectItem value="stag_skomptab">Stagiaire SKOMPTAB</SelectItem>
                            <SelectItem value="employee">Employé</SelectItem>
                        </SelectContent></Select>
                    </div>
                     <Separator />
                    <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Identifiants générés</h4>
                             <Button type="button" variant="secondary" size="sm" onClick={generatePassword}>Générer le mot de passe</Button>
                        </div>
                        <div className="space-y-2">
                            <Label>Email / Nom d'utilisateur</Label>
                            <Input readOnly value="jean.dupont@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Mot de passe temporaire</Label>
                            <div className="flex items-center gap-2">
                                <Input readOnly value={generatedPassword} placeholder="Cliquez pour générer" />
                                <Button type="button" onClick={() => copyToClipboard(generatedPassword)} size="icon" variant="outline" disabled={!generatedPassword}><Copy className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">L'utilisateur sera invité à changer ce mot de passe à sa première connexion.</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button>Créer l'utilisateur</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function CompanySettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Paramètres de l'entreprise</CardTitle>
                <CardDescription>Gérez les informations générales de votre entreprise et les exercices comptables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input id="companyName" defaultValue="UNIKORP S.A."/>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="font-semibold">Exercices Comptables</h3>
                     <Table>
                        <TableHeader><TableRow><TableHead>Année</TableHead><TableHead>Date Début</TableHead><TableHead>Date Fin</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            <TableRow><TableCell>2024</TableCell><TableCell>01/01/2024</TableCell><TableCell>31/12/2024</TableCell><TableCell><Badge>Ouvert</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm">Clôturer</Button></TableCell></TableRow>
                            <TableRow><TableCell>2023</TableCell><TableCell>01/01/2023</TableCell><TableCell>31/12/2023</TableCell><TableCell><Badge variant="secondary">Clôturé</Badge></TableCell><TableCell className="text-right"><Button variant="outline" size="sm" disabled>Rouvrir</Button></TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
             <CardFooter>
                <Button className="ml-auto">Enregistrer les modifications</Button>
            </CardFooter>
        </Card>
    )
}


export default function SuperAdminPage() {
    const [role] = useAtom(userRoleAtom);
    const hasActionLogAccess = role === 'Compte Entreprise';
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <AdminDashboard />;
            case 'users': return <UserManagement />;
            case 'actions': return hasActionLogAccess ? <ActionsPage /> : null;
            case 'settings': return <CompanySettings />;
            default: return <AdminDashboard />;
        }
    };
    
    return (
        <div className="space-y-6">
             <nav className="bg-primary border-b px-4 sm:px-6 -mx-6 -mt-6">
              <div className="flex items-center gap-4">
                {navItems.map((link) => {
                    const isErpAccess = link.value === 'erp';
                    if (link.value === 'actions' && !hasActionLogAccess) return null;
                    return (
                      <Link href={link.href} key={link.href}>
                        <div
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:text-white rounded-t-md',
                            activeTab === link.value && !isErpAccess && 'bg-background text-primary'
                          )}
                        >
                          {link.label}
                        </div>
                      </Link>
                    )
                })}
              </div>
            </nav>

            <div className="pt-2">
              {renderContent()}
            </div>
        </div>
    );
}
