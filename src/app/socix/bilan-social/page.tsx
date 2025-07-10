
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BilanSocialPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Bilan Social</CardTitle>
        <CardDescription>Élaborez et consultez le bilan social de votre entreprise.</CardDescription>
      </CardHeader>
      <CardContent className="h-96 flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Le module du Bilan Social est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}

