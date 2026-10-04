'use server';
import { Athlete } from '../types/types';

const USERS_ENDPOINT =
  process.env.NEXT_PUBLIC_USERS_ENDPOINT || 'http://localhost:5000';

export interface CreateAthleteDto {
  age: number;
  weight: number;
  height: number;
  address: string;
  phone: string;
}

export type UpdateAthleteDto = Partial<CreateAthleteDto>;

// CREATE ATHLETE
export async function createAthlete(
  data: CreateAthleteDto & { userId: string },
): Promise<Athlete> {
  const res = await fetch(`${USERS_ENDPOINT}/athletes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = 'Failed to create athlete';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// UPDATE ATHLETE
export async function updateAthlete(
  id: string,
  data: UpdateAthleteDto,
): Promise<Athlete> {
  const res = await fetch(`${USERS_ENDPOINT}/athletes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = 'Failed to update athlete';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// GET ONE ATHLETE
export async function getAthlete(id: string): Promise<Athlete> {
  const res = await fetch(`${USERS_ENDPOINT}/athletes/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    let msg = 'Failed to fetch athlete';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// GET ALL ATHLETES
export async function getAllAthletes(): Promise<Athlete[]> {
  const res = await fetch(`${USERS_ENDPOINT}/athletes`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    let msg = 'Failed to fetch athletes';
    try {
      const error = await res.json();
      msg = error?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
