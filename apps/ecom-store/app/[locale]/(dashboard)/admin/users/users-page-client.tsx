'use client';

import { DashboardWrapper } from '@/components/ui/dashboard-wrapper';
import { useTranslations } from 'next-intl';
import { ChartRadialStacked } from './_ui/chart-radial-stacked';
import { ChartPieLabelList } from './_ui/chart-pie-label-list';
import { ChartAreaUsers } from './_ui/chart-area-users';

interface UsersPageClientProps {
  totalUsers: number;
  usersDistributionByRoles: any[];
}

export default function UsersPageClient({
  totalUsers,
  usersDistributionByRoles,
}: UsersPageClientProps) {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('dashboard.common');

  return (
    /*     <DashboardWrapper 
      title={`${t('sidebar.users')} ${t('sidebar.overview')}`}
      description={`${tCommon('overview')} ${t('sidebar.users')} ${tCommon('analytics')}`}
    > */
    <div className="flex flex-col min-h-screen overflow-y-auto gap-6 px-4 lg:px-6 py-6">
      <h1 className="text-2xl font-bold">{`${tCommon('overview')} ${t('sidebar.users')}`}</h1>
      <div className="flex flex-col gap-6">
        {/* Top: charts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          <ChartRadialStacked total={totalUsers} />
          <ChartPieLabelList data={usersDistributionByRoles} />
        </div>

        {/* Bottom: full width chart */}
        <div>
          <ChartAreaUsers />
        </div>
      </div>
    </div>
  );
}
