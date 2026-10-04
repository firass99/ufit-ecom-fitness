// app/(dashboard)/products/page.tsx
import {
  getActiveExpiredPromotions,
  getTopPromosUsed,
  getTotalPromotions,
} from '@/lib/actions/analytics/promotions';
import { ChartRadialStacked } from './_ui/chart-radial-stacked';
import { ChartBarTopPromotions } from './_ui/bar-chart-top-promotions';
import { getPromotions } from '@/lib/actions/promotions';
import PromotionsListClient from './list/promotions-list-client';
import { ChartBarStacked } from './_ui/chart-bar-stacked';
import { getTranslations } from 'next-intl/server';

export default async function PromotionsPage() {
  const t = await getTranslations('dashboard.sidebar');
  const tCommon = await getTranslations('dashboard.common');
  const [total, data, activeExpired] = await Promise.all([
    getTotalPromotions(),
    getTopPromosUsed(5),
    getActiveExpiredPromotions(),
  ]);

  const res = await getPromotions(1); // Page 1 by default

  return (
    <div className="flex flex-col gap-4 md:gap-6 ">
      <h1 className="text-2xl font-bold px-6">
        {tCommon('overview') + ' ' + t('promotions')}
      </h1>
      <div className="grid grid-cols-1 gap-4 px-6 lg:grid-cols-3 lg:px-6">
        <ChartRadialStacked total={total} />
        <ChartBarTopPromotions data={data} />

        <ChartBarStacked
          data={{
            active: activeExpired.active,
            inactive: activeExpired.expired,
          }}
        />
      </div>

      <div className="">
        <PromotionsListClient
          initialPromotions={res.data}
          totalPages={res.totalPages}
        />
      </div>
    </div>
  );
}
