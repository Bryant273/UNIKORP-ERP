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


export const clientsAtom = atom<CompteTiers[]>(initialClients);
export const prospectsAtom = atom<CompteTiers[]>(initialProspects);
export const fournisseursAtom = atom<Fournisseur[]>(initialFournisseurs);
export const produitsAtom = atom<Produit[]>(initialProduits);
