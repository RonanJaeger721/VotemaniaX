import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';
import { appUrl } from '@/lib/app-url';
export async function POST(request: Request) {
  await clearSession();
  return NextResponse.redirect(appUrl(request, '/'), 303);
}
