import { NextResponse } from 'next/server';
import { appUrl } from '@/lib/app-url';
import { getDb } from '@/db';
import { contactMessages } from '@/db/schema';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const subject = String(form.get('subject') || '').trim();
  const message = String(form.get('message') || '').trim();
  if (name.length < 2 || !emailPattern.test(email) || subject.length < 3 || message.length < 10) {
    return NextResponse.redirect(appUrl(request, '/contact?error=invalid'), 303);
  }
  await getDb().insert(contactMessages).values({ name, email, subject, message, status: 'new', createdAt: new Date() });
  return NextResponse.redirect(appUrl(request, '/contact?sent=1'), 303);
}
