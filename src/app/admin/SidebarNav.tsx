"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, List, Settings, MessageSquare, Tag, Bell, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SidebarNav() {
  const pathname = usePathname();

  const linkGroups = [
    {
      title: "Overview",
      items: [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      ]
    },
    {
      title: "Store Management",
      items: [
        { href: '/admin/products', icon: Package, label: 'Products' },
        { href: '/admin/categories', icon: List, label: 'Categories' },
        { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { href: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
        { href: '/admin/promo-codes', icon: Tag, label: 'Promo Codes' },
      ]
    },
    {
      title: "Mobile App Controls",
      items: [
        { href: '/admin/mobile-banners', icon: Smartphone, label: 'Mobile Banners' },
        { href: '/admin/notifications', icon: Bell, label: 'Push Notifications' },
      ]
    },
    {
      title: "Configuration",
      items: [
        { href: '/admin/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {linkGroups.map((group) => (
        <div key={group.title}>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {group.title}
          </h3>
          <nav className="space-y-1">
            {group.items.map((link) => {
              const Icon = link.icon;
              const isActive = (link as any).exact 
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
        </div>
      ))}
    </div>
  );
}
