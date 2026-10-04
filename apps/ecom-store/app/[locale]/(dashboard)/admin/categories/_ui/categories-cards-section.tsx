import {
  getTotalCategories,
  getProductsPerCategory,
  getTopCategoriesBySales,
  getTopPerformingCategories,
} from '@/lib/actions/analytics/categories';

import { ChartRadialStat } from './chart-radial-stat';
import { ChartBarCategory } from './chart-bar-categories';
export default async function CategoriesCardsSection() {
  const [total, data] = await Promise.all([
    getTotalCategories(),
    getProductsPerCategory(),
  ]);
  console.log('total : ::::::s ::', total);
  console.log('perCategory : ::::::s ::', data);

  return (
    <div className=" grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 min-h-[33vh]">
      <ChartRadialStat total={total} />
      <ChartBarCategory data={data} />
    </div>
  );
}
