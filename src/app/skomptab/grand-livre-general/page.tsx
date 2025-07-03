import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function GrandLivreGeneralPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Grand Livre Général</CardTitle>
        <CardDescription>Consultation du grand livre général.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de la section du grand livre général est en cours de construction.</p>
      </CardContent>
    </Card>
  );
}
