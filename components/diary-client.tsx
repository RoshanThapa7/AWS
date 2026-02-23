'use client';

import { useState } from 'react';

export function DiaryClient({ entries }: { entries: { date: string; content: string }[] }) {
  const [selectedDate, setSelectedDate] = useState(entries[0]?.date || new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState(entries.find((e) => e.date === selectedDate)?.content || '');

  const onDateChange = (date: string) => {
    setSelectedDate(date);
    setContent(entries.find((e) => e.date === date)?.content || '');
  };

  return (
    <div className="grid lg:grid-cols-[220px_1fr] gap-4">
      <aside className="bg-card rounded-2xl p-3 max-h-[70vh] overflow-auto">
        <button onClick={() => onDateChange(new Date().toISOString().slice(0, 10))} className="w-full text-left px-3 py-2 rounded hover:bg-slate-800">Today</button>
        {entries.map((entry) => (
          <button key={entry.date} onClick={() => onDateChange(entry.date)} className="w-full text-left px-3 py-2 rounded hover:bg-slate-800 text-sm">
            {entry.date}
          </button>
        ))}
      </aside>
      <section className="bg-card rounded-2xl p-4 space-y-3">
        <input type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)} className="w-fit" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16} className="w-full resize-none" placeholder="Write your daily reflection..." />
        <button
          className="bg-emerald-600 rounded px-4 py-2"
          onClick={async () => {
            await fetch('/api/diary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: selectedDate, content }) });
            location.reload();
          }}
        >
          Save entry
        </button>
      </section>
    </div>
  );
}
