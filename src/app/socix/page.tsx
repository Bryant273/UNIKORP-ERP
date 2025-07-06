import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SocixPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Module SOCIX</CardTitle>
        <CardDescription>RH et Mix Social</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Bienvenue dans le module SOCIX. Les fonctionnalités de ce module sont en cours de développement.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div data-ai-hint="employee directory" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
            <p className="text-muted-foreground">Gestion des Employés</p>
          </div>
          <div data-ai-hint="payroll processing" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
             <p className="text-muted-foreground">Gestion de la Paie</p>
          </div>
           <div data-ai-hint="leave requests" className="h-64 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center">
             <p className="text-muted-foreground">Demandes de Congés</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
