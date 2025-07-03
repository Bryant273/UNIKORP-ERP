import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TableauSigPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Tableau des SIG</CardTitle>
        <CardDescription>Génération et consultation du tableau des Soldes Intermédiaires de Gestion.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section du tableau des SIG est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
