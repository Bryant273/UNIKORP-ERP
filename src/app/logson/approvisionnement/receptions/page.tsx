import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReceptionsPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Réceptions</CardTitle>
        <CardDescription>Gérez la réception des commandes fournisseurs.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section des réceptions est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
