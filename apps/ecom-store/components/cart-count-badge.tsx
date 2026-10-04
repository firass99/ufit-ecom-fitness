'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Minus, Plus, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

import { useCartStore } from '@/lib/store/cartStore';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { getCart, addToCart, removeFromCart } from '@/lib/actions/carts';
import { getSession } from '@/lib/actions/session';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/design-system/components/ui/sheet';
import { getItemPrice } from '@/lib/util/pick-price';

const currencySymbol: Record<string, string> = {
  TND: 'د.ت',
  EUR: '€',
  USD: '$',
  SAR: '﷼',
  AED: 'د.إ',
};

export default function CartCountBadge() {
  const t = useTranslations('cart');
  const router = useRouter();

  const itemCount = useCartStore((s) => s.itemCount);
  const items = useCartStore((s) => s.items || []);
  const setCart = useCartStore((s) => s.setCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const currency = useCurrencyStore((s) => s.currency);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function hydrateCart() {
      try {
        const session = await getSession();
        const userId = session?.user?.id;
        if (!userId) return clearCart();
        const cart = await getCart(userId);
        setCart(cart?.items || []);
      } catch {
        clearCart();
      }
    }
    hydrateCart();
  }, [setCart, clearCart]);

  const handleAdd = async (
    variantId: string | null,
    productId: string | null,
    quantity: number,
    stock: number,
  ) => {
    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) return;
    if (quantity >= stock) {
      toast.error(t('max_stock'));
      return;
    }
    await addToCart({
      userId,
      currency,
      variantId: variantId ?? undefined,
      productId: productId ?? undefined,
      quantity: 1,
    });
    const cart = await getCart(userId);
    setCart(cart?.items || []);
  };

  const handleMinus = async (
    variantId: string | null,
    productId: string | null,
    itemId: string,
    quantity: number,
  ) => {
    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    if (quantity <= 1) {
      await removeFromCart(userId, itemId);
    } else {
      await addToCart({
        userId,
        currency,
        variantId: variantId ?? undefined,
        productId: productId ?? undefined,
        quantity: -1,
      });
    }

    const cart = await getCart(userId);
    setCart(cart?.items || []);
  };

  const handleRemove = async (itemId: string) => {
    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) return;

    await removeFromCart(userId, itemId);
    const cart = await getCart(userId);
    setCart(cart?.items || []);
  };

  const subtotal = items.reduce((sum, item) => {
    const price = getItemPrice(item, currency);
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 200 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    setOpen(false);
    setTimeout(() => router.push('/checkout'), 200);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {itemCount}
            </span>
          )}
          <span className="sr-only">{t('view')}</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full max-w-md p-0 flex flex-col h-full"
      >
        <SheetHeader className="p-6 pb-3 border-b">
          <SheetTitle>{t('title')}</SheetTitle>
          <SheetDescription>
            {itemCount === 0 ? t('empty') : t('summary', { count: itemCount })}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {itemCount === 0 ? (
            <div className="text-muted-foreground text-center text-sm mt-8">
              {t('empty')}
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => {
                const isVariant = !!item.variant;
                const name = isVariant
                  ? (item.variant?.product?.name ?? 'Unnamed Variant')
                  : (item.product?.name ?? 'Unnamed Product');
                const img = isVariant
                  ? (item.variant?.product?.images?.[0] ?? '/placeholder.png')
                  : (item.product?.images?.[0] ?? '/placeholder.png');
                const stock = isVariant
                  ? item.variant?.stock
                  : (item.product?.stock ?? 99);

                const price = getItemPrice(item, currency);

                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 border-b pb-3"
                  >
                    <div className="relative h-16 w-16 rounded overflow-hidden border">
                      <Image
                        src={img}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{name}</div>
                      {isVariant && (
                        <div className="text-xs text-muted-foreground">
                          {item.variant?.color} • {item.variant?.size}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {currencySymbol[currency]}
                        {price} {t('each')}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end min-w-[80px]">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleMinus(
                              isVariant ? item.variant?.id : null,
                              !isVariant ? item.product?.id : null,
                              item.id,
                              item.quantity,
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleAdd(
                              isVariant ? item.variant.id : null,
                              !isVariant ? item.product?.id : null,
                              item.quantity,
                              stock,
                            )
                          }
                          disabled={item.quantity >= stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="font-semibold">
                        {currencySymbol[currency]}
                        {(price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {itemCount > 0 && (
          <div className="px-6 pb-4 pt-2 border-t bg-background">
            <div className="space-y-1 mb-3">
              {/* <div className="flex justify-between text-sm">
                <span>{t('subtotal')}</span>
                <span>{currencySymbol[currency]}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('shipping')}</span>
                <span>
                  {shipping === 0 ? t('free') : `${currencySymbol[currency]}${shipping.toFixed(2)}`}
                </span>
              </div> */}
              <div className="flex justify-between text-lg font-bold">
                <span>{t('total')}</span>
                <span>
                  {currencySymbol[currency]}
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
            <Button className="w-full mb-2" onClick={handleCheckout}>
              <CreditCard className="mr-2 h-4 w-4" />
              {t('checkout')}
            </Button>
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                {t('close')}
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
