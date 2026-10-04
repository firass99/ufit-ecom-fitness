'use server';

import { PaymentStatus } from '../types/enum';
import { Payment } from '../types/types';

export interface CreatePaymentDto {
  orderId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'PAYPAL';
  currency: string;
  status?: PaymentStatus;
}

export interface UpdatePaymentDto {
  status: PaymentStatus;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPayments(): Promise<Payment[]> {
  const res = await fetch(`${API_URL}/payments`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function getPayment(id: string): Promise<Payment> {
  const res = await fetch(`${API_URL}/payments/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function createPayment(data: CreatePaymentDto) {
  const res = await fetch(`${API_URL}/payments`, {
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

export async function updatePayment(id: string, data: UpdatePaymentDto) {
  const res = await fetch(`${API_URL}/payments/${id}`, {
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

export async function deletePayment(id: string) {
  const res = await fetch(`${API_URL}/payments/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
