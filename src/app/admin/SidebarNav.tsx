"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, List, Settings, MessageSquare, Tag, Bell, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/categories', icon: List, label: 'Categories' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { href: '/admin/mobile-banners', icon: Smartphone, label: 'Mobile Banners' },
    { href: '/admin/promo-codes', icon: Tag, label: 'Promo Codes' },
    { href: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = link.exact 
          ? pathname === link.href 
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors",
              isActive ? "text-pink-400 font-medium" : "text-slate-300"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
