import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';
import { dateKey, weekStartKey } from '@/lib/date';

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();

  if (body.type === 'adhoc') {
    const title = String(body.title || '').trim();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    db.prepare('INSERT INTO completions(taskId, titleSnapshot, date) VALUES (NULL, ?, ?)').run(title, dateKey());
    return NextResponse.json({ ok: true });
  }

  const taskId = Number(body.taskId);
  const action = body.action === 'remove' ? 'remove' : 'add';
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as { period: 'day' | 'week' } | undefined;
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  if (action === 'add') {
    const targetDate = task.period === 'day' ? dateKey() : weekStartKey();
    db.prepare('INSERT INTO completions(taskId, date) VALUES (?, ?)').run(taskId, targetDate);
  } else {
    const targetDate = task.period === 'day' ? dateKey() : weekStartKey();
    db.prepare('DELETE FROM completions WHERE id = (SELECT id FROM completions WHERE taskId = ? AND date = ? ORDER BY createdAt DESC LIMIT 1)').run(taskId, targetDate);
  }

  return NextResponse.json({ ok: true });
}
