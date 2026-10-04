'use client';

import { Brand } from '@/lib/types/types';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { deleteBrand, getBrands } from '@/lib/actions/brands';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function BrandListClient({
  initialBrands,
  totalPages,
}: {
  initialBrands: Brand[];
  totalPages: number;
}) {
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  const [brands, setBrands] = useState(initialBrands);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
      toast.success('Brand deleted');
    } catch (err) {
      toast.error('Failed to delete brand');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold"> {t('brands')}</h1>
        <Button onClick={() => router.push('/admin/brands/add')}>
          {tCommon('add') + ' ' + tCommon('brand')}
        </Button>
      </div>

      <div className="overflow-x-auto rounded border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon('name')}</TableHead>
              <TableHead>{tCommon('brand')}</TableHead>
              <TableHead>{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  {tCommon('notFound')}
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    {brand.logo ? (
                      <Image
                        src={
                          brand.logo?.startsWith('/') ||
                          brand.logo?.startsWith('http')
                            ? brand.logo
                            : '/placeholder.svg' // fallback image in public/
                        }
                        alt={brand.name}
                        width={40}
                        height={40}
                        className="object-contain rounded border"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded" />
                    )}
                  </TableCell>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/brands/${brand.id}`)}
                      >
                        {tCommon('edit')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(brand.id)}
                      >
                        {tCommon('delete')}
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
