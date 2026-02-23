import { redirect } from 'next/navigation';
import { isAuthenticated, userExists } from '@/lib/auth';

export default async function LoginPage() {
  if (!userExists()) redirect('/auth/setup');
  if (await isAuthenticated()) redirect('/dashboard');

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <form action="/api/auth/login" method="post" className="w-full max-w-sm bg-card p-6 rounded-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <input name="password" type="password" placeholder="Password" required className="w-full" />
        <button className="w-full bg-emerald-500 text-slate-900 font-semibold py-2 rounded-lg hover:bg-emerald-400">Login</button>
      </form>
    </main>
  );
}
