'use server';

export interface BrandStat {
  name: string;
  count: number;
}

export interface BrandsProductSplit {
  withProducts: number;
  withoutProducts: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function getTotalBrands(): Promise<number> {
  const res = await fetch(`${API_URL}/analytics/brands`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getBrandsQuantityDistribution(): Promise<BrandsProductSplit> {
  const res = await fetch(`${API_URL}/analytics/brands/quantity/distribution`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTopBrandsProductsDistribution(
  limit: number = 5,
): Promise<BrandStat[]> {
  const res = await fetch(
    `${API_URL}/analytics/brands/products/distribution?limit=${limit}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
