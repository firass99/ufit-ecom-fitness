// apps/ecom-store/app/[locale]/(dashboard)/admin/users/page.tsx

import { getUsers } from '@/lib/actions/users';
import UsersTableClient from './users-table-client';

type Props = {
  searchParams: { page?: string };
};

export default async function UsersPage({ searchParams }: Props) {
  const page = Number(searchParams?.page || 1);

  const res = await getUsers({ page, limit: 10 });

  return (
    <UsersTableClient initialUsers={res.data} totalPages={res.totalPages} />
  );
}
