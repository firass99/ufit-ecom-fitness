'use client';

import { Skeleton } from '@repo/design-system/components/ui/skeleton';

export default function UpdateProductSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg shadow">
      {/* Title */}
      <Skeleton className="h-7 w-1/3 mb-8" />

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Description */}
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
        {/* Category */}
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Images */}
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-20" />
            ))}
          </div>
        </div>
        {/* Variants */}
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="mb-3 grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, c) => (
                <Skeleton key={c} className="h-9 w-full" />
              ))}
            </div>
          ))}
          <Skeleton className="h-8 w-32 mt-2" />
        </div>
      </div>
      {/* Submit Button */}
      <Skeleton className="mt-8 h-10 w-full" />
    </div>
  );
}
