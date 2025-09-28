
'use client';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Image from "next/image";
import { Calculator, UsersRound, Megaphone, Ship, Zap, ShieldCheck, GitCommit, MoveUpRight, CheckCircle, BarChart2, TrendingUp, Cpu } from "lucide-react";
import { useState } from "react";
import { LoginModal } from "@/components/login-modal";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export default function LandingPage() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const modules = [
        {
            name: 'SKOMPTAB',
            title: 'Finance & Comptabilité',
            icon: Calculator,
            description: 'Pilotez votre santé financière avec une précision chirurgicale. SKOMPTAB centralise votre comptabilité, de la saisie des écritures à la génération des états financiers.',
        },
        {
            name: 'SOCIX',
            title: 'Ressources Humaines',
            icon: UsersRound,
            description: 'Transformez votre gestion RH en un levier de croissance stratégique. SOCIX simplifie la gestion des employés, de la paie aux congés et au développement des talents.',
        },
        {
            name: 'MARKOS',
            title: 'Marketing & CRM',
            icon: Megaphone,
            description: 'De la prospection à la fidélisation, MARKOS est votre copilote pour une relation client optimisée et des campagnes marketing percutantes.',
        },
        {
            name: 'LOGSON',
            title: 'Logistique & Stocks',
            icon: Ship,
            description: 'Optimisez l\'ensemble de votre chaîne d\'approvisionnement. LOGSON vous donne une visibilité complète sur vos stocks, commandes et livraisons.',
        },
    ];

    const pillars = [
        { icon: Zap, title: "Intelligence Artificielle", description: "Automatisez les tâches complexes et obtenez des analyses prédictives grâce à notre IA intégrée." },
        { icon: ShieldCheck, title: "Sécurité Renforcée", description: "Vos données sont protégées par une architecture robuste avec une gestion fine des accès." },
        { icon: GitCommit, title: "Intégration Fluide", description: "Les données circulent sans effort entre les modules, éliminant la double saisie et les erreurs." },
    ];
    
     const allInOneFeatures = [
        { title: 'Centralisation', description: 'Une seule source de vérité pour toutes vos données.' },
        { title: 'Automatisation', description: 'Gagnez du temps en automatisant les processus répétitifs.' },
        { title: 'Visibilité 360°', description: 'Des tableaux de bord pour une vision complète de votre activité.' },
        { title: 'Collaboration', description: 'Des outils pour améliorer la communication entre les équipes.' },
        { title: 'Évolutivité', description: 'Une solution qui grandit avec votre entreprise.' },
        { title: 'Mobilité', description: 'Accédez à vos données partout, à tout moment.' },
    ];

    return (
        <>
            <div className="w-full min-h-screen bg-background text-foreground">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-8 bg-background/80 backdrop-blur-sm border-b">
                    <div className="flex items-center gap-2">
                        <Logo className="h-8 w-8 text-primary" />
                        <span className="font-bold text-xl">UNIKORP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex gap-6 text-sm font-medium">
                            <a href="#modules" className="hover:text-primary transition-colors">Modules</a>
                             <a href="#avantages" className="hover:text-primary transition-colors">Avantages</a>
                            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                        </nav>
                        <Button onClick={() => setIsLoginModalOpen(true)}>Se connecter</Button>
                    </div>
                </header>

                <main>
                    {/* Hero Section */}
                    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
                        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                        <div className="absolute -bottom-1/3 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-blob"></div>
                        <div className="absolute -top-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                        
                        <div className="container mx-auto px-4 relative z-10">
                             <div className="max-w-3xl mx-auto text-center">
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary via-violet-500 to-accent">
                                   Plus unifié, plus intelligent, plus performant.
                                </h1>
                                <p className="mt-6 text-lg text-muted-foreground">
                                    UNIKORP, une solution de l'entreprise <span className="font-semibold text-primary">INNOV'KORP</span>, est l'ERP moderne qui centralise vos finances, vos ressources humaines, votre marketing et votre logistique pour une gestion d'entreprise sans friction.
                                </p>
                                <div className="mt-8 flex justify-center gap-4">
                                    <Button size="lg" onClick={() => setIsLoginModalOpen(true)}>Se connecter à UNIKORP</Button>
                                </div>
                            </div>
                            
                            <div className="mt-20">
                                <Image 
                                    src="https://picsum.photos/seed/dashboard/1200/600"
                                    alt="Tableau de bord UNIKORP"
                                    data-ai-hint="dashboard screen application"
                                    width={1200}
                                    height={600}
                                    className="rounded-lg shadow-2xl mx-auto ring-1 ring-white/10"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Modules Section */}
                    <section id="modules" className="py-24 bg-muted/40">
                         <div className="container mx-auto px-4">
                             <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold">Une suite ERP complète et intégrée</h2>
                                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                                    Chaque module est conçu pour exceller de manière autonome, mais leur véritable puissance se révèle lorsqu'ils fonctionnent ensemble.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {modules.map((module) => (
                                    <Card key={module.name} className="bg-card/80 backdrop-blur-sm border-white/10 hover:border-primary/30 hover:-translate-y-2 transition-transform duration-300">
                                        <CardHeader>
                                            <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                                                <module.icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <CardTitle>{module.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{module.description}</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="link" className="p-0">En savoir plus <MoveUpRight className="h-4 w-4 ml-1"/></Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    {/* All-in-one Section */}
                    <section className="py-24 bg-background">
                         <div className="container mx-auto px-4">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold">La seule plateforme dont vous avez besoin</h2>
                                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                                    UNIKORP remplace vos multiples logiciels par une solution unique et cohérente, vous offrant une vue à 360° et un contrôle total sur votre activité.
                                </p>
                            </div>
                            <div className="relative">
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                               </div>
                               <Image 
                                    src="https://picsum.photos/seed/dashboard2/1200/800"
                                    alt="UNIKORP all-in-one"
                                    data-ai-hint="application screen"
                                    width={1200}
                                    height={800}
                                    className="relative rounded-lg shadow-2xl mx-auto ring-1 ring-white/10 z-10"
                                />
                                <div className="hidden lg:grid grid-cols-3 gap-8 mt-12 relative z-10">
                                    {allInOneFeatures.slice(0, 3).map(feature => (
                                        <div key={feature.title} className="text-center p-4">
                                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pillars Section */}
                    <section id="avantages" className="py-24 bg-muted/40">
                         <div className="container mx-auto px-4">
                            <div className="text-center mb-16">
                                 <h2 className="text-3xl font-bold">Conçu pour la performance et la simplicité</h2>
                                 <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
                                   Briser les silos entre vos départements. En centralisant vos données et en automatisant vos processus, nous vous offrons une vision claire pour des décisions plus rapides.
                                 </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                {pillars.map(pillar => (
                                    <div key={pillar.title} className="text-center p-6">
                                        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                                            <pillar.icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{pillar.title}</h3>
                                        <p className="text-muted-foreground text-sm">{pillar.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer id="contact" className="bg-foreground text-background">
                    <div className="container mx-auto px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                 <div className="flex items-center gap-2 mb-4">
                                    <Logo className="h-8 w-8 text-primary" />
                                    <span className="font-bold text-xl">UNIKORP</span>
                                </div>
                                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} INNOV'KORP. <br/>Tous droits réservés.</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Modules</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><a href="#" className="hover:text-white">SKOMPTAB</a></li>
                                    <li><a href="#" className="hover:text-white">SOCIX</a></li>
                                    <li><a href="#" className="hover:text-white">MARKOS</a></li>
                                    <li><a href="#" className="hover:text-white">LOGSON</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Société</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><a href="#" className="hover:text-white">À propos</a></li>
                                    <li><a href="#" className="hover:text-white">Carrières</a></li>
                                    <li><a href="#" className="hover:text-white">Contact</a></li>
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-4">Ressources</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><a href="#" className="hover:text-white">Blog</a></li>
                                    <li><a href="#" className="hover:text-white">Centre d'aide</a></li>
                                    <li><a href="#" className="hover:text-white">Sécurité</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}

    