'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, deleteCategory } from '@/lib/actions/categories';
import { Category } from '@/lib/types/types';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { toast } from 'sonner';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export default function CategoriesListSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      const data = Array.isArray(res) ? res : (res.data ?? []);
      setCategories(
        data.map((cat) => ({
          ...cat,
          createdAt: cat.createdAt || new Date().toISOString(),
          updatedAt: cat.updatedAt || new Date().toISOString(),
        })),
      );
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="">
      <div className="flex justify-between mb-4">
        {/*         <h1 className="text-2xl font-bold">Categories</h1>
         */}{' '}
        <Button onClick={() => router.push('/admin/categories/add')}>
          {tCommon('add') + ' ' + tCommon('category')}
        </Button>
      </div>

      <div className="border rounded overflow-x-auto bg-background">
        {loading ? (
          <div className="p-6">
            <Skeleton className="h-8 w-1/2 mb-3" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full mb-2" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            {tCommon('category') + ' ' + tCommon('notFound')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tCommon('name')}</TableHead>
                <TableHead>{tCommon('description')}</TableHead>
                <TableHead>{tCommon('translations')}</TableHead>
                <TableHead>{tCommon('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {cat.translations && cat.translations.length > 0 ? (
                        cat.translations.map((tr, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Badge variant="outline">{tr.locale}</Badge>
                            <span className="font-semibold">{tr.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {tr.description}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {tCommon('no') + ' ' + tCommon('translations')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/admin/categories/${cat.id}`)
                        }
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2Icon className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
