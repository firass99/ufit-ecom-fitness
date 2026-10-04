import {
  getTotalOrders,
  getTotalRevenue,
  getOrderStatusDistribution,
  getTopSellingProducts,
  getOrdersCreatedByDates,
} from '@/lib/actions/analytics/orders';

import { ChartRadialStat } from './_ui/chart-radial-stat';
import { ChartPieStatus } from './_ui/chart-pie-orders-status'; /* 
import { ChartBarHorizontal } from './_ui/chart-bar-stacked'
import { ChartAreaMonthly } from './_ui/chart-area-orders-volume' */
import { ChartRadialStatRevenue } from './_ui/chart-radial-stat-revenue';
import { ChartAreaOrders } from './_ui/chart-area-orders';
import { getTranslations } from 'next-intl/server';

export default async function OrdersAnalyticsPage() {
  const [totalOrders, totalRevenue, statusData, topProducts, orderFlow] =
    await Promise.all([
      getTotalOrders(),
      getTotalRevenue(),
      getOrderStatusDistribution(),
      getTopSellingProducts(),
      getOrdersCreatedByDates(6),
    ]);

  const statusFormatted = statusData.map((item) => ({
    label: item.status,
    value: item.count,
  }));

  /*  const productsFormatted = topProducts.map((p) => ({
    label: p.name,
    value: p.totalSold,
  }));
  

  const orderFlowFormatted = orderFlow.map((item) => ({
    date: `${item.month} ${item.year}`,
    total: item.count,
  })) 
   */
  const tCommon = await getTranslations('dashboard.common');
  const t = await getTranslations('dashboard');

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto gap-6 px-4 lg:px-6 py-6">
      <h1 className="text-2xl font-bold">{`${tCommon('overview')} ${t('sidebar.orders')}`}</h1>
      {/* 📊 Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 min-h-[33vh]">
        <ChartRadialStat total={totalOrders} unit="Orders" />
        <ChartRadialStatRevenue total={totalRevenue} unit="$" />
        <ChartPieStatus data={statusFormatted} />
      </div>

      {/* 🥇 Top Products
      <div className="min-h-[45vh]">
        <ChartBarHorizontal title="Top Selling Products" data={productsFormatted} />
      </div> */}

      {/* 📈 Order Flow */}
      <div className="min-h-[45vh]">
        <ChartAreaOrders />
      </div>
    </div>
  );
}
