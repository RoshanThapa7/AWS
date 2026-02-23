import { redirect } from 'next/navigation';
import { isAuthenticated, userExists } from '@/lib/auth';

export default async function Home() {
  if (!userExists()) redirect('/auth/setup');
  if (await isAuthenticated()) redirect('/dashboard');
  redirect('/auth/login');
}
