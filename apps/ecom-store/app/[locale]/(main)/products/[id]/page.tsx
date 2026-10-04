import { notFound } from 'next/navigation';
import ProductDetailPage from '@/components/product-detail';
import { getProduct } from '@/lib/actions/products';

interface PageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: PageProps) {
  /*   try { */
  const product = await getProduct(params.id);

  if (!product) return notFound();

  return <ProductDetailPage product={product} />;
  /*   } catch (err) {
    // Optionally log or handle the error
    console.error('Error loading product:', err);
    return notFound();
  } */
}
