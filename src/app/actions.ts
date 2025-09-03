'use server';

import { 
  parseAccountingPlan,
  type ParseAccountingPlanInput,
  type ParseAccountingPlanOutput,
} from '@/ai/flows/parse-accounting-plan';
import {
  parseInvoice,
  type ParseInvoiceInput,
  type ParseInvoiceOutput,
} from '@/ai/flows/parse-invoice';

// NOTE: handleSmartSearch has been moved to its own API route at /src/app/api/smart-search/route.ts

const MOCK_PARSED_ACCOUNTS: ParseAccountingPlanOutput = [
    { numero: '641000', intitule: 'Rémunérations du personnel', nature: 'Compte de résultat - Charge' },
    { numero: '645000', intitule: 'Charges de sécurité sociale et de prévoyance', nature: 'Compte de résultat - Charge' },
    { numero: '707000', intitule: 'Ventes de marchandises', nature: 'Compte de résultat - Produit' },
    { numero: '758000', intitule: 'Produits divers de gestion courante', nature: 'Compte de résultat - Produit' },
    { numero: '601000', intitule: 'Achats stockés - Matières premières', nature: 'Compte de résultat - Charge' },
];

export async function handleParseAccountingPlan(input: ParseAccountingPlanInput): Promise<ParseAccountingPlanOutput> {
  // In a real scenario, you would uncomment the following lines to call the AI flow.
  // We are using mock data to demonstrate the functionality without incurring API costs.
  /*
  try {
    const results = await parseAccountingPlan(input);
    return results;
  } catch (error) {
    console.error("Error in parseAccountingPlan flow:", error);
    throw new Error("Failed to parse accounting plan.");
  }
  */
  
  // Simulate network delay and AI processing time
  await new Promise(resolve => setTimeout(resolve, 2500));
  return MOCK_PARSED_ACCOUNTS;
}


export async function handleParseInvoice(input: ParseInvoiceInput): Promise<ParseInvoiceOutput> {
  // Simulate a real API call to the Genkit flow
  // In a real app, you would remove the mock and call:
  // return await parseInvoice(input);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock data that simulates a successful parse
  const MOCK_PARSED_INVOICE: ParseInvoiceOutput = {
    numeroPiece: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
    tiers: 'Fournisseur Analysé S.A.',
    dateOperation: new Date().toISOString().split('T')[0],
    montantTotal: Math.round((Math.random() * 2000 + 500) * 100) / 100,
    type: 'Achat',
  };

  return MOCK_PARSED_INVOICE;
}
