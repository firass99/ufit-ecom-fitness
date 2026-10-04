/* 'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  deleteCart,
} from '@/lib/actions/carts';
import { createOrder } from '@/lib/actions/orders';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import { Input } from '@repo/design-system/components/ui/input';
import { useCartStore } from '@/lib/store/cartStore';
import {
  Trash2,
  Plus,
  Minus,
  Package,
  CreditCard,
  Truck,
  Shield,
  TicketPercent,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { getItemPrice } from '@/lib/util/pick-price';
import { getSession } from '@/lib/actions/session';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { validatePromotionCode } from '@/lib/actions/promotions';

const currencySymbol: Record<string, string> = {
  TND: 'د.ت',
  EUR: '€',
  USD: '$',
  SAR: '﷼',
  AED: 'د.إ',
};

export default function CheckoutDetail({ userId }: { userId: string | null }) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  

  const { items, setCart, clearCart: clearStoreCart } = useCartStore();
  const [shippingMethod] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const clearCart = useCartStore((s) => s.clearCart);
  const currency = useCurrencyStore((s) => s.currency);

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
    if (!userId) return;
    if (quantity >= stock) {
      toast.error('Stock limit reached');
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
  const totalPrice = subtotal + shipping - discount;

  const handleCheckout = async () => {
    if (!userId || !items.length) {
      toast.error(t('errorNotLogged'));
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error(t('errorAddress'));
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error(t('errorPhone'));
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) =>
        item.variant
          ? { variantId: item.variant.id, quantity: item.quantity }
          : { productId: item.product?.id, quantity: item.quantity },
      );

      await createOrder({
        currency,
        userId,
        items: orderItems,
        shippingAddress,
        phoneNumber,
        promoId: appliedPromo?.id ?? null,
        totalPrice: totalPrice.toFixed(2),
      });
      
      await deleteCart(userId);

      

      setCart([]);
      clearStoreCart();
      toast.success(t('success'));
    } catch (e: any) {
      toast.error(e.message || t('errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePromoCode = async () => {
    try {

      const promo = await validatePromotionCode(promoCode);
      if (!promo.isActive) throw new Error();

      if (promo.discountType === 'PERCENT') {
        const percent = (subtotal * promo.value) / 100;
        setDiscount(percent);
      } else {
        setDiscount(promo.value);
      }

      setAppliedPromo(promo);


      toast.success(t('promoApplied'));
    } catch {
      toast.error(t('invalidPromo'));
      setDiscount(0);
      setAppliedPromo(null);
    }
  };
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  deleteCart,
} from '@/lib/actions/carts';
import { createOrder } from '@/lib/actions/orders';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import { Input } from '@repo/design-system/components/ui/input';
import { useCartStore } from '@/lib/store/cartStore';
import {
  Trash2,
  Plus,
  Minus,
  Package,
  CreditCard,
  Truck,
  Shield,
  TicketPercent,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { getItemPrice } from '@/lib/util/pick-price';
import { getSession } from '@/lib/actions/session';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { validatePromotionCode } from '@/lib/actions/promotions';

const currencySymbol: Record<string, string> = {
  TND: 'د.ت',
  EUR: '€',
  USD: '$',
  SAR: '﷼',
  AED: 'د.إ',
};

export default function CheckoutDetail({ userId }: { userId: string | null }) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const { items, setCart, clearCart: clearStoreCart } = useCartStore();
  const [shippingMethod] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const clearCart = useCartStore((s) => s.clearCart);
  const currency = useCurrencyStore((s) => s.currency);

  const shipping = subtotal > 200 ? 0 : 5.99;

  const recalculateTotals = (newSubtotal: number, newDiscount = discount) => {
    const newTotal = newSubtotal + shipping - newDiscount;
    setTotalPrice(Number(newTotal.toFixed(2)));
  };

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

  useEffect(() => {
    const newSubtotal = items.reduce((sum, item) => {
      const price = getItemPrice(item, currency);
      return sum + price * item.quantity;
    }, 0);

    setSubtotal(newSubtotal);
    recalculateTotals(newSubtotal);
  }, [items, currency]);

  const handleAdd = async (
    variantId: string | null,
    productId: string | null,
    quantity: number,
    stock: number,
  ) => {
    if (!userId) return;
    if (quantity >= stock) {
      toast.error('Stock limit reached');
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
    if (!userId) return;
    await removeFromCart(userId, itemId);
    const cart = await getCart(userId);
    setCart(cart?.items || []);
  };

  const handleCheckout = async () => {
    if (!userId || !items.length) {
      toast.error(t('errorNotLogged'));
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error(t('errorAddress'));
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error(t('errorPhone'));
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) =>
        item.variant
          ? { variantId: item.variant.id, quantity: item.quantity }
          : { productId: item.product?.id, quantity: item.quantity },
      );

      await createOrder({
        currency,
        userId,
        items: orderItems,
        shippingAddress,
        phoneNumber,
        promoId: appliedPromo?.id ?? null,
        totalPrice: totalPrice.toFixed(2),
      });

      await deleteCart(userId);
      setCart([]);
      clearStoreCart();
      toast.success(t('success'));
    } catch (e: any) {
      toast.error(e.message || t('errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePromoCode = async () => {
    try {
      const promo = await validatePromotionCode(promoCode);
      if (!promo.isActive) throw new Error();

      let calculatedDiscount = 0;

      if (promo.discountType === 'PERCENT') {
        calculatedDiscount = (subtotal * promo.value) / 100;
      } else {
        calculatedDiscount = promo.value;
      }

      setDiscount(calculatedDiscount);
      setAppliedPromo(promo);
      recalculateTotals(subtotal, calculatedDiscount);
      toast.success(t('promoApplied'));
    } catch {
      toast.error(t('invalidPromo'));
      setDiscount(0);
      setAppliedPromo(null);
      recalculateTotals(subtotal, 0);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="text-2xl font-semibold">{t('cartTitle')}</h1>
            <p className="text-muted-foreground">
              {t('cartItems', { count: items.length })}
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const isVariant = !!item.variant;
              const product = isVariant ? item.variant?.product : item.product;
              const price = getItemPrice(item, currency);
              const stock = isVariant
                ? item.variant?.stock
                : (product?.stock ?? 99);

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-auto w-full md:w-32">
                        <Image
                          src={product?.images?.[0] || '/placeholder.png'}
                          alt={product?.name || 'Product image'}
                          width={500}
                          height={500}
                          className="h-full w-full object-cover md:w-32"
                        />
                      </div>
                      <div className="flex-1 p-6 pb-3">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{product?.name}</h3>
                            {isVariant && (
                              <p className="text-sm text-muted-foreground">
                                {item.variant?.color} • {item.variant?.size}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleMinus(
                                  isVariant ? item.variant.id : null,
                                  !isVariant ? product.id : null,
                                  item.id,
                                  item.quantity,
                                )
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleAdd(
                                  isVariant ? item.variant.id : null,
                                  !isVariant ? product.id : null,
                                  item.quantity,
                                  stock,
                                )
                              }
                              disabled={item.quantity >= stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right font-medium">
                            {currencySymbol[currency]}{' '}
                            {(price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('summaryTitle')}</CardTitle>
              <CardDescription>{t('summaryDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="shipping-address">{t('address')}</Label>
                <Input
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="1234 St. Street, City"
                />
              </div>
              <div>
                <Label htmlFor="phone-number">{t('phone')}</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+123456789"
                />
              </div>
              <div>
                <Label htmlFor="promo-code">{t('promoCode')}</Label>
                <div className="sm:flex gap-2 space-y-2 sm:space-y-0">
                  <Input
                    className="md:w-2/3 w-full"
                    id="promo-code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="****"
                  />
                  <Button
                    className="md:w-1/3 w-full"
                    onClick={handleValidatePromoCode}
                    disabled={loading || !items.length}
                  >
                    <TicketPercent className="h-4 w-4 mr-2" />
                    {loading ? t('verify') : t('validate')}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span>
                    {currencySymbol[currency]} {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('shipping')}</span>
                  <span>
                    {shipping === 0
                      ? t('free')
                      : `${currencySymbol[currency]} ${shipping.toFixed(2)}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('discount')}</span>
                    <span>
                      -{currencySymbol[currency]} {discount}
                    </span>
                    {/*                     <span>-{currencySymbol[currency]} {discount.toFixed(2)}</span>
                     */}
                  </div>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span>{t('total')}</span>
                  <span>
                    {currencySymbol[currency]} {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4 text-sm text-muted-foreground">
                <div className="flex gap-2 items-center">
                  <Package className="text-primary h-4 w-4" />
                  <span>{t('returns')}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Shield className="text-primary h-4 w-4" />
                  <span>{t('secure')}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Truck className="text-primary h-4 w-4" />
                  <span>{t('delivery')}</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={loading || !items.length}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {loading ? t('placing') : t('proceed')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
