'use client';

import logo from '@/public/logo.jpeg';
import Image from 'next/image';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import { sendLoginEmail } from '@/lib/actions/auth';
import { useLocale, useTranslations } from 'next-intl';

export default function LoginForm({
  searchParams,
}: {
  searchParams?: Record<string, string>;
}) {
  const magicMessage = searchParams?.message ?? null;
  const t = useTranslations('login');
  const locale = useLocale();

  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 bg-background animate-fade-in"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-md px-8 py-10 animate-slide-up-fade space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" aria-label="Go Home" className="animate-pulse">
            <Image src={logo} alt="UFITPAL logo" width={48} height={48} />
          </Link>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-sm text-muted-foreground text-center">
            {t('welcome')}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            variant="outline"
            className="w-full flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
            aria-label={t('google')}
          >
            <Link href="http://localhost:5000/auth/google/login">
              <FcGoogle className="w-5 h-5" />
              <span>{t('google')}</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
            aria-label={t('facebook')}
          >
            <Link href="http://localhost:5000/auth/facebook/login">
              <FaFacebookF className="w-5 h-5 text-[#1877F2]" />
              <span>{t('facebook')}</span>
            </Link>
          </Button>
        </div>

        <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <hr className="border-dashed" />
          <span className="text-muted-foreground text-xs">{t('or')}</span>
          <hr className="border-dashed" />
        </div>

        <form action={sendLoginEmail}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                {t('emailLabel')}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <Button
              className="w-full hover:scale-[1.01] transition-transform"
              type="submit"
            >
              {t('submit')}
            </Button>

            {magicMessage && (
              <p className="text-sm text-destructive text-center mt-2">
                {magicMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
