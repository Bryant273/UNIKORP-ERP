import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FichesDeStocksPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Fiches de Stocks</CardTitle>
        <CardDescription>Consultez les fiches détaillées de vos stocks.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section des fiches de stocks est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
