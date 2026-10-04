import { getPromotions } from '@/lib/actions/promotions';
import PromotionsListClient from './promotions-list-client';

export default async function PromotionsListPage() {
  const res = await getPromotions(1); // Page 1 by default

  return (
    <PromotionsListClient
      initialPromotions={res.data}
      totalPages={res.totalPages}
    />
  );
}
