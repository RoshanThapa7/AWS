'use client';

import { useState } from 'react';

export function SettingsClient({ target }: { target: number }) {
  const [value, setValue] = useState(target);

  return (
    <div className="bg-card rounded-2xl p-4 max-w-xl space-y-3">
      <h2 className="font-semibold">Calorie Target</h2>
      <p className="text-sm text-slate-400">Used for weekly surplus/deficit analysis.</p>
      <div className="flex gap-2">
        <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full" />
        <button
          type="button"
          className="bg-emerald-600 px-4 rounded"
          onClick={async () => {
            await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetCalories: value }) });
            location.reload();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
