'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@repo/design-system/components/ui/carousel';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import clsx from 'clsx';

const partners = [
  { name: 'Nike', logo: '/partners/nike.svg' },
  { name: 'Adidas', logo: '/partners/adidas.svg' },
  { name: 'Reebok', logo: '/partners/reebok.svg' },
  { name: 'Under Armour', logo: '/partners/ua.svg' },
  { name: 'Decathlon', logo: '/partners/decathlon.svg' },
  { name: 'Gymshark', logo: '/partners/gymshark.svg' },
];

export default function PartnersSection() {
  const [embla, setEmbla] = React.useState<any>(null);
  const t = useTranslations('partners');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const partnersLoop = [...partners, ...partners]; // seamless loop

  React.useEffect(() => {
    if (!embla) return;
    const interval = setInterval(() => {
      if (embla.canScrollNext()) {
        embla.scrollNext();
      } else {
        embla.scrollTo(0);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [embla]);

  return (
    <section className="w-full bg-muted py-10">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold">{t('title')}</h2>
      </div>
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        setApi={setEmbla}
        className="w-full"
      >
        <CarouselContent>
          {partnersLoop.map((partner, i) => (
            <CarouselItem
              key={partner.name + i}
              className="flex items-center justify-center basis-1/2 sm:basis-1/4 md:basis-1/6"
            >
              <div className="flex flex-col items-center min-w-[100px] max-w-[160px] px-4 py-3 bg-background rounded-lg shadow-sm border border-muted-foreground/10 hover:shadow-lg transition">
                <Image
                  width={90}
                  height={90}
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 object-contain mb-2"
                  draggable={false}
                  priority={i < 6}
                />
                <span className="sr-only">{partner.name}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
