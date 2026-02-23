import { NextResponse } from 'next/server';
import { login, setPassword, userExists } from '@/lib/auth';

export async function POST(req: Request) {
  if (userExists()) return NextResponse.redirect(new URL('/auth/login', req.url));

  const form = await req.formData();
  const password = String(form.get('password') || '');
  if (password.length < 8) return NextResponse.redirect(new URL('/auth/setup', req.url));

  await setPassword(password);
  await login();
  return NextResponse.redirect(new URL('/dashboard', req.url));
}
