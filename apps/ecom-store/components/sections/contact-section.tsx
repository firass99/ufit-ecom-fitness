import { Mail, MapPin, Phone } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';

export default function ContactSection() {
  const t = useTranslations('contact');
  const locale = useLocale();
  // dir={isArabic ? 'ltr' : 'ltr'}
  const isArabic = locale === 'ar';
  return (
    <section
      className="py-32 bg-background"
      style={isArabic ? { fontFamily: 'Cairo, sans-serif' } : undefined}
    >
      {' '}
      <div className="container">
        <div className="mb-14 text-center md:text-left">
          <span className="text-sm font-semibold uppercase text-primary">
            {t('sectionTitle')}
          </span>
          <h1 className="mt-2 mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t('mainHeading')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
            {t('description')}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {/* Email */}
          <div className="text-center md:text-left">
            <div className="mb-4 flex items-center justify-center md:justify-start">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                <Mail className="h-6 w-6" />
              </span>
            </div>
            <h3 className="text-lg font-semibold">{t('emailTitle')}</h3>
            <p className="mb-3 text-muted-foreground">
              {t('emailDescription')}
            </p>
            <a
              href={`mailto:${t('emailLink')}`}
              className="font-semibold text-primary hover:underline"
            >
              {t('emailLink')}
            </a>
          </div>

          {/* Location */}
          <div className="text-center md:text-left">
            <div className="mb-4 flex items-center justify-center md:justify-start">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                <MapPin className="h-6 w-6" />
              </span>
            </div>
            <h3 className="text-lg font-semibold">{t('locationTitle')}</h3>
            <p className="mb-3 text-muted-foreground">
              {t('locationDescription')}
            </p>
            <a
              href="https://maps.google.com?q=123 Fitness Avenue, Wellness City"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              {t('locationLink')}
            </a>
          </div>

          {/* Hotline */}
          <div className="text-center md:text-left">
            <div className="mb-4 flex items-center justify-center md:justify-start">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                <Phone className="h-6 w-6" />
              </span>
            </div>
            <h3 className="text-lg font-semibold">{t('phoneTitle')}</h3>
            <p className="mb-3 text-muted-foreground">
              {t('phoneDescription')}
            </p>
            <a
              href={`tel:${t('phoneLink')}`}
              className="font-semibold text-primary hover:underline"
            >
              {t('phoneLink')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
