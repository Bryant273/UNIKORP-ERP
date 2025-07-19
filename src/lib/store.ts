
import { atom } from 'jotai';

type CompteTiers = {
  id: number;
  numero: string;
  intitule: string;
  telephone: string;
};

type Fournisseur = {
    id: number;
    numero: string;
    intitule: string;
    telephone: string;
}

type Produit = {
  id: number;
  reference: string;
  name: string;
  stock: number;
  unitPrice: number;
};

export type LigneCommande = {
  id: string;
  produitId: number | null;
  description: string;
  quantite: number;
  prixUnitaire: number;
};

export type Commande = {
  id: number;
  numero: string;
  date: string;
  fournisseurId: number;
  lignes: LigneCommande[];
};

export type Reception = {
  id: string; // Unique ID for the reception event
  commandeId: number;
  date: string;
  numeroBon: string;
  numeroBonFournisseur?: string;
  lignes: {
    ligneCommandeId: string;
    description: string;
    quantiteRecue: number;
  }[];
};

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type PreparationStatus = 'En attente' | 'En préparation' | 'Prête' | 'En transit' | 'Livrée';

export type InvoiceData = {
  id: string;
  invoiceTitle: string;
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  isVatEnabled: boolean;
  vatRate: number;
  notes: string;
  companyName: string;
  companyAddress: string;
  companyLogoUrl: string;
  primaryColor: string;
  preparationStatus: PreparationStatus;
};

export type InvoiceTemplate = {
  id: string;
  name: string;
  primaryColor: string;
  companyName: string;
  companyAddress: string;
  companyLogoUrl: string;
  showTax: boolean;
  footerText: string;
};

export const initialTemplates: InvoiceTemplate[] = [
  {
    id: 'tpl_classic',
    name: 'Classique',
    primaryColor: '#3b82f6', // blue-500
    companyName: 'Votre Société S.A.',
    companyAddress: '123 Rue de la Facture, 75001 Paris',
    companyLogoUrl: '',
    showTax: true,
    footerText: 'Merci de votre confiance.\nPaiement à 30 jours net.',
  },
  {
    id: 'tpl_modern',
    name: 'Moderne',
    primaryColor: '#10b981', // emerald-500
    companyName: 'Tech Innovante Inc.',
    companyAddress: '456 Avenue du Futur, Lyon',
    companyLogoUrl: '',
    showTax: false,
    footerText: 'Coordonnées bancaires : FR76 ...',
  },
];


const initialInvoices: InvoiceData[] = [
  {
    id: 'inv_1',
    invoiceTitle: 'Prestation de développement web',
    clientName: 'Client Alpha SARL',
    clientAddress: '10 Rue du Commerce, 33000 Bordeaux',
    invoiceNumber: 'FACT-2024-00123',
    invoiceDate: '2024-07-15',
    dueDate: '2024-08-14',
    lineItems: [
      { id: 'l1', description: 'Développement de site web', quantity: 1, unitPrice: 2500000 },
      { id: 'l2', description: 'Hébergement annuel', quantity: 1, unitPrice: 300000 },
    ],
    isVatEnabled: true,
    vatRate: 20,
    notes: 'Merci de votre confiance.',
    companyName: 'Votre Société S.A.',
    companyAddress: '123 Rue de la Facture, 75001 Paris',
    companyLogoUrl: '',
    primaryColor: '#3b82f6',
    preparationStatus: 'En attente',
  },
  {
    id: 'inv_2',
    invoiceTitle: 'Consulting SEO - Juillet 2024',
    clientName: 'Tech Innovante Inc.',
    clientAddress: '456 Avenue du Futur, Lyon',
    invoiceNumber: 'FACT-2024-00124',
    invoiceDate: '2024-07-18',
    dueDate: '2024-08-17',
    lineItems: [{ id: 'l3', description: 'Consulting SEO', quantity: 10, unitPrice: 150000 }],
    isVatEnabled: true,
    vatRate: 20,
    notes: 'Paiement à réception.',
    companyName: 'Tech Innovante Inc.',
    companyAddress: '456 Avenue du Futur, Lyon',
    companyLogoUrl: '',
    primaryColor: '#10b981',
    preparationStatus: 'Prête',
  },
];


const initialClients: CompteTiers[] = [
  { id: 1, numero: '411CLIENT1', intitule: 'Client Alpha', telephone: '0123456789' },
  { id: 3, numero: '411CLIENT2', intitule: 'Client Beta', telephone: '0123456788' },
  { id: 5, numero: '411CLIENT3', intitule: 'Client Gamma', telephone: '0123456787' },
];

const initialFournisseurs: Fournisseur[] = [
  { id: 2, numero: '401FOURN1', intitule: 'Fournisseur Omega', telephone: '0987654321' },
  { id: 4, numero: '401FOURN2', intitule: 'Fournisseur Gamma', telephone: '0987654322' },
];

const initialProspects: CompteTiers[] = [
    { id: 101, numero: 'PROS-001', intitule: 'Prospect Delta', telephone: '0612345678' },
    { id: 102, numero: 'PROS-002', intitule: 'Prospect Epsilon', telephone: '0623456789' },
];

const initialProduits: Produit[] = [
    { id: 1, reference: 'SRV-DELL-R740', name: 'Serveur Dell PowerEdge R740', stock: 15, unitPrice: 2500000 },
    { id: 2, reference: 'SW-MS-WIN22', name: 'Licence Windows Server 2022', stock: 50, unitPrice: 150000 },
    { id: 3, reference: 'NW-CIS-C9200', name: 'Switch Cisco Catalyst 9200', stock: 25, unitPrice: 850000 },
    { id: 4, reference: 'PC-LEN-T14', name: 'PC Portable Lenovo ThinkPad T14', stock: 40, unitPrice: 750000 },
];

const initialCommandes: Commande[] = [
    { id: 1, numero: 'BC-2024-001', date: '2024-07-28', fournisseurId: 2, lignes: [ { id: 'l1', produitId: 1, description: 'Serveur Dell R740', quantite: 2, prixUnitaire: 2500000 }] },
    { id: 2, numero: 'BC-2024-002', date: '2024-07-30', fournisseurId: 4, lignes: [ { id: 'l2', produitId: 2, description: 'Licence Windows Server', quantite: 10, prixUnitaire: 150000 }] },
];

export const clientsAtom = atom<CompteTiers[]>(initialClients);
export const prospectsAtom = atom<CompteTiers[]>(initialProspects);
export const fournisseursAtom = atom<Fournisseur[]>(initialFournisseurs);
export const produitsAtom = atom<Produit[]>(initialProduits);
export const commandesFournisseursAtom = atom<Commande[]>(initialCommandes);
export const receptionsAtom = atom<Reception[]>([]);
export const invoicesAtom = atom<InvoiceData[]>(initialInvoices);
