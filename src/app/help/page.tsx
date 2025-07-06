import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Centre d'aide</CardTitle>
        <CardDescription>Trouvez des réponses à vos questions et apprenez à utiliser Unikorp Central.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le centre d'aide est en cours de construction. Revenez bientôt pour des guides et des tutoriels.</p>
      </CardContent>
    </Card>
  );
}
