import { getSession } from '@/lib/actions/session';

// Import the CSR component
import CheckoutDetail from '@/components/checkout-detail';

export default async function CheckoutServerPage() {
  const session = await getSession();
  const userId = session?.user?.id ?? null;
  // Optionally fetch user or cart data here

  // Pass userId as prop to the client page
  return <CheckoutDetail userId={userId} />;
}
