import { createSession } from '@/lib/actions/session';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');
  // Validate query params BEFORE doing anything
  if (!accessToken || !refreshToken || !userId || !role) {
    console.error('Missing Link OAuth data:', {
      accessToken,
      refreshToken,
      userId,
      role,
    });
    redirect('/auth/error');
  }

  if (
    typeof accessToken !== 'string' ||
    typeof refreshToken !== 'string' ||
    typeof userId !== 'string' ||
    typeof role !== 'string'
  ) {
    console.error('Invalid types for OAuth callback params');
    redirect('/account/error');
  }
  // Only wrap async logic
  try {
    await createSession({
      user: { id: userId, role },
      accessToken,
    });
  } catch (err) {
    console.error('Session creation error:', err);
    redirect('/account/error');
  }

  // Safe to call redirect after everything succeeded
  redirect('/account');
}
