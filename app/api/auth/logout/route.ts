import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';
export async function POST(request: Request) {
  await clearSession();
  if (request.headers.get('oai-authenticated-user-id')) return NextResponse.redirect(new URL('/signout-with-chatgpt?return_to=%2F', request.url), 303);
  return NextResponse.redirect(new URL('/', request.url), 303);
}
