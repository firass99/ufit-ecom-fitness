import {
  getTotalCategories,
  getProductsPerCategory,
  getTopPerformingCategories,
} from '@/lib/actions/analytics/categories';

import { ChartCategoryTotalsCard } from './_ui/chart-category-totals-card';
import { ChartPieCategoriesRevenue } from './_ui/chart-pie-categories-revenue';
import { ChartBarCategoriesVolume } from './_ui/chart-bar-categories-volume';
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

  return (
    <div className="flex flex-col min-h-screen gap-6 px-4 py-6 lg:px-6">
      {/* 🟢 Top Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[33vh]">
        <ChartCategoryTotalsCard
          data={[
            { id: 'total', name: 'Total Categories', revenue: 0, count: total },
          ]}
        />
        <ChartPieCategoriesRevenue
          data={perCategoryFormatted.map((item, i) => ({
            ...item,
            fill: `var(--chart-${(i % 5) + 1})`,
          }))}
        />
      </div>

      {/* 🔽 Bottom: Top Categories by Revenue */}
      <div className="min-h-[45vh]">
        <ChartBarCategoriesVolume data={topFormatted} />
      </div>
    </div>
  );
}
