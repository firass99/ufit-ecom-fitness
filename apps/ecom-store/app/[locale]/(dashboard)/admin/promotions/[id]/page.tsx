import { getPromotion } from '@/lib/actions/promotions';
import UpdatePromotionClient from './update-promotions-client';

interface Props {
  params: { id: string };
}

export default async function PromotionPage({ params }: Props) {
  const promotion = await getPromotion(params.id);

  return <UpdatePromotionClient promotion={promotion} />;
}
