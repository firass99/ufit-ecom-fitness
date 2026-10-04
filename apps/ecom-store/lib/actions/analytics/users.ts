'use server';

export interface UserRoleData {
  role: string;
  count: number;
}

export interface ActiveInactiveData {
  active: number;
  inactive: number;
}

export interface UsersCreatedMonthly {
  label: string;
  count: number;
}
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// ✅ 1. Get Total Users
export async function getTotalUsers(): Promise<number> {
  const res = await fetch(`${API_URL}/analytics/users`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ 2. Get Users By Role
export async function getUsersDistributionByRoles(): Promise<UserRoleData[]> {
  const res = await fetch(`${API_URL}/analytics/users/roles/distribution`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ 3. Get Active/Inactive Users
export async function getUsersDistributionByStatus(): Promise<ActiveInactiveData> {
  const res = await fetch(`${API_URL}/analytics/users/status/distribution`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ✅ 4. Get New Users by Month
export async function getUsersByDates(
  months?: number,
  startDate?: string,
  beforeDays?: string,
): Promise<UsersCreatedMonthly[]> {
  const params: Record<string, string> = {};

  if (months !== undefined) params.months = months.toString();
  if (startDate) params.startDate = startDate;
  if (beforeDays) params.beforeDays = beforeDays;

  const query = new URLSearchParams(params).toString();

  const res = await fetch(`${API_URL}/analytics/users/created?${query}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
