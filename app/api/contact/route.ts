import { NextResponse } from 'next/server';
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
    return NextResponse.redirect(new URL('/contact?error=invalid', request.url), 303);
  }
  await getDb().insert(contactMessages).values({ name, email, subject, message, status: 'new', createdAt: new Date() });
  return NextResponse.redirect(new URL('/contact?sent=1', request.url), 303);
}
