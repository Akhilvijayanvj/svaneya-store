"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function ProductCard({ product, userEmail }: { product: any, userEmail?: string | null }) {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail && product.id) {
      checkWishlist();
    }
  }, [userEmail, product.id]);

  async function checkWishlist() {
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_email', userEmail)
      .eq('product_id', product.id)
      .single();
    if (data) {
      setIsWishlisted(true);
    }
  }

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault(); // Prevent navigating to product page
    if (!userEmail) {
      router.push('/login');
      return;
    }
    
    setLoading(true);
    if (isWishlisted) {
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_email', userEmail)
        .eq('product_id', product.id);
      setIsWishlisted(false);
    } else {
      await supabase
        .from('wishlists')
        .insert({ user_email: userEmail, product_id: product.id });
      setIsWishlisted(true);
    }
    setLoading(false);
  }

  // Calculate Save Percentage
  let savePercentage = 0;
  if (product.mrp && product.mrp > product.price) {
    savePercentage = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  }

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col h-full">
      <div className="aspect-[4/5] bg-[#fcfcfc] mb-3 overflow-hidden relative border border-transparent group-hover:border-slate-200 transition-colors">
        
        {/* Save Percentage Badge */}
        {savePercentage > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-100 text-slate-900 text-[10px] font-medium tracking-widest px-2.5 py-1 uppercase shadow-sm">
            {savePercentage}% OFF
          </div>
        )}

        {/* Custom Text Badge */}
        {product.badge_text && (
          <div 
            className={`absolute z-10 text-[10px] font-medium tracking-widest px-2.5 py-1 uppercase shadow-sm ${savePercentage > 0 ? 'top-10 left-3 mt-1' : 'top-3 left-3'}`}
            style={{ 
              background: product.badge_bg || '#0f172a', 
              color: product.badge_text_color || '#ffffff' 
            }}
          >
            {product.badge_text}
          </div>
        )}

        {/* Rating Pill */}
        {product.rating && product.rating >= 4.0 && (
          <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-sm shadow-sm px-2 py-1 flex items-center gap-1 rounded-sm border border-slate-100">
            <span className="text-[11px] font-bold text-slate-900">{product.rating}</span>
            <span className="text-[10px] text-green-600">★</span>
            {product.review_count > 0 && (
              <span className="text-[10px] text-slate-500 font-medium ml-0.5">({product.review_count})</span>
            )}
          </div>
        )}

        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
        )}
        
        {/* Wishlist Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Button 
            size="icon" 
            variant="secondary" 
            onClick={toggleWishlist}
            disabled={loading}
            className={`rounded-full shadow-sm w-10 h-10 transition-colors ${isWishlisted ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-white text-black hover:bg-slate-900 hover:text-white'}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 mt-3 sm:mt-0">
        <h3 className="font-heading text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-1 group-hover:opacity-80 transition-opacity">{product.name}</h3>
        <div className="flex flex-wrap items-center gap-1 sm:gap-3 mt-auto">
          <span className="font-medium text-sm sm:text-base">₹{product.price}</span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-xs sm:text-sm opacity-50 line-through">₹{product.mrp}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
