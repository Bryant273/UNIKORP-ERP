import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Returns a simple greeting
 *     description: This is a basic API endpoint to demonstrate server-side functionality in Next.js.
 *     responses:
 *       200:
 *         description: A JSON object with a message and the current server timestamp.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello from the UNIKORP Backend!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export async function GET() {
  // This logic runs on the server.
  const data = {
    message: 'Hello from the UNIKORP Backend!',
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
