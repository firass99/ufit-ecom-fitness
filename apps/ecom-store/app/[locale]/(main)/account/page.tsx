import LoginForm from '@/components/sections/login-form';
import { getSession } from '@/lib/actions/session';
import { Locale } from '@/i18n/routing';
import { redirect } from 'next/navigation';

export default async function AccountMainPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  // The middleware already bounces authenticated users before this renders;
  // this is a safety net, so keep the targets locale-prefixed to avoid a
  // second redirect through next-intl.
  if (!session?.accessToken) {
    return <LoginForm />;
  }
  if (session.user.role === 'ADMIN') {
    redirect(`/${locale}/admin`);
  }
  if (session.user.role === 'ATHLETE') {
    redirect(`/${locale}/athlete`);
  }
  redirect(`/${locale}`);
}
