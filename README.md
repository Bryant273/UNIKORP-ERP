# Cahier des Charges - ERP UNIKORP

**Version 2.0**
**Date :** 31 Juillet 2024

---

## 1. Introduction & Vision

### 1.1. Objectif du Projet

Le projet UNIKORP vise à développer une solution ERP (Enterprise Resource Planning) moderne, intégrée et modulaire, conçue pour unifier et optimiser la gestion des processus métier d'une entreprise. L'application centralise les données et les opérations de quatre départements clés : la finance, les ressources humaines, le marketing et la logistique.

Face aux défis classiques de la gestion d'entreprise – silos d'information, redondance des saisies manuelles, manque de visibilité en temps réel et complexité administrative – UNIKORP propose une réponse unifiée et intelligente. L'objectif est de transformer la gestion opérationnelle en un avantage stratégique, en permettant aux entreprises de se concentrer sur leur croissance plutôt que sur la gestion de leurs outils.

### 1.2. Philosophie

L'application est conçue pour être :
- **Intuitive :** Une interface utilisateur claire, cohérente et facile à prendre en main pour tous les niveaux d'utilisateurs. L'ergonomie est pensée pour réduire la courbe d'apprentissage et permettre une adoption rapide par les équipes. Chaque écran est conçu pour présenter l'information la plus pertinente en premier, guidant l'utilisateur dans ses tâches.
- **Intégrée :** Les données circulent de manière fluide et logique entre les modules, reflétant les interactions réelles d'une entreprise. Une action dans un module (ex: la validation d'une facture) déclenche automatiquement les processus nécessaires dans les autres modules (ex: mise à jour des stocks en logistique). Cela élimine la double saisie, réduit les erreurs et assure la cohérence des données à travers toute l'organisation.
- **Modulaire :** Chaque module (SKOMPTAB, SOCIX, MARKOS, LOGSON) peut fonctionner de manière autonome tout en étant parfaitement connecté aux autres. Cette approche permet une flexibilité maximale : une entreprise peut commencer par utiliser un seul module et intégrer les autres progressivement, selon ses besoins et sa croissance.
- **Intelligente :** L'intégration de l'IA (via Genkit) permet d'automatiser des tâches complexes et d'offrir des fonctionnalités avancées comme la recherche sémantique, le traitement automatique de documents (factures, plans comptables), et à terme, des analyses prédictives. L'IA n'est pas un gadget, mais un outil au service de la productivité.
- **Sécurisée :** Une gestion des rôles et des accès précise garantit que chaque utilisateur ne voit et ne modifie que les informations pertinentes à sa fonction. La sécurité des données, la confidentialité et la traçabilité des actions sont au cœur de l'architecture.

---

## 2. Architecture Technique

- **Framework Frontend :** Next.js 15 avec le App Router. Choisi pour ses performances, son rendu côté serveur (SSR) et sa capacité à créer des applications web rapides et optimisées pour le SEO. Le App Router, en particulier, permet une gestion fine des états de chargement et des layouts imbriqués.
- **Librairie UI :** React 18. Pour son approche basée sur les composants, qui favorise la réutilisabilité et la maintenabilité du code, et pour son vaste écosystème.
- **Système de Design :** ShadCN UI pour les composants, et Tailwind CSS pour le style. Cette combinaison offre le meilleur des deux mondes : des composants d'interface accessibles et personnalisables (ShadCN) avec la flexibilité et la rapidité de développement d'un framework CSS utility-first (Tailwind).
- **Gestion d'état :** Jotai pour une gestion d'état atomique et légère. Préféré pour sa simplicité et ses performances, Jotai permet de partager l'état entre les composants de manière efficace sans la complexité d'autres solutions plus lourdes.
- **Intelligence Artificielle :** Google Genkit pour la création de flux IA (flows) et l'interaction avec les modèles Gemini. Genkit a été choisi pour son intégration native avec l'écosystème Google, sa facilité à définir des schémas de données structurées (entrées/sorties) et sa capacité à orchestrer des tâches complexes.
- **Langage :** TypeScript pour la robustesse et la sécurité de typage. L'utilisation de TypeScript réduit les erreurs à l'exécution et améliore considérablement la maintenabilité du code sur un projet de grande envergure comme un ERP.

---

## 3. Structure de l'Application

L'ERP est organisé autour de plusieurs modules principaux, accessibles via une navigation claire.

### 3.1. Rôles et Contrôle d'Accès

L'accès aux fonctionnalités est strictement contrôlé par un système de rôles. La logique est de fournir à chaque utilisateur uniquement les outils dont il a besoin, évitant ainsi la surcharge cognitive et les erreurs de manipulation.

- **Compte Entreprise :** Rôle de supervision ultime. A accès à tous les modules, au tableau de bord principal, et à une **vue d'administration** exclusive (`/super-admin`) qui inclut le journal de toutes les actions des utilisateurs. Ce rôle est destiné au propriétaire ou au dirigeant de l'entreprise.
- **Admin-Gestionnaire :** Rôle de configuration. A accès à tous les modules, au tableau de bord principal et à la page d'administration (`/super-admin`), mais ne voit pas le journal des actions. Ce rôle est parfait pour un directeur des opérations ou un DSI qui a besoin de configurer l'ERP sans pour autant surveiller l'activité de chaque employé.
- **Gestionnaire de Module (Finance, RH, Marketing, Logistique) :** Accès limité au tableau de bord principal et à leur module spécifique (ex: un Gestionnaire RH ne voit que les onglets "Tableau de bord" et "SOCIX"). Ce rôle est conçu pour les chefs de département.
- **Stagiaire de Module (Finance, RH, Marketing, Logistique) :** Accès identique à celui du gestionnaire, mais avec des droits de modification potentiellement restreints (cette restriction pourra être affinée dans une future version). Cela permet aux stagiaires de se former sur l'outil en conditions réelles mais contrôlées.
- **Employé :** N'a pas accès à l'ERP de gestion. Il est redirigé directement vers son propre tableau de bord (`/employee-dashboard`) pour consulter ses informations personnelles, ses documents et gérer ses absences. C'est un portail en self-service conçu pour autonomiser l'employé.

**Logique de Sélection de Fichier :** Tous les rôles, à l'exception de "Employé", doivent obligatoirement sélectionner un fichier de gestion après la connexion pour accéder à l'ERP. Cette étape simule le choix d'un dossier comptable ou d'une entité juridique spécifique sur laquelle travailler, une pratique courante dans les cabinets ou les groupes multi-sociétés.

### 3.2. Modules de l'ERP

#### 3.2.1. SKOMPTAB (Comptabilité & Finance)

- **Objectif :** Gérer l'intégralité du cycle comptable et financier, de la saisie des écritures à la production des états financiers, en passant par la gestion de la fiscalité et le pilotage analytique.

- **Tableau de Bord (`/skomptab`)**
  - **Description :** Le tableau de bord financier offre une vue synthétique de la santé financière de l'entreprise. Il présente les indicateurs de performance clés (KPIs) comme le chiffre d'affaires, le résultat net, et la trésorerie. Des graphiques illustrent l'évolution des revenus face aux dépenses et les flux de trésorerie mensuels.

- **CRÉATION**
  - **`Journaux` :** Créez et configurez les différents codes journaux (Achats, Ventes, Banque, Opérations Diverses, etc.) utilisés pour classer les écritures comptables. Chaque journal est un livre distinct qui enregistre des transactions de même nature.
  - **`Comptes généraux` :** Gérez le plan comptable général de l'entreprise. Cette section permet d'ajouter, de modifier ou de supprimer des comptes de bilan (classe 1 à 5) ou de résultat (classe 6 et 7) conformément au système SYSCOHADA.
  - **`Comptes tiers` :** Centralisez la gestion des fiches clients et fournisseurs. Cette section sert de base de données pour toutes vos transactions commerciales. Chaque tiers est associé à un compte collectif (401 pour les fournisseurs, 411 pour les clients).
  - **`Modèle de saisie` :** Créez des modèles d'écritures récurrentes (ex: salaires, loyers, dotations aux amortissements) pour accélérer et standardiser la saisie comptable, réduisant ainsi les risques d'erreur.
  - **`Modèle de déclaration` :** Configurez des modèles pour les différentes déclarations fiscales (TVA, IS) et sociales (CNPS). Ces modèles pré-remplissent les formulaires avec les informations comptables pertinentes.
  - **`Modèle de facture` :** Personnalisez l'apparence de vos factures de vente : logo, couleurs, informations légales, conditions de paiement, etc. pour maintenir une image de marque cohérente.

- **GESTION**
  - **`Brouillards` :** Consultez et validez les écritures comptables avant leur intégration définitive dans les journaux. C'est une étape de contrôle essentielle pour assurer la qualité de la comptabilité.
  - **`Saisie comptable` :** Enregistrez manuellement les écritures comptables. C'est le cœur de la comptabilité quotidienne où les transactions sont imputées dans les comptes appropriés.
  - **`Digitalisation des factures` :** Importez vos factures (PDF, image) et laissez l'IA extraire automatiquement les informations clés (fournisseur, montant, date, etc.). Cette fonctionnalité utilise l'OCR et le traitement du langage naturel.
  - **`Contrôle de trésorerie` :** Suivez le solde de vos comptes bancaires et caisses, et enregistrez les mouvements de trésorerie.
  - **`Elaboration des factures` :** Créez, modifiez et envoyez vos factures de vente aux clients à partir des modèles prédéfinis.
  - **`Rapprochement bancaire` :** Comparez vos relevés bancaires avec vos écritures comptables pour identifier et justifier les écarts, assurant ainsi l'exactitude de votre trésorerie.

- **ÉTATS COMPTABLES**
  - **`Journaux` :** Générez et consultez le détail des écritures pour un journal et une période donnés.
  - **`Brouillards` :** Éditez un état de toutes les écritures en attente de validation.
  - **`Grand livre général` :** Consultez le détail de tous les mouvements (débit/crédit) pour chaque compte du plan comptable sur une période définie.
  - **`Grand livre tiers` :** Consultez le détail des transactions (factures, paiements) pour chaque client ou fournisseur.
  - **`Balance générale` :** Générez la balance des comptes généraux, présentant les totaux des mouvements et les soldes, pour vérifier l'égalité entre débits et crédits.
  - **`Balance âgée` :** Analysez l'ancienneté des créances clients et des dettes fournisseurs pour piloter le recouvrement et la trésorerie.
  - **`Amortissements` :** Générez le tableau des amortissements des immobilisations pour un exercice donné.

- **ÉTATS FINANCIERS**
  - **`Bilan` :** Éditez le bilan comptable, fonctionnel ou financier de l'entreprise, représentant le patrimoine de l'entreprise à un instant T.
  - **`Compte de résultat` :** Visualisez la performance de l'entreprise sur une période en détaillant les produits et les charges.
  - **`Tableau des SIG` :** Analysez la formation du résultat à travers les Soldes Intermédiaires de Gestion (Marge commerciale, EBE, etc.).
  - **`Tableau des flux de trésorerie` :** Comprenez comment la trésorerie a été générée et utilisée à travers les activités d'exploitation, d'investissement et de financement.

- **ANALYTIQUE**
  - **`Plan analytiques` :** Créez et gérez les axes et sections analytiques pour une comptabilité détaillée (par projet, par département, etc.).
  - **`Ventilations` :** Répartissez les charges et produits des comptes généraux vers les différentes sections analytiques selon des clés de répartition.
  - **`Sections analytiques` :** Explorez le détail des coûts et profits de chaque section ou projet.
  - **`Reporting analytique` :** Consultez des rapports visuels (graphiques, tableaux) basés sur vos données analytiques.
  - **`Budgétisation` :** Élaborez des budgets par section analytique et suivez leur exécution en comparant le prévisionnel au réalisé.

- **FISCALITÉ**
  - **`TVA` :** Gérez et déclarez la TVA. Suivez la TVA collectée et déductible, et préparez vos déclarations (CA3).
  - **`Déclarations fiscales` :** Préparez et suivez vos déclarations d'impôts (IS, etc.) hors TVA.
  - **`Déclarations sociales` :** Gérez les déclarations destinées aux organismes sociaux (CNPS, etc.).
  - **`Autres impôts` :** Suivez les autres taxes et droits divers auxquels votre entreprise est soumise.
  - **`Calendrier fiscal` :** Visualisez toutes vos échéances fiscales et sociales sur un calendrier interactif.
  - **`Simulations fiscales` :** Estimez le montant de vos impôts (TVA, IS) en fonction de différents scénarios de chiffre d'affaires et de charges.

#### 3.2.2. SOCIX (Ressources Humaines)

- **Objectif :** Gérer le capital humain de l'entreprise, du recrutement à la paie, en passant par le développement des talents et le suivi administratif.

- **Tableau de Bord (`/socix`)**
  - **Description :** Vue d'ensemble des indicateurs RH : effectif, pyramide des âges, répartition par genre, et suivi des événements RH à venir.

- **PERSONNEL**
  - **`Employés` :** Base de données centrale de tous vos employés. Gérez les fiches individuelles, les informations personnelles et professionnelles.
  - **`Contrats` :** Gérez les contrats de travail (CDI, CDD, etc.), les avenants et les documents légaux associés à chaque employé.
  - **`Dossiers administratifs` :** Archivez et consultez tous les documents relatifs aux employés (CNI, RIB, diplômes, etc.).
  - **`Organigramme` :** Visualisez la structure hiérarchique de l'entreprise de manière interactive.

- **PRÉSENCES**
  - **`Congés & Absences` :** Suivez les soldes de congés payés, RTT et autres absences pour chaque collaborateur.
  - **`Pointage` :** Gérez le suivi quotidien des présences, absences, retards et départs anticipés.
  - **`Planning d'équipe` :** Planifiez les activités de vos équipes sur un calendrier hebdomadaire (congés, télétravail, déplacements).
  - **`Validation des demandes` :** Approuvez ou refusez les demandes de congés et d'absences soumises par les employés.

- **PAIE**
  - **`Paramétrage de la paie` :** Créez et configurez les modèles de paie, avec leurs rubriques, constantes et variables de calcul.
  - **`Bulletins de paie` :** Générez, consultez et archivez les bulletins de paie mensuels de tous les employés.
  - **`Notes de frais` :** Suivez et validez le processus de soumission et de remboursement des notes de frais.
  - **`Déclarations sociales` :** Centralisez la gestion de toutes les déclarations destinées aux organismes sociaux (CNPS, etc.).

- **TALENTS**
  - **`Recrutement` :** Gérez vos offres d'emploi et suivez le pipeline des candidatures pour chaque poste.
  - **`Plans de formation` :** Planifiez les sessions de formation, suivez les participants et le catalogue des compétences à acquérir.
  - **`Compétences & Évaluations` :** Maintenez un référentiel des compétences de l'entreprise et gérez les sessions d'évaluation.
  - **`Entretiens annuels` :** Organisez et suivez les campagnes d'entretiens annuels et de performance.

- **ANALYSE**
  - **`KPI sociaux` :** Visualisez les indicateurs de performance RH clés (turnover, satisfaction, coût RH, etc.).
  - **`Alternance des équipes` :** Analysez la charge de travail et la répartition des shifts entre les différentes équipes.
  - **`Rapports et analyses` :** Accédez à des rapports détaillés sur la démographie, les recrutements, et les compétences.
  - **`Bilan social` :** Générez le bilan social annuel récapitulant les principales données sociales de l'entreprise.

#### 3.2.3. MARKOS (Marketing & CRM)

- **Objectif :** Gérer la relation client et les campagnes marketing, de la génération de leads à la fidélisation, en passant par l'analyse des performances.

- **Tableau de Bord (`/markos`)**
  - **Description :** Vue d'ensemble des performances marketing, incluant les leads, le coût par lead, et le tunnel de conversion.

- **CLIENTS**
  - **`Prospects` :** Gérez la base de données de vos prospects, qualifiez-les et convertissez-les en clients.
  - **`Clients` :** Accédez à la base de données de vos clients actifs.
  - **`Segmentation` :** Créez des segments de contacts dynamiques ou statiques pour des campagnes ciblées.
  - **`Pipelines` :** Suivez vos opportunités commerciales à travers les différentes étapes du cycle de vente.

- **CAMPAGNES**
  - **`Emails marketing` :** Créez, envoyez et analysez la performance de vos campagnes d'emailing.
  - **`Campagnes SMS` :** Lancez des campagnes de communication par SMS à destination de vos contacts.
  - **`Réseaux sociaux` :** Planifiez vos publications et suivez leurs performances sur les différentes plateformes.
  - **`Automation marketing` :** Créez des scénarios automatisés (ex: email de bienvenue) pour engager vos contacts.

- **GESTION**
  - **`Templates` :** Créez et gérez des modèles réutilisables pour vos emails et landing pages.
  - **`Médiathèque` :** Stockez et organisez toutes vos ressources multimédia (images, vidéos, documents).
  - **`Landing pages` :** Créez et suivez la performance de vos pages de destination.
  - **`Calendrier éditorial` :** Planifiez toutes vos publications de contenu (articles, posts, etc.) sur un calendrier.

- **ANALYSES**
  - **`Performances` :** Analysez le tunnel de conversion marketing, des leads générés jusqu'aux clients.
  - **`ROI marketing` :** Évaluez la rentabilité de vos investissements et campagnes marketing.
  - **`Taux de conversion` :** Suivez l'efficacité de vos différents points de conversion (landing pages, emails, etc.).
  - **`Rapports personnalisés` :** Créez vos propres rapports en choisissant les métriques et dimensions qui vous intéressent.

#### 3.2.4. LOGSON (Logistique & Stocks)

- **Objectif :** Optimiser la chaîne d'approvisionnement et la gestion des stocks, de la commande fournisseur à la livraison client, en assurant une traçabilité complète.

- **Tableau de Bord (`/logson`)**
  - **Description :** Synthèse des indicateurs logistiques : rotation des stocks, livraison à temps, coût par commande, etc.

- **APPROVISIONNEMENT**
  - **`Fournisseurs` :** Gérez la base de données de vos fournisseurs.
  - **`Commandes fournisseurs` :** Créez et suivez vos bons de commande pour l'approvisionnement en produits.
  - **`Réceptions` :** Enregistrez la réception des marchandises commandées et mettez à jour les stocks.

- **LIVRAISONS**
  - **`Commandes clients` :** Gérez la préparation des commandes clients facturées qui sont prêtes à être expédiées.
  - **`Expéditions` :** Planifiez les expéditions, choisissez les transporteurs et générez les bons de livraison.
  - **`Suivi des Livraisons` :** Suivez l'état de vos livraisons en temps réel, du transit jusqu'à la réception par le client.
  - **`Gestion des retours` :** Gérez les demandes de retour de produits de la part des clients.
  - **`Transporteurs` :** Gérez la base de données de vos partenaires de transport et de livraison.

- **STOCKS**
  - **`Produits` :** Gérez le catalogue de produits, les références et les informations de base.
  - **`Inventaire` :** Planifiez et réalisez les inventaires physiques pour comparer le stock théorique et le stock réel.
  - **`Entrepôts` :** Gérez vos différents lieux de stockage, leur capacité et leur taux de remplissage.
  - **`Mouvements de stock` :** Consultez l'historique de toutes les entrées, sorties et transferts de stock.
  - **`Fiches de stocks` :** Générez des fiches de stock valorisées (CUMP) pour suivre la valeur et les mouvements d'un produit.

- **PILOTAGE**
  - **`Coûts logistiques` :** Analysez en détail les coûts liés au transport, au stockage et à la manutention.
  - **`KPI logistiques` :** Suivez les indicateurs de performance clés de votre chaîne logistique.
  - **`Optimisation des routes` :** Utilisez les outils d'optimisation pour planifier les tournées de livraison les plus efficaces.
  - **`Rapports et analyses` :** Générez des rapports personnalisés sur l'activité logistique.

---

## 4. Flux de Données & Logique d'Intégration

L'intégration entre les modules est un pilier de l'application :

1.  **MARKOS → SKOMPTAB :** Un prospect qualifié dans le module MARKOS peut être converti en un clic. Cette action le supprime de la liste des prospects et le crée automatiquement comme un "Client" dans les comptes tiers du module SKOMPTAB.

2.  **SKOMPTAB → LOGSON :** La création d'une facture de vente dans SKOMPTAB déclenche automatiquement la création d'une "Commande client" dans le module LOGSON, avec le statut "En attente de préparation".

3.  **LOGSON (Interne) :**
    - **Réception Fournisseur :** L'enregistrement d'une réception de commande fournisseur dans LOGSON met à jour automatiquement le stock des produits concernés.
    - **Expédition Client :** La validation d'une expédition client dans LOGSON décrémente automatiquement le stock des produits correspondants.
    - **Traçabilité :** Toutes ces opérations (réceptions, expéditions, transferts manuels) génèrent une ligne dans l'historique des "Mouvements de stock" pour une traçabilité complète.

---

## 5. Fonctionnalités d'Intelligence Artificielle (Genkit)

L'IA est utilisée pour augmenter les capacités de l'ERP :

- **Recherche Intelligente :** Une barre de recherche utilise un flux Genkit pour interpréter une requête en langage naturel et rechercher des informations pertinentes à travers tous les modules, retournant des résultats synthétisés.
- **Digitalisation de Factures :** Un utilisateur peut uploader un PDF de facture. L'IA analyse le document (via OCR et extraction d'entités) et pré-remplit automatiquement les champs clés (fournisseur, date, montant, etc.), accélérant drastiquement la saisie.
- **Parsing de Plan Comptable :** Permet d'importer un plan comptable depuis un fichier (PDF, CSV, etc.). L'IA analyse le fichier, en extrait les numéros de compte, les intitulés et leur nature, et les intègre directement dans l'application.

---

## 6. Conclusion

UNIKORP est une application ERP complète et fonctionnelle, bâtie sur des technologies modernes. Elle offre une base solide avec des fonctionnalités clés pour chaque grand pôle de l'entreprise. Les flux de données intégrés et les capacités d'IA en font un outil puissant et prêt à être étendu avec de nouvelles fonctionnalités. Ce document sert de référence pour la structure et la logique actuelles du projet.
