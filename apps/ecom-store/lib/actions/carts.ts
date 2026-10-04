'use server';

import { Cart } from '@/lib/types/types';
import { Currency } from '@prisma/client';

export interface CreateCartDto {
  userId: string;
  currency: string;
}

export interface UpdateCartDto {
  userId: string;
  amount: number;
}
export interface AddToCartDto {
  productId?: string;
  variantId?: string;
  quantity: number;
  currency: string;
}

export interface RemoveFromCartDto {
  userId: string;
  productId?: string;
  variantId?: string;
}

export interface ClearCartDto {
  userId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get user's cart
export async function getCart(userId: string): Promise<Cart> {
  const res = await fetch(`${API_URL}/carts/${userId}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Create a new cart
export async function createCart(data: CreateCartDto): Promise<Cart> {
  const res = await fetch(`${API_URL}/carts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
//Reduce Cart Total

export async function reduceCartTotal(data: UpdateCartDto): Promise<Boolean> {
  const response = await fetch(`${API_URL}/carts/${data.userId}/reduce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error((await response.text()) || 'Failed to add item to cart');
  }

  return response.json();
}

// Delete entire cart
export async function deleteCart(userId: string) {
  console.log('THIS IS USER ID :::::  ', userId);

  const res = await fetch(`${API_URL}/carts/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Add item to cart
// ✅ Use this signature instead of (userId, payload)
export async function addToCart({
  userId,
  productId,
  variantId,
  quantity,
  currency,
}: {
  userId: string;
  productId?: string;
  variantId?: string;
  quantity: number;
  currency: string;
}) {
  try {
    console.log('=== [ADD TO CART ACTION] ===');
    console.log('userId:', userId);
    console.log('productId:', productId);
    console.log('variantId:', variantId);
    console.log('quantity:', quantity);
    console.log('currency:', currency);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/carts/${userId}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity, currency }),
        credentials: 'include',
      },
    );

    if (!res.ok) {
      const error = await res.text();
      console.error('[addToCart] API ERROR:', error);
      throw new Error(error || 'Failed to add item to cart');
    }

    return res.json();
  } catch (error) {
    console.error('[addToCart] CLIENT ERROR:', error);
    throw error;
  }
}

// Remove item from cart
export async function removeFromCart(
  userId: string,
  itemId: string,
): Promise<{ success: boolean }> {
  console.log('THIS IS REMOVE TO CART ACTION :: ');

  const res = await fetch(`${API_URL}/carts/${userId}/items/${itemId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    //body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Clear all items from cart
export async function clearCart(data: ClearCartDto): Promise<Cart> {
  const res = await fetch(`${API_URL}/carts/${data.userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* 'use server';

import { Cart, CartItem } from '../types/types';

interface CreateCartDto {
  userId: string;
}

interface AddToCartDto {
  productId?: string;
  variantId?: string;
  quantity: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createCart(data: CreateCartDto): Promise<Cart> {
  const response = await fetch(`${API_URL}/carts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error((await response.text()) || 'Failed to create cart');
  }

  return response.json();
}

export async function getCart(userId: string): Promise<Cart> {
  const response = await fetch(`${API_URL}/carts/${userId}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error((await response.text()) || undefined);
  }

  return response.json();
}

export async function addToCart(
  userId: string,
  data: AddToCartDto,
): Promise<CartItem> {
  const response = await fetch(`${API_URL}/carts/${userId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error((await response.text()) || 'Failed to add item to cart');
  }

  return response.json();
}

export async function removeFromCart(
  userId: string,
  itemId: string,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/carts/${userId}/items/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      (await response.text()) || 'Failed to remove item from cart',
    );
  }

  return response.json();
}

export async function clearCart(userId: string): Promise<Cart> {
  const response = await fetch(`${API_URL}/carts/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error((await response.text()) || 'Failed to clear cart');
  }

  return response.json();
}
 */
