// components/AddToCartButton.tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { toast } from 'sonner';
import { getSession } from '@/lib/actions/session';
import { getUser } from '@/lib/actions/users';
import { addToCart, createCart, getCart } from '@/lib/actions/carts';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useLocale } from 'next-intl';

interface Variant {
  id: string;
  size: string;
  color: string;
  stock?: number;
  price?: number;
}
interface Product {
  id: string;
  name: string;
  description: string;
  stock?: number;
  price?: number;
  images: string[];
  variants?: Variant[];
}

export function AddToCartButton({
  product,
  variants,
  productName,
}: {
  product: Product;
  variants: Variant[];
  productName: string;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const getAddToCartLabel = () => {
    if (locale === 'ar') {
      return variants.length > 0
        ? stock > 0
          ? 'أضف إلى السلة'
          : 'اختر المقاس واللون'
        : 'أضف إلى السلة';
    }

    return variants.length > 0
      ? stock > 0
        ? 'Add to Cart'
        : 'Select Size & Color'
      : 'Add to Cart';
  };
  useEffect(() => {
    async function fetchUserId() {
      try {
        const session = await getSession();
        if (!session?.user?.id) {
          setUserId(null);
          return;
        }
        const user = await getUser(session.user.id);
        setUserId(user.id);
      } catch {
        setUserId(null);
      }
    }
    fetchUserId();
  }, []);

  // Unique sizes
  const sizes = Array.from(new Set(variants.map((v) => v.size)));

  // Colors for the selected size
  const colors =
    selectedSize != null
      ? Array.from(
          new Set(
            variants.filter((v) => v.size === selectedSize).map((v) => v.color),
          ),
        )
      : [];

  // Active variant (size & color)
  const activeVariant =
    selectedSize && selectedColor
      ? variants.find(
          (v) => v.size === selectedSize && v.color === selectedColor,
        )
      : null;

  // Price logic
  const price =
    variants.length > 0
      ? parseFloat(
          (
            activeVariant?.price ??
            variants[0]?.price ??
            product.price ??
            '0'
          ).toString(),
        )
      : parseFloat((product.price ?? '0').toString());

  // Stock logic
  const stock =
    variants.length > 0 ? (activeVariant?.stock ?? 0) : (product.stock ?? 99);

  useEffect(() => {
    if (quantity > stock) setQuantity(stock || 1);
    if (quantity < 1) setQuantity(1);
  }, [stock, quantity]);

  useEffect(() => {
    if (selectedSize) {
      const availableColors = variants
        .filter((v) => v.size === selectedSize)
        .map((v) => v.color);
      setSelectedColor(availableColors[0] || null);
    } else {
      setSelectedColor(null);
    }
  }, [selectedSize]);

  const handleAddToCart = async () => {
    if (!userId) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (variants.length > 0) {
      if (!selectedSize || !selectedColor || !activeVariant) {
        toast.error('Please select a size and color');
        return;
      }
      if (quantity > stock) {
        toast.error('Not enough stock available');
        return;
      }
      let userCart;
      try {
        userCart = await getCart(userId);
      } catch (err) {
        await createCart({ userId });
        userCart = await getCart(userId);
      }
      await addToCart(userId, { variantId: activeVariant.id, quantity });
      const cart = await getCart(userId);
      useCartStore.getState().setCart(cart.items || []);
      toast.success(`${productName} added to cart!`);
      router.refresh();
    } else {
      // Simple product (no variants)
      let userCart;
      try {
        userCart = await getCart(userId);
      } catch (err) {
        await createCart({ userId });
        userCart = await getCart(userId);
      }
      await addToCart(userId, { productId: product.id, quantity });
      const cart = await getCart(userId);
      useCartStore.getState().setCart(cart.items || []);
      toast.success(`${productName} added to cart!`);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {variants.length > 0 && (
        <>
          {' '}
          <div className="text-2xl font-semibold">€{price.toFixed(2)}</div>
          <div>
            <label className="text-sm font-medium">Select Size</label>
            <div className="flex gap-2 mt-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={
                    selectedSize === size
                      ? 'px-4 py-1 border rounded-md bg-primary text-white'
                      : 'px-4 py-1 border rounded-md'
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          {colors.length > 0 && (
            <div>
              <label className="text-sm font-medium">Select Color</label>
              <div className="flex gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={
                      selectedColor === color
                        ? 'px-4 py-1 border rounded-md bg-secondary text-white'
                        : 'px-4 py-1 border rounded-md'
                    }
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex items-center border rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1 text-lg"
            disabled={quantity <= 1}
          >
            -
          </button>
          <div className="px-4">{quantity}</div>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            className="px-3 py-1 text-lg"
            disabled={quantity >= stock}
          >
            +
          </button>
        </div>
        {variants.length > 0 && activeVariant && (
          <span className="text-xs text-muted-foreground ml-2">
            Stock: {stock}
          </span>
        )}
      </div>
      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={
          variants.length > 0
            ? stock === 0 || quantity > stock || !activeVariant
            : false
        }
      >
        {getAddToCartLabel()}
      </Button>
    </div>
  );
}
