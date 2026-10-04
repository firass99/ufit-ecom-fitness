import { getSession } from '@/lib/actions/session';
import { Locale, routing } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import './globals.css';
import AdminDashboardTemplate from '@/components/template/dashboard/admin-dashboard';
import { ThemeProvider } from 'next-themes';

export default async function AdminDashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  // Check if locale is valid
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const session = await getSession();
  const messages = await getMessages();

  // If no session, redirect to login
  if (!session) {
    redirect(`/${locale}/account`);
  } else if (session?.user.role !== 'ADMIN') {
    redirect(`/${locale}`);
  }

  return (
    <html lang={locale} dir={isArabic ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`transition-colors duration-300 ${isArabic ? 'font-arabic' : ''}`}
      >
        <AdminDashboardTemplate>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
        </AdminDashboardTemplate>
      </body>
    </html>
  );
}
