import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EntrepotsPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Entrepôts</CardTitle>
        <CardDescription>Gérez vos entrepôts et emplacements de stockage.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section des entrepôts est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
