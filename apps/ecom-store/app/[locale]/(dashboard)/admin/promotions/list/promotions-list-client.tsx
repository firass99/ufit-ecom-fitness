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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@repo/design-system/components/ui/select';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { deletePromotion } from '@/lib/actions/promotions';
import { toast } from 'sonner';
import {
  PencilIcon,
  Trash2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
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

export default function PromotionsListClient({
  initialPromotions,
}: {
  initialPromotions: Promotion[];
}) {
  const router = useRouter();

  const t = useTranslations('dashboard.sidebar');

  const tCommon = useTranslations('dashboard.common');

  const [sortKey, setSortKey] = useState<SortKey>('code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 🔍 Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>(
    'all',
  );
  const [typeFilter, setTypeFilter] = useState<'all' | 'PERCENTAGE' | 'FIXED'>(
    'all',
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  const isAllSelected =
    initialPromotions.length > 0 &&
    selectedIds.length === initialPromotions.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialPromotions.map((p) => p.id));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(tCommon('delete'))) return;
    try {
      await deletePromotion(id);
      toast.success(tCommon('deleted'));
      window.location.reload(); // or refetch manually
    } catch {
      toast.error(tCommon('failedToDelete'));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length)
      return toast.warning(
        tCommon('no') + '' + t('promotions') + '' + tCommon('selected'),
      );
    if (
      !confirm(
        tCommon('delete') + '' + selectedIds.length + '' + t('promotions'),
      )
    )
      return;

    const failed: string[] = [];
    for (const id of selectedIds) {
      try {
        await deletePromotion(id);
      } catch {
        failed.push(id);
      }
    }

    toast.success(
      tCommon('deleted') +
        '' +
        (selectedIds.length - failed.length) +
        '' +
        t('promotions'),
    );
    window.location.reload();
  };

  // 🔍 Filtered + Sorted Promotions
  const filteredPromotions = useMemo(() => {
    return initialPromotions.filter((p) => {
      const matchesStatus =
        statusFilter === 'all' || String(p.isActive) === String(statusFilter);
      const matchesType = typeFilter === 'all' || p.discountType === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [initialPromotions, statusFilter, typeFilter]);

  const sortedPromotions = useMemo(() => {
    const arr = [...filteredPromotions];
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
  }, [filteredPromotions, sortKey, sortDir]);

  const columns = [
    { key: 'select', label: '' },
    { key: 'code', label: tCommon('code'), sortable: true },
    { key: 'value', label: tCommon('value'), sortable: true },
    { key: 'maxUsage', label: tCommon('maxUsage'), sortable: true },
    { key: 'discountType', label: tCommon('discountType') },
    { key: 'expiresAt', label: tCommon('expiresAt'), sortable: true },
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
    <div className="p-6">
      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex gap-4 flex-wrap">
          <Select
            value={statusFilter}
            onValueChange={(val) =>
              setStatusFilter(val as 'all' | 'true' | 'false')
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={tCommon('status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {tCommon('all') + ' ' + tCommon('statuses')}
              </SelectItem>
              <SelectItem value="true">{tCommon('true')}</SelectItem>
              <SelectItem value="false">{tCommon('false')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(val) =>
              setTypeFilter(val as 'all' | 'PERCENTAGE' | 'FIXED')
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={tCommon('type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {tCommon('all') + ' ' + tCommon('types')}
              </SelectItem>
              <SelectItem value="PERCENTAGE">
                {tCommon('percentage')}
              </SelectItem>
              <SelectItem value="FIXED">{tCommon('fixed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              {tCommon('delete') +
                ' ' +
                tCommon('selected') +
                ' ' +
                selectedIds.length}
            </Button>
          )}
          <Button onClick={() => router.push('/admin/promotions/add')}>
            {tCommon('add') + ' ' + tCommon('promotion')}
          </Button>
        </div>
      </div>

      {/* Table */}
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
                  {tCommon('notFound') + ' ' + t('promotions')}
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
    </div>
  );
}
