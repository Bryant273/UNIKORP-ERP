
'use client';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BarChart, Calculator, Megaphone, Ship, Users } from "lucide-react";

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="w-full min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-8 bg-background/80 backdrop-blur-sm border-b">
                <div className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-bold text-xl">UNIKORP</span>
                </div>
                <div className="flex items-center gap-4">
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <a href="#features" className="hover:text-primary transition-colors">Fonctionnalités</a>
                        <a href="#modules" className="hover:text-primary transition-colors">Modules</a>
                        <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                    </nav>
                    <Button onClick={() => router.push('/login')}>Se connecter</Button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="h-screen flex items-center justify-center bg-muted/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                     <div className="absolute -bottom-1/3 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-blob"></div>
                     <div className="absolute -top-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="container mx-auto text-center relative z-10 px-4">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent/80">
                           Unifiez la gestion de votre entreprise.
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                            UNIKORP est l'ERP moderne, intégré et intelligent qui centralise vos finances, vos ressources humaines, votre marketing et votre logistique.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Button size="lg" onClick={() => router.push('/login')}>Commencer</Button>
                            <Button size="lg" variant="outline">Demander une démo</Button>
                        </div>
                    </div>
                </section>

                {/* Modules Section */}
                 <section id="modules" className="py-20 bg-background">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">Quatre Pôles Stratégiques, Une Solution Unifiée</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center p-6 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                                <Calculator className="h-12 w-12 mx-auto text-primary mb-4" />
                                <h3 className="font-semibold text-lg">SKOMPTAB</h3>
                                <p className="text-muted-foreground mt-2 text-sm">Finance & Comptabilité</p>
                            </div>
                             <div className="text-center p-6 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                                <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                                <h3 className="font-semibold text-lg">SOCIX</h3>
                                <p className="text-muted-foreground mt-2 text-sm">Ressources Humaines</p>
                            </div>
                             <div className="text-center p-6 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                                <Megaphone className="h-12 w-12 mx-auto text-primary mb-4" />
                                <h3 className="font-semibold text-lg">MARKOS</h3>
                                <p className="text-muted-foreground mt-2 text-sm">Marketing & CRM</p>
                            </div>
                             <div className="text-center p-6 border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                                <Ship className="h-12 w-12 mx-auto text-primary mb-4" />
                                <h3 className="font-semibold text-lg">LOGSON</h3>
                                <p className="text-muted-foreground mt-2 text-sm">Logistique & Stocks</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-muted/40">
                    <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <Image src="https://placehold.co/800x600.png" alt="Tableau de bord Unikorp" data-ai-hint="dashboard screen" width={800} height={600} className="rounded-lg shadow-2xl" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Pilotage en Temps Réel</h2>
                            <p className="text-muted-foreground mb-6">
                                Prenez des décisions éclairées grâce à des tableaux de bord dynamiques et des indicateurs de performance clés (KPI) mis à jour en continu. UNIKORP transforme vos données brutes en informations stratégiques.
                            </p>
                             <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><BarChart className="h-5 w-5 text-primary" /></div>
                                    <div><h4 className="font-semibold">Vue à 360°</h4><p className="text-sm text-muted-foreground">Consolidez les données de tous vos départements en une seule vue unifiée.</p></div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Users className="h-5 w-5 text-primary" /></div>
                                    <div><h4 className="font-semibold">Collaboration Accrue</h4><p className="text-sm text-muted-foreground">Éliminez les silos d'information et favorisez une communication fluide entre les équipes.</p></div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer id="contact" className="bg-foreground text-background">
                <div className="container mx-auto px-4 py-8 text-center">
                    <p>&copy; {new Date().getFullYear()} UNIKORP. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
}

// Add this to your globals.css or a new CSS file
/*
@layer utilities {
    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
        animation: blob 7s infinite;
    }
    .animation-delay-2000 {
        animation-delay: 2s;
    }
    .bg-grid-pattern {
        background-image: linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
        background-size: 4rem 4rem;
    }
}
*/
