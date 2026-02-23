'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/calories', label: 'Calories' },
  { href: '/diary', label: 'Diary' },
  { href: '/settings', label: 'Settings' }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-60 bg-card rounded-2xl p-4 h-fit sticky top-4">
      <h2 className="text-lg font-semibold mb-4">Productivity OS</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              'block rounded-lg px-3 py-2 text-sm',
              pathname.startsWith(link.href) ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-slate-800 text-slate-300'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <form action="/api/auth/logout" method="post" className="mt-4">
        <button className="w-full bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-sm">Logout</button>
      </form>
    </aside>
  );
}
