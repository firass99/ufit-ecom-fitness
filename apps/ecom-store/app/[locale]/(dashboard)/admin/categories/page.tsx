import {
  getTotalCategories,
  getProductsPerCategory,
  getTopPerformingCategories,
} from '@/lib/actions/analytics/categories';

import { ChartCategoryTotalsCard } from './_ui/chart-category-totals-card';
import { ChartPieCategoriesRevenue } from './_ui/chart-pie-categories-revenue';
import { ChartBarCategoriesVolume } from './_ui/chart-bar-categories-volume';
import { ChartRadialStat } from './_ui/chart-radial-stat';
import { ChartPieInteractive } from './_ui/chart-bar-categories';
export default async function CategoriesAnalyticsPage() {
  const [total, perCategory, topCategories] = await Promise.all([
    getTotalCategories(),
    getProductsPerCategory(),
    getTopPerformingCategories(5),
  ]);

  const perCategoryFormatted = perCategory.map((item) => ({
    label: item.category,
    value: item.productCount,
  }));

  const topFormatted = topCategories.map((item) => ({
    label: item.category,
    value: item.orderCount,
  }));

  console.log('topFormatted  :  ', topFormatted);

  return (
    <div className="flex flex-col min-h-screen gap-6 px-4 lg:px-6 py-6">
      {/* 🟢 Top Grid */}
      <div className=" grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 min-h-[33vh]">
        <ChartRadialStat
          title="Total Categories"
          total={total}
          unit="Categories"
        />
        <ChartPieInteractive />
      </div>
      <div className="min-h-[45vh]">
        <ChartBarCategoriesVolume data={topFormatted} />
      </div>
    </div>
  );
}
