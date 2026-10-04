'use client';

import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function TableSkeleton({
  rows,
  columns,
}: {
  rows: number;
  columns: number;
}) {
  return (
    <div className={`space-y-4 space-x-4`}>
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded mb-2" />
      ))}
      {[...Array(columns)].map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded" />
      ))}
    </div>
  );
}
