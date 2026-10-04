'use server';

import { revalidateTag } from 'next/cache';

export interface CategoryTranslationDto {
  id: string;
  locale: string;
  name: string;
  description?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  image?: string;
  translations: CategoryTranslationDto[];
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  image?: string;
  translations?: CategoryTranslationDto[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  translations?: CategoryTranslationDto[];
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_NEST_BACKEND_URL;

const defaultFetchOptions: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  cache: 'force-cache',
};

// --- GET ALL CATEGORIES ---

export async function getCategories(
  lang?: string,
): Promise<{ data: Category[] }> {
  try {
    const res = await fetch(
      `${API_URL}/categories${lang ? `?lang=${lang}` : ''}`,
      {
        ...defaultFetchOptions,
        method: 'GET',
        next: { tags: ['categories'] }, // ✅ same here
        // cache: 'no-store' if needed
      },
    );

    if (!res.ok) {
      const text = await res.text(); // Get backend error
      console.error('Backend /categories error:', text);
      throw new Error(`Failed to fetch categories (${res.status})`);
    }

    const json = await res.json();
    return { data: json };
  } catch (err) {
    console.error('getCategories error:', err);
    return { data: [] }; // or throw if you want to fail hard
  }
}

// --- GET ONE CATEGORY ---
export async function getCategory(id: string): Promise<Category> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    next: { tags: ['categories'] }, // ✅ same here
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error((await response.text()) || undefined);
  }
  return response.json();
}

// --- CREATE CATEGORY ---
export async function createCategory(
  data: CreateCategoryDto,
): Promise<{ data: Category }> {
  const res = await fetch(`${API_URL}/categories`, {
    ...defaultFetchOptions,
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok)
    throw new Error(`Failed to create category: ${await res.text()}`);
  revalidateTag('categories'); // ✅ invalidate cache

  return { data: await res.json() };
}

// --- UPDATE CATEGORY ---
export async function updateCategory(
  id: string,
  data: UpdateCategoryDto,
): Promise<{ data: Category }> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    ...defaultFetchOptions,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok)
    throw new Error(`Failed to update category: ${await res.text()}`);
  revalidateTag('categories'); // ✅ invalidate cache

  return { data: await res.json() };
}

// --- DELETE CATEGORY ---
export async function deleteCategory(
  id: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${API_URL}/categories/${id}`, {
    ...defaultFetchOptions,
    method: 'DELETE',
  });
  if (!res.ok)
    throw new Error(`Failed to delete category: ${await res.text()}`);
  revalidateTag('categories'); // ✅ invalidate cache

  return { success: true };
}

// --- UPLOAD CATEGORY IMAGE ---
export async function uploadCategoryImage(
  id: string,
  file: File,
): Promise<{ data: Category }> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_URL}/categories/${id}/image`, {
    method: 'PATCH',
    body: formData,
    credentials: 'include',
  });
  if (!res.ok)
    throw new Error(`Failed to upload category image: ${await res.text()}`);
  return { data: await res.json() };
}

export async function getCategoriesAnalytics() {
  const res = await fetch('http://localhost:5000/orders?page=1&limit=9999');
  const { data: orders } = await res.json();

  const categoryMap: Record<
    string,
    { label: string; revenue: number; count: number }
  > = {};

  for (const order of orders) {
    for (const item of order.items) {
      const product = item.variant?.product || item.product;
      const categoryId = product?.categoryId;
      const categoryLabel = product?.name || 'Unknown Category';
      const quantity = item.quantity ?? 0;
      const price = parseFloat(item.price ?? '0');
      const total = quantity * price;

      if (!categoryId) continue;

      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          label: categoryLabel,
          revenue: 0,
          count: 0,
        };
      }

      categoryMap[categoryId].count += quantity;
      categoryMap[categoryId].revenue += total;
    }
  }

  const barVolume = Object.entries(categoryMap).map(([id, entry], i) => ({
    label: entry.label,
    value: entry.count,
    fill: `hsl(var(--chart-${(i % 5) + 1}))`,
  }));

  const pieRevenue = Object.entries(categoryMap).map(([id, entry], i) => ({
    label: entry.label,
    value: parseFloat(entry.revenue.toFixed(2)),
    fill: `hsl(var(--chart-${(i % 5) + 1}))`,
  }));

  const total = Object.entries(categoryMap).map(([id, entry]) => ({
    id,
    name: entry.label,
    revenue: parseFloat(entry.revenue.toFixed(2)),
    count: entry.count,
  }));

  return {
    barVolume,
    pieRevenue,
    total,
  };
}
