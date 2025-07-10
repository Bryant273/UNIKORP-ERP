
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AlternanceEquipesPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Alternance des Équipes</CardTitle>
        <CardDescription>Gérez le turnover et l'alternance au sein de vos équipes.</CardDescription>
      </CardHeader>
      <CardContent className="h-96 flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Le module d'analyse de l'alternance est en cours de construction.</p>
        <p className="text-sm text-muted-foreground">Revenez bientôt pour visualiser les données de turnover.</p>
      </CardContent>
    </Card>
  );
}

