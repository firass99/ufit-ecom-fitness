import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function Loading() {
  return (
    <section className="container max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Skeleton product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="border rounded-lg shadow-sm overflow-hidden p-4"
          >
            <Skeleton className="w-full h-56 mb-4" />
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-5 w-1/3 mb-4" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      {/* Pagination skeleton */}
      <div className="mt-10 flex justify-center gap-4 items-center">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-10 w-28" />
      </div>
    </section>
  );
}
