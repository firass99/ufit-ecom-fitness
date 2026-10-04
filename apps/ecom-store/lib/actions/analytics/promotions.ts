'use server';

export interface PromotionStatus {
  active: number;
  expired: number;
}

export interface PromoTypeStat {
  type: string;
  count: number;
}

export interface TopPromo {
  code: string;
  used: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export async function getTotalPromotions(): Promise<number> {
  const res = await fetch(`${API_URL}/analytics/promotions`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getActiveExpiredPromotions(): Promise<PromotionStatus> {
  const res = await fetch(`${API_URL}/analytics/promotions/status`, {
    cache: 'no-store',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getPromotionsByType(): Promise<PromoTypeStat[]> {
  const res = await fetch(
    `${API_URL}/analytics/promotions/types/distribution`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTopPromosUsed(limit: number): Promise<TopPromo[]> {
  const res = await fetch(
    `${API_URL}/analytics/promotions/top?limit=${limit}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
