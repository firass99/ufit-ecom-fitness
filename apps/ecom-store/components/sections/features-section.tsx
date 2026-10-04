'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

const featureImages = [
  'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?cs=srgb&dl=pexels-victorfreitas-841130.jpg',
  '/features/personal-training.jpg',
  '/features/nutrition-plan.jpg',
  '/features/ai-assistant.jpg',
  '/features/community.jpg',
];

export default function FeaturesSection() {
  const locale = useLocale();
  const t = useTranslations('featuresSection');
  const features = t.raw('features') as {
    category: string;
    title: string;
    details: string;
  }[];
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 ">
      <div className="max-w-screen-xl w-full py-20 px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center max-w-3xl mx-auto">
          {t('heading')}
        </h2>
        <p className="mt-5 text-lg text-muted-foreground text-center max-w-2xl mx-auto">
          {t('subheading')}
        </p>

        <div className="mt-16 md:mt-24 space-y-24">
          {features.map((feature, i) => (
            <div
              key={feature.category}
              className={`flex flex-col-reverse md:flex-row ${i % 2 === 1 ? 'md:flex-row-reverse' : ''} items-center gap-y-10 md:gap-x-16`}
            >
              {/* IMAGE */}
              <div className="relative w-full aspect-[6/4] md:w-1/2 rounded-xl overflow-hidden shadow-xl border border-border group">
                <Image
                  src={featureImages[i]}
                  alt={feature.category}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* TEXT */}
              <div
                className={`md:w-1/2 ${locale === 'ar' ? 'md:text-right' : 'md:text-left'} text-center `}
              >
                <span className="text-primary font-semibold text-sm uppercase tracking-wide">
                  {feature.category}
                </span>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-4 text-muted-foreground text-[17px] leading-relaxed">
                  {feature.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
