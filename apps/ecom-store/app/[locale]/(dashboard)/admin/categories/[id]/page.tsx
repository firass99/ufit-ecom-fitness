'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { toast } from 'sonner';
import {
  getCategory,
  updateCategory,
  UpdateCategoryDto,
} from '@/lib/actions/categories';
import Image from 'next/image';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : '';
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<UpdateCategoryDto>({
    defaultValues: {
      name: '',
      description: '',
      image: '',
      translations: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'translations',
  });

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return '';
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/categories`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = await res.json();
      if (data?.url) {
        return data.url.replace(/\\/g, '/');
      }
    } catch {
      toast.error('Failed to upload image');
    }
    return '';
  };

  const handleRemoveImage = () => {
    setUploadedImage('');
    setValue('image', '', { shouldDirty: true });
  };

  useEffect(() => {
    (async () => {
      try {
        const cat = await getCategory(id);
        console.log('thisssss is categories', cat);

        const image = cat.image ?? '';
        setUploadedImage(image);
        reset({
          name: cat.name ?? '',
          description: cat.description ?? '',
          image: image,
          translations: cat.translations?.length
            ? cat.translations
            : [{ locale: 'ar', name: '', description: '' }],
        });
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load category');
        router.push('/admin/categories/list');
      }
    })();
  }, [id, reset, router]);

  useEffect(() => {
    setValue('image', uploadedImage, { shouldDirty: true });
  }, [uploadedImage, setValue]);

  const onSubmit = async (data: UpdateCategoryDto) => {
    try {
      await updateCategory(id, { ...data, image: uploadedImage });
      toast.success('Category updated');
      router.push('/admin/categories/list');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update category');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-background rounded-xl shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Edit Category</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Default fields */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="name">
              Name (default) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              required
              {...register('name', { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description (default)</Label>
            <Textarea id="description" rows={3} {...register('description')} />
          </div>
        </div>

        {/* Image (single file, preview & remove) */}
        <div>
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={async (e) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;
              const url = await handleImageUpload(files);
              if (url) {
                setUploadedImage(url);
              }
              if (imageInputRef.current) imageInputRef.current.value = '';
            }}
          />
          {uploadedImage && (
            <div className="flex gap-2 mt-3">
              <div className="relative group">
                <Image
                  src={uploadedImage}
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
                  onClick={handleRemoveImage}
                  aria-label="Remove"
                >
                  ×
                </Button>
              </div>
            </div>
          )}
        </div>

        <hr className="my-4 border-muted" />

        {/* Translations */}
        <div className="space-y-2">
          <Label className="mb-2">Translations</Label>
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="grid grid-cols-3 gap-2 items-center group"
            >
              <Input
                placeholder="Locale (ar, en, fr)"
                autoCapitalize="off"
                autoCorrect="off"
                {...register(`translations.${idx}.locale` as const, {
                  required: true,
                })}
                required
              />
              <Input
                placeholder="Name"
                {...register(`translations.${idx}.name` as const)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Description"
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
            onClick={() => append({ locale: '', name: '', description: '' })}
            className="mt-2"
          >
            + Add Translation
          </Button>
        </div>

        <Button
          className="w-full mt-4"
          type="submit"
          disabled={isSubmitting || !isDirty}
        >
          {isSubmitting ? 'Updating...' : 'Update Category'}
        </Button>
      </form>
    </div>
  );
}
