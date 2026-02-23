import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { targetCalories } = await req.json();
  db.prepare('INSERT OR REPLACE INTO settings(key, value) VALUES (?, ?)').run('targetCalories', String(Number(targetCalories || 1800)));
  return NextResponse.json({ ok: true });
}
