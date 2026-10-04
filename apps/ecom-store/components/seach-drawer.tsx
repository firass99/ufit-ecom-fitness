'use client';

import { useState, useRef } from 'react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@repo/design-system/components/ui/sheet';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'shoes', name: 'Shoes' },
  { id: 'equipment', name: 'Equipment' },
  { id: 'supplements', name: 'Supplements' },
];

// Dummy search function (replace with your real API call)
async function searchProducts(q: string, cat: string) {
  if (!q) return [];
  // Simulate API
  return [
    { id: 'p1', name: `Product ${q} A`, category: cat },
    { id: 'p2', name: `Product ${q} B`, category: cat },
  ];
}

export default function SearchDrawer() {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger search on input
  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const data = await searchProducts(e.target.value, cat);
    setResults(data);
    setLoading(false);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    router.push(`/products?category=${cat}&q=${encodeURIComponent(query)}`);
  };

  // Focus input when opening
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setTimeout(() => {
      if (next && inputRef.current) inputRef.current.focus();
    }, 150);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          className="flex-1 justify-start px-3 bg-muted border rounded-lg h-10 gap-2 text-muted-foreground hover:bg-muted/90"
          variant="ghost"
        >
          <Search className="w-5 h-5 opacity-60" />
          <span className="text-sm opacity-70">Search products...</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="max-h-[70vh] md:max-w-xl mx-auto">
        <SheetHeader>
          <SheetTitle>Search Products</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <select
            className="border rounded px-2 h-10"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Input
            ref={inputRef}
            type="search"
            placeholder="Type to search…"
            className="flex-1"
            value={query}
            onChange={handleInput}
            autoFocus
          />
          <Button type="submit" variant="default">
            <Search className="w-5 h-5" />
          </Button>
        </form>

        {/* Results */}
        <div className="mt-4">
          {loading && (
            <div className="text-xs py-4 text-center text-muted-foreground">
              Searching…
            </div>
          )}
          {!loading && results.length > 0 && (
            <ul className="divide-y border mt-2 rounded bg-background shadow">
              {results.map((prod) => (
                <li
                  key={prod.id}
                  className="p-3 hover:bg-muted cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/product/${prod.id}`);
                  }}
                >
                  <div className="font-medium">{prod.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {prod.category}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && query.length > 1 && results.length === 0 && (
            <div className="text-xs text-center text-muted-foreground py-4">
              No products found.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
