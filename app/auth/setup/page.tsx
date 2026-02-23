import { redirect } from 'next/navigation';
import { userExists } from '@/lib/auth';

export default function SetupPage() {
  if (userExists()) redirect('/auth/login');

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <form action="/api/auth/setup" method="post" className="w-full max-w-sm bg-card p-6 rounded-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Create your local account</h1>
        <p className="text-sm text-slate-400">This app is local-only. Your password is stored as a hash in SQLite.</p>
        <input name="password" type="password" minLength={8} placeholder="New password" required className="w-full" />
        <button className="w-full bg-emerald-500 text-slate-900 font-semibold py-2 rounded-lg hover:bg-emerald-400">Save & continue</button>
      </form>
    </main>
  );
}
