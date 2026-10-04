import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',
  /* 
    pathnames: {
      '/account': {
        en: '/account',
        ar: '/الحساب',
      },
      '/contact': {
        en: '/contact-us',
        ar: '/اتصل بنا',
      },
      '/service': {
        en: '/service',
        ar: '/خدمة',
      },
      '/product': {
        en: '/product',
        ar: '/منتج',
      },
      '/session': {
        en: '/session',
        ar: '/جلسة',
      },
    }, */
});

export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
