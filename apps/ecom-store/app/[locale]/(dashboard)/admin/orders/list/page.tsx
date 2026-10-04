// app/admin/orders/list/page.tsx
import { getOrders } from '@/lib/actions/orders';
import OrdersTableClient from './orders-table';

export default async function OrdersListPage() {
  const res = await getOrders(1, 10); // default first page load
  const orders = res?.data || [];
  const totalPages = res?.totalPages || 1;

  return <OrdersTableClient initialOrders={orders} totalPages={totalPages} />;
}
