'use server';

import { Promo } from '@prisma/client';
import { Promotion } from '../types/types';

export interface CreatePromotionDto {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  maxUsage?: number;
  expiresAt?: Date;
}

export interface PromotionDto {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  isActive: boolean;
  maxUsage?: number;
  expiresAt?: Date;
}
type PromotionListResponse = {
  data: Promotion[];
  totalPages: number;
  page: number;
  total: number;
};

export interface UpdatePromotionDto extends Partial<CreatePromotionDto> {}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPromotions(page: number = 1, limit: number = 10) {
  const res = await fetch(`${API_URL}/promotions?page=${page}&limit=${limit}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json(); // Returns { data, total, page, totalPages }
}

export async function validatePromotionCode(
  code: string,
): Promise<PromotionDto> {
  const res = await fetch(`${API_URL}/promotions/validate`, {
    method: 'POST', // ✅ required
    headers: { 'Content-Type': 'application/json' }, // ✅ required
    body: JSON.stringify({ code }), // ✅ must be wrapped in object
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function getPromotion(id: string): Promise<any> {
  const res = await fetch(`${API_URL}/promotions/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function createPromotion(data: CreatePromotionDto) {
  const res = await fetch(`${API_URL}/promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function updatePromotion(id: string, data: UpdatePromotionDto) {
  const res = await fetch(`${API_URL}/promotions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function deletePromotion(id: string) {
  const res = await fetch(`${API_URL}/promotions/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
