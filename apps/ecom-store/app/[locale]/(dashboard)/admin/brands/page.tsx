// app/(dashboard)/products/page.tsx
import { ChartPieSeparatorNone } from './_ui/chart-pie-separator-none';
import { ChartRadialStacked } from './_ui/chart-radial-stacked';
import { getBrands } from '@/lib/actions/brands';
import BrandListClient from './list/brands-list-client';
import {
  getTopBrandsProductsDistribution,
  getTotalBrands,
} from '@/lib/actions/analytics/brands';
import { ChartBarTopBrands } from './_ui/bar-chart-top-brands';
import { getTranslations } from 'next-intl/server';

export default async function BrandsPage() {
  const t = await getTranslations('dashboard.sidebar');
  const tCommon = await getTranslations('dashboard.common');

  const [productsBrandsCount, totalBrands] = await Promise.all([
    getTopBrandsProductsDistribution(5),
    getTotalBrands(),
  ]);

  const res = await getBrands(1); // fetch first page
  console.log('THESE ARE THE BRANDS  ::  ', res.data);

  return (
    <div className="flex flex-col gap-4 md:gap-6 ">
      <h1 className="text-2xl font-bold px-6">
        {tCommon('overview') + ' ' + t('brands')}
      </h1>

      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-2 lg:px-6">
        <ChartRadialStacked total={totalBrands} />
        <ChartBarTopBrands data={productsBrandsCount} />
      </div>

      <div className="px-4 lg:px-6">
        <BrandListClient initialBrands={res.data} totalPages={res.totalPages} />
      </div>
    </div>
  );
}
