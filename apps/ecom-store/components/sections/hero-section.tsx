import { Button } from '@repo/design-system/components/ui/button';
import { MoveRight, ShoppingBag, Headset, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import HeroImg from '@/public/hero.jpg';
import { getTranslations } from 'next-intl/server';

export default async function HeroSection() {
  const t = await getTranslations('hero');

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] relative overflow-hidden px-5 sm:px-10">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(${HeroImg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="container mx-auto relative py-20 lg:py-40 z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t('tagline')}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                {t('title.first')}{' '}
                <span className="text-primary">{t('title.second')}</span>{' '}
                {t('title.third')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                {t('description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-3" asChild>
                <Link href="/products">
                  {t('cta_primary')} <MoveRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-3" asChild>
                <Link href="/categories">
                  <Star className="h-5 w-5 text-yellow-500" />
                  {t('cta_secondary')}
                </Link>
              </Button>
            </div>

            <div className="flex gap-8 pt-8 border-t border-border/30">
              <div>
                <h3 className="text-3xl font-bold text-primary">
                  {t('stats.products.value')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('stats.products.label')}
                </p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-primary">
                  {t('stats.support.value')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('stats.support.label')}
                </p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="hidden md:flex justify-center relative">
            <div className="w-full max-w-md aspect-square bg-primary/10 rounded-full animate-pulse-slow absolute inset-0 blur-2xl" />
            <div className="relative z-10 w-full max-w-md aspect-square bg-background/80 rounded-full border border-primary/20 shadow-2xl overflow-hidden">
              <Image
                src={HeroImg}
                alt="Ecommerce showcase"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
