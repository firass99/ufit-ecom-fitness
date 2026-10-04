// /app/api/test-backend/route.ts
import { getProducts } from '@/lib/actions/products';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Extract lang from the query param
    const url = new URL(request.url);
    const lang = url.searchParams.get('locale') || 'en'; // default to 'en'
    console.log('this is lang ', lang);

    const res = await getProducts({ lang });

    return NextResponse.json(res); // not wrapped inside { res }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error', stack: err.stack },
      { status: 500 },
    );
  }
}
