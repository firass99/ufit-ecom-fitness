'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function getBrands(page: number = 1, limit: number = 10) {
  const res = await fetch(`${API_URL}/brands?page=${page}&limit=${limit}`, {
    cache: 'no-store',
    next: { tags: ['brands'] },
  });

  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
}

export async function getBrand(id: string) {
  const res = await fetch(`${API_URL}/brands/${id}`, {
    cache: 'no-store',
    next: { tags: ['brands'] },
  });

  if (!res.ok) throw new Error('Failed to fetch brand');
  return res.json();
}

export async function createBrand(data: { name: string; logo?: string }) {
  const res = await fetch(`${API_URL}/brands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to create brand');
  }

  return res.json();
}

export async function updateBrand(
  id: string,
  data: { name?: string; logo?: string },
) {
  const res = await fetch(`${API_URL}/brands/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to update brand');
  }

  return res.json();
}

export async function deleteBrand(id: string) {
  const res = await fetch(`${API_URL}/brands/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'Failed to delete brand');
  }

  return true;
}
