import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';
import { dateKey } from '@/lib/date';

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { calories, date } = await req.json();
  db.prepare('INSERT OR REPLACE INTO calorie_entries(date, calories) VALUES (?, ?)').run(date || dateKey(), Number(calories));
  return NextResponse.json({ ok: true });
}
