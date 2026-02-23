'use client';

import { addDays, format } from 'date-fns';
import { useMemo, useState } from 'react';

type TaskView = {
  id: number;
  title: string;
  period: 'day' | 'week';
  targetCount: number;
  completed: number;
  scheduledDate: string | null;
};

export function TasksClient({ initialTasks, selectedDate }: { initialTasks: TaskView[]; selectedDate: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [mode, setMode] = useState<'recurring' | 'one-time'>('recurring');
  const tomorrow = useMemo(() => format(addDays(new Date(`${selectedDate}T00:00:00`), 1), 'yyyy-MM-dd'), [selectedDate]);

  const refresh = (date = selectedDate) => {
    window.location.href = `/tasks?date=${date}`;
  };

  async function addTask(formData: FormData) {
    const title = String(formData.get('title') || '');
    const period = String(formData.get('period') || 'day');
    const targetCount = Number(formData.get('targetCount') || 1);
    const when = String(formData.get('when') || 'today');

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        period,
        targetCount,
        mode,
        scheduledDate: mode === 'one-time' ? (when === 'tomorrow' ? tomorrow : selectedDate) : null
      })
    });

    refresh(when === 'tomorrow' && mode === 'one-time' ? tomorrow : selectedDate);
  }

  async function addCompletion(taskId: number, action: 'add' | 'remove') {
    await fetch('/api/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, action, date: selectedDate })
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: Math.max(0, t.completed + (action === 'add' ? 1 : -1)) } : t))
    );
  }

  async function persistOrder(updated: TaskView[]) {
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: updated.map((task) => task.id) })
    });
  }

  function onDropAt(targetId: number) {
    if (draggingId === null || draggingId === targetId) return;
    const fromIndex = tasks.findIndex((t) => t.id === draggingId);
    const toIndex = tasks.findIndex((t) => t.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const updated = [...tasks];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTasks(updated);
    setDraggingId(null);
    persistOrder(updated);
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Task date</p>
          <input type="date" value={selectedDate} onChange={(e) => refresh(e.target.value)} className="mt-1" />
        </div>
        <p className="text-sm text-slate-400">Drag cards to reorder. Order is saved automatically.</p>
      </div>

      <div className="bg-card rounded-2xl p-4">
        <h2 className="font-semibold mb-3">Task List</h2>
        <div className="space-y-3">
          {tasks.map((task) => {
            const remaining = Math.max(0, task.targetCount - task.completed);
            const done = task.completed >= task.targetCount;
            const oneTime = Boolean(task.scheduledDate);
            return (
              <div
                key={task.id}
                draggable
                onDragStart={() => setDraggingId(task.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropAt(task.id)}
                className="p-3 bg-slate-900/40 rounded-lg flex items-center justify-between gap-3 cursor-grab"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-slate-400">
                    {oneTime ? `one-time (${task.scheduledDate})` : task.period === 'day' ? `${task.targetCount}x/day` : `${task.targetCount}x/week`} · completed {task.completed}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addCompletion(task.id, 'remove')} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700">
                    -
                  </button>
                  <button onClick={() => addCompletion(task.id, 'add')} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500">
                    {done ? 'Done' : `+ ${remaining}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form action={addTask} className="bg-card rounded-2xl p-4 grid sm:grid-cols-4 gap-2 items-end">
        <label className="space-y-1 sm:col-span-2">
          <span className="text-sm text-slate-400">Task name</span>
          <input name="title" required className="w-full" />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-slate-400">Type</span>
          <select value={mode} onChange={(e) => setMode(e.target.value as 'recurring' | 'one-time')} className="w-full">
            <option value="recurring">Recurring</option>
            <option value="one-time">One-time task</option>
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-sm text-slate-400">Target</span>
          <input type="number" name="targetCount" defaultValue={1} min={1} className="w-full" />
        </label>

        {mode === 'recurring' ? (
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-slate-400">Frequency</span>
            <select name="period" className="w-full">
              <option value="day">Times per day</option>
              <option value="week">Times per week</option>
            </select>
          </label>
        ) : (
          <label className="space-y-1 sm:col-span-2">
            <span className="text-sm text-slate-400">Schedule</span>
            <select name="when" className="w-full">
              <option value="today">Add task for today</option>
              <option value="tomorrow">Add task for tomorrow</option>
            </select>
          </label>
        )}

        <button className="sm:col-span-2 bg-emerald-500 text-slate-900 py-2 rounded-lg font-semibold">Add Task</button>
      </form>
    </div>
  );
}
