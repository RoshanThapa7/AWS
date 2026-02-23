'use client';

import { useState } from 'react';

type TaskView = {
  id: number;
  title: string;
  period: 'day' | 'week';
  targetCount: number;
  completed: number;
};

export function TasksClient({ initialTasks, adhocToday }: { initialTasks: TaskView[]; adhocToday: string[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [adhoc, setAdhoc] = useState(adhocToday);
  const [quickTitle, setQuickTitle] = useState('');

  const refresh = () => location.reload();

  async function addTask(formData: FormData) {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        period: formData.get('period'),
        targetCount: formData.get('targetCount')
      })
    });
    refresh();
  }

  async function addCompletion(taskId: number, action: 'add' | 'remove') {
    await fetch('/api/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, action })
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: Math.max(0, t.completed + (action === 'add' ? 1 : -1)) } : t))
    );
  }

  async function addAdhoc() {
    if (!quickTitle.trim()) return;
    await fetch('/api/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'adhoc', title: quickTitle })
    });
    setAdhoc((prev) => [quickTitle, ...prev]);
    setQuickTitle('');
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="space-y-4">
        <div className="bg-card rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Task List</h2>
          <div className="space-y-3">
            {tasks.map((task) => {
              const remaining = Math.max(0, task.targetCount - task.completed);
              const done = task.completed >= task.targetCount;
              return (
                <div key={task.id} className="p-3 bg-slate-900/40 rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-slate-400">
                      {task.period === 'day' ? `${task.targetCount}x/day` : `${task.targetCount}x/week`} · completed {task.completed}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addCompletion(task.id, 'remove')}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700"
                    >
                      -
                    </button>
                    <button
                      onClick={() => addCompletion(task.id, 'add')}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500"
                    >
                      {done ? 'Done' : `+ ${remaining}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <form
          action={addTask}
          className="bg-card rounded-2xl p-4 grid sm:grid-cols-4 gap-2 items-end"
        >
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-slate-400">Task name</span>
            <input name="title" required className="w-full" />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-slate-400">Frequency</span>
            <select name="period" className="w-full">
              <option value="day">Times per day</option>
              <option value="week">Times per week</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm text-slate-400">Target</span>
            <input type="number" name="targetCount" defaultValue={1} min={1} className="w-full" />
          </label>
          <button className="sm:col-span-4 bg-emerald-500 text-slate-900 py-2 rounded-lg font-semibold">Add Task</button>
        </form>
      </div>

      <aside className="bg-card rounded-2xl p-4 h-fit lg:sticky top-4">
        <h3 className="font-semibold mb-2">Quick Complete (unscheduled)</h3>
        <p className="text-sm text-slate-400 mb-3">Mark a completed action even if not pre-defined.</p>
        <div className="flex gap-2 mb-3">
          <input value={quickTitle} onChange={(e) => setQuickTitle(e.target.value)} placeholder="e.g. Extra walk" className="flex-1" />
          <button onClick={addAdhoc} className="bg-emerald-600 px-3 rounded">Add</button>
        </div>
        <div className="space-y-2 max-h-64 overflow-auto">
          {adhoc.map((title, i) => (
            <p key={`${title}-${i}`} className="text-sm bg-slate-900/50 rounded p-2">✅ {title}</p>
          ))}
        </div>
      </aside>
    </div>
  );
}
