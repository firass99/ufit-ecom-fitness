import { createSession } from '@/lib/actions/session';
import { Role } from '@/lib/types/enum';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const accessToken = searchParams.get('accessToken');
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');

  if (
    !accessToken ||
    !userId ||
    !role ||
    typeof accessToken !== 'string' ||
    typeof userId !== 'string' ||
    typeof role !== 'string'
  ) {
    console.error('Missing or invalid Socials OAuth data:', {
      accessToken,
      userId,
      role,
    });
    //throw new Error("invalid search params");

    return NextResponse.redirect(new URL('/account', req.url));
  }

  try {
    await createSession({
      user: { id: userId, role: role as Role },
      //accessToken: accessToken + 22,
      accessToken: accessToken,
    });
  } catch (err) {
    console.error('Session creation error:', err);
    return NextResponse.redirect(new URL('/account', req.url));
  }

  // All good, redirect to account page
  if (role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', req.url));
  } else if (role === 'ATHLETE') {
    return NextResponse.redirect(new URL('/athlete', req.url));
  }
}
