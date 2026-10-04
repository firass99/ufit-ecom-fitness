'use server';

export interface ProductCategoryData {
  id: string;
  category: string;
  count: number;
}

export interface ProductAvailability {
  available: number;
  outOfStock: number;
}

export interface ProductCreatedMonthly {
  month: string;
  year: number;
  count: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function getTotalProducts(): Promise<number> {
  const res = await fetch(`${API_URL}/analytics/products`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProductsAvailability(): Promise<ProductAvailability> {
  const res = await fetch(`${API_URL}/analytics/products/status/distribution`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTopProductCategoriesDistributions(): Promise<
  ProductCategoryData[]
> {
  const res = await fetch(
    `${API_URL}/analytics/products/categories/distribution`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProductsByCategory(): Promise<ProductCategoryData[]> {
  const res = await fetch(
    `${API_URL}/analytics/products/categories/distribution`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getProductsCreatedByDates(
  months: number = 6,
  startDate?: string,
  beforeDays?: string,
): Promise<ProductCreatedMonthly[]> {
  const query = new URLSearchParams({
    months: months.toString(),
    ...(startDate && { start: startDate }),
    ...(beforeDays && { before: beforeDays }),
  }).toString();

  const res = await fetch(`${API_URL}/analytics/products/created?${query}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
