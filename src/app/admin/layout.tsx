import Link from 'next/link';
import { Store } from 'lucide-react';
import { SidebarNav } from './SidebarNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-950 text-slate-50 p-6 md:min-h-screen border-r border-slate-800">
        <div className="flex items-center gap-2 mb-8">
          <Store className="h-6 w-6" />
          <h1 className="text-xl font-bold">Svaneya Admin</h1>
        </div>
        <SidebarNav />
        <div className="mt-8 pt-8 border-t border-slate-800 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-50">
            <Store className="h-4 w-4" />
            Back to Store
          </Link>
          <form action="/admin/login" method="POST" className="block w-full">
            <button formAction={async () => {
              "use server";
              const { logout } = await import('./login/actions');
              await logout();
            }} className="flex w-full items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-slate-400 hover:text-red-400">
              Logout
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8 bg-slate-50 text-slate-900">
        {children}
      </main>
    </div>
  );
}
