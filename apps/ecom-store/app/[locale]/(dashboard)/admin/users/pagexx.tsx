import {
  getUsersByRole,
  getNewUsersByMonth,
  getActiveInactiveUsers,
  getTotalUsers,
} from '@/lib/actions/analytics/users';

import { ChartBarStacked } from './_ui/chart-bar-stacked';
import { ChartRadialStacked } from './_ui/chart-radial-stacked';
import { ChartPieLabelList } from './_ui/chart-pie-label-list';
import { ChartBarUsers } from './_ui/chart-area-users';

export default async function UsersPage() {
  const [totalUsers, roles, status, created] = await Promise.all([
    getTotalUsers(),
    getUsersByRole(),
    getActiveInactiveUsers(),
    getNewUsersByMonth(6),
  ]);

  const createdFormatted = created.map((item) => ({
    date: `${item.month} ${item.year}`,
    total: item.count,
  }));

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto gap-6 px-4 lg:px-6 py-6">
      {/* Top: three compact cards/charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChartPieLabelList data={roles} />
        <ChartBarStacked data={status} />
        <ChartRadialStacked total={totalUsers} />
      </div>

      {/* Bottom: full width chart */}
      <div>
        <ChartBarUsers data={createdFormatted} />
      </div>
    </div>
  );
}
