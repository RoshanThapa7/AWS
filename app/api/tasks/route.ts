import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const title = String(body.title || '').trim();
  const period = body.period === 'week' ? 'week' : 'day';
  const targetCount = Math.max(1, Number(body.targetCount || 1));

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  db.prepare('INSERT INTO tasks(title, period, targetCount) VALUES (?, ?, ?)').run(title, period, targetCount);
  return NextResponse.json({ ok: true });
}
