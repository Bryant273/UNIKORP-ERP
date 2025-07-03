import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SkomptabPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Module SKOMPTAB</CardTitle>
        <CardDescription>Comptabilité, Finance et Fiscalité</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Bienvenue dans le module SKOMPTAB. Les fonctionnalités de ce module sont en cours de développement.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div data-ai-hint="financial report" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
            <p className="text-muted-foreground">Rapports Financiers</p>
          </div>
          <div data-ai-hint="invoice management" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
             <p className="text-muted-foreground">Gestion des Factures</p>
          </div>
           <div data-ai-hint="tax declaration" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
             <p className="text-muted-foreground">Déclarations Fiscales</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
