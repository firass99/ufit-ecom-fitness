'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store/cartStore';
import { useLocale } from 'next-intl';
import { getSession } from '@/lib/actions/session';
import { addToCart, getCart } from '@/lib/actions/carts';
import { Product, Variant } from '@/lib/types/types';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';

export function AddToCartButton({
  product,
  variants,
  productName,
  selectedSize,
  selectedColor,
  quantity,
}: {
  product: Product;
  variants: Variant[];
  productName: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
}) {
  const currency = useCurrencyStore((s) => s.currency);
  const router = useRouter();
  const locale = useLocale();
  const setCart = useCartStore((s) => s.setCart);

  const activeVariant = variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor,
  );

  const stock =
    variants.length > 0 ? (activeVariant?.stock ?? 0) : (product.stock ?? 99);

  const handleAddToCart = async () => {
    const session = await getSession();
    if (!session?.user?.id) {
      toast.error(
        locale === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first',
      );
      return;
    }

    const userId = session.user.id;

    try {
      await addToCart({
        userId,
        quantity,
        currency,
        ...(activeVariant
          ? { variantId: activeVariant.id }
          : { productId: product.id }),
      });

      const updatedCart = await getCart(userId);
      setCart(updatedCart?.items || []);
      toast.success(
        `${productName} ${locale === 'ar' ? 'تمت إضافته!' : 'added to cart!'}`,
      );
      router.refresh();
    } catch (err) {
      console.error('[AddToCartButton] Error:', err);
      toast.error(locale === 'ar' ? 'حدث خطأ ما!' : 'Failed to add to cart!');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={
          variants.length > 0 ? !activeVariant || stock <= 0 : stock <= 0
        }
      >
        {variants.length > 0
          ? activeVariant && stock > 0
            ? locale === 'ar'
              ? 'أضف إلى السلة'
              : 'Add to Cart'
            : locale === 'ar'
              ? 'اختر المقاس واللون'
              : 'Select Size & Color'
          : locale === 'ar'
            ? 'أضف إلى السلة'
            : 'Add to Cart'}
      </Button>
    </div>
  );
}
