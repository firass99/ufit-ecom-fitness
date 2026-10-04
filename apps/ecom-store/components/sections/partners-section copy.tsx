// app/components/PartnersSection.tsx
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@repo/design-system/components/ui/carousel';
import { getBrands } from '@/lib/actions/brands'; // server action
import { useTranslations } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

export default async function PartnersSection() {
  const res = await getBrands();
  const brands = Array.isArray(res?.data) ? res.data : [];
  const t = await getTranslations('partners');

  // Duplicate the array for seamless looping
  const loopedBrands = [...brands, ...brands];

  return (
    <section className="w-full bg-muted py-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold">{t('title')}</h2>
      </div>

      <Carousel opts={{ align: 'start', loop: true }} className="w-full">
        <CarouselContent>
          {loopedBrands.map((brand, i) => (
            <CarouselItem
              key={brand.id + '-' + i}
              className="flex items-center justify-center basis-1/2 sm:basis-1/4 md:basis-1/6"
            >
              <div className="flex flex-col items-center w-full px-4 py-3 bg-background rounded-lg shadow-sm border border-muted-foreground/10 hover:shadow-md transition">
                {brand.logo ? (
                  <Image
                    width={90}
                    height={90}
                    src={
                      brand.logo.startsWith('http')
                        ? brand.logo
                        : `${brand.logo.startsWith('/') ? brand.logo : '/' + brand.logo}`
                    }
                    alt={brand.name}
                    className="h-12 w-auto object-contain mb-2"
                    draggable={false}
                    priority={i < 6}
                  />
                ) : (
                  <div className="h-12 flex items-center justify-center text-xs text-muted-foreground mb-2">
                    No Logo
                  </div>
                )}
                <span className="sr-only">{brand.name}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
