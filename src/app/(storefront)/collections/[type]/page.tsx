import { supabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ type: string }>, searchParams: Promise<{ category?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const type = resolvedParams.type;
  
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const userEmail = user?.email;

  let query = supabase.from('products').select('*').eq('is_archived', false).order('created_at', { ascending: false });

  let title = "Collection";
  let description = "Browse our exclusive collection.";

  if (type === 'new-arrivals') {
    title = "New Arrivals";
    description = "The latest additions to our collection.";
    query = query.eq('is_new_arrival', true);
  } else if (type === 'best-sellers') {
    title = "Best Sellers";
    description = "Our most loved pieces by customers.";
    query = query.eq('is_best_seller', true);
  } else if (type === 'special-editions') {
    title = "Special Editions";
    description = "Exclusive, rare, and limited edition pieces.";
    query = query.eq('is_special_edition', true);
  } else {
    notFound();
  }

  // Handle Category Filtering from URL search params
  const categoryFilter = resolvedSearchParams.category;
  if (categoryFilter) {
    query = query.eq('category', categoryFilter);
  }

  const { data: products } = await query;

  // Fetch all unique categories from products in this collection for the sidebar filters
  // We'll fetch without the category filter to show all available options
  let allQuery = supabase.from('products').select('category').eq('is_archived', false).order('created_at', { ascending: false });
  if (type === 'new-arrivals') allQuery = allQuery.eq('is_new_arrival', true);
  if (type === 'best-sellers') allQuery = allQuery.eq('is_best_seller', true);
  if (type === 'special-editions') allQuery = allQuery.eq('is_special_edition', true);
  
  const { data: allProducts } = await allQuery;
  
  // Extract unique categories and count them
  const categoryCounts = (allProducts || []).reduce((acc: any, p) => {
    if (p.category) {
      acc[p.category] = (acc[p.category] || 0) + 1;
    }
    return acc;
  }, {});
  
  const availableCategories = Object.keys(categoryCounts).sort();

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-xl font-heading tracking-tight mb-6 text-slate-900 border-b pb-4">Filters</h2>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-slate-900 uppercase tracking-widest">Categories</h3>
          <div className="flex flex-col gap-3">
            <Link 
              href={`/collections/${type}`}
              className={`text-sm flex items-center gap-2 ${!categoryFilter ? 'font-medium text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${!categoryFilter ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
                {!categoryFilter && <span className="text-white text-[10px]">✓</span>}
              </div>
              All Categories
            </Link>
            
            {availableCategories.map((cat) => {
              const isSelected = categoryFilter === cat;
              return (
                <Link 
                  key={cat}
                  href={`/collections/${type}?category=${encodeURIComponent(cat)}`}
                  className={`text-sm flex items-center justify-between group ${isSelected ? 'font-medium text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${isSelected ? 'bg-slate-900 border-slate-900' : 'border-slate-300 group-hover:border-slate-500'}`}>
                      {isSelected && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span>{cat}</span>
                  </div>
                  <span className="text-xs text-slate-400">({categoryCounts[cat]})</span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex flex-col space-y-4 mb-8 border-b pb-6">
          <h1 className="text-3xl font-heading tracking-tight md:text-5xl">{title}</h1>
          <p className="text-slate-500 md:text-lg">{description}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:gap-x-8 lg:gap-y-14">
          {products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} userEmail={userEmail} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-slate-500 bg-slate-50">
              No products found {categoryFilter && `in the "${categoryFilter}" category`}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
