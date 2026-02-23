import { AppShell } from '@/components/app-shell';
import { DiaryClient } from '@/components/diary-client';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function DiaryPage() {
  await requireAuth();
  const entries = db.prepare('SELECT date, content FROM diary_entries ORDER BY date DESC').all() as { date: string; content: string }[];

  return (
    <AppShell title="Diary">
      <DiaryClient entries={entries} />
    </AppShell>
  );
}
