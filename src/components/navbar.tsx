"use client";
import Link from 'next/link';
import { ShoppingCart, User, Sparkles, Heart, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const items = useCartStore((state) => state.items);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 relative">
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between relative z-20 bg-white">
        
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
          <button onClick={() => setSearchOpen(!searchOpen)} className="text-slate-600 hover:text-black transition-colors">
            {searchOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Search className="h-5 w-5 stroke-[1.5]" />}
          </button>
          <Link href="/account" className="text-slate-600 hover:text-black transition-colors hidden sm:block">
            <User className="h-5 w-5 stroke-[1.5]" />
          </Link>
          <Link href="/wishlist" className="text-slate-600 hover:text-black transition-colors hidden sm:block">
            <Heart className="h-5 w-5 stroke-[1.5]" />
          </Link>
          <Link href="/cart" className="relative text-slate-600 hover:text-black transition-colors">
            <ShoppingCart className="h-5 w-5 stroke-[1.5]" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search Dropdown overlay */}
      <div 
        className={`absolute top-full left-0 w-full bg-white border-b border-slate-100 transition-all duration-300 ease-in-out -z-10 ${
          searchOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-full invisible'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 stroke-[1.5]" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Search for 'Gold Necklace', 'Earrings'..."
              className="w-full h-14 pl-12 pr-4 bg-slate-50 border-none text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 rounded-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
    </header>
  );
}
