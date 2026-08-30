import { createClient } from "@/utils/supabase/server";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { Heart } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function WishlistPage() {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch wishlists for the user and join the product details
  const { data: wishlists } = await supabaseServer
    .from('wishlists')
    .select(`
      *,
      products (*)
    `)
    .eq('user_email', user.email)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl min-h-[60vh]">
      <div className="flex flex-col space-y-4 mb-12">
        <h1 className="text-3xl font-heading tracking-tight md:text-5xl flex items-center gap-4">
          <Heart className="h-8 w-8 md:h-12 md:w-12 text-slate-900 fill-slate-900" />
          My Wishlist
        </h1>
        <p className="text-slate-500 md:text-lg">
          Items you've saved to review or purchase later.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
        {wishlists && wishlists.length > 0 ? (
          wishlists.map((wishlist) => {
            // Because we did a join, the nested 'products' object contains the actual product data
            const product = wishlist.products;
            if (!product) return null; // Defensive check in case a product was deleted
            
            return (
              <ProductCard 
                key={wishlist.id} 
                product={product} 
                userEmail={user.email} 
              />
            );
          })
        ) : (
          <div className="col-span-full text-center py-24 text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-heading text-slate-900 mb-2">Your wishlist is empty</h3>
            <p className="mb-6">Save items you love to your wishlist to keep track of them.</p>
            <Link href="/products" className="inline-flex h-10 items-center justify-center rounded-none bg-slate-900 px-8 text-sm font-medium text-white tracking-widest uppercase hover:bg-slate-800 transition-colors">
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
