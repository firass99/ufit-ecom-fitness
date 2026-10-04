import { getCategories } from './categories';
import { getOrders } from './orders';
import { getProducts } from './products';
import { getUsers } from './users';

export async function getDashboardStats() {
  const [products, users, orders, categories] = await Promise.all([
    getProducts({ page: 1, limit: 1000 }),
    getUsers(),
    getOrders(),
    getCategories(),
  ]);

  return {
    totalProducts: products.total || products.data.length,
    totalOrders: orders.total || orders.data.length,
    totalUsers: users.data.length,
    totalCategories: categories.data.length,
    ordersTimeline: orders.data.map((order: any) => ({
      date: new Date(order.createdAt).toISOString().split('T')[0], // YYYY-MM-DD
      total: order.total || 1,
    })),
  };
}
