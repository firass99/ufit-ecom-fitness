import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 md:px-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">{t('title')}</h1>

      <p className="text-muted-foreground mb-4 text-base leading-relaxed">
        {t('section1')}
      </p>
      <p className="text-muted-foreground mb-4 text-base leading-relaxed">
        {t('section2')}
      </p>
      <p className="text-muted-foreground mb-6 text-base leading-relaxed">
        {t('section3')}
      </p>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">{t('missionTitle')}</h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          {t('missionText')}
        </p>
      </div>

      <div className="mt-10 text-sm text-muted-foreground">
        {t('footerNote')}
      </div>
    </div>
  );
}
