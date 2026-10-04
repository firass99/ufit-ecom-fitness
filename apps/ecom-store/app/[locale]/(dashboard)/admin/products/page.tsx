import {
  getTotalProducts,
  getProductsAvailability,
  getProductsByCategory,
  getProductsCreatedByDates,
} from '@/lib/actions/analytics/products';

import { ChartRadialStacked } from './_ui/chart-radial-stacked';
import { ChartPieStockStatus } from './_ui/chart-bar-stackedxx';
import { ChartAreaMonthly } from './_ui/chart-area-products';
import { getTopSellingProducts } from '@/lib/actions/analytics/orders';
import { ChartPieInteractive } from './_ui/chart-pie-interactice-categories';

export default async function ProductsAnalyticsPage() {
  const [total, topProducts, availability, categories, createdFlow] =
    await Promise.all([
      getTotalProducts(),
      getTopSellingProducts(),
      getProductsAvailability(),
      getProductsByCategory(),
      getProductsCreatedByDates(6),
    ]);

  const createdFormatted = createdFlow.map((item) => ({
    date: `${item.month} ${item.year}`,
    total: item.count,
  }));
  const productsFormatted = topProducts.map((p) => ({
    label: p.name,
    value: p.totalSold,
  }));
  //console.log("This is topProducts : ", topProducts);

  // Transform data to include fill property with CSS variables
  const categoryData = (categories || []).map((item, index) => ({
    ...item,
    fill: `hsl(var(--color-${item.category.toLowerCase().replace(/\s+/g, '-')}))`,
  }));

  return (
    <div className="flex flex-col min-h-screen gap-6 px-4 lg:px-6 py-6">
      {/* 🟢 Top Grid */}
      <div className=" grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 min-h-[33vh]">
        {/* 1️⃣ Total Products (Radial stacked chart with a single bar) */}
        <ChartRadialStacked total={total} />
        <ChartPieStockStatus
          available={availability.available}
          outOfStock={availability.outOfStock}
        />
        <ChartPieInteractive categoriesData={categoryData} />
      </div>

      {/* 📈 Bottom Chart: Product Flow Over Time */}
      <div className="min-h-[45vh]">
        <ChartAreaMonthly
          title="Product Flow Over Time"
          data={createdFormatted}
        />
      </div>
    </div>
  );
}
