'use server';
/**
 * @fileOverview An AI agent to parse invoice files.
 *
 * - parseInvoice - A function that handles the parsing of an invoice file.
 * - ParseInvoiceInput - The input type for the parseInvoice function.
 * - ParseInvoiceOutput - The return type for the parseInvoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const InvoiceTypeSchema = z.enum(['Achat', 'Vente', 'Avoir', 'Autre']);
export type InvoiceType = z.infer<typeof InvoiceTypeSchema>;

export const ParseInvoiceInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The invoice file content as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileType: z.string().describe("The MIME type of the file, e.g., 'application/pdf'."),
});
export type ParseInvoiceInput = z.infer<typeof ParseInvoiceInputSchema>;

export const ParseInvoiceOutputSchema = z.object({
    numeroPiece: z.string().describe("Le numéro de la facture ou de la pièce comptable."),
    tiers: z.string().describe("Le nom du client ou du fournisseur."),
    dateOperation: z.string().describe("La date de l'opération ou de la facture (format YYYY-MM-DD)."),
    montantTotal: z.number().describe("Le montant total TTC de la facture."),
    type: InvoiceTypeSchema.describe("Le type de facture (Achat, Vente, Avoir, Autre)."),
});
export type ParseInvoiceOutput = z.infer<typeof ParseInvoiceOutputSchema>;

export async function parseInvoice(input: ParseInvoiceInput): Promise<ParseInvoiceOutput> {
  return parseInvoiceFlow(input);
}

const parseInvoicePrompt = ai.definePrompt({
  name: 'parseInvoicePrompt',
  input: {schema: ParseInvoiceInputSchema},
  output: {schema: ParseInvoiceOutputSchema},
  prompt: `You are an expert OCR and data extraction agent specializing in invoices.
Your task is to analyze the provided invoice file and extract key information into a structured JSON format.

The file is of type {{{fileType}}}.
File content: {{media url=fileDataUri}}

Please parse the document and return a JSON object with the following fields:
- numeroPiece: The invoice number.
- tiers: The name of the customer or supplier.
- dateOperation: The invoice date, formatted as YYYY-MM-DD.
- montantTotal: The total amount including taxes (TTC).
- type: The type of invoice. Determine if it is a purchase ('Achat'), a sale ('Vente'), a credit note ('Avoir'), or something else ('Autre').

Ensure the output is a valid JSON object.`,
});

const parseInvoiceFlow = ai.defineFlow(
  {
    name: 'parseInvoiceFlow',
    inputSchema: ParseInvoiceInputSchema,
    outputSchema: ParseInvoiceOutputSchema,
  },
  async input => {
    const {output} = await parseInvoicePrompt(input);
    return output!;
  }
);
