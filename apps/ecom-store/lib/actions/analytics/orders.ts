'use server';

export interface RevenueStat {
  totalRevenue: number;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
}

export interface OrderCreatedMonthly {
  label: string;
  count: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function getTotalOrders(): Promise<number> {
  const res = await fetch(`${API_URL}/analytics/orders`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export async function getTotalRevenue(): Promise<number> {
  const res = await fetch(`${API_URL}/analytics/orders/revenue`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTopSellingProducts(
  limit: number = 5,
): Promise<TopProduct[]> {
  const res = await fetch(
    `${API_URL}/analytics/orders/top-products?limit=${limit}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOrderStatusDistribution(): Promise<
  OrderStatusDistribution[]
> {
  const res = await fetch(`${API_URL}/analytics/orders/status/distribution`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* export async function getOrdersCreatedByDates(
    months: number | undefined,
    startDate?: string,
    beforeDays?: string
): Promise<OrderCreatedMonthly[]> {
    const query = new URLSearchParams({
        months: months?.toString() || '6',
        ...(startDate && { start: startDate }),
        ...(beforeDays && { before: beforeDays }),
    }).toString()

    const res = await fetch(`${API_URL}/analytics/orders/created?${query}`, {
        cache: 'no-store',
        credentials: 'include',
    })

    if (!res.ok) throw new Error(await res.text())
    return res.json()
}
 */

export async function getOrdersCreatedByDates(
  months?: number,
  startDate?: string,
  beforeDays?: string,
): Promise<OrderCreatedMonthly[]> {
  const params: Record<string, string> = {};

  if (months !== undefined) params.months = months.toString();
  if (startDate) params.startDate = startDate;
  if (beforeDays) params.beforeDays = beforeDays;

  const query = new URLSearchParams(params).toString();

  const res = await fetch(`${API_URL}/analytics/orders/created?${query}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
