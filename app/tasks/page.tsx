import { AppShell } from '@/components/app-shell';
import { TasksClient } from '@/components/tasks-client';
import { requireAuth } from '@/lib/auth';
import { db, Task } from '@/lib/db';
import { dateKey, weekStartKey } from '@/lib/date';

export default async function TasksPage() {
  await requireAuth();

  const tasks = db.prepare('SELECT * FROM tasks WHERE active = 1 ORDER BY createdAt DESC').all() as Task[];
  const dailyMap = new Map<number, number>();
  const weeklyMap = new Map<number, number>();

  const daily = db
    .prepare('SELECT taskId, COUNT(*) as count FROM completions WHERE date = ? AND taskId IS NOT NULL GROUP BY taskId')
    .all(dateKey()) as { taskId: number; count: number }[];
  const weekly = db
    .prepare('SELECT taskId, COUNT(*) as count FROM completions WHERE date = ? AND taskId IS NOT NULL GROUP BY taskId')
    .all(weekStartKey()) as { taskId: number; count: number }[];

  daily.forEach((row) => dailyMap.set(row.taskId, row.count));
  weekly.forEach((row) => weeklyMap.set(row.taskId, row.count));

  const model = tasks.map((task) => ({
    ...task,
    completed: task.period === 'day' ? dailyMap.get(task.id) || 0 : weeklyMap.get(task.id) || 0
  }));

  const adhoc = db
    .prepare('SELECT titleSnapshot FROM completions WHERE taskId IS NULL AND date = ? ORDER BY createdAt DESC')
    .all(dateKey()) as { titleSnapshot: string }[];

  return (
    <AppShell title="Tasks & Habits">
      <TasksClient initialTasks={model} adhocToday={adhoc.map((a) => a.titleSnapshot)} />
    </AppShell>
  );
}
