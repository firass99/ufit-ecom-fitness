'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { Currency, Gender, Size } from '@prisma/client';

// ----- Types -----

export interface VariantPriceDto {
  currency: Currency;
  price: number;
  salePrice?: number;
  saleStartAt?: Date;
  saleEndAt?: Date;
}

export interface VariantDto {
  id?: string;
  size?: Size;
  color?: string;
  gender: Gender;
  stock: number;
  prices: VariantPriceDto[];
}

export interface ProductTranslationDto {
  locale: string;
  name: string;
  description: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  categoryId: string;
  brandId: string;
  images?: string[];
  translations: ProductTranslationDto[];
  prices?: VariantPriceDto[]; // Required if hasVariants is false
  variants?: VariantDto[]; // Required if hasVariants is true
  stock?: number;
  isAvailable?: boolean;
  hasVariants: boolean; // ✅ REQUIRED for backend logic
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// ----- Config -----
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type FilterProductsDto = {
  sizes?: string[];
  genders?: string[];
  colors?: string[];
  categoryId?: string;
  brandId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc'; // no 'lang', no min/max
  isAvailable?: 'true'; // send only when checked
};

function toQueryString(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (
      v === undefined ||
      v === null ||
      v === '' ||
      v === 'all' ||
      v === 'none'
    )
      continue;
    if (Array.isArray(v)) {
      if (v.length) sp.set(k, v.join(','));
    } else {
      sp.set(k, String(v));
    }
  }
  return sp.toString();
}

export async function getProducts(filters: FilterProductsDto = {}) {
  const qs = toQueryString(filters);
  const res = await fetch(`${API_URL}/products${qs ? `?${qs}` : ''}`, {
    next: { tags: ['products'] },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Failed to fetch products');
  }

  return res.json();
}

// ----- Fetch Single Product -----
export async function getProduct(id: string, currency?: Currency) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    next: { tags: ['products'] },
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Failed to fetch product');
  }

  return res.json();
}

// ----- Create Product -----
export async function createProduct(data: CreateProductDto) {
  console.log('tHIS IS PRODUCT DTO : ', data);

  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  console.log('THIS IS NEW PRODUCTS ::::  ', data);

  if (!res.ok) {
    let message = 'Failed to create product';
    try {
      const json = await res.json();
      message = json.message || JSON.stringify(json);
    } catch {
      message = await res.text();
    }
    throw new Error(message);
  }

  revalidateTag('products');
  return res.json();
}

// ----- Update Product -----
export async function updateProduct(id: string, data: UpdateProductDto) {
  console.log('this is update product DATA TO NEST JS :', data);

  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let message = 'Failed to update product';
    try {
      const json = await res.json();
      message = json.message || JSON.stringify(json);
    } catch {
      message = await res.text();
    }
    throw new Error(message);
  }

  revalidateTag('products');
  return res.json();
}

// ----- Delete Product -----
export async function deleteProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Failed to delete product');
  }

  revalidateTag('products');
  revalidatePath('/admin/products/list');
  return res.json();
}

// ----- Upload Image -----
export async function uploadProductImage(id: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/products/${id}/images`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Failed to upload image');
  }

  return res.json();
}

// ----- Delete Image -----
export async function deleteProductImage(id: string, imageUrl: string) {
  const res = await fetch(`${API_URL}/products/${id}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Failed to delete image');
  }

  return res.json();
}
