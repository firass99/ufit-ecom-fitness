'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
} from '@repo/design-system/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@repo/design-system/components/ui/dialog';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';

import { getCategories } from '@/lib/actions/categories';
import { getBrands, createBrand } from '@/lib/actions/brands';
import { createProduct } from '@/lib/actions/products';
import { Gender, Size } from '@/lib/types/enum';
import { Brand, Category } from '@/lib/types/types';
import { useTranslations } from 'next-intl';

const GENDERS = Object.values(Gender);
const SIZES = Object.values(Size);
const CURRENCIES = ['TND', 'USD', 'AED'];

// ------------------
// ✅ Zod Schema
// ------------------
const priceSchema = z.object({
  currency: z.string().min(1),
  price: z.coerce.number().nonnegative(),
});

const variantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  gender: z.string().min(1),
  stock: z.coerce.number().int().nonnegative(),
  prices: z.array(priceSchema).min(1),
});

const translationSchema = z.object({
  locale: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
});

const baseSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
  images: z.any().optional(),
  translations: z.array(translationSchema).min(1),
  hasVariants: z.enum(['true', 'false']),
});

const productSchema = baseSchema.and(
  z.discriminatedUnion('hasVariants', [
    z.object({
      hasVariants: z.literal('true'),
      variants: z.array(variantSchema).min(1),
      stock: z.number(),
      prices: z.array(priceSchema),
    }),
    z.object({
      hasVariants: z.literal('false'),
      variants: z.undefined(),
      stock: z.coerce.number().nonnegative(),
      prices: z.array(priceSchema).min(1),
    }),
  ]),
);

type FormValues = z.infer<typeof productSchema>;

export default function AddProductClient({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      hasVariants: 'true',
      translations: [{ locale: 'ar', name: '', description: '' }],
      variants: [
        {
          size: '',
          color: '',
          gender: 'UNISEX',
          stock: 0,
          prices: [{ currency: 'TND', price: 0 }],
        },
      ],
      prices: [{ currency: 'TND', price: 0 }],
    },
  });

  const hasVariants = watch('hasVariants') === 'true';

  useEffect(() => {
    if (hasVariants) {
      setValue('prices', []);
      setValue('stock', 0);
    } else {
      setValue('variants', undefined);
    }
  }, [hasVariants]);

  const {
    fields: translationFields,
    append: appendTranslation,
    remove: removeTranslation,
  } = useFieldArray({ control, name: 'translations' });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: 'variants' });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({ control, name: 'prices' });

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return [];

    const uploaded = await Promise.all(
      Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/uploads/products`,
          {
            method: 'POST',
            body: formData,
          },
        );

        const data = await res.json();
        return data?.url?.replace(/\\/g, '/');
      }),
    );

    const urls = uploaded.filter(Boolean) as string[];
    setUploadedImages((prev) => [...prev, ...urls]);
    if (imageRef.current) imageRef.current.value = '';
    return urls;
  };

  const onSubmit = async (data: FormValues) => {
    console.log('✅ Final form data:', data);

    try {
      let images = uploadedImages;

      if (data.images?.length && uploadedImages.length === 0) {
        images = await handleImageUpload(data.images);
      }

      const payload = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        brandId: data.brandId,
        images,
        hasVariants: data.hasVariants === 'true',
        translations: data.translations,
        ...(hasVariants
          ? { variants: data.variants }
          : { stock: data.stock ?? 0, prices: data.prices }),
      };

      console.log('🟢 Sending payload:', payload);

      await createProduct(payload);
      toast.success('Product created!');
      reset();
      router.push('/admin/products/list');
    } catch (err: any) {
      console.error('❌ Product creation failed:', err);
      toast.error(err.message || 'Failed to create product');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {tCommon('add') + ' ' + t('products')}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <div>
          <Label>{tCommon('name')}</Label>
          <Input {...register('name')} />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label>{tCommon('description')}</Label>
          <Textarea {...register('description')} />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        {/* Translations */}
        <div>
          <Label>{tCommon('translations')}</Label>
          {translationFields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-4 gap-2 items-end">
              <Input
                placeholder={tCommon('locale')}
                {...register(`translations.${idx}.locale`)}
              />
              <Input
                placeholder={tCommon('name')}
                {...register(`translations.${idx}.name`)}
              />
              <Input
                placeholder={tCommon('description')}
                {...register(`translations.${idx}.description`)}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeTranslation(idx)}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() =>
              appendTranslation({ locale: '', name: '', description: '' })
            }
          >
            {tCommon('add')} {tCommon('translation')} +
          </Button>
        </div>

        {/* Brand */}
        <div>
          <Label>{tCommon('brand')}</Label>
          <Controller
            control={control}
            name="brandId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={tCommon('select') + ' ' + tCommon('brand')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.brandId && (
            <p className="text-red-500 text-sm">{errors.brandId.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <Label>{tCommon('category')}</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={tCommon('select') + ' ' + tCommon('category')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-red-500 text-sm">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <Label>{tCommon('images')}</Label>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
            ref={(el) => {
              register('images').ref(el);
              imageRef.current = el;
            }}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {uploadedImages.map((url, i) => (
              <div key={i} className="relative">
                <Image
                  src={url}
                  alt="uploaded"
                  width={80}
                  height={80}
                  className="rounded border"
                />
                <button
                  type="button"
                  onClick={() =>
                    setUploadedImages((imgs) =>
                      imgs.filter((_, idx) => idx !== i),
                    )
                  }
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Has Variants */}
        <div>
          <Label>{tCommon('hasVariants')}</Label>
          <div className="flex gap-4 mt-2">
            <label>
              <input
                type="radio"
                value="true"
                {...register('hasVariants')}
                defaultChecked
              />{' '}
              {tCommon('yes')}
            </label>
            <label>
              <input type="radio" value="false" {...register('hasVariants')} />{' '}
              {tCommon('no')}
            </label>
          </div>
        </div>

        {/* Variants or Prices */}
        {hasVariants ? (
          <>
            {variantFields.map((field, idx) => (
              <div key={field.id} className="border p-4 rounded space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <Controller
                    control={control}
                    name={`variants.${idx}.size`}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tCommon('size')} />
                        </SelectTrigger>
                        <SelectContent>
                          {SIZES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    placeholder={tCommon('color')}
                    {...register(`variants.${idx}.color`)}
                  />
                  <Controller
                    control={control}
                    name={`variants.${idx}.gender`}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={tCommon('gender')} />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDERS.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Input
                  type="number"
                  placeholder={tCommon('stock')}
                  {...register(`variants.${idx}.stock`)}
                />

                <Label>{tCommon('price')}</Label>
                <Controller
                  control={control}
                  name={`variants.${idx}.prices`}
                  render={({ field }) => (
                    <>
                      {field.value?.map((_, pIdx) => (
                        <div
                          key={pIdx}
                          className="grid grid-cols-3 gap-2 items-center"
                        >
                          <Controller
                            control={control}
                            name={`variants.${idx}.prices.${pIdx}.currency`}
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
                            placeholder={tCommon('price')}
                            {...register(
                              `variants.${idx}.prices.${pIdx}.price`,
                            )}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => {
                              const prices =
                                watch(`variants.${idx}.prices`) ?? [];
                              const newPrices = [
                                ...prices.slice(0, pIdx),
                                ...prices.slice(pIdx + 1),
                              ];
                              setValue(`variants.${idx}.prices`, newPrices);
                            }}
                          >
                            ❌
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() =>
                          setValue(`variants.${idx}.prices`, [
                            ...(field.value || []),
                            { currency: 'TND', price: 0 },
                          ])
                        }
                      >
                        {tCommon('add')} {tCommon('price')} +
                      </Button>
                    </>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeVariant(idx)}
                >
                  {tCommon('remove')} {tCommon('variant')}
                </Button>
              </div>
            ))}
            <Button
              type="button"
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
          </>
        ) : (
          <>
            <Label>{tCommon('price')}</Label>
            {priceFields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-2 gap-2 items-center"
              >
                <Controller
                  control={control}
                  name={`prices.${idx}.currency`}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
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
                  placeholder="Price"
                  {...register(`prices.${idx}.price`)}
                />
              </div>
            ))}
            <Button
              type="button"
              onClick={() => appendPrice({ currency: 'TND', price: 0 })}
            >
              {tCommon('add')} {tCommon('price')} +
            </Button>

            <Input
              type="number"
              placeholder={tCommon('stock')}
              {...register('stock')}
              className="mt-4"
            />
          </>
        )}

        <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
          {isSubmitting
            ? tCommon('creating')
            : tCommon('create') + ' ' + t('products')}
        </Button>
      </form>
    </div>
  );
}
