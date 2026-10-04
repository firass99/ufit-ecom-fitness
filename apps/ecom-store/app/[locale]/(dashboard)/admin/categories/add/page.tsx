'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { toast } from 'sonner';
import { createCategory, CreateCategoryDto } from '@/lib/actions/categories';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function AddCategoryPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
    setValue,
  } = useForm<CreateCategoryDto>({
    defaultValues: {
      translations: [{ locale: 'ar', name: '', description: '' }],
    },
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'translations',
  });

  const handleImageUpload = async (file: File | null) => {
    if (!file) return null;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/categories`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = await res.json();
      if (data?.url) {
        const url = data.url.replace(/\\/g, '/');
        setUploadedImage(url);
        setValue('image', url); // for payload if needed
      }
    } catch {
      toast.error('Failed to upload image');
    }
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setValue('image', '');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const onSubmit = async (data: CreateCategoryDto) => {
    try {
      // Add image to data if present
      if (uploadedImage) data.image = uploadedImage;
      await createCategory(data);
      toast.success('Category created');
      router.push('/admin/categories/list');
    } catch (e: any) {
      toast.error(
        e.message || tCommon('failToCreate') + ' ' + tCommon('category'),
      );
    }
  };

  return (
    <>
      {/*       <h1 className="text-2xl font-bold mb-4">{`${tCommon('add')} ${tCommon('category')}`}</h1>
       */}{' '}
      {/* Filter Row */}
      <div className="mb-4 flex flex-wrap justify-between gap-3"></div>
      <div className="max-w-xl mx-auto p-6 bg-background rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-6">{`${tCommon('add')} ${tCommon('category')}`}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">
                {tCommon('name')} {tCommon('default')}{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                autoFocus
                required
                {...register('name', { required: true })}
              />
            </div>
            <div>
              <Label htmlFor="description">
                {tCommon('description')} {tCommon('default')}
              </Label>
              <Textarea
                id="description"
                rows={3}
                {...register('description')}
              />
            </div>
            {/* Single Image Upload */}
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="image">{tCommon('image')}</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={async (e) => {
                  const file = e.target.files?.[0] ?? null;
                  await handleImageUpload(file);
                }}
              />
              {uploadedImage && (
                <div className="relative mt-2">
                  <Image
                    src={uploadedImage}
                    alt="preview"
                    width={80}
                    height={80}
                    className="rounded border"
                  />
                  <button
                    type="button"
                    className="absolute -top-2  z-10 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center opacity-90 hover:opacity-100 shadow"
                    onClick={handleRemoveImage}
                    aria-label="Remove image"
                    tabIndex={-1}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <hr className="my-4 border-muted" />

          {/* Translations */}
          <div className="space-y-2">
            <Label className="mb-2">{tCommon('translations')}</Label>
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-3 gap-2 items-center group"
              >
                <Input
                  placeholder={tCommon('locale')}
                  autoCapitalize="off"
                  autoCorrect="off"
                  {...register(`translations.${idx}.locale` as const, {
                    required: true,
                  })}
                  required
                />
                <Input
                  placeholder={tCommon('name')}
                  {...register(`translations.${idx}.name` as const)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder={tCommon('description')}
                    {...register(`translations.${idx}.description` as const)}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    tabIndex={-1}
                    onClick={() => remove(idx)}
                    className="self-center text-muted-foreground"
                    aria-label="Remove translation"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                append({ id: '', locale: '', name: '', description: '' })
              }
              /*             onClick={() => append({ locale: '', name: '', description: '' })}
               */ className="mt-2"
            >
              {tCommon('add') + ' ' + tCommon('translation')}
            </Button>
          </div>

          <Button className="w-full mt-4" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? tCommon('saving')
              : tCommon('create') + ' ' + tCommon('category')}
          </Button>
        </form>
      </div>
    </>
  );
}
