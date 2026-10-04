import { getCategories } from '@/lib/actions/categories';
import { getBrands } from '@/lib/actions/brands';
import AddProductClient from './add-product-client';

export default async function Page() {
  const [categoriesRes, brandsRes] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  const categories = categoriesRes?.data ?? [];
  const brands = brandsRes?.data ?? [];

  return <AddProductClient categories={categories} brands={brands} />;
}
