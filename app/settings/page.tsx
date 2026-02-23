import { AppShell } from '@/components/app-shell';
import { SettingsClient } from '@/components/settings-client';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function SettingsPage() {
  await requireAuth();
  const target = Number((db.prepare("SELECT value FROM settings WHERE key = 'targetCalories'").get() as { value: string } | undefined)?.value || 1800);

  return (
    <AppShell title="Settings">
      <SettingsClient target={target} />
    </AppShell>
  );
}
