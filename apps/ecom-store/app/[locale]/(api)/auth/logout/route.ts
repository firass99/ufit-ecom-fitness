import { deleteSession } from '@/lib/actions/session';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  await deleteSession();
  //reval cache
  revalidatePath('/');

  return NextResponse.redirect(new URL('/', req.url));
}
