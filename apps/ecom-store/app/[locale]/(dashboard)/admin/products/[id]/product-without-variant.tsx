'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateProduct } from '@/lib/actions/products';
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

type SimpleMode = {
  hasVariants: false;
  variants?: [];
  prices: PriceInput[];
  stock: number;
};

export type UpdateProductPayload = BaseUpdatePayload & SimpleMode;

// ===== Form Types =====
type PriceForm = { currency: CurrencyCode; price: number | undefined };

type TranslationForm = TranslationInput;

type FormValues = {
  name: string;
  description: string;
  categoryId: string;
  images: FileList | string[];
  hasVariants: boolean;
  prices?: PriceForm[]; // non-variant mode
  stock?: number; // non-variant mode
  translations?: TranslationForm[];
};

const SIZE_OPTIONS = Object.values(Size);
const GENDER_OPTIONS = Object.values(Gender);
const CURRENCIES: CurrencyCode[] = ['TND', 'USD', 'AED'];

// ===== Component =====
export default function UpdateProductWithoutVariant({
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

  const mappedBasePrices: PriceForm[] =
    !hasVariantsBool &&
    Array.isArray(initialProduct?.prices) &&
    initialProduct.prices.length
      ? initialProduct.prices.map((p: any) => ({
          currency: p.currency as CurrencyCode,
          price: p.price != null ? Number(p.price) : 0,
        }))
      : [{ currency: 'TND', price: 0 }];

  const defaultValues: FormValues = {
    name: initialProduct?.name ?? '',
    description: initialProduct?.description ?? '',
    categoryId: initialProduct?.categoryId ?? '',
    images: initialProduct?.images ?? [],
    hasVariants: false,
    translations: initialProduct?.translations?.length
      ? initialProduct.translations.map((t: any) => ({
          locale: t.locale,
          name: t.name,
          description: t.description,
        }))
      : [{ locale: 'ar', name: '', description: '' }],
    prices: mappedBasePrices,
    stock: Number(initialProduct?.stock ?? 0),
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
    fields: translationFields,
    append: appendTranslation,
    remove: removeTranslation,
  } = useFieldArray({ control, name: 'translations' });

  const {
    fields: basePriceFields,
    append: appendBasePrice,
    remove: removeBasePrice,
  } = useFieldArray({ control, name: 'prices' });

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

  // ===== Strongly-typed payload builder =====
  function buildUpdatePayload(
    data: FormValues,
    images: string[],
  ): UpdateProductPayload {
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

    {
      const prices: PriceInput[] = (data.prices || []).map((p) => ({
        currency: p.currency,
        price: Number(p.price ?? 0),
      }));
      const stock = Number(data.stock ?? 0);

      const payload: UpdateProductPayload = {
        ...base,
        hasVariants: false,
        prices,
        stock,
      };
      return payload;
    }
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
        {/* Variants OR Base Prices ::  watch('hasVariants')  */}

        <div>
          <Label>Prices</Label>
          {basePriceFields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-3 gap-2 items-center mt-2"
            >
              <Controller
                control={control}
                name={`prices.${idx}.currency` as const}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tCommon('currency')} />
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
                {...register(`prices.${idx}.price` as const, {
                  valueAsNumber: true,
                })}
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => removeBasePrice(idx)}
              >
                ❌
              </Button>
            </div>
          ))}
          <Button
            type="button"
            className="mt-2"
            onClick={() => appendBasePrice({ currency: 'TND', price: 0 })}
          >
            {tCommon('add')} {tCommon('price')} +
          </Button>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="stock">{tCommon('stock')}</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock', { valueAsNumber: true })}
              />
            </div>
          </div>
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
