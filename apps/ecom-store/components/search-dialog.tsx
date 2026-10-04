'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandGroup,
} from '@repo/design-system/components/ui/command';
import { Button } from '@repo/design-system/components/ui/button';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { LoopIcon, StarFilledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

import { getCategories } from '@/lib/actions/categories';
import { meiliClient } from '@/lib/meilsearch/meilisearch';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Category } from '@/lib/types/types';

interface Item {
  id: string;
  name: string;
  image: string;
  category: string;
  _formatted?: {
    name?: string;
  };
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const t = useTranslations('navbar.search');
  const locale = useLocale();

  useEffect(() => {
    const searchItems = async () => {
      if (!debouncedQuery) return setItems([]);

      try {
        const index = meiliClient.index('products');
        const result = await index.search<Item>(debouncedQuery, {
          limit: 15,
          attributesToHighlight: ['*'],
        });

        setItems(result.hits);
      } catch (error) {
        console.error('Meilisearch error:', error);
        setItems([]);
      }
    };

    searchItems();
  }, [debouncedQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  const groupedItems = items.reduce(
    (acc, item) => {
      const key = item.category || 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, Item[]>,
  );

  const getCategoriesTitle = (cat: Category) => {
    if (locale === 'en') return cat.name;
    const translation = cat.translations?.find((tr) => tr.locale === locale);
    return translation?.name || cat.name;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          {t('button')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden mt-[%15]">
        <DialogHeader>
          <DialogTitle className="sr-only">{t('title')}</DialogTitle>
        </DialogHeader>

        <Command>
          <div className="border-b px-4 py-3">
            <CommandInput
              autoFocus
              placeholder={t('placeholder')}
              value={query}
              onValueChange={setQuery}
            />
          </div>

          <ScrollArea className="max-h-[500px] px-1 py-2">
            {Object.keys(groupedItems).length === 0 && (
              <div className="text-muted-foreground text-sm px-4 py-6 text-center">
                {t('no_results')}
              </div>
            )}

            {Object.keys(groupedItems).map((category) => (
              <CommandGroup
                key={category}
                heading={category}
                className="text-base font-semibold"
              >
                {groupedItems[category].map((item) => {
                  const highlighted = item._formatted?.name ?? item.name;
                  const imageSrc =
                    item.image ||
                    'https://ui.shadcn.com/placeholder.svg?text=No+Image';

                  return (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      className="gap-4 py-3 px-4 rounded-md hover:bg-accent transition"
                    >
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="w-12 h-12 rounded-md object-cover border"
                      />
                      <span
                        className="text-sm font-medium text-foreground flex-1"
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                      />
                      <Link href={`/products/${item.id}`} passHref>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="ml-auto p-1 hover:bg-gray-100 rounded"
                          aria-label={`Go to ${item.name}`}
                        >
                          <StarFilledIcon className="w-4 h-4 text-gray-500" />
                        </button>
                      </Link>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </ScrollArea>
        </Command>

        {/* Categories Footer */}
        <div className="border-t px-4 py-3 text-xs text-muted-foreground flex flex-wrap gap-3">
          <span className="text-gray-500 font-medium">{t('categories')}:</span>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs"
            >
              <Link href={`/products?categoryId=${cat.id}`}>
                {getCategoriesTitle(cat)}
              </Link>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
