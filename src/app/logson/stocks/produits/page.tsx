import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProduitsPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Produits</CardTitle>
        <CardDescription>Gérez votre catalogue de produits.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section des produits est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
