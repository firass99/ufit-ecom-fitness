import './globals.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';
import { Locale, routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import { cookies } from 'next/headers';
import NavbarSection from '@/components/sections/navbar-section';

export const metadata: Metadata = {
  title: 'UFITPAL',
  description: 'An app for UfitPal - Fitness & Nutrition',
};

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const cookieStore = await cookies();
  const currency = cookieStore.get('currency')?.value ?? 'USD';

  return (
    <NextIntlClientProvider messages={messages}>
      <html
        lang={locale}
        dir={isArabic ? 'rtl' : 'ltr'}
        suppressHydrationWarning
      >
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body
          className={`transition-colors duration-300 ${isArabic ? 'font-arabic' : ''}`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <NavbarSection />
            <main
              className={`min-h-screen flex flex-col ${isArabic ? 'rtl' : 'ltr'}`}
            >
              {children}
            </main>
          </ThemeProvider>
          <Toaster richColors position="bottom-center" />
        </body>
      </html>
    </NextIntlClientProvider>
  );
}
