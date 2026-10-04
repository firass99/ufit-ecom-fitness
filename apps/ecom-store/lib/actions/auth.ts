'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get user profile (JWT required)
export async function getUserProfile(accessToken: string) {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'force-cache',
    next: { revalidate: 60 }, // Revalidate every 60 seconds NEW NEW
  });

  if (!res.ok) throw new Error('Failed to fetch profile');

  return res.json();
}

// Logout a single session
export async function logout(accessToken: string) {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

// Logout all sessions
export async function logoutAll(accessToken: string) {
  const res = await fetch(`${API_URL}/auth/logout-all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error('Logout all sessions failed');
  return res.json();
}
/* 
export async function MagicLink(_currentState: unknown, formData: FormData) {
  const email = formData.get('email') as string;

  try {
    const response = await fetch('http://localhost:5000/auth/link/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const { accessToken, refreshToken } = await response.json();
    await setAuthToken(accessToken);
    await setRefreshToken(refreshToken);
    const UserCacheTag = await getCacheTag('customers');
    revalidateTag(UserCacheTag);
  } catch (error: any) {
    return error.toString();
  }

  try {
    await transferCart();
  } catch (error: any) {
    return error.toString();
  }
} */
// Trigger magic link email login
export async function sendLoginEmail(email: string) {
  const res = await fetch(`${API_URL}/auth/link/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error('Failed to send login email');
  return res.json();
}

// Callback logic for email login is handled by backend redirect

export async function refreshToken(oldRefreshToken: string) {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${oldRefreshToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Refresh failed: ${res.status} ${err}`);
  }

  return res.json(); // returns { accessToken, refreshToken }
}
