import LoginForm from '@/components/sections/login-form';
import { getSession } from '@/lib/actions/session';
import { redirect } from 'next/navigation';

export default async function AccountMainPage() {
  const session = await getSession();
  if (!session?.accessToken) {
    return <LoginForm />;
  } else if (session?.user.role === 'ADMIN') {
    redirect('/admin');
  } else if (session?.user.role === 'ATHLETE') {
    redirect('/athlete');
  } else {
    redirect('/');
  }
}
