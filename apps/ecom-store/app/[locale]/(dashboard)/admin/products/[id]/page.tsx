// app/admin/products/[id]/page.tsx
import UpdateProductWithVariant from './product-with-variant';
import UpdateProductWithoutVariant from './product-without-variant';
import { getProduct } from '@/lib/actions/products';
import { getCategories } from '@/lib/actions/categories';

export default async function Page({
  params,
}: {
  params: { id: string }; // ✅ direct access, no React.use()
}) {
  const { id } = params;

  // Fetch server-side so the client form can render instantly
  const [product, cats] = await Promise.all([getProduct(id), getCategories()]);
  const categories = Array.isArray(cats) ? cats : (cats?.data ?? []);
  console.log('this is products Data STARTTT ', product);
  console.log('this is products Data ENDDD ');
  /* 
  return (
    <UpdateProductClient
      id={id}
      initialProduct={product}
      initialCategories={categories}
    />
  ); */
  if (product.hasVariants) {
    return (
      <UpdateProductWithVariant
        id={id}
        initialProduct={product}
        initialCategories={categories}
      />
    );
  } else {
    return (
      <UpdateProductWithoutVariant
        id={id}
        initialProduct={product}
        initialCategories={categories}
      />
    );
  }
}
