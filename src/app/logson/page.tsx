import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LogsonPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Module LOGSON</CardTitle>
        <CardDescription>Logistique et Contrôle de gestion</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Bienvenue dans le module LOGSON. Les fonctionnalités de ce module sont en cours de développement.</p>
         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div data-ai-hint="inventory management" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
            <p className="text-muted-foreground">Gestion des Stocks</p>
          </div>
          <div data-ai-hint="shipment tracking" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
             <p className="text-muted-foreground">Suivi des Expéditions</p>
          </div>
           <div data-ai-hint="supplier management" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
             <p className="text-muted-foreground">Gestion des Fournisseurs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
