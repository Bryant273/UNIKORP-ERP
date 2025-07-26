
'use client';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Image from "next/image";
import { BarChart, Calculator, Megaphone, Ship, Users, ArrowRight, GitCommit, Zap, ShieldCheck, Heart, UsersRound } from "lucide-react";
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
            description: 'Pilotez votre santé financière avec une précision chirurgicale. SKOMPTAB centralise votre comptabilité, de la saisie des écritures à la génération des états financiers, en passant par la gestion de la trésorerie et la conformité fiscale.',
            features: [
                'Plan comptable général et analytique personnalisable.',
                'Gestion automatisée de la TVA et des autres impôts.',
                'Rapprochement bancaire intelligent et suivi de trésorerie.',
                'Reporting financier en temps réel (Bilan, Compte de Résultat, SIG).',
            ],
            image: 'https://placehold.co/600x400.png'
        },
        {
            name: 'SOCIX',
            title: 'Ressources Humaines',
            icon: UsersRound,
            description: 'Transformez votre gestion RH en un levier de croissance stratégique. SOCIX simplifie la gestion des employés, de la paie aux congés, en passant par le développement des talents et le suivi des performances.',
            features: [
                'Gestion complète des dossiers employés et des contrats.',
                'Traitement de la paie et déclarations sociales automatisées.',
                'Suivi des congés, absences et plannings d\'équipe.',
                'Gestion des compétences, formations et entretiens annuels.',
            ],
            image: 'https://placehold.co/600x400.png'
        },
        {
            name: 'MARKOS',
            title: 'Marketing & CRM',
            icon: Megaphone,
            description: 'De la prospection à la fidélisation, MARKOS est votre copilote pour une relation client optimisée et des campagnes marketing percutantes. Unifiez vos efforts pour une croissance mesurable.',
            features: [
                'Pipeline de vente visuel et suivi des opportunités.',
                'Segmentation avancée de la base de contacts.',
                'Automatisation des campagnes marketing multicanal.',
                'Analyse du ROI et des performances en temps réel.',
            ],
            image: 'https://placehold.co/600x400.png'
        },
        {
            name: 'LOGSON',
            title: 'Logistique & Stocks',
            icon: Ship,
            description: 'Optimisez l\'ensemble de votre chaîne d\'approvisionnement. LOGSON vous donne une visibilité complète sur vos stocks, commandes et livraisons pour une efficacité maximale.',
            features: [
                'Suivi des stocks en temps réel sur plusieurs entrepôts.',
                'Gestion des commandes fournisseurs et des réceptions.',
                'Planification et suivi des expéditions clients.',
                'Analyse des coûts logistiques et des indicateurs de performance.',
            ],
            image: 'https://placehold.co/600x400.png'
        },
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
                            <a href="#integration" className="hover:text-primary transition-colors">Intégration</a>
                            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                        </nav>
                        <Button onClick={() => setIsLoginModalOpen(true)}>Se connecter</Button>
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
                                <Button size="lg" onClick={() => setIsLoginModalOpen(true)}>Commencer</Button>
                                <Button size="lg" variant="outline">Demander une démo</Button>
                            </div>
                        </div>
                    </section>

                    {/* Intro Section */}
                    <section className="py-20 bg-background">
                        <div className="container mx-auto px-4 text-center">
                             <h2 className="text-3xl font-bold">La Plateforme Unifiée pour Piloter votre Croissance</h2>
                             <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
                                UNIKORP, une innovation signée <span className="font-semibold text-primary">INNOV'KORP</span>, est bien plus qu'un simple logiciel. C'est un partenaire stratégique conçu pour briser les silos entre vos départements. En centralisant vos données et en automatisant vos processus, nous vous offrons une vision à 360° de votre activité pour des décisions plus rapides et plus intelligentes.
                             </p>
                        </div>
                    </section>
                    
                    {/* Modules Section */}
                    <section id="modules" className="py-20 bg-muted/40">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold">Une solution complète pour chaque département</h2>
                                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Découvrez comment chaque module UNIKORP répond aux besoins spécifiques de votre entreprise.</p>
                            </div>
                            <div className="space-y-24">
                                {modules.map((module, index) => (
                                    <div key={module.name} className="grid md:grid-cols-2 gap-12 items-center">
                                        <div className={cn("space-y-4", index % 2 !== 0 && "md:order-last")}>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-md">
                                                    <module.icon className="h-6 w-6 text-primary" />
                                                </div>
                                                <h3 className="text-2xl font-semibold">{module.title}</h3>
                                            </div>
                                            <p className="text-muted-foreground">{module.description}</p>
                                            <ul className="space-y-2 pt-2">
                                                {module.features.map(feature => (
                                                    <li key={feature} className="flex items-start gap-3">
                                                        <Zap className="h-4 w-4 text-primary mt-1 flex-shrink-0"/>
                                                        <span className="text-sm">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <Image src={module.image} alt={`Interface ${module.name}`} data-ai-hint={`${module.name} screen dashboard`} width={600} height={400} className="rounded-lg shadow-lg aspect-video object-cover"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>


                    {/* Integration Section */}
                    <section id="integration" className="py-20 bg-background">
                        <div className="container mx-auto px-4">
                             <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold">Une Synergie Parfaite</h2>
                                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Les modules d'UNIKORP ne sont pas des silos. Ils communiquent et travaillent ensemble pour automatiser vos flux de travail.</p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone/>MARKOS</CardTitle></CardHeader>
                                    <CardContent><p className="text-sm">Un prospect est converti en client.</p></CardContent>
                                </Card>
                                <div className="flex items-center justify-center text-primary"><ArrowRight className="w-12 h-12"/></div>
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Calculator/>SKOMPTAB</CardTitle></CardHeader>
                                    <CardContent><p className="text-sm">Le compte client est automatiquement créé dans les tiers.</p></CardContent>
                                </Card>
                            </div>
                            <div className="flex justify-center my-8">
                                <GitCommit className="w-8 h-8 rotate-90 text-muted-foreground"/>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8">
                                 <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Calculator/>SKOMPTAB</CardTitle></CardHeader>
                                    <CardContent><p className="text-sm">Une facture de vente est validée.</p></CardContent>
                                </Card>
                                <div className="flex items-center justify-center text-primary"><ArrowRight className="w-12 h-12"/></div>
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><Ship/>LOGSON</CardTitle></CardHeader>
                                    <CardContent><p className="text-sm">Une commande client est automatiquement créée, prête pour préparation et expédition.</p></CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                </main>

                {/* Footer */}
                <footer id="contact" className="bg-foreground text-background">
                    <div className="container mx-auto px-4 py-8 text-center">
                        <p>&copy; {new Date().getFullYear()} UNIKORP by INNOV'KORP. Tous droits réservés.</p>
                    </div>
                </footer>
            </div>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}
