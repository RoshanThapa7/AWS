import { AppShell } from '@/components/app-shell';
import { TasksClient } from '@/components/tasks-client';
import { requireAuth } from '@/lib/auth';
import { dateKey, fromDateKey, weekStartKey } from '@/lib/date';
import { db, Task } from '@/lib/db';

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function TasksPage({ searchParams }: PageProps) {
  await requireAuth();
  const params = await searchParams;
  const selectedDate = params.date || dateKey();
  const selectedDateObj = fromDateKey(selectedDate);

  const tasks = db
    .prepare('SELECT * FROM tasks WHERE active = 1 AND (scheduledDate IS NULL OR scheduledDate = ?) ORDER BY sortOrder ASC, createdAt ASC')
    .all(selectedDate) as Task[];

  const dailyMap = new Map<number, number>();
  const weeklyMap = new Map<number, number>();

  const daily = db
    .prepare('SELECT taskId, COUNT(*) as count FROM completions WHERE date = ? AND taskId IS NOT NULL GROUP BY taskId')
    .all(selectedDate) as { taskId: number; count: number }[];
  const weekly = db
    .prepare('SELECT taskId, COUNT(*) as count FROM completions WHERE date = ? AND taskId IS NOT NULL GROUP BY taskId')
    .all(weekStartKey(selectedDateObj)) as { taskId: number; count: number }[];

  daily.forEach((row) => dailyMap.set(row.taskId, row.count));
  weekly.forEach((row) => weeklyMap.set(row.taskId, row.count));

  const model = tasks.map((task) => ({
    ...task,
    completed: task.period === 'day' ? dailyMap.get(task.id) || 0 : weeklyMap.get(task.id) || 0
  }));

  return (
    <AppShell title="Tasks & Habits">
      <TasksClient initialTasks={model} selectedDate={selectedDate} />
    </AppShell>
  );
}
