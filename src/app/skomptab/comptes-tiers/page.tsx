import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ComptesTiersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Comptes Tiers</CardTitle>
        <CardDescription>Gestion des comptes tiers (clients, fournisseurs).</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section des comptes tiers est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
