import { NextResponse } from 'next/server';
import { login, verifyPassword } from '@/lib/auth';

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get('password') || '');

  if (!(await verifyPassword(password))) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  await login();
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
