import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MarkosPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Médiathèque</CardTitle>
        <CardDescription>Gérez vos ressources multimédia (images, vidéos, documents).</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le contenu de cette page est en cours de développement.</p>
      </CardContent>
    </Card>
  );
}
