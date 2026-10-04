'use server';

import { Nutritionist } from '../types/types';

const USERS_ENDPOINT =
  process.env.NEXT_PUBLIC_USERS_ENDPOINT || 'http://localhost:5000';

export interface CreateNutritionistDto {
  workingAddress: string;
  phone: string;
  experience: string;
  cv: string;
}
export type UpdateNutritionistDto = Partial<CreateNutritionistDto>;

export async function createNutritionist(
  data: CreateNutritionistDto & { userId: string },
): Promise<Nutritionist> {
  const res = await fetch(`${USERS_ENDPOINT}/nutritionists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = 'Failed to create nutritionist';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function updateNutritionist(
  id: string,
  data: UpdateNutritionistDto,
): Promise<Nutritionist> {
  const res = await fetch(`${USERS_ENDPOINT}/nutritionists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = 'Failed to update nutritionist';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function getNutritionist(id: string): Promise<Nutritionist> {
  const res = await fetch(`${USERS_ENDPOINT}/nutritionists/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    // credentials: 'include', // only if you need cookies
  });
  if (!res.ok) {
    let msg = 'Failed to fetch nutritionist';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
