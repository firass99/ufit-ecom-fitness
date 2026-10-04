'use server';

import { OrderStatus } from '../types/enum';
import { Order } from '../types/types';

interface OrderItemDto {
  productId?: string;
  variantId?: string; // ✅ Fixed from productId to variantId
  quantity?: number;
}

interface CreateOrderDto {
  userId: string;
  items: OrderItemDto[];
  quantity?: number;
  promoId?: number;
  shippingAddress?: string;
  phoneNumber?: string;
  totalPrice?: string;
  currency: string;
}

interface UpdateOrderDto {
  status: OrderStatus;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getOrders(
  page = 1,
  limit = 10,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (status) params.set('status', status);
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/orders?${params.toString()}`;

  const res = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
}

export async function getOrder(id: string) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

export async function getOrdersByUser(userId: string) {
  try {
    const response = await fetch(`${API_URL}/orders/user/${userId}`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}
export async function createOrder(data: CreateOrderDto) {
  console.log('THISSSS IS DATAAA ORDER', data);

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to create order: ${err}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrder(id: string, data: UpdateOrderDto) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to update order: ${err}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

export async function deleteOrder(id: string) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to delete order: ${err}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// lib/actions/orders.ts
// lib/actions/orders.ts
export async function getOrdersAnalytics() {
  const res = await fetch('http://localhost:5000/orders?page=1&limit=9999');
  const json = await res.json();
  const orders = json.data;

  const statusMap: Record<string, number> = {};
  const dateMap: Record<string, { count: number; total: number }> = {};

  let total = 0;

  for (const order of orders) {
    const status = order.status || 'UNKNOWN';
    const price = parseFloat(order.totalPrice ?? '0');
    const createdAt = new Date(order.createdAt).toISOString().split('T')[0]; // 'YYYY-MM-DD'

    statusMap[status] = (statusMap[status] || 0) + 1;
    total += price;

    if (!dateMap[createdAt]) {
      dateMap[createdAt] = { count: 0, total: 0 };
    }

    dateMap[createdAt].count += 1;
    dateMap[createdAt].total += price;
  }

  const status = Object.entries(statusMap).map(([status, value], i) => ({
    label: status,
    value,
    fill: `hsl(var(--chart-${(i % 5) + 1}))`,
  }));

  const volumeByDate = Object.entries(dateMap)
    .map(([date, { count }]) => ({
      date,
      total: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const revenueByDate = Object.entries(dateMap)
    .map(([date, { total }]) => ({
      date,
      total,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  isNaN(Number(total))
    ? console.log('THIS IS A  NUMBER')
    : console.log('THIS IS NOT A NUMBRE');

  return {
    totalOrders: orders.length,
    total, // ✅ now included
    status,
    volumeByDate,
    revenueByDate,
  };
}

// lib/actions/orders.ts
export async function getTopSellingProducts() {
  const res = await fetch('http://localhost:5000/orders?page=1&limit=9999');
  const json = await res.json();
  const orders = json.data;

  const productMap = new Map<string, { name: string; total: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      let product = item?.variant?.product || item?.product;
      if (!product) continue;

      const key = product.id;
      const prev = productMap.get(key);
      const qty = Number(item.quantity);

      if (prev) {
        prev.total += qty;
      } else {
        productMap.set(key, {
          name: product.name,
          total: qty,
        });
      }
    }
  }

  const data = Array.from(productMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 6) // top 6
    .map((item, i) => ({
      label: item.name,
      value: item.total,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    }));

  return data;
}

export async function getOrdersChart(range: '7d' | '30d' | '90d') {
  const since = new Date();
  since.setDate(
    since.getDate() - (range === '90d' ? 90 : range === '30d' ? 30 : 7),
  );

  const res = await fetch(`${API_URL}/orders/?page=1&limit=9999`);
  //const { data: orders } = await res.json();
  const { data: orders }: { data: Order[] } = await res.json();

  const filtered = orders.filter((order) => new Date(order.createdAt) >= since);

  const aggregated: Record<string, number> = {};

  for (const order of filtered) {
    const dateKey = new Date(order.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
    aggregated[dateKey] = (aggregated[dateKey] || 0) + 1;
  }

  const chartData = Object.entries(aggregated)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, total]) => ({ date, total }));

  return {
    total: filtered.length,
    data: chartData,
  };
}
//////////
/*'use server';

import { Order } from '@/lib/types/types';
import { OrderStatus } from '../types/enum';

export interface OrderItemDto {
  productId?: string;
  variantId?: string;
  quantity: number;
}

export interface CreateOrderDto {
  userId: string;
  shippingAddress?: string;
  phoneNumber?: string;
  currency: string;
  items: OrderItemDto[];
  promoCode?: string; // if supported later
}
interface UpdateOrderDto {
  status: OrderStatus;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getOrdersByUser(id: string) {
  try {
    const response = await fetch(`${API_URL}/orders/user/${id}`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}
export async function createOrder(data: CreateOrderDto): Promise<Order> {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


export async function updateOrder(id: string, data: UpdateOrderDto) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to update order: ${err}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

export async function getOrdersAnalytics() {
  const res = await fetch('http://localhost:5000/orders?page=1&limit=9999');
  const json = await res.json();
  const orders = json.data;

  const statusMap: Record<string, number> = {};
  const dateMap: Record<string, { count: number; total: number }> = {};

  let total = 0;

  for (const order of orders) {
    const status = order.status || 'UNKNOWN';
    const price = parseFloat(order.totalPrice ?? '0');
    const createdAt = new Date(order.createdAt).toISOString().split('T')[0]; // 'YYYY-MM-DD'

    statusMap[status] = (statusMap[status] || 0) + 1;
    total += price;

    if (!dateMap[createdAt]) {
      dateMap[createdAt] = { count: 0, total: 0 };
    }

    dateMap[createdAt].count += 1;
    dateMap[createdAt].total += price;
  }

  const status = Object.entries(statusMap).map(([status, value], i) => ({
    label: status,
    value,
    fill: `hsl(var(--chart-${(i % 5) + 1}))`,
  }));

  const volumeByDate = Object.entries(dateMap)
    .map(([date, { count }]) => ({
      date,
      total: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const revenueByDate = Object.entries(dateMap)
    .map(([date, { total }]) => ({
      date,
      total,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  isNaN(Number(total))
    ? console.log('THIS IS A  NUMBER')
    : console.log('THIS IS NOT A NUMBRE');

  return {
    totalOrders: orders.length,
    total, // ✅ now included
    status,
    volumeByDate,
    revenueByDate,
  };
}

// lib/actions/orders.ts
export async function getTopSellingProducts() {
  const res = await fetch('http://localhost:5000/orders?page=1&limit=9999');
  const json = await res.json();
  const orders = json.data;

  const productMap = new Map<string, { name: string; total: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      let product = item?.variant?.product || item?.product;
      if (!product) continue;

      const key = product.id;
      const prev = productMap.get(key);
      const qty = Number(item.quantity);

      if (prev) {
        prev.total += qty;
      } else {
        productMap.set(key, {
          name: product.name,
          total: qty,
        });
      }
    }
  }

  const data = Array.from(productMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 6) // top 6
    .map((item, i) => ({
      label: item.name,
      value: item.total,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    }));

  return data;
}

export async function getOrdersChart(range: '7d' | '30d' | '90d') {
  const since = new Date();
  since.setDate(
    since.getDate() - (range === '90d' ? 90 : range === '30d' ? 30 : 7),
  );

  const res = await fetch(`${API_URL}/orders/?page=1&limit=9999`);
  //const { data: orders } = await res.json();
  const { data: orders }: { data: Order[] } = await res.json();

  const filtered = orders.filter((order) => new Date(order.createdAt) >= since);

  const aggregated: Record<string, number> = {};

  for (const order of filtered) {
    const dateKey = new Date(order.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
    aggregated[dateKey] = (aggregated[dateKey] || 0) + 1;
  }

  const chartData = Object.entries(aggregated)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, total]) => ({ date, total }));

  return {
    total: filtered.length,
    data: chartData,
  };
}







/* 'use server';

import { OrderStatus } from '../types/enum';
import { Order } from '../types/types';

interface OrderItemDto {
  productId?: string;
  variantId?: string; // ✅ Fixed from productId to variantId
  quantity?: number;
}

interface CreateOrderDto {
  userId: string;
  items: OrderItemDto[];
  quantity?: number;
  shippingAddress?: string;
  phoneNumber?: string;
  totalPrice?: number;
}

interface UpdateOrderDto {
  status: OrderStatus;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getOrders(
  page = 1,
  limit = 10,
  status?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (status) params.set('status', status);
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/orders?${params.toString()}`;

  const res = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Failed to fetch orders');
  return await res.json();
}

export async function getOrder(id: string) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

export async function getOrdersByUser(id: string) {
  try {
    const response = await fetch(`${API_URL}/orders/user/${id}`, {
      cache: 'no-store',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}
export async function createOrder(data: CreateOrderDto) {
  console.log('THISSSS IS DATAAA ORDER', data);

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to create order: ${err}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrder(id: string, data: UpdateOrderDto) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to update order: ${err}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

export async function deleteOrder(id: string) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to delete order: ${err}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// lib/actions/orders.ts
// lib/actions/orders.ts
export async function getOrdersAnalytics() {
  const res = await fetch('http://localhost:5000/orders?page=1&limit=9999');
  const json = await res.json();
  const orders = json.data;

  const statusMap: Record<string, number> = {};
  const dateMap: Record<string, { count: number; total: number }> = {};

  let total = 0;

  for (const order of orders) {
    const status = order.status || 'UNKNOWN';
    const price = parseFloat(order.totalPrice ?? '0');
    const createdAt = new Date(order.createdAt).toISOString().split('T')[0]; // 'YYYY-MM-DD'

    statusMap[status] = (statusMap[status] || 0) + 1;
    total += price;

    if (!dateMap[createdAt]) {
      dateMap[createdAt] = { count: 0, total: 0 };
    }

    dateMap[createdAt].count += 1;
    dateMap[createdAt].total += price;
  }

  const status = Object.entries(statusMap).map(([status, value], i) => ({
    label: status,
    value,
    fill: `hsl(var(--chart-${(i % 5) + 1}))`,
  }));

  const volumeByDate = Object.entries(dateMap)
    .map(([date, { count }]) => ({
      date,
      total: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const revenueByDate = Object.entries(dateMap)
    .map(([date, { total }]) => ({
      date,
      total,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  isNaN(Number(total))
    ? console.log('THIS IS A  NUMBER')
    : console.log('THIS IS NOT A NUMBRE');

  return {
    totalOrders: orders.length,
    total, // ✅ now included
    status,
    volumeByDate,
    revenueByDate,
  };
}

// lib/actions/orders.ts
export async function getTopSellingProducts() {
  const res = await fetch('http://localhost:5000/orders?page=1&limit=9999');
  const json = await res.json();
  const orders = json.data;

  const productMap = new Map<string, { name: string; total: number }>();

  for (const order of orders) {
    for (const item of order.items) {
      let product = item?.variant?.product || item?.product;
      if (!product) continue;

      const key = product.id;
      const prev = productMap.get(key);
      const qty = Number(item.quantity);

      if (prev) {
        prev.total += qty;
      } else {
        productMap.set(key, {
          name: product.name,
          total: qty,
        });
      }
    }
  }

  const data = Array.from(productMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 6) // top 6
    .map((item, i) => ({
      label: item.name,
      value: item.total,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
    }));

  return data;
}

export async function getOrdersChart(range: '7d' | '30d' | '90d') {
  const since = new Date();
  since.setDate(
    since.getDate() - (range === '90d' ? 90 : range === '30d' ? 30 : 7),
  );

  const res = await fetch(`${API_URL}/orders/?page=1&limit=9999`);
  //const { data: orders } = await res.json();
  const { data: orders }: { data: Order[] } = await res.json();

  const filtered = orders.filter((order) => new Date(order.createdAt) >= since);

  const aggregated: Record<string, number> = {};

  for (const order of filtered) {
    const dateKey = new Date(order.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
    aggregated[dateKey] = (aggregated[dateKey] || 0) + 1;
  }

  const chartData = Object.entries(aggregated)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, total]) => ({ date, total }));

  return {
    total: filtered.length,
    data: chartData,
  };
}
 */
