"use client";
import Link from 'next/link';
import { ShoppingCart, User, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-heading tracking-tighter">Svaneya</span>
        </Link>
        
        <nav className="hidden md:flex gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/" className="text-[13px] uppercase tracking-widest text-slate-500 hover:text-black transition-colors">Home</Link>
          <Link href="/products" className="text-[13px] uppercase tracking-widest text-slate-500 hover:text-black transition-colors">Shop</Link>
          <Link href="/about" className="text-[13px] uppercase tracking-widest text-slate-500 hover:text-black transition-colors">About Us</Link>
          <Link href="/contact" className="text-[13px] uppercase tracking-widest text-slate-500 hover:text-black transition-colors">Contact</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/account" className="text-slate-600 hover:text-black transition-colors">
            <User className="h-5 w-5 stroke-[1.5]" />
          </Link>
          <Link href="/wishlist" className="text-slate-600 hover:text-black transition-colors">
            <Heart className="h-5 w-5 stroke-[1.5]" />
          </Link>
          <Link href="/cart" className="relative text-slate-600 hover:text-black transition-colors">
            <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white font-medium">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
