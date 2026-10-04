import {
  getTotalProducts,
  getProductsAvailability,
  getProductsByCategory,
  getProductsCreatedByDates,
  getTopProductCategoriesDistributions,
} from '@/lib/actions/analytics/products';

import { ChartRadialStacked } from './chart-radial-stacked';
import { ChartPieStockStatus } from './chart-bar-stackedxx';
import { getTopSellingProducts } from '@/lib/actions/analytics/orders';
import { ChartPieInteractive } from './chart-pie-interactice-categories';

export default async function ProductsCardsSection() {
  const [
    total,
    topProducts,
    availability,
    categories,
    createdFlow,
    productsCategoriesDistribution,
  ] = await Promise.all([
    getTotalProducts(),
    getTopSellingProducts(),
    getProductsAvailability(),
    getProductsByCategory(),
    getProductsCreatedByDates(6),
    getTopProductCategoriesDistributions(), // ✅ newly added
  ]);

  const createdFormatted = createdFlow.map((item) => ({
    date: `${item.month} ${item.year}`,
    total: item.count,
  }));
  const productsFormatted = topProducts.map((p) => ({
    label: p.name,
    value: p.totalSold,
  }));

  console.log(
    'This is productsCategoriesDistribution : ',
    productsCategoriesDistribution,
  );

  const categoriesData = productsCategoriesDistribution.map((item, i) => ({
    category: item.category,
    count: item.count,
    fill: `hsl(var(--chart-${(i % 5) + 1}))`,
  }));

  console.log('categoriesData  SERVER  : ', categoriesData);

  return (
    <>
      {/* 🟢 Top Grid */}
      <div className=" grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 min-h-[33vh]">
        <ChartRadialStacked total={total} />

        {/* 2️⃣ Stock Status Pie with Legend */}
        <ChartPieStockStatus
          available={availability.available}
          outOfStock={availability.outOfStock}
        />
        <ChartPieInteractive categoriesData={categoriesData} />
      </div>
    </>
  );
}
