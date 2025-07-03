'use server';
/**
 * @fileOverview An AI agent to parse accounting plan files.
 *
 * - parseAccountingPlan - A function that handles the parsing of an accounting plan file.
 * - ParseAccountingPlanInput - The input type for the parseAccountingPlan function.
 * - ParseAccountingPlanOutput - The return type for the parseAccountingPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const NatureCompteSchema = z.enum([
    'Bilan - Actif', 
    'Bilan - Passif', 
    'Compte de résultat - Charge', 
    'Compte de résultat - Produit', 
    'Autre'
]);
export type NatureCompte = z.infer<typeof NatureCompteSchema>;

export const CompteSchema = z.object({
  numero: z.string().describe("Le numéro du compte."),
  intitule: z.string().describe("L'intitulé ou la description du compte."),
  nature: NatureCompteSchema.describe("La nature du compte."),
});
export type Compte = z.infer<typeof CompteSchema>;


export const ParseAccountingPlanInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The accounting plan file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileType: z.string().describe("The MIME type of the file, e.g., 'application/pdf', 'text/csv'."),
});
export type ParseAccountingPlanInput = z.infer<typeof ParseAccountingPlanInputSchema>;

export const ParseAccountingPlanOutputSchema = z.array(CompteSchema);
export type ParseAccountingPlanOutput = z.infer<typeof ParseAccountingPlanOutputSchema>;

export async function parseAccountingPlan(input: ParseAccountingPlanInput): Promise<ParseAccountingPlanOutput> {
  return parseAccountingPlanFlow(input);
}

const parseAccountingPlanPrompt = ai.definePrompt({
  name: 'parseAccountingPlanPrompt',
  input: {schema: ParseAccountingPlanInputSchema},
  output: {schema: ParseAccountingPlanOutputSchema},
  prompt: `You are an expert accountant specializing in interpreting and parsing accounting plan documents.
Your task is to analyze the provided file and extract the chart of accounts into a structured JSON format.

The file is of type {{{fileType}}}.
File content: {{media url=fileDataUri}}

Please parse the document and return a JSON array of accounting entries. Each entry must have the following fields:
- numero: The account number (string).
- intitule: The account title or description (string).
- nature: The nature of the account. It must be one of the following values: 'Bilan - Actif', 'Bilan - Passif', 'Compte de résultat - Charge', 'Compte de résultat - Produit', 'Autre'.

Ensure the output is a valid JSON array.`,
});

const parseAccountingPlanFlow = ai.defineFlow(
  {
    name: 'parseAccountingPlanFlow',
    inputSchema: ParseAccountingPlanInputSchema,
    outputSchema: ParseAccountingPlanOutputSchema,
  },
  async input => {
    const {output} = await parseAccountingPlanPrompt(input);
    return output!;
  }
);
