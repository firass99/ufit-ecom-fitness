import { ChartAreaOrders } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import {
  getOrdersCreatedByDates,
  getTotalOrders,
} from '@/lib/actions/analytics/orders';
import { getTotalUsers } from '@/lib/actions/analytics/users';
import { getTotalProducts } from '@/lib/actions/analytics/products';
import { getTotalCategories } from '@/lib/actions/analytics/categories';
import { getTotalBrands } from '@/lib/actions/analytics/brands';
import { getTotalPromotions } from '@/lib/actions/analytics/promotions';

export default async function AdminDashboardPage() {
  const [orders, users, products, categories, brands, promotions] =
    await Promise.all([
      getTotalOrders(),
      getTotalUsers(),
      getTotalProducts(),
      getTotalCategories(),
      getTotalBrands(),
      getTotalPromotions(),
    ]);
  const stats = {
    totalUsers: users,
    totalOrders: orders,
    totalProducts: products,
    totalCategories: categories,
    totalBrands: brands,
    totalPromotions: promotions,
  };
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards stats={stats} />
      <div className="px-4 lg:px-6">
        <ChartAreaOrders />
      </div>
    </div>
  );
}
