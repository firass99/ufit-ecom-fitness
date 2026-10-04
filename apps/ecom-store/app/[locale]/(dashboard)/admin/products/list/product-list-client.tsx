'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@repo/design-system/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Product, Category } from '@/lib/types/types';
import { getProducts, deleteProduct } from '@/lib/actions/products';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  PencilIcon,
  Trash2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react';
import TableSkeleton from '@/components/table-skeleton';
import { useTranslations } from 'next-intl';
import { useRTL } from '@/components/ui/rtl-wrapper';

type SortKey = 'name' | 'category' | 'stock';

export default function ProductListClient({
  initialProducts,
  initialCategories,
  totalPages: initialTotalPages,
}: {
  initialProducts: Product[];
  initialCategories: Category[];
  totalPages: number;
}) {
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');
  const tTable = useTranslations('dashboard.tables');
  const rtl = useRTL();

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const spIsAvailable =
    (searchParams.get('isAvailable') as 'all' | 'true' | 'false') ?? 'all';
  const spCategoryId = searchParams.get('categoryId') ?? 'all';

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [isAvailable, setIsAvailable] = useState<'all' | 'true' | 'false'>(
    spIsAvailable,
  );
  const [categoryId, setCategoryId] = useState<string>(spCategoryId);

  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const isAllSelected =
    products.length > 0 && selectedIds.length === products.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const getStock = (p: Product) =>
    p.variants?.length
      ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : p.stock || 0;

  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === 'all') {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    });
    router.push(`/admin/products/list?${params.toString()}`);
  };

  const updatePage = (page: number) => {
    updateURL({ page: String(page) });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        page: currentPage,
        categoryId: categoryId !== 'all' ? categoryId : undefined,
        isAvailable: isAvailable === 'all' ? undefined : isAvailable === 'true',
      });

      // If backend already filters isAvailable, skip local filter:
      let filtered = res.data;

      // Optional local filter if API doesn't support it:
      if (
        isAvailable !== 'all' &&
        typeof filtered?.[0]?.isAvailable !== 'undefined'
      ) {
        const want = isAvailable === 'true';
        filtered = filtered.filter((p) => p.isAvailable === want);
      }

      setProducts(filtered);
      setTotalPages(res.totalPages);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // keep state in sync with URL (useful when user lands/changes filters)
  useEffect(() => {
    setIsAvailable(spIsAvailable);
    setCategoryId(spCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spIsAvailable, spCategoryId]);

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isAvailable, categoryId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');

      // Optimistic update:
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return toast.warning('No products selected');
    if (!confirm(`Delete ${selectedIds.length} products?`)) return;

    const failed: string[] = [];
    for (const id of selectedIds) {
      try {
        await deleteProduct(id);
      } catch {
        failed.push(id);
      }
    }

    toast.success(`Deleted ${selectedIds.length - failed.length} products`);

    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    arr.sort((a, b) => {
      let valA: any, valB: any;

      if (sortKey === 'category') {
        valA = a.category?.name || '';
        valB = b.category?.name || '';
      } else if (sortKey === 'stock') {
        valA = getStock(a);
        valB = getStock(b);
      } else {
        valA = (a as any)[sortKey];
        valB = (b as any)[sortKey];
      }

      if (valA === valB) return 0;
      return sortDir === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
    return arr;
  }, [products, sortKey, sortDir]);

  const columns = [
    { key: 'select', label: '' },
    { key: 'image', label: tCommon('image') },
    { key: 'name', label: tCommon('name'), sortable: true },
    { key: 'category', label: t('categories'), sortable: true },
    { key: 'stock', label: tCommon('stock'), sortable: true },
    { key: 'status', label: tCommon('status') },
    { key: 'actions', label: tCommon('actions') },
  ] as const;

  const SortIcon = ({
    active,
    dir,
  }: {
    active: boolean;
    dir: 'asc' | 'desc';
  }) =>
    active ? (
      dir === 'asc' ? (
        <ArrowUpIcon className="inline w-3 h-3 ml-1" />
      ) : (
        <ArrowDownIcon className="inline w-3 h-3 ml-1" />
      )
    ) : null;

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        {/*         <h1 className="text-2xl font-bold">Products</h1>
         */}{' '}
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              {tCommon('delete')} ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => router.push('/admin/products/add')}>
            {tCommon('add')} {t('products')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Select
          value={isAvailable}
          onValueChange={(v) => {
            setIsAvailable(v as 'all' | 'true' | 'false');
            // reset to page 1 on filter change
            updateURL({ isAvailable: v, page: '1' });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tCommon('allStatus')}</SelectItem>
            <SelectItem value="true">{tCommon('available')}</SelectItem>
            <SelectItem value="false">{tCommon('outOfStock')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={categoryId}
          onValueChange={(v) => {
            setCategoryId(v);
            updateURL({ categoryId: v, page: '1' });
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {tCommon('all') + ' ' + t('categories')}{' '}
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : (
        <>
          <div className="border rounded-md overflow-x-auto bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={
                        col.sortable ? 'cursor-pointer select-none' : ''
                      }
                      onClick={() =>
                        col.sortable &&
                        (sortKey === (col.key as SortKey)
                          ? setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                          : (setSortKey(col.key as SortKey), setSortDir('asc')))
                      }
                    >
                      {col.key === 'select' ? (
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      ) : (
                        <>
                          {col.label}
                          {col.sortable && (
                            <SortIcon
                              active={sortKey === col.key}
                              dir={sortDir}
                            />
                          )}
                        </>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-6"
                    >
                      {tCommon('notFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected(p.id)}
                          onCheckedChange={() => toggleSelect(p.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {p.images?.[0] ? (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                            {tCommon('notFound')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category?.name || '-'}</TableCell>
                      <TableCell>{getStock(p)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            p.isAvailable
                              ? 'bg-green-600  hover:bg-green-600 '
                              : 'bg-red-500  hover:bg-red-500 '
                          }
                        >
                          {p.isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/admin/products/${p.id}`)
                            }
                            aria-label="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(p.id)}
                            aria-label="Delete"
                          >
                            <Trash2Icon className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => updatePage(currentPage - 1)}
              >
                {tTable('goToPreviousPage')}
              </Button>

              <span className="px-3 py-2 text-sm border rounded">
                {currentPage} / {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => updatePage(currentPage + 1)}
              >
                {tTable('goToNextPage')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
