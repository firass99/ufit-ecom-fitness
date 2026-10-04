// app/orders/page.tsx

import { getSession } from '@/lib/actions/session';
import { getOrdersByUser } from '@/lib/actions/orders';
import { redirect } from 'next/navigation';
import { Order } from '@/lib/types/types';
import OrdersTableClient from './orders-table';

export default async function OrdersPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch orders on the server
  const res = await getOrdersByUser(session.user.id);
  const orders: Order[] = res?.data || [];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <OrdersTableClient initialOrders={orders} />
    </div>
  );
}
