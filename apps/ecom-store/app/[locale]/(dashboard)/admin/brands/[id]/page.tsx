import { getBrand } from '@/lib/actions/brands';
import EditBrandClient from './update-brands-client';

export default async function EditBrandPage({
  params,
}: {
  params: { id: string };
}) {
  const brand = await getBrand(params.id);

  return <EditBrandClient brand={brand} />;
}
