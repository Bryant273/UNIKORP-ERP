// /src/app/api/smart-search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { handleSmartSearch as handleSmartSearchService } from '@/lib/services/smart-search-service';

/**
 * @swagger
 * /api/smart-search:
 *   post:
 *     summary: Performs a cross-module smart search.
 *     description: Receives a natural language query and uses an AI agent to find relevant information across all ERP modules.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: The natural language search query.
 *                 example: "Quelles sont les dernières campagnes marketing pour le produit X?"
 *     responses:
 *       200:
 *         description: Search results.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrossModuleSmartSearchOutput'
 *       400:
 *         description: Bad Request - Missing or invalid query.
 *       500:
 *         description: Internal Server Error - Failed to execute search.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required and must be a string.' }, { status: 400 });
    }

    const results = await handleSmartSearchService({ query });
    return NextResponse.json(results);

  } catch (error) {
    console.error("Error in smart-search API route:", error);
    return NextResponse.json({ error: 'Failed to execute smart search.' }, { status: 500 });
  }
}
