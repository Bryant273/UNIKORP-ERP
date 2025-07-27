import { use } from 'react';
import { SettingsTabs } from '@/components/settings-tabs';

export default function SettingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const tab = use(searchParams)?.tab as string | undefined;

  return (
    <div className="flex w-full flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres de votre compte et vos préférences.
        </p>
      </div>
      <SettingsTabs tab={tab} />
    </div>
  );
}
