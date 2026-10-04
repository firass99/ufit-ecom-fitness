import { getBrands } from '@/lib/actions/brands';
import BrandListClient from './brands-list-client';

export default async function BrandListPage() {
  const res = await getBrands(1); // fetch first page
  console.log('THESE ARE THE BRANDS  ::  ', res.data);

  return (
    <BrandListClient initialBrands={res.data} totalPages={res.totalPages} />
  );
}
