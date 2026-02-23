import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const title = String(body.title || '').trim();
  const mode = body.mode === 'one-time' ? 'one-time' : 'recurring';
  const period = body.period === 'week' ? 'week' : 'day';
  const targetCount = Math.max(1, Number(body.targetCount || 1));
  const scheduledDate = mode === 'one-time' ? String(body.scheduledDate || '').trim() : null;

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
  if (mode === 'one-time' && !scheduledDate) return NextResponse.json({ error: 'Date required' }, { status: 400 });

  const maxRow = db.prepare('SELECT COALESCE(MAX(sortOrder), 0) as maxSort FROM tasks').get() as { maxSort: number };
  db.prepare('INSERT INTO tasks(title, period, targetCount, sortOrder, scheduledDate) VALUES (?, ?, ?, ?, ?)').run(
    title,
    mode === 'one-time' ? 'day' : period,
    targetCount,
    maxRow.maxSort + 1,
    scheduledDate
  );

  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds.map(Number).filter(Boolean) : [];
  if (!orderedIds.length) return NextResponse.json({ error: 'No task ids provided' }, { status: 400 });

  const tx = db.transaction((ids: number[]) => {
    ids.forEach((id, idx) => {
      db.prepare('UPDATE tasks SET sortOrder = ? WHERE id = ?').run(idx + 1, id);
    });
  });
  tx(orderedIds);

  return NextResponse.json({ ok: true });
}
