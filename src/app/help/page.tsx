
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BookCopy, Calculator, Megaphone, Truck, UsersRound } from 'lucide-react';


const helpData = [
    {
        module: 'Présentation Générale',
        icon: BookCopy,
        items: [
            { q: "Qu'est-ce que Unikorp ?", a: "Unikorp est une solution ERP intégrée conçue pour unifier la gestion de votre entreprise. Elle combine la finance, les ressources humaines, le marketing et la logistique en une seule plateforme." },
            { q: "Comment naviguer entre les modules ?", a: "Utilisez la barre de navigation principale en haut de l'écran pour basculer entre les modules SKOMPTAB, SOCIX, MARKOS et LOGSON. Le menu latéral gauche s'adaptera pour afficher les fonctionnalités spécifiques au module sélectionné." },
        ]
    },
    {
        module: 'SKOMPTAB - Comptabilité & Finance',
        icon: Calculator,
        items: [
            { q: "Comment saisir une nouvelle écriture comptable ?", a: "Allez dans 'Gestion > Saisie comptable' et cliquez sur 'Enregistrer une écriture'. Vous pouvez soit remplir les champs manuellement, soit utiliser un modèle de saisie pour accélérer le processus." },
            { q: "Comment générer le bilan ?", a: "Rendez-vous dans 'États Financiers > Bilan'. Cliquez sur 'Générer un Bilan', sélectionnez l'année et le type de bilan souhaité (comptable, fonctionnel, etc.) pour afficher le rapport." },
        ]
    },
    {
        module: 'SOCIX - Ressources Humaines',
        icon: UsersRound,
        items: [
            { q: "Où trouver la liste des employés ?", a: "La liste complète de vos employés se trouve dans 'Personnel > Employés'. Vous pouvez y rechercher, filtrer et gérer les fiches de chaque collaborateur." },
            { q: "Comment valider une demande de congé ?", a: "Les demandes de congés et d'absences sont centralisées dans 'Présences > Validation des demandes'. Vous pouvez y approuver ou refuser les demandes en attente." },
        ]
    },
     {
        module: 'MARKOS - Marketing & CRM',
        icon: Megaphone,
        items: [
            { q: "Comment segmenter ma base de clients ?", a: "Allez dans 'Clients > Segmentation'. Vous pouvez y créer des segments dynamiques ou statiques basés sur des critères démographiques, transactionnels ou comportementaux pour cibler vos campagnes." },
            { q: "Comment analyser le ROI de mes campagnes ?", a: "La section 'Analyses > ROI marketing' vous offre une vue détaillée de la rentabilité de chaque campagne, avec un suivi des budgets et des revenus générés." },
        ]
    },
     {
        module: 'LOGSON - Logistique & Stocks',
        icon: Truck,
        items: [
            { q: "Comment suivre une commande fournisseur ?", a: "Dans 'Approvisionnement > Suivi des réceptions', vous pouvez voir le statut de toutes vos commandes fournisseurs et enregistrer la réception des marchandises." },
            { q: "Où gérer les expéditions de commandes clients ?", a: "La section 'Livraisons > Expéditions' vous permet de planifier le transport pour les commandes dont la préparation est terminée." },
        ]
    },
];


export default function HelpPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Centre d'Aide & Procédures</CardTitle>
        <CardDescription>Trouvez des réponses à vos questions et découvrez comment utiliser Unikorp.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['Présentation Générale']} className="w-full">
            {helpData.map(section => (
                <AccordionItem value={section.module} key={section.module}>
                    <AccordionTrigger className="text-lg">
                        <div className="flex items-center gap-3">
                           <section.icon className="h-5 w-5 text-primary"/> 
                           {section.module}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-4 pl-4 border-l">
                            {section.items.map(item => (
                                <li key={item.q} className="pl-4">
                                    <h4 className="font-semibold">{item.q}</h4>
                                    <p className="text-muted-foreground">{item.a}</p>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
