
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RapportsAnalysesPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Rapports et Analyses</CardTitle>
        <CardDescription>Générez des rapports personnalisés sur vos données sociales.</CardDescription>
      </CardHeader>
       <CardContent className="h-96 flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Le générateur de rapports personnalisés est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}

