import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Star } from "lucide-react";
import { ProductCard } from "@/components/product-card";

export const revalidate = 0;

export default async function HomePage() {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const userEmail = user?.email;

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(8);

  // Default AI generated image
  let heroImage = "/images/necklace.jpg";

  // Try to fetch custom settings
  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'global')
    .single();
    
  if (settings && settings.hero_image_1) {
    heroImage = settings.hero_image_1;
  }

  // Fetch categories, get first product image for each
  const { data: categories } = await supabase
    .from('categories')
    .select('*');

  const categoriesWithImages = await Promise.all(
    (categories || []).map(async (category) => {
      // If the category has a manual image, use it!
      if (category.image_url) {
        return { ...category, displayImage: category.image_url };
      }
      
      // Otherwise, fallback to the first product's image in that category
      const { data: productData } = await supabase
        .from('products')
        .select('images')
        .eq('is_archived', false)
        .eq('category', category.name)
        .limit(1)
        .single();
        
      const displayImage = productData?.images?.[0] || null;
      return { ...category, displayImage };
    })
  );

  const { data: newArrivals } = await supabase
    .from('products')
    .select('*')
    .eq('is_archived', false)
    .eq('is_new_arrival', true)
    .order('created_at', { ascending: false })
    .limit(4);

  const { data: specialEditions } = await supabase
    .from('products')
    .select('*')
    .eq('is_archived', false)
    .eq('is_special_edition', true)
    .order('created_at', { ascending: false })
    .limit(4);

  const { data: bestSellers } = await supabase
    .from('products')
    .select('*')
    .eq('is_archived', false)
    .eq('is_best_seller', true)
    .order('created_at', { ascending: false })
    .limit(4);

  const { data: featuredReviews } = await supabase
    .from('reviews')
    .select('*, products(name, id)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-950">
      
      {/* Announcement Marquee */}
      {settings && settings.sale_active && settings.sale_text && (
        <div className="bg-slate-950 text-white py-2 overflow-hidden whitespace-nowrap border-b border-slate-800">
          <div className="inline-block animate-marquee">
            <span className="mx-8 text-xs sm:text-sm font-medium tracking-widest uppercase">{settings.sale_text}</span>
            <span className="mx-8 text-xs sm:text-sm font-medium tracking-widest uppercase">{settings.sale_text}</span>
            <span className="mx-8 text-xs sm:text-sm font-medium tracking-widest uppercase">{settings.sale_text}</span>
            <span className="mx-8 text-xs sm:text-sm font-medium tracking-widest uppercase">{settings.sale_text}</span>
          </div>
        </div>
      )}

      {/* Full-Screen Editorial Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Premium Jewelry Collection" 
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="container relative z-10 px-4 md:px-8 mx-auto w-full">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-7xl font-heading tracking-tight leading-[1.1] text-white">
              Elevate The<br />
              Everyday With<br />
              Timeless Jewels
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-lg font-light leading-relaxed">
              Discover our exclusive collection of 316L waterproof, anti-tarnish jewelry designed for the modern minimalist.
            </p>
            <div className="pt-4">
              <Link href="/products" className="inline-block">
                <Button size="lg" className="px-10 h-14 text-sm tracking-widest uppercase rounded-none bg-white text-black hover:bg-slate-200 transition-colors">
                  Explore Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Categories Section */}
      {categoriesWithImages && categoriesWithImages.length > 0 && (
        <section className="w-full py-24 bg-white">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="flex justify-between items-end mb-12">
              <h2 className="text-3xl md:text-4xl font-heading tracking-tight text-slate-900">Shop by Category</h2>
            </div>
            
            <div className="flex flex-wrap justify-start gap-6 md:gap-10">
              {categoriesWithImages.map((category) => (
                <Link key={category.id} href={`/products?category=${encodeURIComponent(category.name)}`} className="group flex flex-col items-center text-center w-[120px] md:w-[160px]">
                  <div className="w-full aspect-square rounded-full overflow-hidden bg-[#f5f5f5] mb-4 p-1 border border-transparent group-hover:border-slate-200 transition-colors">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      {category.displayImage ? (
                        <img 
                          src={category.displayImage} 
                          alt={category.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                          <span className="text-xs uppercase tracking-wider">{category.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="font-heading text-base md:text-lg text-slate-900 group-hover:text-slate-500 transition-colors">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Special Editions Section */}
      {specialEditions && specialEditions.length > 0 && (
        <section className="w-full py-24 bg-[#0a0a0a] text-white border-t border-slate-900">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-heading tracking-tight mb-2">Special Editions</h2>
                <p className="text-slate-400">Exclusive and rare collections.</p>
              </div>
              <Link href="/collections/special-editions" className="hidden md:inline-flex text-sm font-medium uppercase tracking-widest hover:text-slate-300 transition-colors">
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {specialEditions.map((product) => (
                <ProductCard key={product.id} product={product} userEmail={userEmail} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="w-full py-24 bg-white border-t border-slate-100">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-heading tracking-tight text-slate-900 mb-2">New Arrivals</h2>
                <p className="text-slate-500">The latest additions to our collection.</p>
              </div>
              <Link href="/collections/new-arrivals" className="hidden md:inline-flex text-sm font-medium uppercase tracking-widest text-slate-900 hover:text-slate-500 transition-colors">
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} userEmail={userEmail} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      {bestSellers && bestSellers.length > 0 && (
        <section className="w-full py-24 bg-[#faf9f8] border-t border-slate-100">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-heading tracking-tight text-slate-900 mb-2">Best Sellers</h2>
                <p className="text-slate-500">Our most loved pieces.</p>
              </div>
              <Link href="/collections/best-sellers" className="hidden md:inline-flex text-sm font-medium uppercase tracking-widest text-slate-900 hover:text-slate-500 transition-colors">
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} userEmail={userEmail} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products Section */}
      <section className="w-full py-24 bg-white border-t border-slate-100">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-heading tracking-tight text-slate-900 mb-2">All Products</h2>
              <p className="text-slate-500">Explore our complete collection.</p>
            </div>
            <Link href="/products" className="text-sm uppercase tracking-widest text-slate-500 hover:text-black transition-colors hidden sm:block">
              Shop all
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} userEmail={userEmail} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-slate-500">
                No products found. Head to the admin dashboard to add some!
              </div>
            )}
          </div>
          
          <div className="mt-12 text-center sm:hidden">
            <Link href="/products" className="text-sm uppercase tracking-widest text-slate-500 hover:text-black transition-colors">
              Shop all
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Reviews Section */}
      {featuredReviews && featuredReviews.length > 0 && (
        <section className="w-full py-24 bg-[#faf9f8] border-t border-slate-100">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-heading tracking-tight text-slate-900 mb-4">What Our Customers Say</h2>
              <p className="text-slate-500">Real reviews from our amazing community.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredReviews.slice(0, 3).map((review) => (
                <div key={review.id} className="group flex flex-col h-full bg-white p-8 md:p-10 transition-colors border border-transparent hover:border-slate-200">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-heading text-sm">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-900 font-medium mb-1.5">{review.customer_name}</p>
                      <div className="flex text-slate-900">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-8">
                    <p className="text-slate-800 text-lg md:text-xl leading-relaxed font-heading italic tracking-wide">"{review.comment}"</p>
                  </div>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="mt-auto mb-6 h-48 md:h-56 w-full overflow-hidden">
                      <img src={review.images[0]} alt="Customer photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                    </div>
                  )}
                  
                  {review.products && (
                    <div className="mt-auto pt-6 border-t border-slate-100">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">
                        Purchased: <Link href={`/product/${review.products.id}`} className="text-slate-900 hover:underline">{review.products.name}</Link>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
