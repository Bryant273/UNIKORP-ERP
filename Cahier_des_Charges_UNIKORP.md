# Cahier des Charges - ERP UNIKORP

**Version 1.0**
**Date :** 31 Juillet 2024

---

## 1. Introduction & Vision

### 1.1. Objectif du Projet

Le projet UNIKORP vise à développer une solution ERP (Enterprise Resource Planning) moderne, intégrée et modulaire, conçue pour unifier et optimiser la gestion des processus métier d'une entreprise. L'application centralise les données et les opérations de quatre départements clés : la finance, les ressources humaines, le marketing et la logistique.

### 1.2. Philosophie

L'application est conçue pour être :
- **Intuitive :** Une interface utilisateur claire, cohérente et facile à prendre en main pour tous les niveaux d'utilisateurs.
- **Intégrée :** Les données circulent de manière fluide et logique entre les modules, reflétant les interactions réelles d'une entreprise.
- **Modulaire :** Chaque module peut fonctionner de manière autonome tout en étant parfaitement connecté aux autres.
- **Intelligente :** L'intégration de l'IA (via Genkit) permet d'automatiser des tâches complexes et d'offrir des fonctionnalités avancées comme la recherche sémantique.
- **Sécurisée :** Une gestion des rôles et des accès précise garantit que chaque utilisateur ne voit et ne modifie que les informations pertinentes à sa fonction.

---

## 2. Architecture Technique

- **Framework Frontend :** Next.js 15 avec le App Router.
- **Librairie UI :** React 18.
- **Système de Design :** ShadCN UI pour les composants, et Tailwind CSS pour le style.
- **Gestion d'état :** Jotai pour une gestion d'état atomique et légère, idéale pour les interactions complexes sans surcharger l'application.
- **Intelligence Artificielle :** Google Genkit pour la création de flux IA (flows) et l'interaction avec les modèles Gemini.
- **Langage :** TypeScript pour la robustesse et la sécurité de typage.

---

## 3. Structure de l'Application

L'ERP est organisé autour de plusieurs modules principaux, accessibles via une navigation claire.

### 3.1. Rôles et Contrôle d'Accès

L'accès aux fonctionnalités est strictement contrôlé par un système de rôles :

- **Compte Entreprise :** Rôle de supervision ultime. A accès à tous les modules, au tableau de bord principal, et à une **vue d'administration** exclusive (`/super-admin`) qui inclut le journal de toutes les actions des utilisateurs.
- **Admin-Gestionnaire :** Rôle de configuration. A accès à tous les modules, au tableau de bord principal et à la page d'administration (`/super-admin`), mais ne voit pas le journal des actions.
- **Gestionnaire de Module (Finance, RH, Marketing, Logistique) :** Accès limité au tableau de bord principal et à leur module spécifique (ex: un Gestionnaire RH ne voit que les onglets "Tableau de bord" et "SOCIX").
- **Stagiaire de Module (Finance, RH, Marketing, Logistique) :** Accès identique à celui du gestionnaire, mais avec des droits de modification potentiellement restreints (logique à affiner).
- **Employé :** N'a pas accès à l'ERP de gestion. Il est redirigé directement vers son propre tableau de bord (`/employee-dashboard`) pour consulter ses informations personnelles, ses documents et gérer ses absences.

**Logique de Sélection de Fichier :** Tous les rôles, à l'exception de "Employé", doivent obligatoirement sélectionner un fichier de gestion après la connexion pour accéder à l'ERP.

### 3.2. Modules de l'ERP

#### 3.2.1. SKOMPTAB (Comptabilité & Finance)

- **Objectif :** Gérer l'intégralité du cycle comptable et financier.
- **Fonctionnalités Clés :**
  - **Création :** Journaux, plan comptable, comptes tiers, modèles de saisie, de déclaration et de facture.
  - **Gestion :** Saisie d'écritures (manuelle ou via modèle), digitalisation de factures (IA), contrôle de trésorerie, rapprochement bancaire, élaboration de factures de vente.
  - **États Comptables :** Génération des journaux, brouillards, grands livres, balances.
  - **États Financiers :** Génération du Bilan, Compte de Résultat, SIG, et Tableau des Flux de Trésorerie.
  - **Analytique :** Gestion du plan analytique, ventilations, reporting et budgétisation.
  - **Fiscalité :** Suivi de la TVA et des autres déclarations.

#### 3.2.2. SOCIX (Ressources Humaines)

- **Objectif :** Gérer le capital humain de l'entreprise.
- **Fonctionnalités Clés :**
  - **Personnel :** Gestion centralisée des fiches employés, des contrats et des dossiers administratifs.
  - **Présences :** Suivi des congés, des absences, du pointage et validation des demandes.
  - **Paie :** Paramétrage, génération des bulletins, gestion des notes de frais.
  - **Talents :** Suivi du recrutement, des plans de formation et des évaluations.
  - **Analyse :** KPIs sociaux, bilan social et rapports RH.

#### 3.2.3. MARKOS (Marketing & CRM)

- **Objectif :** Gérer la relation client et les campagnes marketing.
- **Fonctionnalités Clés :**
  - **Clients :** Gestion des prospects, clients, segmentation et pipelines de vente.
  - **Campagnes :** Lancement de campagnes par email, SMS, et gestion des réseaux sociaux.
  - **Gestion :** Création de templates, gestion d'une médiathèque et d'un calendrier éditorial.
  - **Analyses :** Suivi des performances, du ROI et des taux de conversion.

#### 3.2.4. LOGSON (Logistique & Stocks)

- **Objectif :** Optimiser la chaîne d'approvisionnement et la gestion des stocks.
- **Fonctionnalités Clés :**
  - **Approvisionnement :** Gestion des fournisseurs, des commandes et des réceptions.
  - **Livraisons :** Préparation des commandes clients, expéditions, suivi et gestion des retours.
  - **Stocks :** Gestion du catalogue produits, inventaires, entrepôts et suivi des mouvements.
  - **Pilotage :** Analyse des coûts, KPIs logistiques et optimisation.

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
