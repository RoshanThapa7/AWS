import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { date, content } = await req.json();
  db.prepare('INSERT OR REPLACE INTO diary_entries(date, content) VALUES (?, ?)').run(String(date), String(content));
  return NextResponse.json({ ok: true });
}
