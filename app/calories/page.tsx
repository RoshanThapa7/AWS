import { AppShell } from '@/components/app-shell';
import { CaloriesClient } from '@/components/calories-client';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

function getMessage(diff: number) {
  if (diff <= 0) return 'Great discipline this week. Keep this momentum going.';
  if (diff <= 400) return 'Slight surplus. Tighten portions and stay consistent tomorrow.';
  return 'You overate this week. Reset now: prioritize high-protein, lower-calorie meals.';
}

export default async function CaloriesPage() {
  await requireAuth();

  const calories = db.prepare('SELECT date, calories FROM calorie_entries ORDER BY date ASC').all() as { date: string; calories: number }[];
  const weights = db.prepare('SELECT date, weight FROM weight_entries ORDER BY date ASC').all() as { date: string; weight: number }[];
  const target = Number((db.prepare("SELECT value FROM settings WHERE key = 'targetCalories'").get() as { value: string } | undefined)?.value || 1800);

  const last7 = calories.slice(-7);
  const actual = last7.reduce((sum, e) => sum + e.calories, 0);
  const ideal = target * 7;
  const diff = actual - ideal;

  return (
    <AppShell title="Calories & Weight">
      <CaloriesClient calories={calories} weights={weights} target={target} actual={actual} ideal={ideal} diff={diff} message={getMessage(diff)} />
    </AppShell>
  );
}
