'use server';

import {
  crossModuleSmartSearch,
  type CrossModuleSmartSearchInput,
  type CrossModuleSmartSearchOutput,
} from '@/ai/flows/cross-module-smart-search';
import { 
  parseAccountingPlan,
  type ParseAccountingPlanInput,
  type ParseAccountingPlanOutput,
} from '@/ai/flows/parse-accounting-plan';

import { z } from 'zod';

const DUMMY_RESULTS: CrossModuleSmartSearchOutput = {
  results: [
    { module: 'MARKOS', recordId: 'CAMP-001', summary: 'Campagne marketing "Lancement Produit Alpha" pour le Q3 2024.' },
    { module: 'LOGSON', recordId: 'SHIP-987', summary: 'Expédition en retard pour le client "TechCorp", prévue pour le 15/08/2024.' },
    { module: 'SKOMPTAB', recordId: 'INV-2024-042', summary: 'Facture impayée pour le client "Innovate Inc.", due le 30/07/2024.' },
    { module: 'MARKOS', recordId: 'LEAD-554', summary: 'Nouveau prospect qualifié "Global Solutions Ltd" intéressé par le Produit Beta.' },
    { module: 'SOCIX', recordId: 'EMP-076', summary: 'Profil de l\'employé Jean Dupont, Senior Developer.' },
  ],
};

const inputSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

export async function handleSmartSearch(input: CrossModuleSmartSearchInput): Promise<CrossModuleSmartSearchOutput> {
  const validatedInput = inputSchema.safeParse(input);
  if (!validatedInput.success) {
    throw new Error('Invalid input for smart search.');
  }

  // To avoid hitting real API for every test, we can use a flag.
  // In a real app, this would be based on environment variables.
  const useDummyData = process.env.NODE_ENV === 'development';

  if (useDummyData && validatedInput.data.query.toLowerCase().includes('test')) {
     // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return DUMMY_RESULTS;
  }

  try {
    // In a real scenario, you'd call the actual AI flow.
    // We simulate a call here to demonstrate functionality.
    // const results = await crossModuleSmartSearch(validatedInput.data);
    // return results;

    // Simulating a successful but empty response for now
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { results: [] };
    
  } catch (error) {
    console.error("Error in crossModuleSmartSearch flow:", error);
    // You can return a structured error response if needed
    throw new Error("Failed to execute smart search.");
  }
}

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
