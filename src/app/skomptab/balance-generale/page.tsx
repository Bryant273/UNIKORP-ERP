import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BalanceGeneralePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Balance Générale</CardTitle>
        <CardDescription>Consultation de la balance générale.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section de la balance générale est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
