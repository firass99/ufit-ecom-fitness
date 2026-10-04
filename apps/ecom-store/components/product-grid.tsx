'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import ProductFilters from './product-filter';
import { Skeleton } from '@repo/design-system/components/ui/skeleton';
import { Button } from '@repo/design-system/components/ui/button';

interface Product {
  id: string;
  name: string;
  images: string[];
  category: { id: string; name: string };
  brandId?: string;
  brand?: { id: string; name: string } | null;
  variants: {
    id: string;
    size: string;
    color: string;
    stock: number;
    price?: string | number;
    prices?: { currency: string; price: number }[];
  }[];
  translations?: { locale: string; name: string; description: string }[];
}

interface Category {
  id: string;
  name: string;
  translations?: { locale: string; name: string; description?: string }[];
}

interface Brand {
  id: string | number;
  name: string;
}

interface Props {
  data: Product[];
  totalPages: number;
  page: number;
  categories: Category[];
  brands: Brand[];
  sizes: string[];
  genders: string[];
  filters: any;
  loading?: boolean;
}

export default function ProductGrid({
  data,
  page,
  totalPages,
  categories,
  brands,
  sizes,
  genders,
  filters,
  loading = false,
}: Props) {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (newPage === 1) params.delete('page');
    else params.set('page', String(newPage));
    router.push(`/${locale}/products?${params.toString()}`);
  };

  const getTranslation = (obj: { name: string; translations?: any[] }) => {
    if (locale && obj.translations?.length) {
      const t = obj.translations.find((tr: any) => tr.locale === locale);
      if (t?.name) return t.name;
    }
    return obj.name;
  };

  return (
    <section className="container max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="md:w-1/4 w-full md:sticky md:top-24">
          <ProductFilters
            categories={categories}
            brands={brands}
            sizes={sizes}
            genders={genders}
            locale={locale}
            filters={filters}
          />
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold">
              {locale === 'ar' ? 'منتجاتنا' : 'Explore Our Product Collection'}
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="border rounded-lg shadow-sm overflow-hidden p-4"
                >
                  <Skeleton className="w-full h-56 mb-4" />
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>{locale === 'ar' ? 'لا توجد منتجات' : 'No products found.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.map((product) => {
                const productImg =
                  product.images?.[0] ||
                  'https://ui.shadcn.com/placeholder.svg?text=No+Image';
                const name = getTranslation(product);
                const brandName = product.brand?.name ?? '';

                return (
                  <div
                    key={product.id}
                    className="group border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    <Link
                      href={`/${locale}/products/${product.id}`}
                      tabIndex={-1}
                    >
                      <div className="relative h-56 w-full overflow-hidden">
                        <Image
                          src={productImg}
                          alt={name}
                          fill
                          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          priority={false}
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <h2 className="font-semibold text-lg">{name}</h2>
                      {brandName ? (
                        <p className="text-sm text-muted-foreground mt-1">
                          {brandName}
                        </p>
                      ) : null}
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                        className="w-full mt-4"
                      >
                        <Link
                          href={`/${locale}/products/${product.id}`}
                          aria-label={`View ${name}`}
                        >
                          {locale === 'ar' ? 'عرض المنتج' : 'View Product'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-wrap justify-center items-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
              >
                {locale === 'ar' ? 'السابق' : 'Previous'}
              </Button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === page;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - page) <= 1
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => goToPage(pageNum)}
                      disabled={isActive}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                if (
                  (pageNum === page - 2 && page > 3) ||
                  (pageNum === page + 2 && page < totalPages - 2)
                ) {
                  return (
                    <span
                      key={`ellipsis-${pageNum}`}
                      className="px-2 text-muted"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => goToPage(page + 1)}
              >
                {locale === 'ar' ? 'التالي' : 'Next'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
