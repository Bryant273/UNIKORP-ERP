
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

const validTabs = ['profile', 'preferences', 'notifications'];

export function SettingsTabs({ tab }: { tab?: string }) {
  const router = useRouter();
  const defaultTab = tab && validTabs.includes(tab) ? tab : 'profile';
  
  const onTabChange = (value: string) => {
    router.push(`/settings?tab=${value}`);
  }

  return (
    <Tabs defaultValue={defaultTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="preferences">Préférences</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>
              Modifiez vos informations personnelles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" defaultValue="Utilisateur Unikorp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="utilisateur@unikorp.com"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Enregistrer</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="preferences">
        <Card>
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
            <CardDescription>
              Gérez vos préférences de langue et de région.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select defaultValue="fr">
                <SelectTrigger id="language">
                  <SelectValue placeholder="Sélectionnez une langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Enregistrer les préférences</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configurez la manière dont vous recevez les notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">
                  Notifications par email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Recevoir les notifications importantes par email.
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notifications push</Label>
                <p className="text-xs text-muted-foreground">
                  Recevoir des notifications en temps réel dans l&apos;application.
                </p>
              </div>
              <Switch id="push-notifications" defaultChecked />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Enregistrer les préférences</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
