'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@repo/design-system/components/ui/carousel';
import { Card, CardContent } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { Category, CategoryTranslation } from '@/lib/types/types';
import { getCategories } from '@/lib/actions/categories';
import { useLocale, useTranslations } from 'next-intl';

export default function CategoriesSection() {
  const [embla, setEmbla] = React.useState<CarouselApi | null>(null);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const locale = useLocale();
  const t = useTranslations('categories');
  const isArabic = locale === 'ar';

  const isHoveringRef = React.useRef(false);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  React.useEffect(() => {
    if (!embla) return;

    const interval = setInterval(() => {
      if (isHoveringRef.current) return;
      if (embla.canScrollNext()) {
        embla.scrollNext();
      } else {
        embla.scrollTo(0);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [embla]);

  function getLocalizedName(cat: Category) {
    if (locale === 'en') return cat.name;
    return (
      cat.translations?.find((t: CategoryTranslation) => t.locale === locale)
        ?.name || cat.name
    );
  }

  function getLocalizedDesc(cat: Category) {
    if (locale === 'en') return cat.description;
    return (
      cat.translations?.find((t: CategoryTranslation) => t.locale === locale)
        ?.description || cat.description
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase px-3 py-1 bg-black text-white rounded-full">
          {t('title1')}
        </span>
        <h2 className="text-4xl font-extrabold mt-4">{t('title2')}</h2>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          {t('description')}
        </p>
      </div>

      <Carousel
        opts={{ align: 'start', direction: isArabic ? 'rtl' : 'ltr' }}
        setApi={setEmbla}
        className="w-full"
      >
        <CarouselContent
          onMouseEnter={() => (isHoveringRef.current = true)}
          onMouseLeave={() => (isHoveringRef.current = false)}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <CarouselItem
                  key={idx}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="p-2">
                    <Card className="overflow-hidden rounded-xl shadow-sm animate-pulse h-80" />
                  </div>
                </CarouselItem>
              ))
            : categories.map((cat) => (
                <CarouselItem
                  key={cat.id}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div className="p-2">
                    <Link href={`/products?categoryId=${cat.id}`}>
                      <Card className="overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-transform duration-300 hover:scale-[1.03] group">
                        <CardContent className="relative p-0 h-64">
                          {/* Image Background */}
                          <Image
                            priority
                            src={cat.image}
                            alt={getLocalizedName(cat)}
                            width={800}
                            height={256}
                            className="absolute inset-0 w-full h-full object-cover"
                          />

                          {/* Overlay Layer that slides from bottom */}
                          <div className="absolute inset-0 bg-black/80 text-white p-4 flex flex-col justify-end transform translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out z-30">
                            <h3 className="text-lg font-bold mb-1">
                              {getLocalizedName(cat)}
                            </h3>
                            <p className="text-sm text-white/80 line-clamp-3">
                              {getLocalizedDesc(cat)}
                            </p>
                          </div>

                          {/* Always Visible Title */}
                          <div className="absolute bottom-4 left-4 right-4 text-white z-20 group-hover:opacity-0 transition-opacity duration-300">
                            <h3 className="text-base font-bold">
                              {getLocalizedName(cat)}
                            </h3>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </CarouselItem>
              ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* CTA */}
      <div className="text-center mt-16">
        <h4 className="text-xl font-semibold">{t('ctaTitle')}</h4>
        <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
          {t('ctaDescription')}
        </p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <Button asChild>
            <Link href="/products">{t('btn')} →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
