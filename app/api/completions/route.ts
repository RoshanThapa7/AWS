import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';
import { dateKey, fromDateKey, weekStartKey } from '@/lib/date';

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();

  const taskId = Number(body.taskId);
  const action = body.action === 'remove' ? 'remove' : 'add';
  const selectedDate = String(body.date || dateKey());
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as { period: 'day' | 'week' } | undefined;
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const baseDate = fromDateKey(selectedDate);
  const targetDate = task.period === 'day' ? selectedDate : weekStartKey(baseDate);

  if (action === 'add') {
    db.prepare('INSERT INTO completions(taskId, date) VALUES (?, ?)').run(taskId, targetDate);
  } else {
    db.prepare('DELETE FROM completions WHERE id = (SELECT id FROM completions WHERE taskId = ? AND date = ? ORDER BY createdAt DESC LIMIT 1)').run(taskId, targetDate);
  }

  return NextResponse.json({ ok: true });
}
