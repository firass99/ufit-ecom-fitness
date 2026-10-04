'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateProduct, UpdateProductDto } from '@/lib/actions/products';
import { Input } from '@repo/design-system/components/ui/input';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Label } from '@repo/design-system/components/ui/label';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from '@repo/design-system/components/ui/select';
import { Gender, Size } from '@/lib/types/enum';
import { Currency } from '@prisma/client';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// ===== Types =====
type CurrencyCode = 'TND' | 'USD' | 'AED';

type TranslationInput = {
  locale: string;
  name: string;
  description: string;
};

type PriceInput = {
  currency: CurrencyCode;
  price: number;
};

type VariantInput = {
  id?: string;
  size?: string | null;
  color?: string | null;
  gender: string; // from Gender enum string values
  stock: number;
  prices: PriceInput[];
};

type BaseUpdatePayload = {
  name: string;
  description: string;
  categoryId: string;
  images: string[];
  translations?: TranslationInput[];
};

type VariantMode = {
  hasVariants: true;
  variants: VariantInput[];
  prices?: undefined;
  stock?: undefined;
};

type SimpleMode = {
  hasVariants: false;
  variants?: [];
  prices: PriceInput[];
  stock: number;
};

// Using UpdateProductDto from lib/actions/products instead
// export type UpdateProductPayload = BaseUpdatePayload &
//   (VariantMode | SimpleMode);

// ===== Form Types =====
type PriceForm = { currency: CurrencyCode; price: number | undefined };
type VariantForm = {
  id?: string;
  size?: string;
  color?: string;
  gender: string;
  stock?: number;
  prices: PriceForm[];
};
type TranslationForm = TranslationInput;

type FormValues = {
  name: string;
  description: string;
  categoryId: string;
  images: FileList | string[];
  hasVariants: boolean;
  prices?: PriceForm[]; // non-variant mode
  stock?: number; // non-variant mode
  variants?: VariantForm[]; // variant mode
  translations?: TranslationForm[];
};

const SIZE_OPTIONS = Object.values(Size);
const GENDER_OPTIONS = Object.values(Gender);
const CURRENCIES: CurrencyCode[] = ['TND', 'USD', 'AED'];

// ===== Component =====
export default function UpdateProductWithVariant({
  id,
  initialProduct,
  initialCategories,
}: {
  id: string;
  initialProduct: any;
  initialCategories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const hasVariantsBool: boolean = !!initialProduct?.hasVariants;

  // Map incoming data → form defaults
  const mappedVariants: VariantForm[] = hasVariantsBool
    ? (initialProduct?.variants ?? []).map((v: any) => ({
        id: v.id,
        size: v.size ?? '',
        color: v.color ?? '',
        gender: v.gender ?? 'UNISEX',
        stock: Number(v.stock ?? 0),
        prices:
          Array.isArray(v.prices) && v.prices.length
            ? v.prices.map((vp: any) => ({
                currency: vp.currency as CurrencyCode,
                price: vp.price != null ? Number(vp.price) : 0,
              }))
            : [{ currency: 'TND', price: 0 }],
      }))
    : [];

  const defaultValues: FormValues = {
    name: initialProduct?.name ?? '',
    description: initialProduct?.description ?? '',
    categoryId: initialProduct?.categoryId ?? '',
    images: initialProduct?.images ?? [],
    hasVariants: true,
    translations: initialProduct?.translations?.length
      ? initialProduct.translations.map((t: any) => ({
          locale: t.locale,
          name: t.name,
          description: t.description,
        }))
      : [{ locale: 'ar', name: '', description: '' }],
    variants: hasVariantsBool ? mappedVariants : [],
    prices: [],
    stock: undefined,
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues });

  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialProduct?.images || [],
  );
  const [categories] = useState(initialCategories);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  // Field arrays
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: 'variants' });

  const {
    fields: translationFields,
    append: appendTranslation,
    remove: removeTranslation,
  } = useFieldArray({ control, name: 'translations' });

  const {
    fields: basePriceFields,
    append: appendBasePrice,
    remove: removeBasePrice,
  } = useFieldArray({ control, name: 'prices' });

  // Toggle guard
  useEffect(() => {
    setValue('prices', undefined as any);
    setValue('stock', undefined as any);
    const v = watch('variants');
    if (!v || v.length === 0) {
      appendVariant({
        size: '',
        color: '',
        gender: 'UNISEX',
        stock: 0,
        prices: [{ currency: 'TND', price: 0 }],
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Upload images
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return [];
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/uploads/products`,
          { method: 'POST', body: formData },
        );
        const data = await res.json();
        if (data?.url) urls.push(data.url.replace(/\\/g, '/'));
      } catch {
        toast.error('Failed to upload image');
      }
    }
    return urls;
  };

  const handleRemoveImage = (url: string) => {
    setUploadedImages((prev) => prev.filter((u) => u !== url));
  };

  const removeVariantPriceAt = (variantIdx: number, priceIdx: number) => {
    const prices =
      (watch(`variants.${variantIdx}.prices`) as PriceForm[]) ?? [];
    const next = [...prices.slice(0, priceIdx), ...prices.slice(priceIdx + 1)];
    setValue(`variants.${variantIdx}.prices`, next as any);
  };

  // ===== Strongly-typed payload builder =====
  function buildUpdatePayload(
    data: FormValues,
    images: string[],
  ): UpdateProductDto {
    const base: BaseUpdatePayload = {
      name: data.name.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      images,
      translations: data.translations?.map((t) => ({
        locale: t.locale,
        name: t.name,
        description: t.description,
      })),
    };

    // Convert variants to match VariantDto type
    const variants = (data.variants || []).map((v) => ({
      ...(v.id ? { id: v.id } : {}),
      // Convert size to Size enum or undefined (not null)
      size: v.size ? (v.size as Size) : undefined,
      color: v.color || undefined,
      // Ensure gender is a valid Gender enum value
      gender: (v.gender as Gender) || 'UNISEX',
      stock: Number(v.stock ?? 0),
      prices: (v.prices || []).map((p) => ({
        currency: p.currency as Currency,
        price: Number(p.price ?? 0),
      })),
    }));

    const payload: UpdateProductDto = {
      ...base,
      hasVariants: true,
      variants,
    };
    return payload;
  }

  // Submit
  const onSubmit = async (data: FormValues) => {
    try {
      // Upload any new files first
      let images = uploadedImages;
      const fileInput = data.images as FileList;
      if (fileInput && fileInput.length > 0 && fileInput[0] instanceof File) {
        const newImages = await handleImageUpload(fileInput);
        images = [
          ...uploadedImages,
          ...newImages.filter((url) => !uploadedImages.includes(url)),
        ];
      }

      if (!data.name?.trim()) return toast.error('Name is required');
      if (!data.description?.trim())
        return toast.error('Description is required');
      if (!data.categoryId) return toast.error('Category is required');

      const payload = buildUpdatePayload(data, images);

      await updateProduct(id, payload);
      toast.success('Product updated!');
      router.push('/admin/products/list');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || tCommon('failToUpdate'));
    }
  };

  // RHF ref + local ref
  const imagesReg = register('images');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-6 tracking-tight">
        {tCommon('update') + ' ' + tCommon('product')}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        autoComplete="off"
      >
        {/* Name / Description */}
        <div>
          <Label htmlFor="name">{tCommon('name')}</Label>
          <Input id="name" {...register('name', { required: true })} />
        </div>
        <div>
          <Label htmlFor="description">{tCommon('description')}</Label>
          <Textarea
            id="description"
            rows={2}
            {...register('description', { required: true })}
          />
        </div>

        {/* Translations */}
        <div>
          <Label>{tCommon('translations')}</Label>
          <div className="space-y-4">
            {translationFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-4 gap-3 items-end">
                <Input
                  placeholder="Locale (ar, fr...)"
                  {...register(`translations.${index}.locale` as const)}
                />
                <Input
                  placeholder="Translated Name"
                  {...register(`translations.${index}.name` as const)}
                />
                <Input
                  placeholder="Translated Description"
                  {...register(`translations.${index}.description` as const)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeTranslation(index)}
                >
                  {tCommon('remove')}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                appendTranslation({ locale: '', name: '', description: '' })
              }
            >
              + Add Translation
            </Button>
          </div>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="categoryId">{tCommon('category')}</Label>
          <Controller
            control={control}
            name="categoryId"
            rules={{ required: true }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('categories')}</SelectLabel>
                    {initialCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Images */}
        <div>
          <Label htmlFor="images">{tCommon('images')}</Label>
          <Input
            id="images"
            type="file"
            multiple
            accept="image/*"
            {...imagesReg}
            ref={(el) => {
              imagesReg.ref(el);
              imageInputRef.current = el;
            }}
            onChange={async (e) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;
              const newUrls = await handleImageUpload(files);
              setUploadedImages((prev) => [
                ...prev,
                ...newUrls.filter((url) => !prev.includes(url)),
              ]);
              if (imageInputRef.current) imageInputRef.current.value = '';
            }}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {uploadedImages.map((url, idx) => (
              <div key={idx} className="relative group">
                <Image
                  src={url}
                  alt="Uploaded"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded border"
                  loading="lazy"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute top-0 right-0"
                  onClick={() => handleRemoveImage(url)}
                  aria-label="Remove"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Has Variants? (controlled) */}

        {/* Variants OR Base Prices */}

        <div>
          <Label>{tCommon('variants')}</Label>
          <div className="space-y-2">
            {variantFields.map((field, idx) => (
              <div
                key={field.id}
                className="border rounded-md p-3 space-y-3 bg-muted/20"
              >
                <div className="grid grid-cols-3 gap-2">
                  <Controller
                    control={control}
                    name={`variants.${idx}.size` as const}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tCommon('size')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{tCommon('sizes')}</SelectLabel>
                            {SIZE_OPTIONS.map((sz) => (
                              <SelectItem key={sz} value={sz}>
                                {sz}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    placeholder={tCommon('color')}
                    {...register(`variants.${idx}.color` as const)}
                  />
                  <Controller
                    control={control}
                    name={`variants.${idx}.gender` as const}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tCommon('gender')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{tCommon('gender')}</SelectLabel>
                            {GENDER_OPTIONS.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    placeholder={tCommon('stock')}
                    min={0}
                    {...register(`variants.${idx}.stock` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div>
                  <Label>{tCommon('price')}</Label>
                  <Controller
                    control={control}
                    name={`variants.${idx}.prices` as const}
                    render={({ field }) => (
                      <>
                        {field.value?.map((_, pIdx) => (
                          <div
                            key={pIdx}
                            className="grid grid-cols-3 gap-2 items-center mt-2"
                          >
                            <Controller
                              control={control}
                              name={
                                `variants.${idx}.prices.${pIdx}.currency` as const
                              }
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={tCommon('currency')}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CURRENCIES.map((cur) => (
                                      <SelectItem key={cur} value={cur}>
                                        {cur}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={tCommon('price')}
                              {...register(
                                `variants.${idx}.prices.${pIdx}.price` as const,
                                { valueAsNumber: true },
                              )}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => removeVariantPriceAt(idx, pIdx)}
                            >
                              ❌
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          className="mt-2"
                          onClick={() =>
                            setValue(
                              `variants.${idx}.prices` as const,
                              [
                                ...(field.value || []),
                                { currency: 'TND', price: 0 },
                              ] as any,
                            )
                          }
                        >
                          {tCommon('add')} {tCommon('price')} +
                        </Button>
                      </>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeVariant(idx)}
                  >
                    {tCommon('remove')} {tCommon('variant')}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() =>
              appendVariant({
                size: '',
                color: '',
                gender: 'UNISEX',
                stock: 0,
                prices: [{ currency: 'TND', price: 0 }],
              })
            }
          >
            {tCommon('add')} {tCommon('variant')} +
          </Button>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? tCommon('updating')
            : tCommon('update') + ' ' + tCommon('product')}
        </Button>
      </form>
    </div>
  );
}
