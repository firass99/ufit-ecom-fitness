'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';

import { updateBrand } from '@/lib/actions/brands';
import { Brand } from '@/lib/types/types';

import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { useTranslations } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Props = {
  brand: Brand;
};

export default function EditBrandClient({ brand }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  const [logoPreview, setLogoPreview] = useState<string | null>(
    brand.logo || null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<{
    name: string;
    logo?: string;
  }>({
    defaultValues: {
      name: brand.name,
      logo: brand.logo || '',
    },
  });

  const handleLogoUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/uploads/brands`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error('Upload failed');
      }

      const url = data.url.replace(/\\/g, '/');
      setLogoPreview(url);
      setValue('logo', url);
      toast.success('Logo uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Logo upload failed');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onSubmit = async (data: { name: string; logo?: string }) => {
    try {
      await updateBrand(brand.id, data);
      toast.success(tCommon('updated') + ' ' + tCommon('brand'));
      router.push('/admin/brands/list');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update brand');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {tCommon('edit') + ' ' + tCommon('brand')}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Brand Name */}
        <div>
          <Label>{tCommon('name')}</Label>
          <Input {...register('name', { required: true })} />
        </div>

        {/* Logo Upload */}
        <div>
          <Label>{tCommon('logo')}</Label>
          <Input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoUpload(file);
            }}
            disabled={isUploading}
          />

          {logoPreview && (
            <div className="mt-3">
              <Image
                src={
                  logoPreview.startsWith('http')
                    ? logoPreview
                    : `${process.env.NEXT_PUBLIC_API_URL}/${logoPreview.replace(/^\/+/, '')}`
                }
                alt="Brand Logo"
                width={80}
                height={80}
                className="rounded border object-contain bg-white"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full"
        >
          {isSubmitting
            ? tCommon('updating')
            : tCommon('update') + ' ' + tCommon('brand')}
        </Button>
      </form>
    </div>
  );
}
