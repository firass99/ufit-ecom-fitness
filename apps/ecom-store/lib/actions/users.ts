'use server';

import { number } from 'zod';
import { User } from '../types/types';
import { getSession } from './session';

export interface CreateUserDto {
  email: string;
  fullName: string;
}

export interface UpdateUserDto {
  email?: string;
  fullName?: string;
}

type GetUsersOptions = {
  page?: number;
  limit?: number;
};
const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const USERS_ENDPOINT = `${API_URL}/users`;

// Get all userstype
export async function getUsers({ page = 1, limit = 10 }: GetUsersOptions = {}) {
  const res = await fetch(`${USERS_ENDPOINT}?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch users');

  return res.json(); // returns { data: User[], totalPages: number }
}

// Get user by ID
export async function getUser(id: string): Promise<User> {
  const res = await fetch(`${USERS_ENDPOINT}/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User> {
  const res = await fetch(
    `${USERS_ENDPOINT}/email/find?email=${encodeURIComponent(email)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to fetch user by email');
  return res.json();
}

// Create user
export async function createUser(data: CreateUserDto): Promise<User> {
  const res = await fetch(`${USERS_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

// Update user
export async function updateUser(
  id: string,
  data: UpdateUserDto,
): Promise<User> {
  const res = await fetch(`${USERS_ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

// Delete user
export async function deleteUser(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${USERS_ENDPOINT}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

// lib/actions/user-analytics.ts
export async function getUserAnalytics() {
  const res = await fetch('http://localhost:5000/users?page=1&limit=9999', {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch users');
  const { data: users } = await res.json();

  const rolesMap = new Map<string, number>();
  let active = 0;
  let inactive = 0;
  const daily = new Map<string, number>();

  for (const user of users) {
    rolesMap.set(user.role, (rolesMap.get(user.role) ?? 0) + 1);
    user.isActive ? active++ : inactive++;

    const dateKey = new Date(user.createdAt).toISOString().split('T')[0];
    daily.set(dateKey, (daily.get(dateKey) ?? 0) + 1);
  }

  const roles = Array.from(rolesMap.entries()).map(([role, value], i) => ({
    browser: role,
    visitors: value,
    fill: `hsl(var(--chart-${i + 1}))`,
  }));

  const created = Array.from(daily.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, total]) => ({ date, total }));

  return {
    totalUsers: users.length,
    roles,
    status: { active, inactive },
    created,
  };
}
