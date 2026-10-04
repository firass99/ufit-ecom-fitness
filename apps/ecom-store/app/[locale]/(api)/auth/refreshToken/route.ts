export async function refreshToken() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_NEST_BACKEND_URL}/auth/refresh`,
    {
      method: 'POST',
      credentials: 'include', // Important: sends cookies
    },
  );

  if (!res.ok) throw new Error('Refresh failed');
  return res.json(); // { accessToken, ... }
}
