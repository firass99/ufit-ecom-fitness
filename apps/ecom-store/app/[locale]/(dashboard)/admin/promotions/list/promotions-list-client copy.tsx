'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@repo/design-system/components/ui/table';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { Badge } from '@repo/design-system/components/ui/badge';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getPromotions, deletePromotion } from '@/lib/actions/promotions';
import { toast } from 'sonner';
import {
  PencilIcon,
  Trash2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react';

type SortKey = 'code' | 'value' | 'expiresAt';

type Promotion = {
  id: string;
  code: string;
  maxUsage: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  value: number;
  isActive: boolean;
  expiresAt: string | null;
};

export default function PromotionsListClientXX({
  initialPromotions,
  totalPages: initialTotalPages,
}: {
  initialPromotions: Promotion[];
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [sortKey, setSortKey] = useState<SortKey>('code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const isAllSelected =
    promotions.length > 0 && selectedIds.length === promotions.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(promotions.map((p) => p.id));
    }
  };

  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (!v || v === 'all') {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    });
    router.push(`/admin/promotions/list?${params.toString()}`);
  };

  const updatePage = (page: number) => {
    updateURL({ page: String(page) });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await getPromotions(currentPage);
      setPromotions(res.data);
      setTotalPages(res.totalPages);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promotion?')) return;
    try {
      await deletePromotion(id);
      toast.success('Promotion deleted');
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('Failed to delete promotion');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return toast.warning('No promotions selected');
    if (!confirm(`Delete ${selectedIds.length} promotions?`)) return;

    const failed: string[] = [];
    for (const id of selectedIds) {
      try {
        await deletePromotion(id);
      } catch {
        failed.push(id);
      }
    }

    toast.success(`Deleted ${selectedIds.length - failed.length} promotions`);
    setPromotions((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const sortedPromotions = useMemo(() => {
    const arr = [...promotions];
    arr.sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];

      if (sortKey === 'expiresAt') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }

      if (valA === valB) return 0;
      return sortDir === 'asc' ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    });
    return arr;
  }, [promotions, sortKey, sortDir]);

  const columns = [
    { key: 'select', label: '' },
    { key: 'code', label: 'Code', sortable: true },
    { key: 'value', label: 'Value', sortable: true },
    { key: 'maxUsage', label: 'Qte', sortable: true },
    { key: 'discountType', label: 'Type' },
    { key: 'expiresAt', label: 'Expires', sortable: true },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => router.push('/admin/promotions/add')}>
            Add Promotion
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.sortable ? 'cursor-pointer select-none' : ''}
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
                        <SortIcon active={sortKey === col.key} dir={sortDir} />
                      )}
                    </>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPromotions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  No promotions found.
                </TableCell>
              </TableRow>
            ) : (
              sortedPromotions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected(p.id)}
                      onCheckedChange={() => toggleSelect(p.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.code}</TableCell>
                  <TableCell>{p.value}</TableCell>
                  <TableCell>{p.maxUsage}</TableCell>
                  <TableCell>{p.discountType}</TableCell>
                  <TableCell>
                    {p.expiresAt
                      ? new Date(p.expiresAt).toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        p.isActive
                          ? 'bg-green-600 hover:bg-green-600'
                          : 'bg-red-500 hover:bg-red-500'
                      }
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/promotions/${p.id}`)}
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
            Previous
          </Button>

          <span className="px-3 py-2 text-sm border rounded">
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => updatePage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
