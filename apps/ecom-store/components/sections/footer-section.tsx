'use client';

import { Separator } from '@repo/design-system/components/ui/separator';
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  TwitterIcon,
  Dumbbell,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function FooterSection() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const footerLinks = [
    {
      title: t('sections.programs.title'),
      links: [
        { name: t('sections.programs.links.0'), href: '#' },
        { name: t('sections.programs.links.1'), href: '#' },
        { name: t('sections.programs.links.2'), href: '#' },
        { name: t('sections.programs.links.3'), href: '#' },
      ],
    },
    {
      title: t('sections.resources.title'),
      links: [
        { name: t('sections.resources.links.0'), href: '#' },
        { name: t('sections.resources.links.1'), href: '#' },
        { name: t('sections.resources.links.2'), href: '#' },
        { name: t('sections.resources.links.3'), href: '#' },
      ],
    },
    {
      title: t('sections.company.title'),
      links: [
        { name: t('sections.company.links.0'), href: '#' },
        { name: t('sections.company.links.1'), href: '#' },
        { name: t('sections.company.links.2'), href: '#' },
        { name: t('sections.company.links.3'), href: '#' },
      ],
    },
    {
      title: t('sections.legal.title'),
      links: [
        { name: t('sections.legal.links.0'), href: '#' },
        { name: t('sections.legal.links.1'), href: '#' },
        { name: t('sections.legal.links.2'), href: '#' },
      ],
    },
  ];

  return (
    <footer
      className="bg-muted py-16 px-10"
      dir={isArabic ? 'rtl' : 'ltr'}
      style={isArabic ? { fontFamily: 'Cairo, sans-serif' } : undefined}
    >
      <div className="container mx-auto px-6 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">UFitPal</span>
            </Link>
            <p className="mt-4 text-muted-foreground max-w-md">
              {t('description')}
            </p>
            <div className="mt-6 flex items-center gap-4 text-muted-foreground">
              <Link
                href="#"
                aria-label="Instagram"
                className="hover:text-primary transition-transform hover:scale-110"
              >
                <InstagramIcon className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                aria-label="Facebook"
                className="hover:text-primary transition-transform hover:scale-110"
              >
                <FacebookIcon className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                aria-label="YouTube"
                className="hover:text-primary transition-transform hover:scale-110"
              >
                <YoutubeIcon className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                aria-label="Twitter"
                className="hover:text-primary transition-transform hover:scale-110"
              >
                <TwitterIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary hover:underline transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} UFitPal. {t('rights')}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {t('footerBottom.privacy')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {t('footerBottom.terms')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {t('footerBottom.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
