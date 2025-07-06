'use client';
import FiscalPageLayout from '@/components/fiscal-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function CalendrierFiscalMainContent() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Calendrier Fiscal Interactif</CardTitle>
                <CardDescription>
                    Explorez le calendrier pour visualiser vos échéances. Cliquez sur une date surlignée pour obtenir les détails de la déclaration due.
                    La liste des prochaines échéances est triée par urgence sur votre droite.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Le calendrier fiscal est affiché dans le panneau de droite.</p>
                <div className="h-64 rounded-lg border-2 border-dashed bg-muted/30 flex items-center justify-center mt-4" data-ai-hint="calendar illustration">
                    <p className="text-muted-foreground">Votre calendrier fiscal interactif est ici.</p>
                </div>
            </CardContent>
        </Card>
    )
}

export default function CalendrierFiscalPage() {
    return (
        <FiscalPageLayout>
            <CalendrierFiscalMainContent />
        </FiscalPageLayout>
    );
}
