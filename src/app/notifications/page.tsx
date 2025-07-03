'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Bell, FileText, UserPlus, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Notification = {
  id: string;
  type: 'invoice' | 'user' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

const allNotifications: Notification[] = [
    { id: '1', type: 'invoice', title: 'Nouvelle facture reçue', description: 'Facture #F2024-155 de Fournisseur Gamma.', timestamp: '2024-07-26T10:30:00Z', read: false },
    { id: '2', type: 'user', title: 'Nouveau membre dans SOCIX', description: 'Sophie Martin a rejoint le module RH.', timestamp: '2024-07-26T08:15:00Z', read: false },
    { id: '3', type: 'system', title: 'Mise à jour système', description: 'Le module LOGSON a été mis à jour en v2.1.', timestamp: '2024-07-25T14:00:00Z', read: true },
    { id: '4', type: 'invoice', title: 'Paiement en retard', description: 'La facture #FACT-088 est en retard de 3 jours.', timestamp: '2024-07-23T09:00:00Z', read: true },
    { id: '5', type: 'system', title: 'Maintenance programmée', description: 'Une maintenance est prévue ce soir à 23h.', timestamp: '2024-07-22T18:00:00Z', read: true },
    { id: '6', type: 'user', title: 'Demande d\'accès', description: 'David Garcia demande l\'accès au module MARKOS.', timestamp: '2024-07-22T11:45:00Z', read: true },
    { id: '7', type: 'invoice', title: 'Facture payée', description: 'Le paiement de la facture #FACT-085 a été reçu.', timestamp: '2024-07-21T16:20:00Z', read: true },
];

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    const className = "h-6 w-6";
    switch (type) {
        case 'invoice': return <FileText className={cn(className, "text-blue-500")} />;
        case 'user': return <UserPlus className={cn(className, "text-green-500")} />;
        case 'system': return <Megaphone className={cn(className, "text-purple-500")} />;
        default: return <Bell className={className} />;
    }
}

function timeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `Il y a ${Math.floor(interval)} ans`;
  interval = seconds / 2592000;
  if (interval > 1) return `Il y a ${Math.floor(interval)} mois`;
  interval = seconds / 86400;
  if (interval > 1) return `Il y a ${Math.floor(interval)} jours`;
  interval = seconds / 3600;
  if (interval > 1) return `Il y a ${Math.floor(interval)} heures`;
  interval = seconds / 60;
  if (interval > 1) return `Il y a ${Math.floor(interval)} minutes`;
  return `À l'instant`;
}


export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(allNotifications);
    const [filter, setFilter] = useState('all');

    const handleMarkAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-2xl">Notifications</CardTitle>
                <CardDescription>Consultez, filtrez et gérez toutes vos notifications.</CardDescription>
            </div>
             <div className="flex items-center gap-4">
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrer..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="unread">Non lues</SelectItem>
                        <SelectItem value="invoice">Factures</SelectItem>
                        <SelectItem value="user">Utilisateurs</SelectItem>
                        <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleMarkAllRead} disabled={notifications.every(n => n.read)}>
                    Tout marquer comme lu
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notif => (
                    <div key={notif.id} className={cn("flex items-start gap-4 p-4 rounded-lg border", !notif.read && "bg-primary/5")}>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <NotificationIcon type={notif.type}/>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">{notif.title}</p>
                                <p className="text-xs text-muted-foreground">{timeSince(new Date(notif.timestamp))}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{notif.description}</p>
                        </div>
                        {!notif.read && (
                            <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" title="Non lu" />
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Aucune notification pour ce filtre.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
