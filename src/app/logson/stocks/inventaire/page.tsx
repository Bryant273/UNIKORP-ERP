import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function InventairePage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Inventaire</CardTitle>
        <CardDescription>Gérez vos inventaires de stock.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section d'inventaire est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
