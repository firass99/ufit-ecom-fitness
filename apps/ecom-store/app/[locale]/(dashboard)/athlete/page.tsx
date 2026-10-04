import { getOrdersByUser } from '@/lib/actions/orders';
import { getSession } from '@/lib/actions/session';
import { getUser } from '@/lib/actions/users';

export default async function AthleteDashboardPage() {
  const session = await getSession();
  const userId = session?.user.id;

  if (!userId) {
    return (
      <div className="p-4 text-red-500">User not found or not logged in</div>
    );
  }

  const user = await getUser(userId);
  const ordersRes = await getOrdersByUser(userId);
  const orders = ordersRes.data || [];

  const lastUpdated = new Date(user.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold">
        👋 Welcome back USER, {user?.fullName || user?.email}!
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* ✅ Total Orders Card */}
        <div className="rounded-lg border bg-background p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-1">🧾 Total Orders</h2>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>

        {/* ✅ Last Profile Update */}
        <div className="rounded-lg border bg-background p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-1">📅 Last Profile Update</h2>
          <p className="text-md text-muted-foreground">{lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}
