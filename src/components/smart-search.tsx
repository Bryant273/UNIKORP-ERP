'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search, Loader2, ServerCrash } from 'lucide-react';
import type { CrossModuleSmartSearchOutput } from '@/ai/flows/cross-module-smart-search';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from './ui/badge';

export function SmartSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CrossModuleSmartSearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      // Frontend now calls the API route
      const response = await fetch('/api/smart-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const searchResults: CrossModuleSmartSearchOutput = await response.json();
      setResults(searchResults);
    } catch (err) {
      setError('An error occurred during the search. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedResults = results?.results.reduce((acc, result) => {
    (acc[result.module] = acc[result.module] || []).push(result);
    return acc;
  }, {} as Record<string, typeof results.results>);


  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground sm:w-64"
        onClick={() => setIsOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Recherche intelligente...</span>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recherche Intelligente Inter-Modules</DialogTitle>
            <DialogDescription>
              Posez une question en langage naturel pour rechercher des informations dans tous les modules UNIKORP.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSearch}>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: 'Quelles sont les dernières campagnes marketing pour le produit X?'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </form>
          <div className="mt-4 max-h-[50vh] overflow-y-auto">
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Recherche en cours...</p>
              </div>
            )}
            {error && (
               <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-center">
                  <ServerCrash className="h-8 w-8 text-destructive" />
                  <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}
            {groupedResults && (
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedResults).map(([module, items]) => (
                  <AccordionItem value={module} key={module}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                           {module} <Badge variant="secondary">{items.length}</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.recordId} className="rounded-md border p-4">
                            <p className="font-semibold text-sm">{item.summary}</p>
                            <p className="text-xs text-muted-foreground mt-1">ID: {item.recordId}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
             {results?.results.length === 0 && !isLoading && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun résultat trouvé.</p>
                </div>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
