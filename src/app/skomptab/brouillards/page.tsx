import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BrouillardsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Brouillards</CardTitle>
        <CardDescription>Consultation des brouillards comptables.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section des brouillards est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
