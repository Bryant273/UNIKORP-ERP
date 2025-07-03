'use server';
/**
 * @fileOverview An AI agent to enable cross-module smart search.
 *
 * - crossModuleSmartSearch - A function that handles the smart search process across modules.
 * - CrossModuleSmartSearchInput - The input type for the crossModuleSmartSearch function.
 * - CrossModuleSmartSearchOutput - The return type for the crossModuleSmartSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrossModuleSmartSearchInputSchema = z.object({
  query: z.string().describe('The natural language search query.'),
});
export type CrossModuleSmartSearchInput = z.infer<typeof CrossModuleSmartSearchInputSchema>;

const CrossModuleSmartSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      module: z.string().describe('The module where the result was found.'),
      recordId: z.string().describe('The ID of the record found.'),
      summary: z.string().describe('A summary of the record content.'),
    })
  ).describe('The search results across all modules.'),
});
export type CrossModuleSmartSearchOutput = z.infer<typeof CrossModuleSmartSearchOutputSchema>;

export async function crossModuleSmartSearch(input: CrossModuleSmartSearchInput): Promise<CrossModuleSmartSearchOutput> {
  return crossModuleSmartSearchFlow(input);
}

const crossModuleSmartSearchPrompt = ai.definePrompt({
  name: 'crossModuleSmartSearchPrompt',
  input: {schema: CrossModuleSmartSearchInputSchema},
  output: {schema: CrossModuleSmartSearchOutputSchema},
  prompt: `You are an expert search assistant specializing in finding information across different modules of an ERP system called UNIKORP.

The ERP system has the following modules:
- SKOMPTAB: Comptabilité, Finance et Fiscalité
- MARKOS: Marketing, CRM
- LOGSON: Logistique et Contrôle de gestion
- SOCIX: RH et Mix Social

You will receive a natural language query from the user and your goal is to find relevant data and information across all modules.

For each result you find, please include:
- module: The module where the result was found.
- recordId: The ID of the record found.
- summary: A summary of the record content.

User Query: {{{query}}}

Ensure the output is a valid JSON array of results.`,
});

const crossModuleSmartSearchFlow = ai.defineFlow(
  {
    name: 'crossModuleSmartSearchFlow',
    inputSchema: CrossModuleSmartSearchInputSchema,
    outputSchema: CrossModuleSmartSearchOutputSchema,
  },
  async input => {
    const {output} = await crossModuleSmartSearchPrompt(input);
    return output!;
  }
);
