import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Store, List, Settings, MessageSquare, Tag, Bell, Smartphone } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-950 text-slate-50 p-6 md:min-h-screen border-r border-slate-800">
        <div className="flex items-center gap-2 mb-8">
          <Store className="h-6 w-6" />
          <h1 className="text-xl font-bold">Svaneya Admin</h1>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            <Package className="h-4 w-4" />
            Products
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            <List className="h-4 w-4" />
            Categories
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-pink-400">
            <Bell className="h-4 w-4" />
            Notifications
          </Link>
          <Link href="/admin/mobile-banners" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            <Smartphone className="h-4 w-4" />
            Mobile Banners
          </Link>
          <Link href="/admin/promo-codes" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            <Tag className="h-4 w-4" />
            Promo Codes
          </Link>
          <Link href="/admin/reviews" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            <MessageSquare className="h-4 w-4" />
            Reviews
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
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
