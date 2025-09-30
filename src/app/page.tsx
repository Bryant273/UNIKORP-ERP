
'use client';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Image from "next/image";
import { Calculator, UsersRound, Megaphone, Ship, Zap, ShieldCheck, GitMerge, MoveUpRight, CheckCircle, Star, Linkedin, Facebook, Twitter, Instagram, Rocket, PlayCircle, Send } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DemoVideoModal } from "@/components/demo-video-modal";
import { LoginModal } from "@/components/login-modal";

export default function LandingPage() {
    const { toast } = useToast();
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
          title: 'Message envoyé !',
          description: "Merci de votre intérêt. Notre équipe vous contactera dans les plus brefs délais.",
        });
        (e.target as HTMLFormElement).reset();
    };

    const partners = [
        { name: "Partner 1", logo: "https://picsum.photos/seed/p1/150/60" },
        { name: "Partner 2", logo: "https://picsum.photos/seed/p2/150/60" },
        { name: "Partner 3", logo: "https://picsum.photos/seed/p3/150/60" },
        { name: "Partner 4", logo: "https://picsum.photos/seed/p4/150/60" },
        { name: "Partner 5", logo: "https://picsum.photos/seed/p5/150/60" },
        { name: "Partner 6", logo: "https://picsum.photos/seed/p6/150/60" },
    ];

    const modules = [
        { name: 'SKOMPTAB', title: 'Finance & Comptabilité', icon: Calculator, description: 'Pilotez votre santé financière avec une précision chirurgicale.', image: "https://picsum.photos/seed/picsum1/600/400" },
        { name: 'SOCIX', title: 'Ressources Humaines', icon: UsersRound, description: 'Transformez votre gestion RH en un levier de croissance stratégique.', image: "https://picsum.photos/seed/picsum2/600/400" },
        { name: 'MARKOS', title: 'Marketing & CRM', icon: Megaphone, description: 'De la prospection à la fidélisation, optimisez votre relation client.', image: "https://picsum.photos/seed/picsum3/600/400" },
        { name: 'LOGSON', title: 'Logistique & Stocks', icon: Ship, description: 'Optimisez l\'ensemble de votre chaîne d\'approvisionnement.', image: "https://picsum.photos/seed/picsum4/600/400" },
    ];

     const benefits = [
        {
            title: 'Collaboration Transparente',
            description: "Briser les silos entre vos départements. En centralisant vos données, UNIKORP offre une source unique de vérité, permettant à vos équipes de collaborer plus efficacement et de prendre des décisions basées sur des informations à jour.",
            icon: GitMerge,
            image: "https://picsum.photos/seed/collab/600/400",
            imageAlt: "Collaboration"
        },
        {
            title: 'Intelligence Augmentée',
            description: "Passez de la saisie manuelle à l'analyse stratégique. Notre IA intégrée automatise les tâches complexes, de la digitalisation des factures à la recherche sémantique, vous libérant du temps pour vous concentrer sur la croissance.",
            icon: Zap,
            image: "https://picsum.photos/seed/ai/600/400",
            imageAlt: "Intelligence Artificielle"
        },
        {
            title: 'Sécurité et Conformité',
            description: "La sécurité de vos données est notre priorité. Avec une gestion fine des rôles et des accès, et une architecture robuste, UNIKORP garantit la confidentialité, l'intégrité et la traçabilité de toutes vos opérations.",
            icon: ShieldCheck,
            image: "https://picsum.photos/seed/security/600/400",
            imageAlt: "Sécurité"
        }
    ];

     const testimonials = [
        { quote: "UNIKORP a transformé notre gestion quotidienne. Tout est plus simple, plus rapide et entièrement intégré. Un gain de productivité incroyable !", author: "Marc Dubois", company: "CEO, Innovatech" },
        { quote: "La vue à 360° sur nos opérations est un véritable atout stratégique. Nous prenons de meilleures décisions, plus rapidement.", author: "Aïssata Traoré", company: "Directrice Financière, Global Corp" },
        { quote: "Le module SOCIX a simplifié notre gestion RH. De la paie aux congés, tout est centralisé. Nos équipes adorent !", author: "Karim Fofana", company: "DRH, Services Plus" }
    ];

    const pricingPlans = [
        {
            name: "Essentiel",
            price: "100 000",
            frequency: "/mois",
            description: "Idéal pour les PME et startups.",
            features: [
                "1 module au choix",
                "Jusqu'à 5 utilisateurs",
                "100 Go de stockage",
                "Support par email",
                "Mises à jour incluses",
            ],
            cta: "Commencer",
            popular: false,
        },
        {
            name: "Premium",
            price: "250 000",
            frequency: "/mois",
            description: "Parfait pour les entreprises en croissance.",
            features: [
                "Accès à tous les modules",
                "Jusqu'à 25 utilisateurs",
                "500 Go de stockage",
                "Support prioritaire",
                "Accès aux fonctionnalités IA",
                "Onboarding personnalisé",
            ],
            cta: "Commencer",
            popular: true,
        },
        {
            name: "Entreprise",
            price: "Sur Devis",
            frequency: "",
            description: "Pour les grandes organisations aux besoins spécifiques.",
            features: [
                "Accès illimité à l'ERP",
                "Utilisateurs illimités",
                "Base de données dédiée et illimitée",
                "Support dédié 24/7",
                "Développements sur-mesure",
                "Accompagnement stratégique",
            ],
            cta: "Nous Contacter",
            popular: false,
        },
    ];


    return (
        <>
            <div className="w-full min-h-screen bg-background text-foreground">
                <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 px-8 bg-background/80 backdrop-blur-sm border-b">
                    <div className="flex items-center gap-2">
                        <Logo className="h-8 w-8 text-primary" />
                        <span className="font-bold text-xl">UNIKORP</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex gap-6 text-sm font-medium">
                            <a href="#modules" className="hover:text-primary transition-colors">Modules</a>
                             <a href="#avantages" className="hover:text-primary transition-colors">Avantages</a>
                             <a href="#pricing" className="hover:text-primary transition-colors">Tarifs</a>
                            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                        </nav>
                        <Button onClick={() => setIsLoginModalOpen(true)}>
                           Se connecter
                        </Button>
                    </div>
                </header>

                <main className="pt-14">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden py-24 lg:py-32">
                        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                        <div className="absolute -bottom-1/4 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
                        <div className="absolute -top-1/4 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                        
                        <div className="container mx-auto px-4 relative z-10">
                             <div className="max-w-3xl mx-auto text-center">
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-primary via-violet-500 to-accent">
                                   L'ERP unifié pour les entreprises modernes.
                                </h1>
                                <p className="mt-6 text-lg text-muted-foreground">
                                    UNIKORP, une solution de l'entreprise <span className="font-semibold text-primary">INNOV'KORP</span>, centralise vos finances, RH, marketing et logistique pour une gestion sans friction.
                                </p>
                                <div className="mt-8 flex justify-center gap-4">
                                     <Button size="lg" asChild>
                                        <a href="#contact"><Rocket className="mr-2 h-4 w-4"/>Démarrer avec UNIKORP</a>
                                    </Button>
                                    <Button size="lg" variant="outline" onClick={() => setIsDemoModalOpen(true)}>
                                        <PlayCircle className="mr-2 h-4 w-4"/>Voir la démo
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    {/* Partners Section */}
                    <section className="py-12">
                        <div className="container mx-auto px-4">
                            <p className="text-center text-sm font-semibold text-muted-foreground mb-6">ILS NOUS FONT CONFIANCE</p>
                            <Carousel
                                opts={{ align: "start", loop: true }}
                                plugins={[Autoplay({ delay: 2000, stopOnInteraction: false })]}
                                className="w-full max-w-6xl mx-auto"
                            >
                                <CarouselContent>
                                    {partners.map((partner, index) => (
                                        <CarouselItem key={index} className="basis-1/3 md:basis-1/4 lg:basis-1/6">
                                            <div className="p-1 flex items-center justify-center">
                                                <Image src={partner.logo} alt={partner.name} width={150} height={60} className="object-contain" data-ai-hint="logo company"/>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
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
                                    <Card key={module.name} className="text-center items-center flex flex-col p-6 hover:-translate-y-2 transition-transform duration-300">
                                        <CardHeader className="p-0 mb-4">
                                            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                                                <module.icon className="h-8 w-8 text-primary" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0 flex-1">
                                            <CardTitle className="text-lg mb-2">{module.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{module.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                     {/* Benefits Section */}
                    <section id="avantages" className="py-24">
                        <div className="container mx-auto px-4 space-y-20">
                            {benefits.map((benefit, index) => (
                                <div key={benefit.title} className="grid md:grid-cols-2 gap-12 items-center">
                                    <div className={cn(index % 2 === 1 && "md:order-2")}>
                                        <div className="inline-block p-3 bg-primary/10 text-primary rounded-lg mb-4">
                                            <benefit.icon className="h-6 w-6"/>
                                        </div>
                                        <h2 className="text-3xl font-bold mb-4">{benefit.title}</h2>
                                        <p className="text-muted-foreground">{benefit.description}</p>
                                        <Button variant="link" className="p-0 mt-4" asChild><a href="#contact">Découvrir plus <MoveUpRight className="h-4 w-4 ml-1"/></a></Button>
                                    </div>
                                    <div className={cn(index % 2 === 1 && "md:order-1")}>
                                        <Image src={benefit.image} alt={benefit.imageAlt} width={600} height={400} className="rounded-xl shadow-lg" data-ai-hint="application interface"/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    {/* Testimonials Section */}
                    <section className="py-24 bg-muted/40">
                        <div className="container mx-auto px-4">
                             <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold">Ce que nos clients disent</h2>
                                <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                                    Découvrez comment UNIKORP transforme la gestion d'entreprise.
                                </p>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {testimonials.map((testimonial) => (
                                    <Card key={testimonial.author}>
                                        <CardContent className="p-6">
                                            <div className="flex mb-2">
                                                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current"/>)}
                                            </div>
                                            <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                                            <p className="font-semibold">{testimonial.author}</p>
                                            <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                     {/* Pricing Section */}
                    <section id="pricing" className="py-24">
                        <div className="container mx-auto px-4">
                             <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold">Un tarif simple et transparent</h2>
                                <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                                    Choisissez le plan qui correspond à la taille et aux ambitions de votre entreprise.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                                {pricingPlans.map((plan) => (
                                    <Card key={plan.name} className={cn("flex flex-col", plan.popular && "border-primary border-2 shadow-primary/20 shadow-lg")}>
                                        {plan.popular && <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-1 rounded-t-lg">RECOMMANDE</div>}
                                        <CardHeader>
                                            <CardTitle>{plan.name}</CardTitle>
                                            <CardDescription>{plan.description}</CardDescription>
                                            <div>
                                                <span className="text-4xl font-bold">{plan.price}</span>
                                                <span className="text-muted-foreground">{plan.frequency}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-4">
                                            <ul className="space-y-2 text-sm">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                                                <a href="#contact">{plan.cta}</a>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section id="contact" className="py-24 bg-muted/40">
                        <div className="container mx-auto px-4">
                             <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold">Prêt à transformer votre entreprise ?</h2>
                                <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Rejoignez les entreprises qui ont choisi UNIKORP pour unifier leurs opérations et accélérer leur croissance.</p>
                            </div>
                             <Card className="max-w-2xl mx-auto">
                                <CardHeader>
                                    <CardTitle>Contactez-nous</CardTitle>
                                    <CardDescription>Remplissez ce formulaire et notre équipe vous contactera pour planifier une démonstration ou répondre à vos questions.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleSubmit}>
                                    <CardContent className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nom">Nom</Label>
                                                <Input id="nom" name="nom" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="prenoms">Prénoms</Label>
                                                <Input id="prenoms" name="prenoms" required />
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="companyName">Nom de l'entreprise</Label>
                                            <Input id="companyName" name="companyName" required />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="email">Email professionnel</Label>
                                            <Input id="email" type="email" name="email" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="objet">Objet</Label>
                                            <Input id="objet" name="objet" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Votre message</Label>
                                            <Textarea id="message" name="message" required placeholder="Comment pouvons-nous vous aider ?"/>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button type="submit" className="ml-auto">
                                            <Send className="mr-2 h-4 w-4"/> Envoyer
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </div>
                    </section>
                </main>

                <footer className="bg-foreground text-background">
                    <div className="container mx-auto px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                 <div className="flex items-center gap-2 mb-4">
                                    <Logo className="h-8 w-8 text-primary" />
                                    <span className="font-bold text-xl">UNIKORP</span>
                                </div>
                                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} INNOV'KORP. <br/>Tous droits réservés.</p>
                                 <div className="flex space-x-4 mt-4">
                                    <a href="#" className="text-muted-foreground hover:text-white"><Linkedin className="h-5 w-5"/></a>
                                    <a href="#" className="text-muted-foreground hover:text-white"><Facebook className="h-5 w-5"/></a>
                                    <a href="#" className="text-muted-foreground hover:text-white"><Twitter className="h-5 w-5"/></a>
                                    <a href="#" className="text-muted-foreground hover:text-white"><Instagram className="h-5 w-5"/></a>
                                </div>
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
                                    <li><a href="#contact" className="hover:text-white">Contact</a></li>
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
            <DemoVideoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}
