'use server';
import { Coach } from '../types/types';

const USERS_ENDPOINT =
  process.env.NEXT_PUBLIC_USERS_ENDPOINT || 'http://localhost:5000';

export interface CreateCoachDto {
  gymAddress: string;
  experience: string;
  phone: string;
  specialities: string[];
}

export type UpdateCoachDto = Partial<CreateCoachDto>;

// CREATE
export async function createCoach(
  data: CreateCoachDto & { userId: string },
): Promise<Coach> {
  const res = await fetch(`${USERS_ENDPOINT}/coaches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = 'Failed to create coach';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// UPDATE
export async function updateCoach(
  id: string,
  data: UpdateCoachDto,
): Promise<Coach> {
  const res = await fetch(`${USERS_ENDPOINT}/coaches/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = 'Failed to update coach';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// GET ONE
export async function getCoach(id: string): Promise<Coach> {
  const res = await fetch(`${USERS_ENDPOINT}/coaches/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    let msg = 'Failed to fetch coach';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// GET ALL
export async function getAllCoaches(): Promise<Coach[]> {
  const res = await fetch(`${USERS_ENDPOINT}/coaches`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    let msg = 'Failed to fetch coaches';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
