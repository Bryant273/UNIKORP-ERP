import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MarkosPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Module MARKOS</CardTitle>
        <CardDescription>Marketing, CRM</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Bienvenue dans le module MARKOS. Les fonctionnalités de ce module sont en cours de développement.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div data-ai-hint="marketing campaign" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
            <p className="text-muted-foreground">Campagnes Marketing</p>
          </div>
          <div data-ai-hint="customer relationship" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
             <p className="text-muted-foreground">Gestion des clients (CRM)</p>
          </div>
           <div data-ai-hint="sales pipeline" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
             <p className="text-muted-foreground">Pipeline de Ventes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
