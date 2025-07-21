
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookCopy, Calculator, Megaphone, Truck, UsersRound, FilePlus, Pencil, FileText, BarChartHorizontal, ClipboardList, Percent, LayoutDashboard, Contact, CalendarDays, Wallet, Star, BarChart3, ShoppingCart, Layers, BarChart as BarChartIcon, Target, Users as UsersIcon, Link2 } from 'lucide-react';
import Link from 'next/link';

const helpData = [
    {
        module: 'Présentation Générale',
        icon: BookCopy,
        items: [
            { 
              q: "Qu'est-ce que Unikorp ?", 
              a: "Unikorp est une solution ERP (Enterprise Resource Planning) intégrée, conçue pour unifier et optimiser la gestion de votre entreprise. Elle combine les modules de finance (SKOMPTAB), de ressources humaines (SOCIX), de marketing (MARKOS) et de logistique (LOGSON) en une seule plateforme cohérente." 
            },
            { 
              q: "Comment naviguer dans l'application ?", 
              a: "Utilisez la barre de navigation supérieure pour basculer entre les quatre modules principaux. Le menu latéral gauche s'adapte alors pour afficher les fonctionnalités spécifiques au module sélectionné. Le tableau de bord principal, accessible via l'icône 'Tableau de bord', offre une vue d'ensemble de toute l'activité." 
            },
        ]
    },
    {
        module: 'SKOMPTAB - Comptabilité & Finance',
        icon: Calculator,
        sections: [
            {
                title: 'Tableau de bord',
                icon: LayoutDashboard,
                href: '/skomptab',
                description: "Le tableau de bord financier offre une vue synthétique de la santé financière de l'entreprise. Il présente les indicateurs de performance clés (KPIs) comme le chiffre d'affaires, le résultat net, et la trésorerie. Des graphiques illustrent l'évolution des revenus face aux dépenses et les flux de trésorerie mensuels."
            },
            {
                title: 'CRÉATION',
                icon: FilePlus,
                subItems: [
                    { href: '/skomptab/creation-journaux', title: 'Journaux', description: 'Créez et configurez les différents codes journaux (Achats, Ventes, Banque, etc.) utilisés pour classer les écritures comptables.' },
                    { href: '/skomptab/comptes-generaux', title: 'Comptes généraux', description: 'Gérez le plan comptable général de l'entreprise. Ajoutez, modifiez ou supprimez des comptes de bilan ou de résultat.' },
                    { href: '/skomptab/comptes-tiers', title: 'Comptes tiers', description: 'Centralisez la gestion des fiches clients et fournisseurs. Cette section sert de base de données pour toutes vos transactions commerciales.' },
                    { href: '/skomptab/modele-saisie', title: 'Modèle de saisie', description: 'Créez des modèles d\'écritures récurrentes (ex: salaires, loyers) pour accélérer et standardiser la saisie comptable.' },
                    { href: '/skomptab/modele-declaration', title: 'Modèle de déclaration', description: 'Configurez des modèles pour les différentes déclarations fiscales et sociales, afin de pré-remplir les formulaires et d\'assurer la cohérence.' },
                    { href: '/skomptab/modele-facture', title: 'Modèle de facture', description: 'Personnalisez l\'apparence de vos factures de vente : logo, couleurs, informations légales, etc.' },
                ]
            },
            {
                title: 'GESTION',
                icon: Pencil,
                subItems: [
                    { href: '/skomptab/brouillards', title: 'Brouillards', description: 'Consultez et validez les écritures comptables avant leur intégration définitive dans les journaux.' },
                    { href: '/skomptab/saisie-comptable', title: 'Saisie comptable', description: "Enregistrez manuellement les écritures comptables. C'est le cœur de la comptabilité quotidienne." },
                    { href: '/skomptab/digitalisation-factures', title: 'Digitalisation des factures', description: "Importez vos factures (PDF, image) et laissez l'IA extraire automatiquement les informations clés (fournisseur, montant, date)." },
                    { href: '/skomptab/controle-tresorerie', title: 'Contrôle de trésorerie', description: 'Suivez le solde de vos comptes bancaires et caisses, et enregistrez les mouvements de trésorerie.' },
                    { href: '/skomptab/elaboration-factures', title: 'Elaboration des factures', description: "Créez, modifiez et envoyez vos factures de vente aux clients à partir des modèles prédéfinis." },
                    { href: '/skomptab/rapprochement-bancaire', title: 'Rapprochement bancaire', description: "Comparez vos relevés bancaires avec vos écritures comptables pour identifier et justifier les écarts." },
                ]
            },
            {
                title: 'ÉTATS COMPTABLES',
                icon: FileText,
                subItems: [
                    { href: '/skomptab/etats-comptables-journaux', title: 'Journaux', description: 'Générez et consultez le détail des écritures pour un journal et une période donnés.' },
                    { href: '/skomptab/etats-comptables-brouillards', title: 'Brouillards', description: 'Éditez un état de toutes les écritures en attente de validation.' },
                    { href: '/skomptab/grand-livre-general', title: 'Grand livre général', description: 'Consultez le détail de tous les mouvements pour chaque compte du plan comptable.' },
                    { href: '/skomptab/grand-livre-tiers', title: 'Grand livre tiers', description: 'Consultez le détail des transactions (factures, paiements) pour chaque client ou fournisseur.' },
                    { href: '/skomptab/balance-generale', title: 'Balance générale', description: 'Générez la balance des comptes généraux, présentant les totaux des mouvements et les soldes.' },
                    { href: '/skomptab/balance-agee', title: 'Balance âgée', description: "Analysez l'ancienneté des créances clients et des dettes fournisseurs." },
                    { href: '/skomptab/amortissements', title: 'Amortissements', description: "Générez le tableau des amortissements des immobilisations pour un exercice donné." },
                ]
            },
            {
                title: 'ÉTATS FINANCIERS',
                icon: BarChartHorizontal,
                subItems: [
                    { href: '/skomptab/bilan', title: 'Bilan', description: "Éditez le bilan comptable, fonctionnel ou financier de l'entreprise." },
                    { href: '/skomptab/compte-de-resultat', title: 'Compte de résultat', description: "Visualisez la performance de l'entreprise sur une période en détaillant les produits et les charges." },
                    { href: '/skomptab/tableau-sig', title: 'Tableau des SIG', description: "Analysez la formation du résultat à travers les Soldes Intermédiaires de Gestion (Marge commerciale, EBE, etc.)." },
                    { href: '/skomptab/tableau-flux-tresorerie', title: 'Tableau des flux de trésorerie', description: "Comprenez comment la trésorerie a été générée et utilisée à travers les activités d'exploitation, d'investissement et de financement." },
                ]
            },
            {
                title: 'ANALYTIQUE',
                icon: ClipboardList,
                subItems: [
                    { href: '/skomptab/plan-analytiques', title: 'Plan analytiques', description: 'Créez et gérez les axes et sections analytiques pour une comptabilité détaillée.' },
                    { href: '/skomptab/ventilations', title: 'Ventilations', description: 'Répartissez les charges et produits des comptes généraux vers les différentes sections analytiques.' },
                    { href: '/skomptab/sections-analytiques', title: 'Sections analytiques', description: 'Explorez le détail des coûts et profits de chaque section ou projet.' },
                    { href: '/skomptab/reporting-analytique', title: 'Reporting analytique', description: 'Consultez des rapports visuels (graphiques, tableaux) basés sur vos données analytiques.' },
                    { href: '/skomptab/budgetisation', title: 'Budgétisation', description: 'Élaborez des budgets par section analytique et suivez leur exécution en comparant le prévisionnel au réalisé.' },
                ]
            },
            {
                title: 'FISCALITÉ',
                icon: Percent,
                subItems: [
                    { href: '/skomptab/tva', title: 'TVA', description: 'Gérez et déclarez la TVA. Suivez la TVA collectée et déductible, et préparez vos déclarations (CA3).' },
                    { href: '/skomptab/declarations-fiscales', title: 'Déclarations fiscales', description: 'Préparez et suivez vos déclarations d\'impôts (IS, etc.) hors TVA.' },
                    { href: '/skomptab/declarations-sociales', title: 'Déclarations sociales', description: 'Gérez les déclarations destinées aux organismes sociaux (CNPS, etc.).' },
                    { href: '/skomptab/autres-impots', title: 'Autres impôts', description: 'Suivez les autres taxes et droits divers auxquels votre entreprise est soumise.' },
                    { href: '/skomptab/calendrier-fiscal', title: 'Calendrier fiscal', description: 'Visualisez toutes vos échéances fiscales et sociales sur un calendrier interactif.' },
                    { href: '/skomptab/simulations-fiscales', title: 'Simulations fiscales', description: 'Estimez le montant de vos impôts (TVA, IS) en fonction de différents scénarios de chiffre d\'affaires et de charges.' },
                ]
            }
        ]
    },
    {
        module: 'SOCIX - Ressources Humaines',
        icon: UsersRound,
        sections: [
            { title: 'Tableau de bord', icon: LayoutDashboard, href: '/socix', description: 'Vue d\'ensemble des indicateurs RH : effectif, turnover, masse salariale, etc.'},
            { title: 'PERSONNEL', icon: Contact, subItems: [
                { href: '/socix/employes', title: 'Employés', description: 'Base de données centrale de tous vos employés. Gérez les fiches individuelles, les informations personnelles et professionnelles.' },
                { href: '/socix/contrats', title: 'Contrats', description: 'Gérez les contrats de travail (CDI, CDD, etc.), les avenants et les documents légaux associés à chaque employé.' },
                { href: '/socix/dossiers-administratifs', title: 'Dossiers administratifs', description: 'Archivez et consultez tous les documents relatifs aux employés (CNI, RIB, diplômes, etc.).' },
                { href: '/socix/organigramme', title: 'Organigramme', description: 'Visualisez la structure hiérarchique de l\'entreprise de manière interactive.' },
            ]},
            { title: 'PRÉSENCES', icon: CalendarDays, subItems: [
                { href: '/socix/conges-payes', title: 'Congés & Absences', description: 'Suivez les soldes de congés payés, RTT et autres absences pour chaque collaborateur.' },
                { href: '/socix/absences-arrets', title: 'Pointage', description: 'Gérez le suivi quotidien des présences, absences, retards et départs anticipés.' },
                { href: '/socix/planning-equipe', title: 'Planning d\'équipe', description: 'Planifiez les activités de vos équipes sur un calendrier hebdomadaire (congés, télétravail, déplacements).' },
                { href: '/socix/validation-demandes', title: 'Validation des demandes', description: 'Approuvez ou refusez les demandes de congés et d\'absences soumises par les employés.' },
            ]},
            { title: 'PAIE', icon: Wallet, subItems: [
                { href: '/socix/traitement-paie', title: 'Paramétrage de la paie', description: 'Créez et configurez les modèles de paie, avec leurs rubriques, constantes et variables de calcul.' },
                { href: '/socix/bulletins-paie', title: 'Bulletins de paie', description: 'Générez, consultez et archivez les bulletins de paie mensuels de tous les employés.' },
                { href: '/socix/notes-de-frais', title: 'Notes de frais', description: 'Suivez et validez le processus de soumission et de remboursement des notes de frais.' },
                { href: '/socix/declarations-sociales', title: 'Déclarations sociales', description: 'Centralisez la gestion de toutes les déclarations destinées aux organismes sociaux (CNPS, etc.).' },
            ]},
            { title: 'TALENTS', icon: Star, subItems: [
                { href: '/socix/recrutement', title: 'Recrutement', description: 'Gérez vos offres d\'emploi et suivez le pipeline des candidatures pour chaque poste.' },
                { href: '/socix/plans-formation', title: 'Plans de formation', description: 'Planifiez les sessions de formation, suivez les participants et le catalogue des compétences à acquérir.' },
                { href: '/socix/competences-evaluations', title: 'Compétences & Évaluations', description: 'Maintenez un référentiel des compétences de l\'entreprise et gérez les sessions d\'évaluation.' },
                { href: '/socix/entretiens-annuels', title: 'Entretiens annuels', description: 'Organisez et suivez les campagnes d\'entretiens annuels et de performance.' },
            ]},
            { title: 'ANALYSE', icon: BarChart3, subItems: [
                { href: '/socix/kpi-sociaux', title: 'KPI sociaux', description: 'Visualisez les indicateurs de performance RH clés (turnover, satisfaction, coût RH, etc.).' },
                { href: '/socix/alternance-equipes', title: 'Alternance des équipes', description: 'Analysez la charge de travail et la répartition des shifts entre les différentes équipes.' },
                { href: '/socix/rapports-analyses', title: 'Rapports et analyses', description: 'Accédez à des rapports détaillés sur la démographie, les recrutements, et les compétences.' },
                { href: '/socix/bilan-social', title: 'Bilan social', description: 'Générez le bilan social annuel récapitulant les principales données sociales de l\'entreprise.' },
            ]},
        ]
    },
    {
        module: 'MARKOS - Marketing & CRM',
        icon: Megaphone,
        sections: [
            { title: 'Tableau de bord', icon: LayoutDashboard, href: '/markos', description: 'Vue d\'ensemble des performances marketing, incluant les leads, le coût par lead, et le tunnel de conversion.' },
            { title: 'CLIENTS', icon: UsersIcon, subItems: [
                { href: '/markos/clients/prospects', title: 'Prospects', description: 'Gérez la base de données de vos prospects, qualifiez-les et convertissez-les en clients.' },
                { href: '/markos/clients', title: 'Clients', description: 'Accédez à la base de données de vos clients actifs.' },
                { href: '/markos/clients/segmentation', title: 'Segmentation', description: 'Créez des segments de contacts dynamiques ou statiques pour des campagnes ciblées.' },
                { href: '/markos/clients/pipelines', title: 'Pipelines', description: 'Suivez vos opportunités commerciales à travers les différentes étapes du cycle de vente.' },
            ]},
            { title: 'CAMPAGNES', icon: Megaphone, subItems: [
                { href: '/markos/campagnes/emails-marketing', title: 'Emails marketing', description: 'Créez, envoyez et analysez la performance de vos campagnes d\'emailing.' },
                { href: '/markos/campagnes/campagnes-sms', title: 'Campagnes SMS', description: 'Lancez des campagnes de communication par SMS à destination de vos contacts.' },
                { href: '/markos/campagnes/reseaux-sociaux', title: 'Réseaux sociaux', description: 'Planifiez vos publications et suivez leurs performances sur les différentes plateformes.' },
                { href: '/markos/campagnes/automation-marketing', title: 'Automation marketing', description: 'Créez des scénarios automatisés (ex: email de bienvenue) pour engager vos contacts.' },
            ]},
            { title: 'GESTION', icon: ClipboardList, subItems: [
                { href: '/markos/gestion/templates', title: 'Templates', description: 'Créez et gérez des modèles réutilisables pour vos emails et landing pages.' },
                { href: '/markos/gestion/mediatheque', title: 'Médiathèque', description: 'Stockez et organisez toutes vos ressources multimédia (images, vidéos, documents).' },
                { href: '/markos/gestion/landing-pages', title: 'Landing pages', description: 'Créez et suivez la performance de vos pages de destination.' },
                { href: '/markos/gestion/calendrier-editorial', title: 'Calendrier éditorial', description: 'Planifiez toutes vos publications de contenu (articles, posts, etc.) sur un calendrier.' },
            ]},
             { title: 'ANALYSES', icon: BarChart3, subItems: [
                { href: '/markos/analyses/performances', title: 'Performances', description: 'Analysez le tunnel de conversion marketing, des leads générés jusqu\'aux clients.' },
                { href: '/markos/analyses/roi-marketing', title: 'ROI marketing', description: 'Évaluez la rentabilité de vos investissements et campagnes marketing.' },
                { href: '/markos/analyses/taux-de-conversion', title: 'Taux de conversion', description: 'Suivez l\'efficacité de vos différents points de conversion (landing pages, emails, etc.).' },
                { href: '/markos/analyses/rapports-personnalises', title: 'Rapports personnalisés', description: 'Créez vos propres rapports en choisissant les métriques et dimensions qui vous intéressent.' },
            ]},
        ]
    },
    {
        module: 'LOGSON - Logistique & Stocks',
        icon: Truck,
        sections: [
            { title: 'Tableau de bord', icon: LayoutDashboard, href: '/logson', description: 'Synthèse des indicateurs logistiques : rotation des stocks, livraison à temps, coût par commande, etc.' },
            { title: 'APPROVISIONNEMENT', icon: ShoppingCart, subItems: [
                { href: '/logson/approvisionnement/fournisseurs', title: 'Fournisseurs', description: 'Gérez la base de données de vos fournisseurs.' },
                { href: '/logson/approvisionnement/commandes-fournisseurs', title: 'Commandes fournisseurs', description: 'Créez et suivez vos bons de commande pour l\'approvisionnement en produits.' },
                { href: '/logson/approvisionnement/receptions', title: 'Réceptions', description: 'Enregistrez la réception des marchandises commandées et mettez à jour les stocks.' },
            ]},
            { title: 'LIVRAISONS', icon: Truck, subItems: [
                { href: '/logson/livraisons/preparation-de-commandes', title: 'Commandes clients', description: 'Gérez la préparation des commandes clients facturées qui sont prêtes à être expédiées.' },
                { href: '/logson/livraisons/transport-et-expedition', title: 'Expéditions', description: 'Planifiez les expéditions, choisissez les transporteurs et générez les bons de livraison.' },
                { href: '/logson/livraisons/suivi-des-livraisons', title: 'Suivi des Livraisons', description: 'Suivez l\'état de vos livraisons en temps réel, du transit jusqu\'à la réception par le client.' },
                { href: '/logson/livraisons/gestion-des-retours', title: 'Gestion des retours', description: 'Gérez les demandes de retour de produits de la part des clients.' },
                { href: '/logson/livraisons/transporteurs', title: 'Transporteurs', description: 'Gérez la base de données de vos partenaires de transport et de livraison.' },
            ]},
            { title: 'STOCKS', icon: Layers, subItems: [
                { href: '/logson/stocks/produits', title: 'Produits', description: 'Gérez le catalogue de produits, les références et les informations de base.' },
                { href: '/logson/stocks/inventaire', title: 'Inventaire', description: 'Planifiez et réalisez les inventaires physiques pour comparer le stock théorique et le stock réel.' },
                { href: '/logson/stocks/entrepots', title: 'Entrepôts', description: 'Gérez vos différents lieux de stockage, leur capacité et leur taux de remplissage.' },
                { href: '/logson/stocks/mouvements-de-stock', title: 'Mouvements de stock', description: 'Consultez l\'historique de toutes les entrées, sorties et transferts de stock.' },
                { href: '/logson/stocks/fiches-de-stocks', title: 'Fiches de stocks', description: 'Générez des fiches de stock valorisées (CUMP) pour suivre la valeur et les mouvements d\'un produit.' },
            ]},
            { title: 'PILOTAGE', icon: BarChartIcon, subItems: [
                { href: '/logson/pilotage/couts-logistiques', title: 'Coûts logistiques', description: 'Analysez en détail les coûts liés au transport, au stockage et à la manutention.' },
                { href: '/logson/pilotage/kpi-logistiques', title: 'KPI logistiques', description: 'Suivez les indicateurs de performance clés de votre chaîne logistique.' },
                { href: '/logson/pilotage/optimisation-des-routes', title: 'Optimisation des routes', description: 'Utilisez les outils d\'optimisation pour planifier les tournées de livraison les plus efficaces.' },
                { href: '/logson/pilotage/rapports-et-analyses', title: 'Rapports et analyses', description: 'Générez des rapports personnalisés sur l\'activité logistique.' },
            ]},
        ]
    }
];

const renderSubItems = (subItems: any[]) => (
    <ul className="space-y-4 pl-6 border-l ml-3">
        {subItems.map(item => (
            <li key={item.title} className="pl-4">
                <Link href={item.href} className="font-semibold text-primary hover:underline">{item.title}</Link>
                <p className="text-muted-foreground text-sm">{item.description}</p>
            </li>
        ))}
    </ul>
);

export default function HelpPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Centre d'Aide & Procédures</CardTitle>
        <CardDescription>Trouvez des réponses à vos questions et découvrez comment utiliser Unikorp.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={'Présentation Générale'} className="w-full">
            {helpData.map(section => (
                <AccordionItem value={section.module} key={section.module}>
                    <AccordionTrigger className="text-xl">
                        <div className="flex items-center gap-3">
                           <section.icon className="h-6 w-6 text-primary"/> 
                           {section.module}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                        {section.items && (
                             <ul className="space-y-4 pl-4 border-l ml-4">
                                {section.items.map(item => (
                                    <li key={item.q} className="pl-4">
                                        <h4 className="font-semibold">{item.q}</h4>
                                        <p className="text-muted-foreground">{item.a}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {section.sections && (
                            <Accordion type="multiple" className="w-full space-y-2 mt-2">
                                {section.sections.map(subSection => (
                                <AccordionItem value={subSection.title} key={subSection.title} className="border bg-muted/50 rounded-md px-4">
                                    <AccordionTrigger className="text-base font-semibold text-primary/90 py-3">
                                      <Link href={subSection.href || '#'} className="flex items-center gap-3 hover:underline">
                                         <subSection.icon className="h-5 w-5"/> 
                                         {subSection.title}
                                      </Link>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="pl-8 pb-2 text-sm text-muted-foreground">{subSection.description}</div>
                                        {subSection.subItems && renderSubItems(subSection.subItems)}
                                    </AccordionContent>
                                </AccordionItem>
                                ))}
                           </Accordion>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
