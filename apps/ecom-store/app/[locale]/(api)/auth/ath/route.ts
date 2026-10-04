export async function POST(request: Request) {
  const body = await request.json();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const { email, password, age, weight, height, phone, address } = body;
  const user = await fetch(`${API_URL}/auth/athlete/create`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      age,
      weight,
      height,
      phone,
      address,
    }),
  });
  return user;
}
