
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function EmployesPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Gestion des Employés</CardTitle>
        <CardDescription>Consultez, ajoutez et gérez les fiches des employés.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de cette section est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
