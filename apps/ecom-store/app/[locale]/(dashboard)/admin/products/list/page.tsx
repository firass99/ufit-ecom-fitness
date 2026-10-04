// app/admin/products/list/page.tsx
import { getProducts } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';
import ClientProductList from './product-list-client';
import ProductsCardsSection from '../_ui/products-cards';
import { useLocale } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';

export default async function ProductsListPage() {
  const [categoriesRes, productsRes] = await Promise.all([
    getCategories(),
    getProducts({ page: 1 }), // Fetch first page by default
  ]);
  console.log('THISSS IS PRODUCTS ... ', productsRes);

  const locale = await getLocale();
  const t = await getTranslations('dashboard.sidebar');
  return (
    <div className="flex flex-col min-h-screen gap-6 px-4 lg:px-6 py-6">
      {/*         <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
       */}{' '}
      <h1 className="text-2xl font-bold">{t('products')}</h1>
      <ProductsCardsSection />
      <ClientProductList
        initialProducts={productsRes.data}
        totalPages={productsRes.totalPages}
        initialCategories={categoriesRes.data || []}
      />
    </div>
  );
}
