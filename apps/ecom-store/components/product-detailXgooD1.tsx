'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { ProductImagesCarousel } from './product-images-carousel';
import { AddToCartButton } from './add-to-cart-button';
import { useCurrencyStore } from '@/lib/store/useCurrencyStore';
import { Product, ProductPrice, Variant } from '@/lib/types/types';

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

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
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
            label: formatMoney(pp.amount, currency),
            baseLabel: formatMoney(pp.base, currency),
          }
        : undefined;
    }
    const pp = pickPriceForCurrency(product.prices, currency);
    return pp
      ? {
          ...pp,
          label: formatMoney(pp.amount, currency),
          baseLabel: formatMoney(pp.base, currency),
        }
      : undefined;
  }, [product.hasVariants, selectedVariant?.prices, product.prices, currency]);

  const displayStock = product.hasVariants
    ? (selectedVariant?.stock ?? 0)
    : (product.stock ?? 0);

  return (
    <section
      className="w-full max-w-7xl mx-auto px-4 py-12"
      dir={isArabic ? 'rtl' : 'ltr'}
      style={isArabic ? { fontFamily: 'Cairo, sans-serif' } : undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductImagesCarousel
          images={product.images ?? []}
          alt={translatedName}
        />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">{translatedName}</h1>
            {product.brand?.name && (
              <p className="text-sm text-muted-foreground mt-1">
                {isArabic ? 'العلامة:' : 'Brand:'}{' '}
                <span className="font-medium">{product.brand.name}</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'الفئة:' : 'Category:'}{' '}
              <span className="font-medium">{translatedCategory}</span>
            </p>
          </div>

          {translatedDesc && (
            <div
              className="prose dark:prose-invert max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: translatedDesc }}
            />
          )}

          {product.hasVariants && (
            <div className="flex flex-col gap-4">
              {sizes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="min-w-16 text-sm text-muted-foreground">
                    {isArabic ? 'المقاس' : 'Size'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1 rounded border text-sm ${
                          selectedSize === s
                            ? 'border-primary text-primary'
                            : 'border-muted-foreground/30 hover:border-primary/50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {colorsForSize.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="min-w-16 text-sm text-muted-foreground">
                    {isArabic ? 'اللون' : 'Color'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {colorsForSize.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`px-3 py-1 rounded border text-sm ${
                          selectedColor === c
                            ? 'border-primary text-primary'
                            : 'border-muted-foreground/30 hover:border-primary/50'
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

          <div className="space-y-1">
            {displayPrice && (
              <div className="text-xl font-semibold">
                {displayPrice.onSale ? (
                  <div className="flex items-baseline gap-2">
                    <span>{displayPrice.label}</span>
                    <span className="text-sm line-through text-muted-foreground">
                      {displayPrice.baseLabel}
                    </span>
                  </div>
                ) : (
                  <span>{displayPrice.label}</span>
                )}
              </div>
            )}

            <p className="text-sm">
              {isArabic ? 'المخزون:' : 'Stock:'}{' '}
              <span className="font-medium">{displayStock}</span>
            </p>

            {/* Quantity input */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                {isArabic ? 'الكمية' : 'Qty'}
              </span>
              <input
                type="number"
                min={1}
                max={displayStock}
                value={quantity}
                onChange={(e) => {
                  const val = Math.max(
                    1,
                    Math.min(displayStock, Number(e.target.value)),
                  );
                  setQuantity(val);
                }}
                className="w-20 border px-2 py-1 rounded text-sm"
              />
            </div>
          </div>

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
    </section>
  );
}
