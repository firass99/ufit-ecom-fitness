// app/[locale]/(api)/auth/carts/[userid]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { userid: string } },
) {
  try {
    const { userid } = params;

    if (!userid) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const res = await fetch(
      `http://localhost:3000/carts/558cbec3-9305-4952-b093-35470efef2b`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const cart = await res.json();
    return NextResponse.json(cart);
  } catch (error) {
    console.error('[GET /api/auth/carts/[userid]]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
