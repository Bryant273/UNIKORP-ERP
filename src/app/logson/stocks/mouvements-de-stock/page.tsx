import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MouvementsDeStockPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Mouvements de Stock</CardTitle>
        <CardDescription>Consultez l'historique des mouvements de stock.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section des mouvements de stock est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
