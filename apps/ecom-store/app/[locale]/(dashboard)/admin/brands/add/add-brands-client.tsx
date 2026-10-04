'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';

import { createBrand } from '@/lib/actions/brands';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function AddBrandClient() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = useTranslations('dashboard.sidebar');
  const tCommon = useTranslations('dashboard.common');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/brands/`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error('Failed to upload image');
      }

      setLogoUrl(data.url);
      toast.success('Logo uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Name is required');
    try {
      await createBrand({ name, logo: logoUrl ?? undefined });
      toast.success('Brand created!');
      router.push('/admin/brands/list');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create brand');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {tCommon('add') + ' ' + tCommon('brand')}
      </h1>

      <div>
        <Label>{tCommon('name')}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <Label>{tCommon('logo')}</Label>
        <Input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />
        {logoUrl && (
          <div className="mt-2">
            <Image
              src={logoUrl}
              alt="Logo preview"
              width={80}
              height={80}
              className="rounded border object-contain"
            />
          </div>
        )}
      </div>

      <Button onClick={handleSubmit} disabled={uploading} className="w-full">
        {uploading
          ? tCommon('uploading')
          : tCommon('create') + ' ' + tCommon('brand')}
      </Button>
    </div>
  );
}
