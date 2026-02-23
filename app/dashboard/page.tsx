import { AppShell } from '@/components/app-shell';
import { TrendLine } from '@/components/charts';
import { requireAuth } from '@/lib/auth';
import { db, Task } from '@/lib/db';
import { dateKey } from '@/lib/date';
import { eachDayOfInterval, format, subDays } from 'date-fns';

export default async function DashboardPage() {
  await requireAuth();

  const tasks = db
    .prepare("SELECT * FROM tasks WHERE period='day' AND active = 1 AND (scheduledDate IS NULL OR scheduledDate = ?) ORDER BY sortOrder ASC, createdAt ASC")
    .all(dateKey()) as Task[];
  const expected = tasks.reduce((sum, t) => sum + t.targetCount, 0);
  const todayDoneRow = db
    .prepare("SELECT COUNT(*) as count FROM completions c JOIN tasks t ON c.taskId = t.id WHERE c.date = ? AND t.period='day'")
    .get(dateKey()) as { count: number };
  const completed = todayDoneRow.count;
  const pct = expected ? Math.min(100, Math.round((completed / expected) * 100)) : 0;

  const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
  const trend = days.map((day) => {
    const key = format(day, 'yyyy-MM-dd');
    const expectedRow = db
      .prepare("SELECT COALESCE(SUM(targetCount),0) as expected FROM tasks WHERE period='day' AND active = 1 AND (scheduledDate IS NULL OR scheduledDate = ?)")
      .get(key) as { expected: number };
    const dayDone = db
      .prepare("SELECT COUNT(*) as count FROM completions c JOIN tasks t ON c.taskId = t.id WHERE c.date = ? AND t.period='day'")
      .get(key) as { count: number };
    const value = expectedRow.expected ? Math.min(100, Math.round((dayDone.count / expectedRow.expected) * 100)) : 0;
    return { date: format(day, 'MM/dd'), completion: value };
  });

  return (
    <AppShell title="Dashboard">
      <div className="bg-card rounded-2xl p-5 space-y-3">
        <p className="text-slate-300">Daily completion</p>
        <p className="text-4xl font-bold">{pct}%</p>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-slate-400">{completed}/{expected} scheduled daily checkmarks completed today.</p>
      </div>

      <div className="bg-card rounded-2xl p-5">
        <h2 className="font-semibold mb-2">Weekly performance trend</h2>
        <TrendLine data={trend} dataKey="completion" color="#60a5fa" />
      </div>

      <div className="bg-card rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Today’s tasks (custom order)</h2>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="bg-slate-900/40 rounded-lg px-3 py-2 text-sm">
              {task.title}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
