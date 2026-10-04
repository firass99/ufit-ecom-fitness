'use server';

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { Session } from '../types/types';

const secretKey = process.env.SESSION_SECRET_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: Session) {
  const cookieStore = await cookies();

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Or based on accessToken expiry
    .sign(encodedKey);

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function getSession(): Promise<Session | null> {
  const cookie = (await cookies()).get('session')?.value;

  if (!cookie) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<Session>(cookie, encodedKey, {
      algorithms: ['HS256'],
    });

    // Cache the session
    //    cachedSession = { session: payload, timestamp: Date.now() };
    return payload;
  } catch (err) {
    console.error('Invalid session token:', err);
    //cachedSession = { session: null, timestamp: Date.now() };
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  cookieStore.delete('refreshToken');
  // Clear the cached session
  //cachedSession = null;
  console.log('Session cookie deleted');
}

export async function updateTokens({ accessToken }: { accessToken: string }) {
  const session = await getSession();
  if (!session) throw new Error('No session found');

  const newSession: Session = {
    ...session,
    accessToken,
  };

  // Update the session and cache
  await createSession(newSession);

  // Update the cache with the new session
  //cachedSession = { session: newSession, timestamp: Date.now() };
}
