'use client';

import { TrendLine } from './charts';

export function CaloriesClient({
  calories,
  weights,
  target,
  actual,
  ideal,
  diff,
  message
}: {
  calories: { date: string; calories: number }[];
  weights: { date: string; weight: number }[];
  target: number;
  actual: number;
  ideal: number;
  diff: number;
  message: string;
}) {
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-4">
        <form className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold">Log calories</h2>
          <input type="date" name="date" className="w-full" />
          <input type="number" name="calories" placeholder="Calories" className="w-full" required />
          <button
            type="button"
            className="w-full bg-emerald-600 py-2 rounded"
            onClick={async (e) => {
              const form = e.currentTarget.closest('form') as HTMLFormElement;
              const fd = new FormData(form);
              await fetch('/api/calories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: fd.get('date'), calories: fd.get('calories') }) });
              location.reload();
            }}
          >
            Save calories
          </button>
        </form>

        <form className="bg-card rounded-2xl p-4 space-y-3">
          <h2 className="font-semibold">Log weight</h2>
          <input type="date" name="date" className="w-full" />
          <input type="number" step="0.1" name="weight" placeholder="Weight" className="w-full" required />
          <button
            type="button"
            className="w-full bg-blue-600 py-2 rounded"
            onClick={async (e) => {
              const form = e.currentTarget.closest('form') as HTMLFormElement;
              const fd = new FormData(form);
              await fetch('/api/weight', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: fd.get('date'), weight: fd.get('weight') }) });
              location.reload();
            }}
          >
            Save weight
          </button>
        </form>
      </div>

      <div className="bg-card rounded-2xl p-4">
        <h3 className="font-semibold mb-2">Calorie trend</h3>
        <TrendLine data={calories.map((c) => ({ ...c, date: c.date.slice(5) }))} dataKey="calories" color="#f59e0b" />
      </div>

      <div className="bg-card rounded-2xl p-4">
        <h3 className="font-semibold mb-2">Weight trend</h3>
        <TrendLine data={weights.map((w) => ({ ...w, date: w.date.slice(5) }))} dataKey="weight" color="#60a5fa" />
      </div>

      <div className="bg-card rounded-2xl p-4">
        <h3 className="font-semibold">Weekly summary</h3>
        <p className="text-sm text-slate-400">Target: {target} × 7 = {ideal} kcal</p>
        <p className="text-lg mt-1">Actual: {actual} kcal</p>
        <p className={`font-semibold ${diff <= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>{diff <= 0 ? `Deficit ${Math.abs(diff)} kcal` : `Surplus ${diff} kcal`}</p>
        <p className="text-sm mt-2 text-slate-300">{message}</p>
      </div>
    </>
  );
}
