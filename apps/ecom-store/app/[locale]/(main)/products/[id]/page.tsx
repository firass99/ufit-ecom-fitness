import { notFound } from 'next/navigation';
import ProductDetailPage from '@/components/product-detail';
import { getProduct } from '@/lib/actions/products';
import { getCart } from '@/lib/actions/carts';

interface PageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: PageProps) {
  /*   try { */
  const product = await getProduct(params.id);

  if (!product) return notFound();
  console.log('Product fetched');
  const x = await getCart('558cbec3-9305-4952-b093-35470efef2ba');
  console.log('THIS IS THE CARRRTTTTTT START ');
  console.log(x);

  console.log('THIS IS THE CARRRTTTTTT ENDDD ');

  return <ProductDetailPage product={product} />;
  /*   } catch (err) {
    // Optionally log or handle the error
    console.error('Error loading product:', err);
    return notFound();
  } */
}
