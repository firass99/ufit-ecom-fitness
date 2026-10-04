'use client';

import { useMemo, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { ProductImagesCarousel } from './product-images-carousel';
import { AddToCartButton } from './add-to-cart-button';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { Product, ProductPrice, Variant } from '@/lib/types/types';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Separator } from '@repo/design-system/components/ui/separator';

function toDate(v?: string | Date | null) {
  return v ? new Date(v) : null;
}

function computeActivePrice(row: ProductPrice, now = new Date()) {
  const start = toDate(row.saleStartAt);
  const end = toDate(row.saleEndAt);
  const onSale =
    row.salePrice != null && (!start || start <= now) && (!end || end >= now);

  return {
    amount: onSale ? (row.salePrice as number) : row.price,
    base: row.price,
    onSale,
  };
}

function pickPriceForCurrency(
  rows: ProductPrice[] | undefined,
  currency: string,
) {
  if (!rows?.length) return undefined;
  const row = rows.find((r) => r.currency === currency) ?? rows[0];
  return computeActivePrice(row);
}

function formatMoney(amount: number, currency: string, locale?: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export default function ProductDetailPage({ product }: { product: Product }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const currency = useCurrencyStore((s) => s.currency);

  console.log(' === [TO PRODUCT DETAIL PAGE] ===');
  console.log(product);
  console.log(currency);
  console.log(locale);
  console.log(' === [TO PRODUCT DETAIL PAGE  END  ] ===');

  const tProduct = product.translations?.find((t) => t.locale === locale);
  const tCategory = product.category.translations?.find(
    (t) => t.locale === locale,
  );

  const translatedName = tProduct?.name || product.name;
  const translatedDesc = tProduct?.description || product.description;
  const translatedCategory = tCategory?.name || product.category.name;

  const sizes = useMemo(() => {
    return Array.from(
      new Set(
        (product.variants ?? []).map((v) => v.size || '').filter(Boolean),
      ),
    );
  }, [product.variants]);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    sizes[0],
  );
  const colorsForSize = useMemo(() => {
    const list = (product.variants ?? [])
      .filter((v) => (selectedSize ? v.size === selectedSize : true))
      .map((v) => v.color || '')
      .filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [product.variants, selectedSize]);

  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    colorsForSize[0],
  );

  const [quantity, setQuantity] = useState<number>(1);

  const selectedVariant: Variant | undefined = useMemo(() => {
    if (!product.hasVariants) return undefined;
    const v =
      (product.variants ?? []).find(
        (v) =>
          (selectedSize ? v.size === selectedSize : true) &&
          (selectedColor ? v.color === selectedColor : true),
      ) ?? (product.variants ?? [])[0];
    return v;
  }, [product.variants, product.hasVariants, selectedSize, selectedColor]);

  const displayPrice = useMemo(() => {
    if (product.hasVariants) {
      const pp = pickPriceForCurrency(selectedVariant?.prices, currency);
      return pp
        ? {
            ...pp,
            label: formatMoney(pp.amount, currency, locale),
            baseLabel: formatMoney(pp.base, currency, locale),
          }
        : undefined;
    }
    const pp = pickPriceForCurrency(product.prices, currency);
    return pp
      ? {
          ...pp,
          label: formatMoney(pp.amount, currency, locale),
          baseLabel: formatMoney(pp.base, currency, locale),
        }
      : undefined;
  }, [
    product.hasVariants,
    selectedVariant?.prices,
    product.prices,
    currency,
    locale,
  ]);

  const displayStock = useMemo(() => {
    return product.hasVariants
      ? (selectedVariant?.stock ?? 0)
      : (product.stock ?? 0);
  }, [product.hasVariants, selectedVariant?.stock, product.stock]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(1, Math.min(displayStock, Number(e.target.value)));
      setQuantity(val);
    },
    [displayStock],
  );

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 py-12"
      dir={isArabic ? 'rtl' : 'ltr'}
      style={isArabic ? { fontFamily: 'Cairo, sans-serif' } : undefined}
      aria-label={isArabic ? 'تفاصيل المنتج' : 'Product Details'}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductImagesCarousel
          images={product.images ?? []}
          alt={translatedName}
        />

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">{translatedName}</h1>
              {displayStock <= 5 && displayStock > 0 && (
                <Badge
                  variant="outline"
                  className="text-amber-500 border-amber-500"
                >
                  {isArabic ? 'كمية محدودة' : 'Low Stock'}
                </Badge>
              )}
              {displayStock === 0 && (
                <Badge
                  variant="outline"
                  className="text-red-500 border-red-500"
                >
                  {isArabic ? 'نفذ من المخزون' : 'Out of Stock'}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {product.brand?.name && (
                <p>
                  {isArabic ? 'العلامة:' : 'Brand:'}{' '}
                  <span className="font-medium">{product.brand.name}</span>
                </p>
              )}
              <p>
                {isArabic ? 'الفئة:' : 'Category:'}{' '}
                <span className="font-medium">{translatedCategory}</span>
              </p>
              {product.sku && (
                <p>
                  {isArabic ? 'رقم المنتج:' : 'SKU:'}{' '}
                  <span className="font-medium">{product.sku}</span>
                </p>
              )}
            </div>
          </div>

          <Separator className="my-2" />

          {translatedDesc && (
            <div>
              <h2 className="text-lg font-semibold mb-2">
                {isArabic ? 'الوصف' : 'Description'}
              </h2>
              <div
                className="prose dark:prose-invert max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: translatedDesc }}
              />
            </div>
          )}

          <Separator className="my-2" />

          {product.hasVariants && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold mb-1">
                {isArabic ? 'الخيارات' : 'Options'}
              </h2>
              {sizes.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    {isArabic ? 'المقاس' : 'Size'}
                  </label>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label={isArabic ? 'اختيار المقاس' : 'Size selection'}
                  >
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        aria-pressed={selectedSize === s}
                        className={`px-3 py-1 rounded border text-sm transition-all ${
                          selectedSize === s
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colorsForSize.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    {isArabic ? 'اللون' : 'Color'}
                  </label>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label={isArabic ? 'اختيار اللون' : 'Color selection'}
                  >
                    {colorsForSize.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        aria-pressed={selectedColor === c}
                        className={`px-3 py-1 rounded border text-sm transition-all ${
                          selectedColor === c
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator className="my-2" />

          <div className="space-y-4">
            {displayPrice && (
              <div className="text-2xl font-bold">
                {displayPrice.onSale ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-primary">{displayPrice.label}</span>
                    <span className="text-sm line-through text-muted-foreground">
                      {displayPrice.baseLabel}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-green-500 border-green-500"
                    >
                      {isArabic ? 'تخفيض' : 'Sale'}
                    </Badge>
                  </div>
                ) : (
                  <span>{displayPrice.label}</span>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label htmlFor="quantity" className="text-sm font-medium">
                  {isArabic ? 'الكمية' : 'Quantity'}
                </label>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'المخزون:' : 'In stock:'}{' '}
                  <span className="font-medium">{displayStock}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label={isArabic ? 'تقليل الكمية' : 'Decrease quantity'}
                  className="w-8 h-8 flex items-center justify-center border rounded-md disabled:opacity-50"
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={displayStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  aria-label={isArabic ? 'الكمية' : 'Quantity'}
                  className="w-16 border px-2 py-1 rounded text-center text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(Math.min(displayStock, quantity + 1))
                  }
                  disabled={quantity >= displayStock}
                  aria-label={isArabic ? 'زيادة الكمية' : 'Increase quantity'}
                  className="w-8 h-8 flex items-center justify-center border rounded-md disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <AddToCartButton
              product={product}
              variants={product.variants || []}
              productName={translatedName}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
