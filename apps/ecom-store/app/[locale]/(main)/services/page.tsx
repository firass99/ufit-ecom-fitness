'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function ServicePage() {
  const t = useTranslations('services');

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {t('welcomeTitle')}
        </h1>
        <p className="text-muted-foreground text-lg">{t('welcomeDesc')}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">
            {t('features.gearTitle')}
          </h2>
          <p className="text-muted-foreground">{t('features.gearDesc')}</p>
        </div>

        {/* Feature 2 */}
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">
            {t('features.coachTitle')}
          </h2>
          <p className="text-muted-foreground">{t('features.coachDesc')}</p>
        </div>

        {/* Feature 3 */}
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-2">
            {t('features.analyticsTitle')}
          </h2>
          <p className="text-muted-foreground">{t('features.analyticsDesc')}</p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-4">{t('ctaTitle')}</h3>
        <p className="text-muted-foreground mb-6">{t('ctaDesc')}</p>
        <Link
          href="/account"
          className="inline-block bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition"
        >
          {t('ctaBtn')}
        </Link>
      </div>
    </section>
  );
}
