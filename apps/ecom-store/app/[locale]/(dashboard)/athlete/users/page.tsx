import {
  getTotalUsers,
  getUsersDistributionByRoles,
} from '@/lib/actions/analytics/users';
import UsersPageClient from './users-page-client';

export default async function UsersPage() {
  const [totalUsers, usersDistributionByRoles] = await Promise.all([
    getTotalUsers(),
    getUsersDistributionByRoles(),
  ]);

  return (
    <UsersPageClient
      totalUsers={totalUsers}
      usersDistributionByRoles={usersDistributionByRoles}
    />
  );
}
