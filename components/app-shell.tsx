import { Sidebar } from './sidebar';

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="p-4 lg:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">
        <Sidebar />
        <section className="flex-1 space-y-4">
          <header>
            <h1 className="text-2xl lg:text-3xl font-semibold">{title}</h1>
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
