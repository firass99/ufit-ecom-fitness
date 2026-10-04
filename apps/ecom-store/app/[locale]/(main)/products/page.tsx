import ProductGrid from '@/components/product-grid';
import { getCategories } from '@/lib/actions/categories';
import { getProducts, type FilterProductsDto } from '@/lib/actions/products';
import { getBrands } from '@/lib/actions/brands';

export const dynamic = 'force-dynamic';

type SP = Record<string, string | string[] | undefined> | undefined;

function one(sp: NonNullable<SP>, key: string, def = ''): string {
  const v = sp?.[key];
  const s = Array.isArray(v) ? v[0] : v;
  if (!s || s === 'all') return def;
  return s;
}

function arr(sp: NonNullable<SP>, key: string): string[] {
  const v = sp?.[key];
  const list = Array.isArray(v) ? v : v ? [v] : [];
  return list.filter(Boolean).filter((x) => x !== 'all') as string[];
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { locale } = await params;

  const page = Number(one(sp, 'page', '1')) || 1;
  const categoryId = one(sp, 'categoryId', '');
  const brandId = one(sp, 'brandId', '');
  const sortParam = one(sp, 'sort', ''); // 'price_asc' | 'price_desc' | ''
  const sort =
    sortParam === 'price_asc' || sortParam === 'price_desc'
      ? sortParam
      : undefined;
  const genders = arr(sp, 'gender');
  const sizes = arr(sp, 'size');
  const isAvailable = one(sp, 'isAvailable', ''); // 'true' or ''

  const filters: FilterProductsDto = {
    page,
    limit: 12,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    genders: genders.length ? genders : undefined,
    sizes: sizes.length ? sizes : undefined,
    sort,
    isAvailable: isAvailable === 'true' ? ('true' as const) : undefined,
  };

  const [productsData, categoriesData, brandsData] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getBrands(),
  ]);

  return (
    <ProductGrid
      data={productsData.data ?? []}
      totalPages={productsData.totalPages ?? 1}
      page={productsData.page ?? page}
      categories={categoriesData.data ?? []}
      brands={brandsData?.data ?? brandsData ?? []}
      sizes={['XS', 'S', 'M', 'L', 'XL']}
      genders={['MEN', 'WOMEN', 'UNISEX']}
      filters={filters}
    />
  );
}
